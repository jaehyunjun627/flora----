package com.flora.backend.controller;

import com.flora.backend.service.ForestApiService;
import com.flora.backend.service.PixabayService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/external")
@RequiredArgsConstructor
public class ExternalApiController {

    private final PixabayService pixabayService;
    private final ForestApiService forestApiService;

    @Value("${external.forest.api-key:}")
    private String forestApiKey;

    // ==========================================
    // Pixabay 이미지 검색
    // ==========================================

    /**
     * 꽃/식물 이미지 검색
     * GET /api/external/pixabay?q=장미&page=1&perPage=12
     */
    @GetMapping("/pixabay")
    public ResponseEntity<Map<String, Object>> searchImages(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int perPage) {
        return ResponseEntity.ok(pixabayService.searchImages(q, page, perPage));
    }

    // ==========================================
    // 산림청 국가표준식물목록 API
    // ==========================================

    /**
     * 식물 목록 검색 (q 없으면 기본 목록)
     * GET /api/external/plants?q=장미&page=1&numOfRows=12
     */
    @GetMapping("/plants")
    public ResponseEntity<Map<String, Object>> searchPlants(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "") String searchWord,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int numOfRows) {
        // q 또는 searchWord 둘 다 지원
        String keyword = (searchWord != null && !searchWord.isBlank()) ? searchWord : q;
        return ResponseEntity.ok(forestApiService.searchPlants(keyword, page, numOfRows));
    }

    /**
     * 식물 상세 정보 (taxonId 기반)
     * GET /api/external/plants/{taxonId}
     */
    @GetMapping("/plants/{taxonId}")
    public ResponseEntity<Map<String, Object>> getPlantDetail(
            @PathVariable String taxonId) {
        return ResponseEntity.ok(forestApiService.getPlantDetail(taxonId));
    }

    // ==========================================
    // 산림청 API 진단 엔드포인트
    // ==========================================

    /**
     * API 연결 진단 — 브라우저에서 직접 호출하여 확인
     * GET /api/external/plants/debug
     */
    @GetMapping("/plants/debug")
    public ResponseEntity<Map<String, Object>> debugForestApi() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("apiKeyPresent", forestApiKey != null && !forestApiKey.isBlank());
        result.put("apiKeyLength", forestApiKey != null ? forestApiKey.length() : 0);
        result.put("apiKeyPreview", forestApiKey != null && forestApiKey.length() > 8
                ? forestApiKey.substring(0, 8) + "..." : "empty");

        RestTemplate rt = new RestTemplate();
        String[] endpoints = {
            "https://apis.data.go.kr/1400119/KpniService/scnmSearch",
            "https://apis.data.go.kr/1400119/NtnStndaPlantListService/scnmSearch"
        };

        for (String ep : endpoints) {
            String label = ep.contains("KpniService") ? "v1_KpniService" : "v2_NtnStndaPlantListService";
            try {
                String encodedKey = URLEncoder.encode(forestApiKey, StandardCharsets.UTF_8);
                String url = ep + "?serviceKey=" + encodedKey + "&pageNo=1&numOfRows=3&type=json";
                String response = rt.getForObject(URI.create(url), String.class);
                if (response != null) {
                    result.put(label + "_status", "응답 수신");
                    result.put(label + "_length", response.length());
                    result.put(label + "_preview", response.substring(0, Math.min(500, response.length())));
                    result.put(label + "_hasError",
                            response.contains("SERVICE_KEY_IS_NOT_REGISTERED_ERROR")
                            || response.contains("SERVICE_ACCESS_DENIED")
                            || response.contains("<OpenAPI_ServiceResponse>"));
                } else {
                    result.put(label + "_status", "null 응답");
                }
            } catch (Exception e) {
                result.put(label + "_status", "에러: " + e.getMessage());
            }
        }

        // searchWord 파라미터도 테스트 (v1은 searchWord, v2는 sText 등)
        try {
            String encodedKey = URLEncoder.encode(forestApiKey, StandardCharsets.UTF_8);
            // sText 파라미터 시도 (v1)
            String url1 = endpoints[0] + "?serviceKey=" + encodedKey + "&pageNo=1&numOfRows=3&type=json&sText="
                    + URLEncoder.encode("장미", StandardCharsets.UTF_8);
            String res1 = rt.getForObject(URI.create(url1), String.class);
            result.put("v1_sText_search", res1 != null ? res1.substring(0, Math.min(300, res1.length())) : "null");
        } catch (Exception e) {
            result.put("v1_sText_search", "에러: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
    }
}
