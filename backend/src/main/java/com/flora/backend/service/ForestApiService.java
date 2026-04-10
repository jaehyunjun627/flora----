package com.flora.backend.service;

import com.flora.backend.document.Plant;
import com.flora.backend.repository.mongo.PlantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 식물 데이터 서비스 — MongoDB plants 컬렉션 기반
 * (기존 정적 배열 ALL_PLANTS → MongoDB로 이관 완료)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ForestApiService {

    private final PlantRepository plantRepository;

    // ─────────────────────────────────────────────
    //  식물 목록 검색 (키워드 필터 + 페이지네이션)
    // ─────────────────────────────────────────────
    public Map<String, Object> searchPlants(String searchWord, int pageNo, int numOfRows) {
        List<Plant> allPlants;

        if (searchWord == null || searchWord.isBlank()) {
            allPlants = plantRepository.findAll();
        } else {
            String kw = searchWord.trim();
            // 이름, 학명, 영명, 과명으로 검색
            Set<Plant> found = new LinkedHashSet<>();
            found.addAll(plantRepository.findByNameContaining(kw));
            found.addAll(plantRepository.findByScientificNameContainingIgnoreCase(kw));
            found.addAll(plantRepository.findByEngNameContainingIgnoreCase(kw));
            found.addAll(plantRepository.findByFamilyKorNameContaining(kw));
            allPlants = new ArrayList<>(found);
        }

        // 페이지네이션
        int total = allPlants.size();
        int start = Math.min((pageNo - 1) * numOfRows, total);
        int end = Math.min(start + numOfRows, total);
        List<Plant> page = allPlants.subList(start, end);

        // Plant → Map 변환 (기존 프론트엔드 호환)
        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 0; i < page.size(); i++) {
            items.add(plantToMap(page.get(i), start + i));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("totalCount", total);
        return result;
    }

    // ─────────────────────────────────────────────
    //  식물 상세 정보 (taxonId = MongoDB _id 또는 인덱스)
    // ─────────────────────────────────────────────
    public Map<String, Object> getPlantDetail(String taxonId) {
        // 먼저 MongoDB _id로 직접 조회
        Optional<Plant> found = plantRepository.findById(taxonId);
        if (found.isPresent()) {
            return plantToMap(found.get(), -1);
        }

        // taxonId가 숫자인 경우 (기존 프론트엔드 호환 — 1000+index 형식)
        try {
            int idx = Integer.parseInt(taxonId);
            if (idx >= 1000) idx -= 1000;
            List<Plant> all = plantRepository.findAll();
            if (idx >= 0 && idx < all.size()) {
                return plantToMap(all.get(idx), idx);
            }
        } catch (NumberFormatException ignored) {}

        // 이름으로 검색 시도
        List<Plant> byName = plantRepository.findByNameContaining(taxonId);
        if (!byName.isEmpty()) {
            return plantToMap(byName.get(0), -1);
        }

        Map<String, Object> empty = new HashMap<>();
        empty.put("error", "식물 상세 정보를 찾을 수 없습니다");
        return empty;
    }

    // ─────────────────────────────────────────────
    //  Plant Document → Map 변환 (프론트엔드 호환 형식)
    // ─────────────────────────────────────────────
    private Map<String, Object> plantToMap(Plant p, int index) {
        Map<String, Object> m = new LinkedHashMap<>();
        // taxonId: MongoDB _id 사용 (프론트에서 고유 식별자로 사용)
        m.put("taxonId", p.getId() != null ? p.getId() : String.valueOf(1000 + index));
        m.put("korName", p.getName());
        m.put("scientificName", p.getScientificName());
        m.put("engName", p.getEngName());
        m.put("familyKorName", p.getFamilyKorName());
        m.put("orderKorName", p.getOrderKorName());
        m.put("nameStatus", "정명");
        m.put("description", p.getDescription());
        m.put("habitat", p.getHabitat());
        m.put("toxicity", p.getToxicity());

        // PLANT_EXTRA에 있던 데이터도 함께 전달 (프론트 통합용)
        m.put("season", p.getSeason());
        m.put("flowerLanguage", p.getFlowerLanguage());
        m.put("isToxicToPets", p.getIsToxicToPets());

        // careInfo 필드
        if (p.getCareInfo() != null) {
            m.put("sunlight", p.getCareInfo().get("sunlight"));
            m.put("watering", p.getCareInfo().get("watering"));
            m.put("soil", p.getCareInfo().get("soil"));
        }

        return m;
    }
}
