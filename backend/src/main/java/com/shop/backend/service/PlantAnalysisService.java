package com.shop.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.backend.dto.PlantAnalysisRequestDto;
import com.shop.backend.dto.PlantAnalysisResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class PlantAnalysisService {

    @Value("${anthropic.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-haiku-4-5-20251001";

    public PlantAnalysisResponseDto analyze(PlantAnalysisRequestDto request) {
        String prompt = buildPrompt(request);

        Map<String, Object> body = Map.of(
                "model", CLAUDE_MODEL,
                "max_tokens", 512,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    CLAUDE_API_URL, HttpMethod.POST, entity, String.class
            );
            return parseResponse(response.getBody());
        } catch (Exception e) {
            return fallbackResponse();
        }
    }

    private String buildPrompt(PlantAnalysisRequestDto req) {
        return String.format(
                "당신은 식물 관리 전문가입니다. 아래 식물의 케어 일정을 JSON 형식으로만 반환해주세요. " +
                "다른 설명 없이 JSON만 출력하세요.\n\n" +
                "식물 이름: %s\n" +
                "종류: %s\n\n" +
                "반환 형식 (숫자는 일 단위):\n" +
                "{\n" +
                "  \"wateringInterval\": <정수>,\n" +
                "  \"repottingInterval\": <정수>,\n" +
                "  \"fertilizingInterval\": <정수 또는 null>,\n" +
                "  \"pruningInterval\": <정수 또는 null>,\n" +
                "  \"careNotes\": \"<한국어로 한 줄 케어 팁>\"\n" +
                "}",
                req.getPlantName(),
                req.getPlantType() != null ? req.getPlantType() : "일반"
        );
    }

    private PlantAnalysisResponseDto parseResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("content").get(0).path("text").asText();

            content = content.trim();
            if (content.startsWith("```")) {
                content = content.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            return objectMapper.readValue(content, PlantAnalysisResponseDto.class);
        } catch (Exception e) {
            return fallbackResponse();
        }
    }

    private PlantAnalysisResponseDto fallbackResponse() {
        PlantAnalysisResponseDto dto = new PlantAnalysisResponseDto();
        dto.setWateringInterval(7);
        dto.setRepottingInterval(180);
        dto.setCareNotes("밝은 간접광에 두고, 흙이 마르면 물을 주세요.");
        return dto;
    }
}
