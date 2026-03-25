package com.flora.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
public class ForestApiService {

    @Value("${external.forest.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 산림청 국립수목원 국가표준식물목록 API (두 가지 버전 모두 지원)
    // v1: 15000236 - 국가표준식물목록 서비스
    private static final String BASE_URL_V1   = "https://apis.data.go.kr/1400119/KpniService";
    private static final String SEARCH_URL_V1 = BASE_URL_V1 + "/scnmSearch";
    private static final String DETAIL_URL_V1 = BASE_URL_V1 + "/scnmInfo";
    // v2: 15142872 - 국가표준식물목록 조회 서비스
    private static final String BASE_URL_V2   = "https://apis.data.go.kr/1400119/NtnStndaPlantListService";
    private static final String SEARCH_URL_V2 = BASE_URL_V2 + "/scnmSearch";
    private static final String DETAIL_URL_V2 = BASE_URL_V2 + "/scnmInfo";

    // ─────────────────────────────────────────────
    //  식물 목록 검색
    // ─────────────────────────────────────────────
    public Map<String, Object> searchPlants(String searchWord, int pageNo, int numOfRows) {
        // 자체 식물 DB (46종) — 검색어 필터링 + 페이지네이션
        // 산림청 API 데이터는 독성·계절 정보가 없어 자체 DB 우선 사용
        return fallbackSearch(searchWord, pageNo, numOfRows);
    }

    private Map<String, Object> tryApiSearch(String searchUrl, String searchWord, int pageNo, int numOfRows) {
        try {
            String encodedKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
            StringBuilder sb = new StringBuilder(searchUrl)
                    .append("?serviceKey=").append(encodedKey)
                    .append("&pageNo=").append(pageNo)
                    .append("&numOfRows=").append(numOfRows)
                    .append("&type=json");
            if (searchWord != null && !searchWord.isBlank()) {
                String encoded = URLEncoder.encode(searchWord, StandardCharsets.UTF_8);
                // 두 가지 파라미터명 모두 전송 (API 버전에 따라 다를 수 있음)
                sb.append("&sText=").append(encoded);
                sb.append("&searchWord=").append(encoded);
            }
            String url = sb.toString();

            log.info("산림청 API 호출: {}", searchUrl);
            log.debug("전체 URL: {}", url);
            String response = restTemplate.getForObject(URI.create(url), String.class);
            log.info("산림청 응답 길이: {}, 앞 300자: {}",
                    response != null ? response.length() : 0,
                    response != null ? response.substring(0, Math.min(300, response.length())) : "null");

            if (response == null) return null;

            // 에러 응답 체크
            if (response.contains("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")
                    || response.contains("SERVICEKEY_IS_NOT_REGISTERED_ERROR")) {
                log.warn("API 키 미등록 오류 ({})", searchUrl);
                return null;
            }
            if (response.contains("SERVICE_ACCESS_DENIED_ERROR")) {
                log.warn("API 접근 거부 오류 ({})", searchUrl);
                return null;
            }
            // OpenAPI_ServiceResponse는 에러 응답 래퍼일 때만 skip
            if (response.contains("<OpenAPI_ServiceResponse>") && response.contains("<returnReasonCode>")) {
                log.warn("API 에러 응답: {}", response.substring(0, Math.min(500, response.length())));
                return null;
            }

            Map<String, Object> result;
            if (response.trim().startsWith("{")) {
                result = parseJsonList(response);
            } else {
                result = parseXmlList(response);
            }

            @SuppressWarnings("unchecked")
            List<?> items = (List<?>) result.get("items");
            if (items != null && !items.isEmpty()) {
                log.info("산림청 API 성공! {}건 조회 ({})", items.size(), searchUrl);
                return result;
            }
            log.warn("API 응답에 items 없음 ({})", searchUrl);
        } catch (Exception e) {
            log.warn("산림청 API 호출 실패 ({}): {}", searchUrl, e.getMessage());
        }
        return null;
    }

    // ─────────────────────────────────────────────
    //  식물 상세 정보
    // ─────────────────────────────────────────────
    public Map<String, Object> getPlantDetail(String taxonId) {
        // 먼저 자체 DB에서 확인 (fallback taxonId는 1000~1099)
        Map<String, Object> fallback = getFallbackPlantDetail(taxonId);
        if (!fallback.isEmpty()) {
            return fallback;
        }

        // 산림청 API로 상세 조회 — 여러 파라미터명 시도
        if (apiKey != null && !apiKey.isBlank()) {
            String encodedKey;
            try { encodedKey = URLEncoder.encode(apiKey, StandardCharsets.UTF_8); }
            catch (Exception e) { encodedKey = apiKey; }

            // id, plantScnmId 두 가지 파라미터명, v1 엔드포인트만 (v2는 500 에러)
            String[] idParams = { "id", "plantScnmId" };
            for (String idParam : idParams) {
                try {
                    String url = DETAIL_URL_V1
                            + "?serviceKey=" + encodedKey
                            + "&" + idParam + "=" + taxonId
                            + "&type=json";

                    log.info("산림청 식물 상세 URL ({}={}): {}", idParam, taxonId, url);
                    String response = restTemplate.getForObject(URI.create(url), String.class);
                    log.info("상세 응답 길이: {}", response != null ? response.length() : 0);

                    if (response != null && !response.contains("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")
                            && !response.contains("<OpenAPI_ServiceResponse>")) {
                        Map<String, Object> result;
                        if (response.trim().startsWith("{")) {
                            result = parseJsonDetail(response);
                        } else {
                            result = parseXmlDetail(response);
                        }
                        // 유효한 결과인지 확인
                        if (result.get("korName") != null && !((String)result.get("korName")).isBlank()) {
                            return result;
                        }
                    }
                } catch (Exception e) {
                    log.warn("산림청 상세 API 호출 실패 ({}): {}", idParam, e.getMessage());
                }
            }
        }

        Map<String, Object> empty = new HashMap<>();
        empty.put("error", "식물 상세 정보를 찾을 수 없습니다");
        return empty;
    }

    // ─────────────────────────────────────────────
    //  JSON 파싱 - 목록
    //  실제 응답 구조: response.body.items.item[]
    //  실제 필드명:  plantGnrlNm, plantScnmId, plantSpecsScnm, falmKorNm 등
    // ─────────────────────────────────────────────
    private Map<String, Object> parseJsonList(String json) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(json);

            // totalCount 추출: response.body.totalCount
            int total = 0;
            JsonNode totalNode = root.path("response").path("body").path("totalCount");
            if (!totalNode.isMissingNode()) {
                total = totalNode.asInt(0);
            }

            // items 배열 추출: response.body.items.item
            JsonNode itemsNode = root.path("response").path("body").path("items").path("item");

            if (itemsNode.isArray()) {
                for (JsonNode itemNode : itemsNode) {
                    Map<String, Object> plant = buildPlantMapFromApiNode(itemNode);
                    if (!((String) plant.getOrDefault("korName", "")).isBlank()) {
                        items.add(plant);
                    }
                }
            } else if (itemsNode.isObject()) {
                // 단일 아이템인 경우
                Map<String, Object> plant = buildPlantMapFromApiNode(itemsNode);
                if (!((String) plant.getOrDefault("korName", "")).isBlank()) {
                    items.add(plant);
                }
            }

            result.put("items", items);
            result.put("totalCount", total > 0 ? total : items.size());
            log.info("JSON 목록 파싱 성공: {}건, 전체 {}건", items.size(), total);

        } catch (Exception e) {
            log.error("JSON 목록 파싱 실패: {}", e.getMessage());
            result.put("items", items);
            result.put("totalCount", 0);
        }

