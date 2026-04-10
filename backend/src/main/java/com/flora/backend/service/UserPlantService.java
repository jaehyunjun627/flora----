package com.flora.backend.service;

import com.flora.backend.document.UserPlant;
import com.flora.backend.entity.User;
import com.flora.backend.repository.mongo.UserPlantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserPlantService {

    private final UserPlantRepository userPlantRepository;
    private final OpenAiService openAiService;

    // ── 식물 정보 규칙 기반 검증 ──
    public List<String> validate(UserPlant plant) {
        List<String> errors = new ArrayList<>();

        // 1. 식물 이름 (필수, 2자 이상)
        if (plant.getName() == null || plant.getName().trim().length() < 2) {
            errors.add("식물 이름은 2자 이상 입력해야 합니다.");
        }

        // 2. 설명 (필수, 5자 이상)
        if (plant.getDescription() == null || plant.getDescription().trim().length() < 5) {
            errors.add("식물 설명은 최소 5자 이상 입력해야 합니다.");
        }

        // 3. 계절 (필수, 유효값 체크)
        List<String> validSeasons = Arrays.asList("봄", "여름", "가을", "겨울", "사계절", "봄/여름", "여름/가을", "가을/겨울", "봄/여름/가을");
        if (plant.getSeason() == null || plant.getSeason().trim().isEmpty()) {
            errors.add("계절 정보를 선택해야 합니다.");
        } else if (!validSeasons.contains(plant.getSeason().trim())) {
            errors.add("올바른 계절을 선택해야 합니다. (봄, 여름, 가을, 겨울, 사계절 등)");
        }

        // 4. 독성 정보 (필수)
        if (plant.getToxicity() == null || plant.getToxicity().trim().isEmpty()) {
            errors.add("독성 여부를 반드시 입력해야 합니다.");
        }

        // 5. 식물 이름에 특수문자 포함 금지
        if (plant.getName() != null && plant.getName().matches(".*[<>{}\\[\\]\\|].*")) {
            errors.add("식물 이름에 특수문자를 사용할 수 없습니다.");
        }

        // 6. 설명에 URL/링크 금지
        if (plant.getDescription() != null &&
            (plant.getDescription().contains("http://") || plant.getDescription().contains("https://"))) {
            errors.add("설명에 외부 링크를 포함할 수 없습니다.");
        }

        return errors;
    }

    // ── 식물 등록 ──
    public Map<String, Object> submit(UserPlant plant, User user) {
        plant.setUserId(user.getId());
        plant.setUserNickname(user.getNickname());

        // 독성 "있음" → 반려동물 독성 자동 true
        if ("있음".equals(plant.getToxicity()) || "주의".equals(plant.getToxicity())) {
            plant.setIsToxicToPets(true);
        } else {
            plant.setIsToxicToPets(false);
        }

        List<String> errors = validate(plant);

        if (!errors.isEmpty()) {
            // 검증 실패 → REJECTED 상태로 저장 안 하고 에러 반환
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("errors", errors);
            result.put("message", "입력 정보를 확인해주세요. (" + errors.size() + "개 항목)");
            return result;
        }

        // AI (ChatGPT) 2차 검증
        String aiError = openAiService.validatePlantFact(plant);
        if (aiError != null) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("errors", List.of(aiError));
            result.put("message", "AI 검증에서 오류가 발견됐습니다. 정확한 식물 정보를 입력해주세요.");
            return result;
        }

        // 검증 통과 → PENDING 상태로 저장 (관리자 승인 대기)
        plant.setStatus("PENDING");
        plant.setValidationErrors(Collections.emptyList());
        plant.setCreatedAt(LocalDateTime.now());
        UserPlant saved = userPlantRepository.save(plant);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("id", saved.getId());
        result.put("message", "식물 등록 신청이 완료됐어요! 검토 후 식물도감에 등재됩니다.");
        return result;
    }

    // ── 내 등록 식물 목록 ──
    public List<UserPlant> getMyPlants(Long userId) {
        return userPlantRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── 승인된 식물 공개 목록 ──
    public List<UserPlant> getApprovedPlants() {
        return userPlantRepository.findByStatusOrderByCreatedAtDesc("APPROVED");
    }

    // ── 전체 목록 (관리자용) ──
    public List<UserPlant> getAllPlants() {
        return userPlantRepository.findAllByOrderByCreatedAtDesc();
    }

    // ── 승인 (관리자) ──
    public UserPlant approve(String id) {
        UserPlant plant = userPlantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("식물을 찾을 수 없습니다."));
        plant.setStatus("APPROVED");
        plant.setUpdatedAt(LocalDateTime.now());
        return userPlantRepository.save(plant);
    }

    // ── 내 식물 삭제 ──
    public void deleteMyPlant(String id, Long userId) {
        UserPlant plant = userPlantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("식물을 찾을 수 없습니다."));
        if (!plant.getUserId().equals(userId)) {
            throw new RuntimeException("본인이 등록한 식물만 삭제할 수 있습니다.");
        }
        userPlantRepository.deleteById(id);
    }

    // ── 반려 (관리자) ──
    public UserPlant reject(String id, String reason) {
        UserPlant plant = userPlantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("식물을 찾을 수 없습니다."));
        plant.setStatus("REJECTED");
        plant.setRejectionReason(reason);
        plant.setUpdatedAt(LocalDateTime.now());
        return userPlantRepository.save(plant);
    }
}
