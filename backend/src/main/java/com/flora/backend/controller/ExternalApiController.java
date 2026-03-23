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
    // 산림청(농촌진흥청) 식물 정보
    // ==========================================

    /**
     * 식물 목록 검색
     * GET /api/external/plants?q=장미&page=1
     */
    @GetMapping("/plants")
    public ResponseEntity<Map<String, Object>> searchPlants(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(forestApiService.searchPlants(q, page));
    }

    /**
     * 식물 상세 정보
     * GET /api/external/plants/{cntntsNo}
     */
    @GetMapping("/plants/{cntntsNo}")
    public ResponseEntity<Map<String, Object>> getPlantDetail(
            @PathVariable String cntntsNo) {
        return ResponseEntity.ok(forestApiService.getPlantDetail(cntntsNo));
    }
}
