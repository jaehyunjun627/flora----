package com.flora.backend.service;

import com.flora.backend.document.UserPlant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class OpenAiService {

    @Value("${external.openai.api-key:}")
    private String apiKey;

    @Value("${external.openai.model:gpt-4o-mini}")
    private String model;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * ChatGPT에게 식물 정보의 사실 여부를 검증하도록 요청
     * @return null이면 검증 통과, 문자열이면 오류 메시지
     */
    public String validatePlantFact(UserPlant plant) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_OPENAI_API_KEY_HERE")) {
            log.warn("OpenAI API 키가 설정되지 않았습니다. AI 검증을 건너뜁니다.");
            return null; // API 키 없으면 검증 통과로 처리
        }

        String prompt = buildPrompt(plant);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(
                Map.of("role", "system", "content",
                    "당신은 식물 전문가입니다. 사용자가 입력한 식물 정보의 사실 여부를 검증합니다. " +
                    "반드시 JSON 형식으로만 응답하세요: {\"valid\": true/false, \"reason\": \"이유\"}. " +
                    "식물 이름이 실존하지 않거나, 계절/독성/관리법이 명백히 틀린 경우에만 false로 응답하세요. " +
                    "확실하지 않거나 일반적인 식물이면 true로 응답하세요."),
                message
            ));
            body.put("max_tokens", 300);
            body.put("temperature", 0.1);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map responseBody = response.getBody();
                List choices = (List) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map messageObj = (Map) choice.get("message");
                    String content = (String) messageObj.get("content");

                    // JSON 파싱
                    return parseValidationResult(content);
                }
            }
        } catch (Exception e) {
            log.error("OpenAI API 호출 실패: {}", e.getMessage());
            // API 오류 시 검증 통과 처리 (서비스 중단 방지)
        }

        return null; // 오류 시 통과
    }

    private String buildPrompt(UserPlant plant) {
        StringBuilder sb = new StringBuilder();
        sb.append("다음 식물 정보가 사실에 부합하는지 검증해주세요:\n\n");
        sb.append("식물 이름: ").append(plant.getName()).append("\n");
        if (plant.getScientificName() != null && !plant.getScientificName().isBlank()) {
            sb.append("학명: ").append(plant.getScientificName()).append("\n");
        }
        sb.append("계절: ").append(plant.getSeason()).append("\n");
        sb.append("설명: ").append(plant.getDescription()).append("\n");
        sb.append("독성 여부: ").append(plant.getToxicity()).append("\n");
        if (plant.getIsToxicToPets() != null) {
            sb.append("반려동물 독성: ").append(plant.getIsToxicToPets() ? "독성 있음" : "독성 없음").append("\n");
        }
        sb.append("\n이 식물이 실존하는지, 정보가 명백히 틀리지 않은지 확인해주세요.");
        return sb.toString();
    }

    private String parseValidationResult(String content) {
        try {
            // 간단한 JSON 파싱 (Jackson 없이)
            content = content.trim();
            // 코드블럭 제거
            if (content.startsWith("```")) {
                content = content.replaceAll("```json?", "").replace("```", "").trim();
            }

            boolean valid = content.contains("\"valid\": true") || content.contains("\"valid\":true");
            if (!valid) {
                // reason 추출
                String reason = "식물 정보가 사실에 부합하지 않습니다.";
                int reasonIdx = content.indexOf("\"reason\":");
                if (reasonIdx != -1) {
                    String afterReason = content.substring(reasonIdx + 9).trim();
                    if (afterReason.startsWith("\"")) {
                        int end = afterReason.indexOf("\"", 1);
                        if (end > 0) {
                            reason = afterReason.substring(1, end);
                        }
                    }
                }
                return "AI 검증 실패: " + reason;
            }
        } catch (Exception e) {
            log.error("AI 응답 파싱 실패: {}", e.getMessage());
        }
        return null; // 검증 통과
    }
}
