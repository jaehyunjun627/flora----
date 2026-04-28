package com.flora.backend.service;

import com.flora.backend.entity.Festival;
import com.flora.backend.repository.jpa.FestivalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FestivalService {

    private final FestivalRepository festivalRepository;

    public List<Map<String, Object>> getUpcomingFestivals() {
        List<Festival> festivals = festivalRepository.findByEndDateGreaterThanEqualOrderByStartDateAsc(LocalDate.now());
        if (festivals.isEmpty()) {
            return getDefaultFestivals();
        }
        return festivals.stream().map(this::toMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllFestivals() {
        List<Festival> festivals = festivalRepository.findAll();
        if (festivals.isEmpty()) {
            return getDefaultFestivals();
        }
        return festivals.stream().map(this::toMap).collect(Collectors.toList());
    }

    private Map<String, Object> toMap(Festival f) {
        return Map.ofEntries(
            Map.entry("id", f.getId()),
            Map.entry("name", f.getName()),
            Map.entry("emoji", f.getEmoji() != null ? f.getEmoji() : "🌸"),
            Map.entry("category", f.getCategory() != null ? f.getCategory() : "꽃축제"),
            Map.entry("region", f.getRegion() != null ? f.getRegion() : ""),
            Map.entry("location", f.getLocation() != null ? f.getLocation() : (f.getRegion() != null ? f.getRegion() : "")),
            Map.entry("organizer", f.getOrganizer() != null ? f.getOrganizer() : ""),
            Map.entry("lat", f.getLat() != null ? f.getLat() : 37.5665),
            Map.entry("lng", f.getLng() != null ? f.getLng() : 126.9780),
            Map.entry("startDate", f.getStartDate() != null ? f.getStartDate().toString() : ""),
            Map.entry("endDate", f.getEndDate() != null ? f.getEndDate().toString() : ""),
            Map.entry("description", f.getDescription() != null ? f.getDescription() : ""),
            Map.entry("bgColor", f.getBgColor() != null ? f.getBgColor() : "#e8f5e9"),
            Map.entry("tags", f.getTags() != null
                ? Arrays.asList(f.getTags().split(","))
                : List.of())
        );
    }

    private List<Map<String, Object>> getDefaultFestivals() {
        return List.of(
            Map.ofEntries(
                Map.entry("id", 201L), Map.entry("name", "고양 국제 꽃박람회"),
                Map.entry("emoji", "🌸"), Map.entry("category", "꽃축제"),
                Map.entry("region", "경기"), Map.entry("location", "경기 고양시 일산서구"),
                Map.entry("organizer", "고양시"), Map.entry("lat", 37.6584), Map.entry("lng", 126.7756),
                Map.entry("startDate", "2026-04-25"), Map.entry("endDate", "2026-05-10"),
                Map.entry("description", "경기 북부 최대 규모의 꽃 축제입니다. 튤립, 장미, 수국 등 100여 종의 꽃이 전시되며, 희귀 식물 판매 부스와 플로리스트 체험 프로그램도 운영해요."),
                Map.entry("bgColor", "#fce4ec"), Map.entry("tags", List.of("봄꽃", "가족", "체험"))
            ),
            Map.ofEntries(
                Map.entry("id", 202L), Map.entry("name", "서울 식물원 봄꽃 페스타"),
                Map.entry("emoji", "🌿"), Map.entry("category", "수목원"),
                Map.entry("region", "서울"), Map.entry("location", "서울 강서구 마곡동"),
                Map.entry("organizer", "서울시"), Map.entry("lat", 37.5707), Map.entry("lng", 126.8269),
                Map.entry("startDate", "2026-04-05"), Map.entry("endDate", "2026-05-27"),
                Map.entry("description", "마곡 서울식물원에서 열리는 봄꽃 페스타입니다. 온실 특별 전시와 야외 정원 프로그램을 즐길 수 있어요."),
                Map.entry("bgColor", "#e8f5e9"), Map.entry("tags", List.of("온실", "워크숍", "봄"))
            ),
            Map.ofEntries(
                Map.entry("id", 203L), Map.entry("name", "태안 세계 튤립 축제"),
                Map.entry("emoji", "🌷"), Map.entry("category", "꽃축제"),
                Map.entry("region", "충남"), Map.entry("location", "충남 태안군"),
                Map.entry("organizer", "태안군"), Map.entry("lat", 36.7455), Map.entry("lng", 126.2982),
                Map.entry("startDate", "2026-04-10"), Map.entry("endDate", "2026-04-30"),
                Map.entry("description", "서해안 최대 규모 튤립 축제입니다! 300만 송이의 튤립 물결과 함께 야간 조명 이벤트, 인생 사진 포토존 등이 준비되어 있어요."),
                Map.entry("bgColor", "#fce4ec"), Map.entry("tags", List.of("튤립", "야간", "포토존"))
            ),
            Map.ofEntries(
                Map.entry("id", 204L), Map.entry("name", "함평 나비·곤충 축제"),
                Map.entry("emoji", "🦋"), Map.entry("category", "체험"),
                Map.entry("region", "전남"), Map.entry("location", "전남 함평군"),
                Map.entry("organizer", "함평군"), Map.entry("lat", 35.0661), Map.entry("lng", 126.5169),
                Map.entry("startDate", "2026-05-01"), Map.entry("endDate", "2026-05-10"),
                Map.entry("description", "전남 함평에서 열리는 생태 축제입니다. 나비와 식물이 공존하는 생태 정원을 관람하고 자연 관찰 체험 프로그램에 참여할 수 있어요."),
                Map.entry("bgColor", "#f3e5f5"), Map.entry("tags", List.of("나비", "생태", "체험"))
            ),
            Map.ofEntries(
                Map.entry("id", 205L), Map.entry("name", "서울 성수 식물 마켓위크"),
                Map.entry("emoji", "🛍️"), Map.entry("category", "마켓"),
                Map.entry("region", "서울"), Map.entry("location", "서울 성동구 성수동"),
                Map.entry("organizer", "성수 팝업파크"), Map.entry("lat", 37.5445), Map.entry("lng", 127.0558),
                Map.entry("startDate", "2026-05-22"), Map.entry("endDate", "2026-05-25"),
                Map.entry("description", "성수동 팝업 단지에서 열리는 식물 마켓 위크입니다. 국내외 인디 식물 브랜드와 희귀 식물 딜러들이 한 자리에 모여요."),
                Map.entry("bgColor", "#fff3e0"), Map.entry("tags", List.of("팝업", "인디브랜드", "희귀식물"))
            )
        );
    }
}
