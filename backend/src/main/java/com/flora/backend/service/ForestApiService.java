package com.flora.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
@Slf4j
public class ForestApiService {

    @Value("${external.forest.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // 농촌진흥청 실내정원용 식물 API
    private static final String GARDEN_PLANT_URL =
            "http://api.nongsaro.go.kr/service/garden/gardenList";
    private static final String GARDEN_DETAIL_URL =
            "http://api.nongsaro.go.kr/service/garden/gardenDtl";

    /**
     * 실내정원용 식물 목록 검색
     * @param searchWord 검색어 (예: "장미", "튤립")
     * @param pageNo     페이지 번호
     * @return 식물 목록
     */
    public Map<String, Object> searchPlants(String searchWord, int pageNo) {
        Map<String, Object> result = new HashMap<>();
        result.put("total", 0);
        result.put("plants", new ArrayList<>());

        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("YOUR_")) {
            log.warn("산림청/농촌진흥청 API 키가 설정되지 않았습니다.");
            result.put("error", "공공데이터 API 키가 설정되지 않았습니다");
            return result;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(GARDEN_PLANT_URL)
                    .queryParam("apiKey", apiKey)
                    .queryParam("sType", "sCntntsSj")
                    .queryParam("sText", searchWord)
                    .queryParam("pageNo", pageNo)
                    .queryParam("numOfRows", 12)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            result = parseGardenListXml(response);

        } catch (Exception e) {
            log.error("산림청 API 호출 실패: {}", e.getMessage());
            result.put("error", "식물 정보 조회 중 오류가 발생했습니다");
        }

        return result;
    }

    /**
     * 식물 상세 정보 조회
     * @param cntntsNo 컨텐츠 번호
     * @return 식물 상세 정보 (학명, 영명, 관리법, 이미지 등)
     */
    public Map<String, Object> getPlantDetail(String cntntsNo) {
        Map<String, Object> result = new HashMap<>();

        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("YOUR_")) {
            result.put("error", "공공데이터 API 키가 설정되지 않았습니다");
            return result;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(GARDEN_DETAIL_URL)
                    .queryParam("apiKey", apiKey)
                    .queryParam("cntntsNo", cntntsNo)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            result = parseGardenDetailXml(response);

        } catch (Exception e) {
            log.error("산림청 상세 API 호출 실패: {}", e.getMessage());
            result.put("error", "식물 상세 정보 조회 실패");
        }

        return result;
    }

    private Map<String, Object> parseGardenListXml(String xml) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, String>> plants = new ArrayList<>();

        try {
            // 간단한 XML 파싱 (태그 기반)
            String[] items = xml.split("<item>");
            int total = 0;

            // totalCount 추출
            if (xml.contains("<totalCount>")) {
                String totalStr = xml.substring(
                        xml.indexOf("<totalCount>") + 12,
                        xml.indexOf("</totalCount>"));
                total = Integer.parseInt(totalStr.trim());
            }

            for (int i = 1; i < items.length; i++) {
                Map<String, String> plant = new HashMap<>();
                plant.put("cntntsNo", extractTag(items[i], "cntntsNo"));
                plant.put("cntntsSj", extractTag(items[i], "cntntsSj"));       // 식물명
                plant.put("rtnFileUrl", extractTag(items[i], "rtnFileUrl"));     // 썸네일 이미지
                plant.put("rtnStreFileNm", extractTag(items[i], "rtnStreFileNm"));
                plants.add(plant);
            }

            result.put("total", total);
        } catch (Exception e) {
            log.error("XML 파싱 실패: {}", e.getMessage());
            result.put("total", 0);
        }

        result.put("plants", plants);
        return result;
    }

    private Map<String, Object> parseGardenDetailXml(String xml) {
        Map<String, Object> result = new HashMap<>();

        try {
            result.put("cntntsNo", extractTag(xml, "cntntsNo"));
            result.put("cntntsSj", extractTag(xml, "cntntsSj"));         // 식물명
            result.put("plntbneNm", extractTag(xml, "plntbneNm"));       // 학명
            result.put("plntzrNm", extractTag(xml, "plntzrNm"));         // 영명
            result.put("fmlNm", extractTag(xml, "fmlNm"));               // 과명
            result.put("orgplceInfo", extractTag(xml, "orgplceInfo"));    // 원산지
            result.put("adviseInfo", extractTag(xml, "adviseInfo"));      // 관리 조언
            result.put("fncltyInfo", extractTag(xml, "fncltyInfo"));      // 기능성
            result.put("grwhTpCodeNm", extractTag(xml, "grwhTpCodeNm")); // 생장 온도
            result.put("hdCodeNm", extractTag(xml, "hdCodeNm"));         // 습도
            result.put("lighttdemanddoCodeNm", extractTag(xml, "lighttdemanddoCodeNm")); // 광요구도
            result.put("watercycleCodeNm", extractTag(xml, "watercycleCodeNm")); // 물주기
            result.put("rtnFileUrl", extractTag(xml, "rtnFileUrl"));     // 이미지
            result.put("rtnStreFileNm", extractTag(xml, "rtnStreFileNm"));
        } catch (Exception e) {
            log.error("상세 XML 파싱 실패: {}", e.getMessage());
        }

        return result;
    }

    private String extractTag(String xml, String tagName) {
        String open = "<" + tagName + ">";
        String close = "</" + tagName + ">";
        int start = xml.indexOf(open);
        int end = xml.indexOf(close);
        if (start == -1 || end == -1) return "";
        return xml.substring(start + open.length(), end).trim();
    }
}
