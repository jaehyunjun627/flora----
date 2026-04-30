package com.flora.backend.service;

import com.flora.backend.dto.FestivalDto;
import com.flora.backend.entity.Festival;
import com.flora.backend.repository.jpa.FestivalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * 지역축제 서비스.
 * - 기본적으로 FESTIVALS 테이블에 저장된 한국 꽃 축제 정보를 제공.
 * - 실제 한국관광공사 TourAPI 연동 시 FestivalDataInitializer 대신 TourApiService가
 *   주기적으로 festival 데이터를 upsert 하도록 확장 가능.
 */
@Service
@RequiredArgsConstructor
public class FestivalService {
    private final FestivalRepository festivalRepository;

    /** 오늘 이후 종료되는(=진행 중이거나 예정된) 축제 목록 */
    public List<FestivalDto> getUpcomingFestivals() {
        LocalDate today = LocalDate.now();
        List<Festival> festivals =
                festivalRepository.findByEndDateGreaterThanEqualOrderByStartDateAsc(today);
        return festivals.stream()
                .sorted(Comparator.comparing(Festival::getStartDate,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(FestivalDto::from)
                .toList();
    }

    /** 전체 축제 (관리 / 지난 축제 포함 조회용) */
    public List<FestivalDto> getAllFestivals() {
        return festivalRepository.findAll().stream()
                .sorted(Comparator.comparing(Festival::getStartDate,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(FestivalDto::from)
                .toList();
    }

    public List<FestivalDto> getFestivalsByRegion(String region) {
        return festivalRepository.findByRegionContaining(region).stream()
                .map(FestivalDto::from)
                .toList();
    }
}
