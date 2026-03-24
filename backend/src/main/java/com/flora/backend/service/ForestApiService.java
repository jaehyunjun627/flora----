package com.flora.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;

@Service
@Slf4j
public class ForestApiService {

    @Value("${external.forest.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // 산림청 국립수목원 국가표준식물목록 API
    private static final String BASE_URL   = "https://apis.data.go.kr/1400119/KpniService";
    private static final String SEARCH_URL = BASE_URL + "/scnmSearch";  // 식물 학명 목록 조회
    private static final String DETAIL_URL = BASE_URL + "/scnmInfo";    // 식물 학명 상세 조회

    // ─────────────────────────────────────────────
    //  식물 목록 검색
    // ─────────────────────────────────────────────
    public Map<String, Object> searchPlants(String searchWord, int pageNo, int numOfRows) {

        // 먼저 산림청 API 시도, 실패 시 자체 데이터에서 검색
        if (apiKey != null && !apiKey.isBlank() && searchWord != null && !searchWord.isBlank()) {
            try {
                String url = SEARCH_URL
                        + "?serviceKey=" + apiKey
                        + "&searchWord=" + searchWord
                        + "&pageNo=" + pageNo
                        + "&numOfRows=" + numOfRows
                        + "&type=json";

                log.info("산림청 식물 검색 URL: {}", url);
                String response = restTemplate.getForObject(URI.create(url), String.class);
                log.debug("산림청 응답: {}", response != null ? response.substring(0, Math.min(300, response.length())) : "null");

                if (response != null
                        && !response.contains("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")
                        && !response.contains("SERVICEKEY_IS_NOT_REGISTERED_ERROR")
                        && !response.contains("OpenAPI_ServiceResponse")
                        && !response.contains("resultCode\":\"3")) {

                    Map<String, Object> result;
                    if (response.trim().startsWith("{")) {
                        result = parseJsonList(response);
                    } else {
                        result = parseXmlList(response);
                    }

                    @SuppressWarnings("unchecked")
                    List<?> items = (List<?>) result.get("items");
                    if (items != null && !items.isEmpty()) {
                        return result;  // 산림청 API 성공!
                    }
                }
            } catch (Exception e) {
                log.warn("산림청 API 호출 실패, 자체 데이터 사용: {}", e.getMessage());
            }
        }

        // fallback: 자체 식물 DB에서 검색 + 페이지네이션
        return fallbackSearch(searchWord, pageNo, numOfRows);
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

        // 산림청 API로 상세 조회
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String url = DETAIL_URL
                        + "?serviceKey=" + apiKey
                        + "&id=" + taxonId
                        + "&type=json";

                log.info("산림청 식물 상세 URL: {}", url);
                String response = restTemplate.getForObject(URI.create(url), String.class);

                if (response != null) {
                    if (response.trim().startsWith("{")) return parseJsonDetail(response);
                    return parseXmlDetail(response);
                }
            } catch (Exception e) {
                log.error("산림청 상세 API 호출 실패: {}", e.getMessage());
            }
        }

