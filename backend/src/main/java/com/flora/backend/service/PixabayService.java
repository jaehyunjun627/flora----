package com.flora.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class PixabayService {

    @Value("${external.pixabay.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String PIXABAY_URL = "https://pixabay.com/api/";

    /**
     * Pixabay에서 꽃/식물 이미지 검색
     * @param query 검색어 (예: "장미", "튤립")
     * @param page  페이지 번호 (1부터)
     * @param perPage 한 페이지당 결과 수 (3~200)
     * @return 이미지 목록 (id, previewURL, webformatURL, largeImageURL, tags)
     */
    public Map<String, Object> searchImages(String query, int page, int perPage) {
        Map<String, Object> result = new HashMap<>();
        result.put("total", 0);
        result.put("hits", new ArrayList<>());

        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("YOUR_")) {
            log.warn("Pixabay API 키가 설정되지 않았습니다. application.yml에서 설정해주세요.");
            result.put("error", "Pixabay API 키가 설정되지 않았습니다");
            return result;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(PIXABAY_URL)
                    .queryParam("key", apiKey)
                    .queryParam("q", query)
                    .queryParam("image_type", "photo")
                    .queryParam("category", "nature")
                    .queryParam("lang", "ko")
                    .queryParam("page", page)
                    .queryParam("per_page", Math.min(perPage, 50))
                    .queryParam("safesearch", true)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            int total = root.path("total").asInt(0);
            result.put("total", total);

            List<Map<String, Object>> hits = new ArrayList<>();
            for (JsonNode hit : root.path("hits")) {
                Map<String, Object> image = new HashMap<>();
                image.put("id", hit.path("id").asLong());
                image.put("previewURL", hit.path("previewURL").asText());
                image.put("webformatURL", hit.path("webformatURL").asText());
                image.put("largeImageURL", hit.path("largeImageURL").asText());
                image.put("tags", hit.path("tags").asText());
                image.put("imageWidth", hit.path("imageWidth").asInt());
                image.put("imageHeight", hit.path("imageHeight").asInt());
                image.put("user", hit.path("user").asText());
                hits.add(image);
            }
            result.put("hits", hits);

        } catch (Exception e) {
            log.error("Pixabay API 호출 실패: {}", e.getMessage());
            result.put("error", "이미지 검색 중 오류가 발생했습니다");
        }

        return result;
    }
}
