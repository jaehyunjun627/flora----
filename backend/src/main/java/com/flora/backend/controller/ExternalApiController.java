package com.flora.backend.controller;

import com.flora.backend.service.ForestApiService;
import com.flora.backend.service.PixabayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/external")
@RequiredArgsConstructor
public class ExternalApiController {

    private final PixabayService pixabayService;
    private final ForestApiService forestApiService;

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
}
