package com.example.demo.controller;

import com.example.demo.dto.PlantAnalysisRequestDto;
import com.example.demo.dto.PlantAnalysisResponseDto;
import com.example.demo.service.PlantAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PlantAnalysisController {

    private final PlantAnalysisService plantAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<PlantAnalysisResponseDto> analyze(@RequestBody PlantAnalysisRequestDto request) {
        PlantAnalysisResponseDto result = plantAnalysisService.analyze(request);
        return ResponseEntity.ok(result);
    }
}
