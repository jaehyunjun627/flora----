package com.flora.backend.controller;

import com.flora.backend.service.FestivalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalService festivalService;

    @GetMapping
    public ResponseEntity<?> getFestivals(
            @RequestParam(defaultValue = "upcoming") String filter) {
        if ("all".equals(filter)) {
            return ResponseEntity.ok(festivalService.getAllFestivals());
        }
        return ResponseEntity.ok(festivalService.getUpcomingFestivals());
    }
}