        Map<String, Object> empty = new HashMap<>();
        empty.put("error", "식물 상세 정보를 찾을 수 없습니다");
        return empty;
    }

    // ─────────────────────────────────────────────
    //  JSON 파싱 - 목록
    // ─────────────────────────────────────────────
    private Map<String, Object> parseJsonList(String json) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();

        try {
            int total = 0;
            if (json.contains("\"totalCount\"")) {
                try { total = Integer.parseInt(extractJsonValue(json, "totalCount")); }
                catch (Exception ignore) {}
            }

            // {item} 블록 단위로 파싱
            String[] parts = json.split("\\{");
            for (String part : parts) {
                if (part.contains("taxonId") || part.contains("korName")) {
                    Map<String, Object> plant = buildPlantMap(part, false);
                    String korName = (String) plant.get("korName");
                    if (korName != null && !korName.isBlank()) items.add(plant);
                }
            }

            result.put("items", items);
            result.put("totalCount", total > 0 ? total : items.size());

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
        return buildPlantMap(json, true);
    }

    // ─────────────────────────────────────────────
    //  공통 식물 Map 생성
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
                plant.put("taxonId",        extractTag(parts[i], "taxonId"));
                plant.put("korName",         extractTag(parts[i], "korName"));
                plant.put("scientificName",  extractTag(parts[i], "scientificName"));
                plant.put("engName",         extractTag(parts[i], "engName"));
                plant.put("genusKorName",    extractTag(parts[i], "genusKorName"));
                plant.put("familyKorName",   extractTag(parts[i], "familyKorName"));
                plant.put("orderKorName",    extractTag(parts[i], "orderKorName"));
                plant.put("nameStatus",      extractTag(parts[i], "nameStatus"));

                String korName = (String) plant.get("korName");
                if (korName != null && !korName.isBlank()) items.add(plant);
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
            p.put("taxonId",         extractTag(xml, "taxonId"));
            p.put("korName",          extractTag(xml, "korName"));
            p.put("scientificName",   extractTag(xml, "scientificName"));
            p.put("engName",          extractTag(xml, "engName"));
            p.put("genusKorName",     extractTag(xml, "genusKorName"));
            p.put("familyKorName",    extractTag(xml, "familyKorName"));
            p.put("orderKorName",     extractTag(xml, "orderKorName"));
            p.put("classKorName",     extractTag(xml, "classKorName"));
            p.put("divisionKorName",  extractTag(xml, "divisionKorName"));
            p.put("nameStatus",       extractTag(xml, "nameStatus"));
            p.put("description",      extractTag(xml, "description"));
            p.put("habitat",          extractTag(xml, "habitat"));
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
        // {한글명, 학명, 과명, 목명, 영명, 상태, 설명, 서식지}
        String[][] data = {
            {"장미",       "Rosa hybrida",               "장미과",       "장미목",       "rose",              "정명", "가시가 있는 줄기에 아름다운 꽃이 피는 관목으로, 전 세계에서 가장 사랑받는 관상식물이다. 붉은색, 분홍색, 흰색, 노란색 등 다양한 품종이 있다.", "정원, 화단, 온실"},
            {"튤립",       "Tulipa gesneriana",           "백합과",       "백합목",       "tulip",             "정명", "봄에 피는 구근식물로, 컵 모양의 꽃이 특징이다. 네덜란드의 국화로 유명하며 다양한 색상과 무늬의 품종이 있다.", "화단, 정원, 화분"},
            {"국화",       "Chrysanthemum morifolium",    "국화과",       "국화목",       "chrysanthemum",     "정명", "가을을 대표하는 꽃으로 다양한 꽃잎 형태와 색상을 가진다. 차, 약재, 관상용으로 널리 이용된다.", "정원, 화단"},
            {"진달래",     "Rhododendron mucronulatum",   "진달래과",     "진달래목",     "Korean azalea",     "정명", "한국 산야에 자생하는 낙엽관목으로 이른 봄 잎보다 먼저 분홍색 꽃이 핀다. 꽃잎은 식용 가능하여 화전을 만든다.", "산지, 숲 가장자리"},
            {"개나리",     "Forsythia koreana",           "물푸레나무과", "물푸레나무목", "Korean forsythia",  "정명", "한국 특산 식물로 이른 봄 노란색 꽃이 가지에 가득 핀다. 한국의 봄을 알리는 대표적인 꽃나무이다.", "산기슭, 정원, 공원"},
            {"벚나무",     "Prunus serrulata",            "장미과",       "장미목",       "cherry blossom",    "정명", "봄에 화려한 분홍색 또는 흰색 꽃이 피는 낙엽교목이다. 꽃이 만개할 때 꽃비가 내리는 풍경이 장관이다.", "산지, 공원, 가로수"},
            {"라벤더",     "Lavandula angustifolia",      "꿀풀과",       "꿀풀목",       "lavender",          "정명", "보라색 꽃과 강한 향기가 특징인 허브 식물이다. 아로마테라피, 향수, 차 등에 널리 사용된다.", "지중해 기후, 정원"},
            {"해바라기",   "Helianthus annuus",           "국화과",       "국화목",       "sunflower",         "정명", "태양을 향해 꽃대가 움직이는 큰 노란 꽃이 특징인 한해살이풀이다. 씨앗은 식용유와 간식으로 이용된다.", "밭, 정원, 공원"},
            {"연꽃",       "Nelumbo nucifera",            "연꽃과",       "프로테아목",   "lotus flower",      "정명", "수생 식물로 진흙에서 자라면서도 아름다운 꽃을 피운다. 불교에서 청정함의 상징으로 여겨진다.", "연못, 저수지, 습지"},
            {"민들레",     "Taraxacum officinale",        "국화과",       "국화목",       "dandelion",         "정명", "노란 꽃이 진 뒤 하얀 솜털 같은 씨앗이 바람에 날린다. 잎은 나물로, 뿌리는 차나 약재로 이용된다.", "들판, 길가, 초원"},
            {"무궁화",     "Hibiscus syriacus",           "아욱과",       "아욱목",       "rose of sharon",    "정명", "대한민국의 국화로, 여름부터 가을까지 끊임없이 꽃이 핀다. 이름처럼 영원히 피고 지지 않는 꽃이라는 뜻이다.", "정원, 공원, 울타리"},
            {"은행나무",   "Ginkgo biloba",               "은행나무과",   "은행나무목",   "ginkgo tree",       "정명", "살아있는 화석이라 불리는 세계에서 가장 오래된 나무 중 하나이다. 가을에 노란 부채꼴 잎이 장관을 이룬다.", "가로수, 공원, 사찰"},
            {"수선화",     "Narcissus tazetta",           "수선화과",     "비짜루목",     "narcissus",         "정명", "이른 봄 향기로운 흰색 또는 노란색 꽃이 피는 구근식물이다. 수선(水仙)이란 물가의 신선이라는 뜻이다.", "정원, 화단, 화분"},
            {"카네이션",   "Dianthus caryophyllus",       "석죽과",       "석죽목",       "carnation",         "정명", "어버이날을 상징하는 꽃으로, 감사와 사랑의 의미를 담고 있다. 다양한 색상의 겹꽃이 특징이다.", "정원, 온실, 화분"},
            {"백합",       "Lilium longiflorum",          "백합과",       "백합목",       "lily flower",       "정명", "우아한 나팔 모양의 흰 꽃이 피며, 강한 향기가 특징이다. 순결과 순수의 상징으로 여겨진다.", "정원, 화단, 온실"},
            {"목련",       "Magnolia kobus",              "목련과",       "목련목",       "magnolia",          "정명", "봄 잎이 나기 전 크고 흰 꽃이 가지 끝에 핀다. 향기가 좋아 정원수로 인기가 많다.", "산지, 정원, 공원"},
            {"철쭉",       "Rhododendron schlippenbachii", "진달래과",    "진달래목",     "royal azalea",      "정명", "진달래와 비슷하지만 꽃이 더 크고 잎과 함께 핀다. 봄 산을 분홍빛으로 물들이는 아름다운 꽃이다.", "산지, 정원"},
            {"동백나무",   "Camellia japonica",           "차나무과",     "차나무목",     "camellia",          "정명", "겨울부터 이른 봄에 빨간 꽃이 피는 상록 교목이다. 꽃이 질 때 꽃잎이 하나씩 떨어지지 않고 통째로 떨어진다.", "남부지방, 섬, 해안"},
            {"매화",       "Prunus mume",                 "장미과",       "장미목",       "plum blossom",      "정명", "이른 봄 추위 속에서 가장 먼저 꽃을 피워 선비의 절개를 상징한다. 매실 열매는 건강식품으로 이용된다.", "산기슭, 정원, 과수원"},
            {"작약",       "Paeonia lactiflora",          "작약과",       "범의귀목",     "peony",             "정명", "크고 풍성한 꽃이 특징으로 함박꽃이라고도 불린다. 뿌리는 한방 약재로 사용된다.", "정원, 화단, 약초밭"},
            {"코스모스",   "Cosmos bipinnatus",           "국화과",       "국화목",       "cosmos flower",     "정명", "가을 들판을 수놓는 대표적인 꽃으로 분홍, 흰색, 자주색 꽃이 핀다. 가느다란 줄기가 바람에 흔들리는 모습이 아름답다.", "들판, 도로변, 공원"},
            {"수국",       "Hydrangea macrophylla",       "수국과",       "층층나무목",   "hydrangea",         "정명", "토양 산도에 따라 꽃 색이 파란색 또는 분홍색으로 변하는 신기한 식물이다. 여름에 풍성한 꽃송이가 핀다.", "정원, 화단, 공원"},
            {"봉선화",     "Impatiens balsamina",         "봉선화과",     "진달래목",     "balsam flower",     "정명", "여름에 빨간 꽃이 피며, 꽃잎으로 손톱을 물들이는 전통이 있다. 익은 열매를 건드리면 씨가 튀어나온다.", "정원, 화단, 화분"},
            {"나팔꽃",     "Ipomoea nil",                 "메꽃과",       "가지목",       "morning glory",     "정명", "아침에 피었다가 오후에 시드는 덩굴식물이다. 파란색, 분홍색, 보라색 나팔 모양 꽃이 특징이다.", "울타리, 정원, 화분"},
            {"패랭이꽃",   "Dianthus chinensis",          "석죽과",       "석죽목",       "Chinese pink",      "정명", "분홍색 또는 붉은색의 작은 꽃이 군락으로 피어 화단을 수놓는다. 꽃잎 가장자리에 톱니 모양이 있다.", "산지, 초원, 화단"},
            {"수련",       "Nymphaea tetragona",          "수련과",       "수련목",       "water lily",        "정명", "수면 위에 떠서 피는 아름다운 수생 식물이다. 연꽃과 달리 잎과 꽃이 수면에 붙어 있다.", "연못, 저수지, 수조"},
            {"제비꽃",     "Viola mandshurica",           "제비꽃과",     "말피기목",     "violet flower",     "정명", "봄에 보라색 작은 꽃이 피는 여러해살이풀이다. 제비가 돌아올 때 피어서 제비꽃이라 불린다.", "산야, 길가, 풀밭"},
            {"칸나",       "Canna indica",                "칸나과",       "생강목",       "canna lily",        "정명", "여름부터 가을까지 빨강, 노랑, 주황의 크고 화려한 꽃이 피는 열대 식물이다.", "화단, 공원, 정원"},
            {"백일홍",     "Zinnia elegans",              "국화과",       "국화목",       "zinnia flower",     "정명", "이름처럼 오랫동안 꽃이 피어 백일 동안 붉다는 뜻이다. 다양한 색상의 꽃이 여름 정원을 밝힌다.", "정원, 화단, 공원"},
            {"금잔화",     "Calendula officinalis",       "국화과",       "국화목",       "marigold",          "정명", "주황색 또는 노란색 꽃이 피며, 식용과 약용으로 모두 사용된다. 피부 진정 효과가 있어 화장품에도 쓰인다.", "정원, 화단, 약초밭"},
            {"아이리스",   "Iris ensata",                 "붓꽃과",       "비짜루목",     "iris flower",       "정명", "붓꽃이라고도 불리며, 보라색 또는 흰색의 우아한 꽃이 특징이다. 습지나 물가에서 잘 자란다.", "습지, 연못 가장자리"},
            {"프리지아",   "Freesia refracta",            "붓꽃과",       "비짜루목",     "freesia flower",    "정명", "달콤한 향기와 밝은 색상의 깔때기 모양 꽃이 특징이다. 절화와 향수 원료로 인기가 높다.", "온실, 화분, 정원"},
            {"안개꽃",     "Gypsophila paniculata",       "석죽과",       "석죽목",       "baby breath flower","정명", "작은 흰 꽃이 안개처럼 무수히 피어 꽃다발의 대표적인 부자재로 사용된다.", "정원, 화단, 온실"},
            {"클레마티스", "Clematis patens",             "미나리아재비과","미나리아재비목","clematis flower",   "정명", "덩굴을 타고 올라가며 크고 화려한 꽃이 피는 식물이다. 으아리라고도 불린다.", "정원, 울타리, 파고라"},
            {"데이지",     "Bellis perennis",             "국화과",       "국화목",       "daisy flower",      "정명", "순수함을 상징하는 작고 사랑스러운 꽃이다. 흰 꽃잎과 노란 중심이 태양을 닮았다.", "정원, 화단, 잔디밭"},
            {"달리아",     "Dahlia pinnata",              "국화과",       "국화목",       "dahlia flower",     "정명", "크고 화려한 꽃이 피며, 색상과 형태가 매우 다양하다. 멕시코의 국화이기도 하다.", "정원, 화단"},
            {"허브제라늄", "Pelargonium graveolens",      "쥐손이풀과",   "쥐손이풀목",   "geranium flower",   "정명", "독특한 향이 나는 잎과 분홍색 꽃이 특징이다. 모기를 쫓는 효과가 있어 허브로 인기가 많다.", "화분, 베란다, 정원"},
            {"자스민",     "Jasminum officinale",         "물푸레나무과", "물푸레나무목", "jasmine flower",    "정명", "달콤하고 진한 향기가 나는 흰색 꽃이 특징이다. 자스민 차의 원료로도 유명하다.", "정원, 울타리, 화분"},
            {"란타나",     "Lantana camara",              "마편초과",     "꿀풀목",       "lantana flower",    "정명", "작은 꽃이 둥글게 모여 피며, 시간이 지남에 따라 색이 변하는 신기한 식물이다.", "정원, 화분, 지피식물"},
            {"스타티스",   "Limonium sinuatum",           "갯질경이과",   "석죽목",       "statice flower",    "정명", "건조해도 색과 형태가 유지되어 드라이플라워로 가장 인기 있는 꽃이다.", "정원, 화단, 온실"},
            {"산수유",     "Cornus officinalis",          "층층나무과",   "층층나무목",   "cornelian cherry",  "정명", "이른 봄 잎보다 먼저 노란색 작은 꽃이 나무를 뒤덮는다. 가을에 빨간 열매가 열리며 한약재로 쓰인다.", "산기슭, 정원, 공원"},
            {"소나무",     "Pinus densiflora",            "소나무과",     "소나무목",     "Korean red pine",   "정명", "한국을 대표하는 상록 침엽수로, 곧은 줄기와 붉은 수피가 특징이다. 솔방울과 잣은 식용된다.", "산지, 능선, 정원"},
            {"단풍나무",   "Acer palmatum",               "단풍나무과",   "무환자나무목", "Japanese maple",    "정명", "가을에 빨갛게 물드는 잎이 장관인 낙엽교목이다. 손바닥 모양의 잎이 특징적이다.", "산지, 정원, 공원"},
            {"대나무",     "Phyllostachys bambusoides",   "벼과",         "벼목",         "bamboo",            "정명", "빠르게 자라는 상록 풀로, 줄기는 건축자재와 공예품에 사용된다. 사군자 중 하나이다.", "산기슭, 정원, 대밭"},
            {"소철",       "Cycas revoluta",              "소철과",       "소철목",       "sago palm",         "정명", "열대 분위기를 내는 상록 식물로 깃털 같은 잎이 방사형으로 퍼진다. 살아있는 화석 식물이다.", "남부지방, 온실, 정원"},
            {"아카시아",   "Robinia pseudoacacia",        "콩과",         "콩목",         "black locust",      "정명", "5월에 흰색 꽃이 향기롭게 피며, 아카시아 꿀의 원료가 된다. 실제로는 아까시나무이다.", "산야, 길가, 공원"},
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
