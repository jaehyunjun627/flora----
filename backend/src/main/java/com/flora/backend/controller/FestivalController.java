package com.flora.backend.controller;

import com.flora.backend.service.FestivalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 지역축제(꽃 축제) REST API.
 * - GET /api/festivals              : 진행 중 + 예정 축제 목록
 * - GET /api/festivals/all          : 전체 (지난 축제 포함)
 * - GET /api/festivals/region/{r}   : 특정 지역 축제
 */
@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalController {
    private final FestivalService festivalService;

    @GetMapping
    public ResponseEntity<?> getUpcoming() {
        return ResponseEntity.ok(festivalService.getUpcomingFestivals());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(festivalService.getAllFestivals());
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<?> getByRegion(@PathVariable String region) {
        return ResponseEntity.ok(festivalService.getFestivalsByRegion(region));
    }
}
