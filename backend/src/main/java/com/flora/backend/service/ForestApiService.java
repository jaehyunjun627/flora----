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

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("산림청 API 키가 설정되지 않았습니다.");
            return fallbackPlants();
        }

        try {
            // 빈 검색어일 때 전체 목록 조회를 위해 기본 검색어 사용
            // (산림청 API는 searchWord 없으면 결과 없음)
            String actualWord = (searchWord != null && !searchWord.isBlank()) ? searchWord : "";
            String url = SEARCH_URL
                    + "?serviceKey=" + apiKey
                    + "&searchWord=" + actualWord
                    + "&pageNo=" + pageNo
                    + "&numOfRows=" + numOfRows
                    + "&type=json";

            log.info("산림청 식물 검색 URL: {}", url);
            String response = restTemplate.getForObject(URI.create(url), String.class);
            log.debug("산림청 응답: {}", response);

            if (response == null) return fallbackPlants();

            // API 에러 응답 체크 (SERVICEKEY_IS_NOT_REGISTERED_ERROR 등)
            if (response.contains("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")
                    || response.contains("SERVICEKEY_IS_NOT_REGISTERED_ERROR")
                    || response.contains("LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR")
                    || response.contains("resultCode\":\"3")
                    || response.contains("OpenAPI_ServiceResponse")) {
                log.warn("산림청 API 에러 응답 - fallback 데이터 사용: {}", response.substring(0, Math.min(200, response.length())));
                return fallbackPlants();
            }

            Map<String, Object> result;
            if (response.trim().startsWith("{")) {
                result = parseJsonList(response);
            } else {
                result = parseXmlList(response);
            }

            // 파싱 결과가 비어있으면 fallback
            @SuppressWarnings("unchecked")
            List<?> items = (List<?>) result.get("items");
            if (items == null || items.isEmpty()) {
                log.warn("산림청 API 결과 없음 - fallback 데이터 사용");
                return (searchWord != null && !searchWord.isBlank()) ? result : fallbackPlants();
            }

            return result;

        } catch (Exception e) {
            log.error("산림청 API 호출 실패: {}", e.getMessage());
            return fallbackPlants();
        }
    }

    // ─────────────────────────────────────────────
    //  식물 상세 정보
    // ─────────────────────────────────────────────
    public Map<String, Object> getPlantDetail(String taxonId) {
        Map<String, Object> result = new HashMap<>();

        if (apiKey == null || apiKey.isBlank()) {
            result.put("error", "API 키가 설정되지 않았습니다");
            return result;
        }

        try {
            String url = DETAIL_URL
                    + "?serviceKey=" + apiKey
                    + "&id=" + taxonId
                    + "&type=json";

            log.info("산림청 식물 상세 URL: {}", url);
            String response = restTemplate.getForObject(URI.create(url), String.class);

            if (response == null) return result;
            if (response.trim().startsWith("{")) return parseJsonDetail(response);
            return parseXmlDetail(response);

        } catch (Exception e) {
            log.error("산림청 상세 API 호출 실패: {}", e.getMessage());
            result.put("error", "식물 상세 정보 조회 실패");
            return result;
        }
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
    //  API 실패 시 기본 데이터
    // ─────────────────────────────────────────────
    private Map<String, Object> fallbackPlants() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> items = new ArrayList<>();

        Object[][] data = {
            {"장미",     "Rosa hybrida",               "장미과",       "장미목",       "rose",             "정명"},
            {"튤립",     "Tulipa gesneriana",           "백합과",       "백합목",       "tulip",            "정명"},
            {"국화",     "Chrysanthemum morifolium",    "국화과",       "국화목",       "chrysanthemum",    "정명"},
            {"진달래",   "Rhododendron mucronulatum",   "진달래과",     "진달래목",     "azalea",           "정명"},
            {"개나리",   "Forsythia koreana",           "물푸레나무과", "물푸레나무목", "Korean forsythia", "정명"},
            {"벚나무",   "Prunus serrulata",            "장미과",       "장미목",       "cherry blossom",   "정명"},
            {"라벤더",   "Lavandula angustifolia",      "꿀풀과",       "꿀풀목",       "lavender",         "정명"},
            {"해바라기", "Helianthus annuus",           "국화과",       "국화목",       "sunflower",        "정명"},
            {"연꽃",     "Nelumbo nucifera",            "수련과",       "수련목",       "lotus",            "정명"},
            {"민들레",   "Taraxacum officinale",        "국화과",       "국화목",       "dandelion",        "정명"},
            {"무궁화",   "Hibiscus syriacus",           "아욱과",       "아욱목",       "rose of sharon",   "정명"},
            {"은행나무", "Ginkgo biloba",               "은행나무과",   "은행나무목",   "ginkgo",           "정명"},
        };

        for (int i = 0; i < data.length; i++) {
            Map<String, Object> p = new HashMap<>();
            p.put("taxonId",       String.valueOf(1000 + i));
            p.put("korName",        data[i][0]);
            p.put("scientificName", data[i][1]);
            p.put("familyKorName",  data[i][2]);
            p.put("orderKorName",   data[i][3]);
            p.put("engName",        data[i][4]);
            p.put("nameStatus",     data[i][5]);
            items.add(p);
        }

        result.put("items", items);
        result.put("totalCount", items.size());
        return result;
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