        return result;
    }

    // ─────────────────────────────────────────────
    //  JSON 파싱 - 상세
    // ─────────────────────────────────────────────
    private Map<String, Object> parseJsonDetail(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode itemNode = root.path("response").path("body").path("items").path("item");
            if (itemNode.isArray() && itemNode.size() > 0) {
                return buildPlantMapFromApiNode(itemNode.get(0));
            } else if (itemNode.isObject()) {
                return buildPlantMapFromApiNode(itemNode);
            }
        } catch (Exception e) {
            log.error("JSON 상세 파싱 실패: {}", e.getMessage());
        }
        return new HashMap<>();
    }

    // ─────────────────────────────────────────────
    //  실제 API 응답 필드명으로 Map 생성
    //  API 필드명 → 내부 필드명 매핑
    // ─────────────────────────────────────────────
    private Map<String, Object> buildPlantMapFromApiNode(JsonNode node) {
        Map<String, Object> p = new HashMap<>();
        // 실제 API 필드명 매핑
        p.put("taxonId",        node.path("plantScnmId").asText(""));
        p.put("korName",         node.path("plantGnrlNm").asText(""));       // 한글명
        p.put("scientificName",  node.path("plantSpecsScnm").asText(""));    // 학명
        p.put("engName",         node.path("engNm").asText(""));             // 영명
        p.put("genusKorName",    node.path("genusKorNm").asText(""));        // 속명(한글)
        p.put("familyKorName",   node.path("falmKorNm").asText(""));         // 과명(한글)
        p.put("orderKorName",    node.path("ordKorNm").asText(""));          // 목명(한글)
        p.put("classKorName",    node.path("classKorNm").asText(""));        // 강명(한글)
        p.put("divisionKorName", node.path("phylumKorNm").asText(""));       // 문명(한글)
        p.put("nameStatus",      node.path("plantSpecsClsscCdNm").asText("")); // 자생식물/귀화식물 등
        p.put("description",     node.path("uniqDesc").asText(""));          // 상세 설명
        p.put("habitat",         node.path("growthEnv").asText(""));         // 서식 환경
        return p;
    }

    // ─────────────────────────────────────────────
    //  (레거시) 공통 식물 Map 생성 - XML 파싱용
    // ─────────────────────────────────────────────
    private Map<String, Object> buildPlantMap(String source, boolean isDetail) {
        Map<String, Object> p = new HashMap<>();
        p.put("taxonId",         extractJsonValue(source, "taxonId"));
        p.put("korName",          extractJsonValue(source, "korName"));
        p.put("scientificName",   extractJsonValue(source, "scientificName"));
        p.put("engName",          extractJsonValue(source, "engName"));
        p.put("genusKorName",     extractJsonValue(source, "genusKorName"));
        p.put("familyKorName",    extractJsonValue(source, "familyKorName"));
        p.put("orderKorName",     extractJsonValue(source, "orderKorName"));
        p.put("classKorName",     extractJsonValue(source, "classKorName"));
        p.put("divisionKorName",  extractJsonValue(source, "divisionKorName"));
        p.put("nameStatus",       extractJsonValue(source, "nameStatus"));
        if (isDetail) {
            p.put("description", extractJsonValue(source, "description"));
            p.put("habitat",     extractJsonValue(source, "habitat"));
            p.put("remark",      extractJsonValue(source, "remark"));
        }
        return p;
    }

    // ─────────────────────────────────────────────
    //  XML 파싱 - 목록
    // ─────────────────────────────────────────────
    private Map<String, Object> parseXmlList(String xml) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();

        try {
            int total = 0;
            if (xml.contains("<totalCount>")) {
                try { total = Integer.parseInt(extractTag(xml, "totalCount").trim()); }
                catch (Exception ignore) {}
            }

            String[] parts = xml.split("<item>");
            for (int i = 1; i < parts.length; i++) {
                Map<String, Object> plant = new HashMap<>();
                // 실제 XML 필드명 (plantGnrlNm, plantScnmId 등)도 함께 시도
                String id   = extractTagMulti(parts[i], "plantScnmId", "taxonId");
                String kor  = extractTagMulti(parts[i], "plantGnrlNm", "korName");
                String sci  = extractTagMulti(parts[i], "plantSpecsScnm", "scientificName");
                plant.put("taxonId",        id);
                plant.put("korName",         kor);
                plant.put("scientificName",  sci);
                plant.put("engName",         extractTagMulti(parts[i], "engNm", "engName"));
                plant.put("genusKorName",    extractTagMulti(parts[i], "genusKorNm", "genusKorName"));
                plant.put("familyKorName",   extractTagMulti(parts[i], "falmKorNm", "familyKorName"));
                plant.put("orderKorName",    extractTagMulti(parts[i], "ordKorNm", "orderKorName"));
                plant.put("classKorName",    extractTagMulti(parts[i], "classKorNm", "classKorName"));
                plant.put("divisionKorName", extractTagMulti(parts[i], "phylumKorNm", "divisionKorName"));
                plant.put("nameStatus",      extractTagMulti(parts[i], "plantSpecsClsscCdNm", "nameStatus"));

                if (!kor.isBlank()) items.add(plant);
            }

            result.put("items", items);
            result.put("totalCount", total > 0 ? total : items.size());

        } catch (Exception e) {
            log.error("XML 목록 파싱 실패: {}", e.getMessage());
            return fallbackPlants();
        }

        return result;
    }

    // ─────────────────────────────────────────────
    //  XML 파싱 - 상세
    // ─────────────────────────────────────────────
    private Map<String, Object> parseXmlDetail(String xml) {
        Map<String, Object> p = new HashMap<>();
        try {
            p.put("taxonId",         extractTagMulti(xml, "plantScnmId", "taxonId"));
            p.put("korName",          extractTagMulti(xml, "plantGnrlNm", "korName"));
            p.put("scientificName",   extractTagMulti(xml, "plantSpecsScnm", "scientificName"));
            p.put("engName",          extractTagMulti(xml, "engNm", "engName"));
            p.put("genusKorName",     extractTagMulti(xml, "genusKorNm", "genusKorName"));
            p.put("familyKorName",    extractTagMulti(xml, "falmKorNm", "familyKorName"));
            p.put("orderKorName",     extractTagMulti(xml, "ordKorNm", "orderKorName"));
            p.put("classKorName",     extractTagMulti(xml, "classKorNm", "classKorName"));
            p.put("divisionKorName",  extractTagMulti(xml, "phylumKorNm", "divisionKorName"));
            p.put("nameStatus",       extractTagMulti(xml, "plantSpecsClsscCdNm", "nameStatus"));
            p.put("description",      extractTagMulti(xml, "uniqDesc", "description"));
            p.put("habitat",          extractTagMulti(xml, "growthEnv", "habitat"));
        } catch (Exception e) {
            log.error("XML 상세 파싱 실패: {}", e.getMessage());
        }
        return p;
    }

    // ─────────────────────────────────────────────
    //  전체 식물 DB (API 실패 시 + 기본 브라우징)
    // ─────────────────────────────────────────────
    private static final List<Map<String, Object>> ALL_PLANTS = new ArrayList<>();

    static {
        // {한글명, 학명, 과명, 목명, 영명, 상태, 설명, 서식지, 독성}
        // ※ 나무·잡초류 제외, 실제로 키울 수 있는 꽃·관엽식물 위주 51종
        String[][] data = {
            // ── 봄꽃 ──
            {"장미",       "Rosa hybrida",                  "장미과",         "장미목",         "rose",               "정명", "가시가 있는 줄기에 아름다운 꽃이 피는 관목으로, 전 세계에서 가장 사랑받는 관상식물이다. 붉은색, 분홍색, 흰색, 노란색 등 다양한 품종이 있다.", "정원, 화단, 온실", "없음"},
            {"튤립",       "Tulipa gesneriana",              "백합과",         "백합목",         "tulip",              "정명", "봄에 피는 구근식물로, 컵 모양의 꽃이 특징이다. 네덜란드의 국화로 유명하며 다양한 색상과 무늬의 품종이 있다.", "화단, 정원, 화분", "있음 (구근 섭취 시 구토·설사 유발)"},
            {"진달래",     "Rhododendron mucronulatum",      "진달래과",       "진달래목",       "Korean azalea",      "정명", "한국 산야에 자생하는 낙엽관목으로 이른 봄 잎보다 먼저 분홍색 꽃이 핀다. 꽃잎은 식용 가능하여 화전을 만든다.", "화분, 정원", "없음"},
            {"개나리",     "Forsythia koreana",              "물푸레나무과",   "물푸레나무목",   "Korean forsythia",   "정명", "한국 특산 식물로 이른 봄 노란색 꽃이 가지에 가득 핀다. 한국의 봄을 알리는 대표적인 꽃나무이다.", "정원, 화분", "없음"},
            {"수선화",     "Narcissus tazetta",              "수선화과",       "비짜루목",       "narcissus",          "정명", "이른 봄 향기로운 흰색 또는 노란색 꽃이 피는 구근식물이다. 수경재배도 가능해 실내에서 많이 기른다.", "정원, 화단, 화분", "있음 (전초에 리코린 함유, 구근 섭취 시 위험)"},
            {"히아신스",   "Hyacinthus orientalis",          "비짜루과",       "비짜루목",       "hyacinth",           "정명", "강한 향기와 총상 꽃차례가 특징인 구근식물이다. 봄 화단을 장식하며 수경재배도 쉽게 가능하다.", "화분, 화단", "있음 (옥살산칼슘 함유, 구근 섭취 시 위험)"},
            {"카네이션",   "Dianthus caryophyllus",          "석죽과",         "석죽목",         "carnation",          "정명", "어버이날을 상징하는 꽃으로, 감사와 사랑의 의미를 담고 있다. 다양한 색상의 겹꽃이 특징이다.", "정원, 온실, 화분", "없음"},
            {"작약",       "Paeonia lactiflora",             "작약과",         "범의귀목",       "peony",              "정명", "크고 풍성한 꽃이 특징으로 함박꽃이라고도 불린다. 뿌리는 한방 약재로 사용된다.", "정원, 화단, 약초밭", "없음"},
            {"아이리스",   "Iris ensata",                    "붓꽃과",         "비짜루목",       "iris flower",        "정명", "붓꽃이라고도 불리며, 보라색 또는 흰색의 우아한 꽃이 특징이다. 화분에서도 잘 자란다.", "화분, 정원", "있음 (뿌리줄기에 이리딘 함유)"},
            {"프리지아",   "Freesia refracta",               "붓꽃과",         "비짜루목",       "freesia",            "정명", "달콤한 향기와 밝은 색상의 깔때기 모양 꽃이 특징이다. 절화와 향수 원료로 인기가 높다.", "온실, 화분, 정원", "없음"},
            {"팬지",       "Viola wittrockiana",             "제비꽃과",       "말피기목",       "pansy",              "정명", "봄 화단을 화려하게 장식하는 대표적인 일년초이다. 다양한 색상 조합과 독특한 얼굴 무늬가 매력적이다.", "화단, 화분", "없음"},
            {"제비꽃",     "Viola mandshurica",              "제비꽃과",       "말피기목",       "violet",             "정명", "봄에 보라색 작은 꽃이 피는 여러해살이풀이다. 제비가 돌아올 때 피어서 제비꽃이라 불린다.", "화분, 화단", "없음"},
            {"안개꽃",     "Gypsophila paniculata",          "석죽과",         "석죽목",         "baby's breath",      "정명", "작은 흰 꽃이 안개처럼 무수히 피어 꽃다발의 대표적인 부자재로 사용된다.", "정원, 화단, 온실", "없음"},
            {"패랭이꽃",   "Dianthus chinensis",             "석죽과",         "석죽목",         "Chinese pink",       "정명", "분홍색 또는 붉은색의 작은 꽃이 군락으로 피어 화단을 수놓는다. 꽃잎 가장자리에 톱니 모양이 있다.", "화단, 화분", "없음"},
            {"데이지",     "Bellis perennis",                "국화과",         "국화목",         "daisy",              "정명", "순수함을 상징하는 작고 사랑스러운 꽃이다. 흰 꽃잎과 노란 중심이 태양을 닮았다.", "정원, 화단, 화분", "없음"},
            {"클레마티스", "Clematis patens",                "미나리아재비과", "미나리아재비목", "clematis",           "정명", "덩굴을 타고 올라가며 크고 화려한 꽃이 피는 식물이다. 으아리라고도 불린다.", "정원, 울타리, 화분", "있음 (프로토아네모닌 함유, 피부 자극)"},
            {"아마릴리스", "Hippeastrum hybridum",           "수선화과",       "비짜루목",       "amaryllis",          "정명", "크고 화려한 나팔 모양의 꽃이 특징인 구근식물이다. 실내에서 수경재배나 화분 재배가 가능하다.", "실내, 화분", "있음 (리코린 함유, 구근 섭취 시 위험)"},
            // ── 여름꽃 ──
            {"라벤더",     "Lavandula angustifolia",         "꿀풀과",         "꿀풀목",         "lavender",           "정명", "보라색 꽃과 강한 향기가 특징인 허브 식물이다. 아로마테라피, 향수, 차 등에 널리 사용된다.", "화분, 정원", "없음"},
            {"해바라기",   "Helianthus annuus",              "국화과",         "국화목",         "sunflower",          "정명", "태양을 향해 꽃대가 움직이는 큰 노란 꽃이 특징인 한해살이풀이다. 씨앗은 식용유와 간식으로 이용된다.", "화단, 정원, 화분", "없음"},
            {"백합",       "Lilium longiflorum",             "백합과",         "백합목",         "lily",               "정명", "우아한 나팔 모양의 흰 꽃이 피며, 강한 향기가 특징이다. 순결과 순수의 상징으로 여겨진다.", "정원, 화단, 온실", "있음 (고양이에게 매우 유독, 사람은 경미)"},
            {"수국",       "Hydrangea macrophylla",          "수국과",         "층층나무목",     "hydrangea",          "정명", "토양 산도에 따라 꽃 색이 파란색 또는 분홍색으로 변하는 신기한 식물이다. 여름에 풍성한 꽃송이가 핀다.", "정원, 화분, 화단", "있음 (잎과 꽃에 시안배당체 함유)"},
            {"봉선화",     "Impatiens balsamina",            "봉선화과",       "진달래목",       "balsam",             "정명", "여름에 빨간 꽃이 피며, 꽃잎으로 손톱을 물들이는 전통이 있다. 익은 열매를 건드리면 씨가 튀어나온다.", "정원, 화단, 화분", "없음"},
            {"나팔꽃",     "Ipomoea nil",                    "메꽃과",         "가지목",         "morning glory",      "정명", "아침에 피었다가 오후에 시드는 덩굴식물이다. 파란색, 분홍색, 보라색 나팔 모양 꽃이 특징이다.", "울타리, 화분", "있음 (씨앗에 리세르그산 아미드 함유)"},
            {"연꽃",       "Nelumbo nucifera",               "연꽃과",         "프로테아목",     "lotus",              "정명", "수생 식물로 진흙에서 자라면서도 아름다운 꽃을 피운다. 큰 수조나 수반에서 재배 가능하다.", "수조, 수반, 연못", "없음"},
            {"수련",       "Nymphaea tetragona",             "수련과",         "수련목",         "water lily",         "정명", "수면 위에 떠서 피는 아름다운 수생 식물이다. 작은 수조에서도 키울 수 있어 베란다 재배도 가능하다.", "수조, 수반, 연못", "없음"},
            {"칸나",       "Canna indica",                   "칸나과",         "생강목",         "canna lily",         "정명", "여름부터 가을까지 빨강, 노랑, 주황의 크고 화려한 꽃이 피는 열대 식물이다.", "화단, 화분", "없음"},
            {"백일홍",     "Zinnia elegans",                 "국화과",         "국화목",         "zinnia",             "정명", "이름처럼 오랫동안 꽃이 피어 백일 동안 붉다는 뜻이다. 다양한 색상의 꽃이 여름 정원을 밝힌다.", "화단, 화분", "없음"},
            {"금잔화",     "Calendula officinalis",          "국화과",         "국화목",         "marigold",           "정명", "주황색 또는 노란색 꽃이 피며, 식용과 약용으로 모두 사용된다. 피부 진정 효과가 있어 화장품에도 쓰인다.", "화단, 화분", "없음"},
            {"달리아",     "Dahlia pinnata",                 "국화과",         "국화목",         "dahlia",             "정명", "크고 화려한 꽃이 피며, 색상과 형태가 매우 다양하다. 멕시코의 국화이기도 하다.", "화단, 정원", "없음"},
            {"글라디올러스","Gladiolus hybridus",            "붓꽃과",         "비짜루목",       "gladiolus",          "정명", "칼 모양의 잎과 화려한 이삭 모양 꽃차례가 특징인 구근식물이다. 절화로 인기가 높다.", "화단, 정원", "없음"},
            {"거베라",     "Gerbera jamesonii",              "국화과",         "국화목",         "gerbera daisy",      "정명", "화려한 색상의 큰 꽃이 특징으로 전 세계적으로 인기 있는 절화이다. 실내에서도 잘 자라며 공기정화 효과가 뛰어나다.", "화분, 화단", "없음"},
            {"피튜니아",   "Petunia hybrida",                "가지과",         "가지목",         "petunia",            "정명", "나팔 모양의 꽃이 여름 내내 풍성하게 피는 대표적인 원예 식물이다. 행잉 바스켓이나 화단에 많이 심는다.", "화단, 화분", "없음"},
            {"자스민",     "Jasminum officinale",            "물푸레나무과",   "물푸레나무목",   "jasmine",            "정명", "달콤하고 진한 향기가 나는 흰색 꽃이 특징이다. 자스민 차의 원료로도 유명하다.", "화분, 정원", "없음"},
            {"허브제라늄", "Pelargonium graveolens",         "쥐손이풀과",     "쥐손이풀목",     "geranium",           "정명", "독특한 향이 나는 잎과 분홍색 꽃이 특징이다. 모기를 쫓는 효과가 있어 허브로 인기가 많다.", "화분, 베란다", "없음"},
            {"란타나",     "Lantana camara",                 "마편초과",       "꿀풀목",         "lantana",            "정명", "작은 꽃이 둥글게 모여 피며, 시간이 지남에 따라 색이 변하는 신기한 식물이다.", "화분, 화단", "있음 (덜 익은 열매 섭취 시 간 독성)"},
            {"스타티스",   "Limonium sinuatum",              "갯질경이과",     "석죽목",         "statice",            "정명", "건조해도 색과 형태가 유지되어 드라이플라워로 가장 인기 있는 꽃이다.", "화단, 온실, 화분", "없음"},
            // ── 가을꽃 ──
            {"국화",       "Chrysanthemum morifolium",       "국화과",         "국화목",         "chrysanthemum",      "정명", "가을을 대표하는 꽃으로 다양한 꽃잎 형태와 색상을 가진다. 차, 약재, 관상용으로 널리 이용된다.", "화분, 화단", "없음"},
            {"코스모스",   "Cosmos bipinnatus",              "국화과",         "국화목",         "cosmos",             "정명", "가을 들판을 수놓는 대표적인 꽃으로 분홍, 흰색, 자주색 꽃이 핀다. 가느다란 줄기가 바람에 흔들리는 모습이 아름답다.", "화단, 화분", "없음"},
            {"베고니아",   "Begonia semperflorens",          "베고니아과",     "박목",           "begonia",            "정명", "그늘에서도 잘 자라며 사계절 꽃을 피우는 실내외 겸용 식물이다. 다양한 색상의 작은 꽃이 지속적으로 핀다.", "화분, 실내, 화단", "있음 (구근 섭취 시 구토 유발)"},
            {"칼란코에",   "Kalanchoe blossfeldiana",        "돌나물과",       "범의귀목",       "kalanchoe",          "정명", "관리가 매우 쉬운 다육식물로 오랫동안 작은 꽃이 피어 있다. 선물용 화분으로 인기가 높다.", "실내, 화분", "있음 (강심배당체 함유, 소량 섭취도 위험)"},
            // ── 겨울·사계절꽃 ──
            {"동백나무",   "Camellia japonica",              "차나무과",       "차나무목",       "camellia",           "정명", "겨울부터 이른 봄에 빨간 꽃이 피는 상록 식물이다. 화분에 키우면 실내에서도 꽃을 즐길 수 있다.", "화분, 정원", "없음"},
            {"매화",       "Prunus mume",                    "장미과",         "장미목",         "plum blossom",       "정명", "이른 봄 추위 속에서 가장 먼저 꽃을 피워 선비의 절개를 상징한다. 분재나 화분으로도 즐길 수 있다.", "화분, 정원", "있음 (덜 익은 열매에 청산배당체 함유)"},
            {"시클라멘",   "Cyclamen persicum",              "앵초과",         "진달래목",       "cyclamen",           "정명", "겨울철 실내를 밝혀주는 대표적인 구근식물이다. 뒤로 젖혀진 독특한 꽃잎 모양이 특징이다.", "실내, 화분", "있음 (전초 특히 구근에 사이클라민 함유)"},
            {"무궁화",     "Hibiscus syriacus",              "아욱과",         "아욱목",         "rose of sharon",     "정명", "대한민국의 국화로, 여름부터 가을까지 끊임없이 꽃이 핀다. 이름처럼 영원히 피고 지지 않는 꽃이라는 뜻이다.", "정원, 화분", "없음"},
            {"철쭉",       "Rhododendron schlippenbachii",   "진달래과",       "진달래목",       "royal azalea",       "정명", "진달래와 비슷하지만 꽃이 더 크고 잎과 함께 핀다. 봄 산을 분홍빛으로 물들이는 아름다운 꽃이다.", "화분, 정원", "있음 (꽃과 잎에 그레이아노톡신 함유)"},
            // ── 관엽식물 (실내) ──
            {"몬스테라",   "Monstera deliciosa",             "천남성과",       "택사목",         "monstera",           "정명", "열대 우림 원산의 관엽식물로 구멍이 뚫린 독특한 잎 모양이 특징이다. 인테리어 식물로 큰 인기를 얻고 있다.", "실내, 화분", "있음 (옥살산칼슘 함유, 구강 자극)"},
            {"산세베리아", "Sansevieria trifasciata",        "비짜루과",       "비짜루목",       "snake plant",        "정명", "강한 생명력과 뛰어난 공기정화 효과로 인기 있는 관엽식물이다. 직립하는 두꺼운 잎에 노란 테두리가 있는 품종이 유명하다.", "실내, 화분", "있음 (구토·설사 유발 가능)"},
            {"알로에베라", "Aloe vera",                      "비짜루과",       "비짜루목",       "aloe vera",          "정명", "다육질 잎 속의 젤은 피부 진정과 치료에 효과적이다. 가정에서 가장 흔히 기르는 약용 식물이다.", "실내, 화분", "없음"},
            {"고무나무",   "Ficus elastica",                 "뽕나무과",       "장미목",         "rubber plant",       "정명", "두꺼운 광택 있는 잎이 특징인 관엽식물이다. 공기정화 효과가 뛰어나고 관리가 쉬워 인기가 높다.", "실내, 화분", "있음 (수액 피부·점막 자극)"},
            {"안스리움",   "Anthurium andraeanum",           "천남성과",       "택사목",         "anthurium",          "정명", "하트 모양의 빨간 불염포가 특징인 열대 관엽식물이다. 공기정화 효과가 높고 오래 꽃이 유지된다.", "실내, 화분", "있음 (옥살산칼슘 함유)"},
            {"소철",       "Cycas revoluta",                 "소철과",         "소철목",         "sago palm",          "정명", "열대 분위기를 내는 상록 관엽식물로 깃털 같은 잎이 방사형으로 퍼진다. 살아있는 화석 식물이다.", "실내, 화분", "있음 (씨앗에 사이카신 함유, 간 독성)"},
        };

        for (int i = 0; i < data.length; i++) {
            Map<String, Object> p = new HashMap<>();
            p.put("taxonId",        String.valueOf(1000 + i));
            p.put("korName",         data[i][0]);
            p.put("scientificName",  data[i][1]);
            p.put("familyKorName",   data[i][2]);
            p.put("orderKorName",    data[i][3]);
            p.put("engName",         data[i][4]);
            p.put("nameStatus",      data[i][5]);
            p.put("description",     data[i][6]);
            p.put("habitat",         data[i][7]);
            p.put("toxicity",        data[i][8]);
            ALL_PLANTS.add(p);
        }
    }

    // ─────────────────────────────────────────────
    //  검색 필터링 + 페이지네이션 지원 fallback
    // ─────────────────────────────────────────────
    private Map<String, Object> fallbackPlants() {
        return fallbackSearch("", 1, 20);
    }

    private Map<String, Object> fallbackSearch(String keyword, int pageNo, int numOfRows) {
        List<Map<String, Object>> filtered;

        if (keyword == null || keyword.isBlank()) {
            filtered = ALL_PLANTS;
        } else {
            String kw = keyword.toLowerCase();
            filtered = new ArrayList<>();
            for (Map<String, Object> plant : ALL_PLANTS) {
                String kor = ((String) plant.getOrDefault("korName", "")).toLowerCase();
                String sci = ((String) plant.getOrDefault("scientificName", "")).toLowerCase();
                String eng = ((String) plant.getOrDefault("engName", "")).toLowerCase();
                String fam = ((String) plant.getOrDefault("familyKorName", "")).toLowerCase();
                if (kor.contains(kw) || sci.contains(kw) || eng.contains(kw) || fam.contains(kw)) {
                    filtered.add(plant);
                }
            }
        }

        // 페이지네이션
        int total = filtered.size();
        int start = Math.min((pageNo - 1) * numOfRows, total);
        int end   = Math.min(start + numOfRows, total);
        List<Map<String, Object>> page = filtered.subList(start, end);

        Map<String, Object> result = new HashMap<>();
        result.put("items", new ArrayList<>(page));
        result.put("totalCount", total);
        return result;
    }

    // ─────────────────────────────────────────────
    //  fallback 식물 상세 조회 (taxonId로)
    // ─────────────────────────────────────────────
    public Map<String, Object> getFallbackPlantDetail(String taxonId) {
        for (Map<String, Object> plant : ALL_PLANTS) {
            if (taxonId.equals(plant.get("taxonId"))) {
                return new HashMap<>(plant);
            }
        }
        return new HashMap<>();
    }

    // ─────────────────────────────────────────────
    //  유틸: XML 태그 추출
    // ─────────────────────────────────────────────
    private String extractTag(String xml, String tagName) {
        String open  = "<"  + tagName + ">";
        String close = "</" + tagName + ">";
        int start = xml.indexOf(open);
        int end   = xml.indexOf(close);
        if (start == -1 || end == -1) return "";
        return xml.substring(start + open.length(), end).trim();
    }

    // 여러 태그명 중 첫 번째로 값이 있는 것 반환 (구/신 API 필드명 모두 지원)
    private String extractTagMulti(String xml, String... tagNames) {
        for (String tagName : tagNames) {
            String val = extractTag(xml, tagName);
            if (!val.isBlank()) return val;
        }
        return "";
    }

    // ─────────────────────────────────────────────
    //  유틸: JSON 단일 값 추출
    // ─────────────────────────────────────────────
    private String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx == -1) return "";
        int colon = json.indexOf(":", idx + search.length());
        if (colon == -1) return "";
        int vs = colon + 1;
        while (vs < json.length() && json.charAt(vs) == ' ') vs++;
        if (vs >= json.length()) return "";

        char first = json.charAt(vs);
        if (first == '"') {
            int end = json.indexOf("\"", vs + 1);
            if (end == -1) return "";
            return json.substring(vs + 1, end);
        } else if (first == 'n') {
            return "";
        } else {
            int end = vs;
            while (end < json.length() && json.charAt(end) != ','
                    && json.charAt(end) != '}' && json.charAt(end) != ']') end++;
            return json.substring(vs, end).trim();
        }
    }
}
