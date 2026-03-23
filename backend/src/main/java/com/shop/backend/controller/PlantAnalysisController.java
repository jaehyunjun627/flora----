package com.shop.backend.controller;

import com.shop.backend.dto.PlantAnalysisRequestDto;
import com.shop.backend.dto.PlantAnalysisResponseDto;
import com.shop.backend.service.PlantAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plants")
@CrossOrigin(origins = "http://localhost:5173")
public class PlantAnalysisController {

    @Autowired
    private PlantAnalysisService plantAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<PlantAnalysisResponseDto> analyze(@RequestBody PlantAnalysisRequestDto request) {
        PlantAnalysisResponseDto result = plantAnalysisService.analyze(request);
        return ResponseEntity.ok(result);
    }
}
