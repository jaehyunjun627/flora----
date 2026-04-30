package com.flora.backend.service;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * 날씨 API 연동 서비스 (기상청 단기예보/특보 가정).
 * <p>
 * 실제 운영 시에는 application.yml 의 {@code weather.api.key} 에 기상청 발급 키를 넣고,
 * fetchFromKma() 의 RestTemplate 호출 부분을 활성화하면 됩니다.
 * 키가 없을 때는 {@link #buildMockSnapshot(String)} 로 결정적인 mock 값을 반환합니다.
 * <p>
 * 캐시: 같은 도시는 1시간 동안 캐시 (외부 API rate limit 보호).
 *
 * @author Flora team
 */
@Slf4j
@Service
public class WeatherApiService {

    @Value("${weather.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /** 도시별 1시간 캐시 */
    private final ConcurrentMap<String, CachedSnapshot> cache = new ConcurrentHashMap<>();

    /**
     * 도시명으로 현재 날씨 스냅샷을 가져옵니다.
     * 도시명이 null/빈값이면 SEOUL 기본값으로 처리.
     */
    public WeatherSnapshot getSnapshot(String city) {
        String key = (city == null || city.isBlank()) ? "SEOUL" : city.trim().toUpperCase();

        CachedSnapshot cached = cache.get(key);
        if (cached != null && cached.expireAt.isAfter(LocalDateTime.now())) {
            return cached.snapshot;
        }

        WeatherSnapshot fresh;
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("weather.api.key 미설정 → mock 데이터 사용 (city={})", key);
            fresh = buildMockSnapshot(key);
        } else {
            try {
                fresh = fetchFromKma(key);
            } catch (Exception e) {
                log.warn("기상청 API 호출 실패, mock으로 대체 (city={}, msg={})", key, e.getMessage());
                fresh = buildMockSnapshot(key);
            }
        }

        cache.put(key, new CachedSnapshot(fresh, LocalDateTime.now().plusHours(1)));
        return fresh;
    }

    // === 실제 기상청 호출 (스켈레톤) =========================================
    private WeatherSnapshot fetchFromKma(String city) {
        // TODO: 기상청 단기예보 + 기상특보 API 호출
        //   GET https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=...
        // 응답에서 TMP(기온), REH(습도), POP(강수확률) 추출 후 WeatherSnapshot 으로 변환.
        // 현재 단계에서는 mock 동작으로 위임.
        return buildMockSnapshot(city);
    }

    // === mock 동작 (오늘 날짜 기반 결정적) ===================================
    private WeatherSnapshot buildMockSnapshot(String city) {
        int dayOfYear = LocalDateTime.now().getDayOfYear();
        int monthHash = (dayOfYear * 7 + city.hashCode()) & 0x7fffffff;

        // 5월 기준 mock: 따뜻하고 약간 건조
        double temp     = 18 + (monthHash % 15);   // 18 ~ 32 °C
        double humidity = 35 + (monthHash % 40);   // 35 ~ 74 %
        boolean heat    = temp >= 33;              // 폭염 임계
        boolean cold    = temp <= 0;               // 한파 임계
        boolean rainy   = (monthHash % 7) == 0;    // 1/7 확률 비

        return WeatherSnapshot.builder()
                .city(city)
                .tempC(temp)
                .humidityPct(humidity)
                .heatwave(heat)
                .coldwave(cold)
                .rainy(rainy)
                .source(apiKey == null || apiKey.isBlank() ? "MOCK" : "KMA")
                .observedAt(LocalDateTime.now())
                .build();
    }

    // === DTO ================================================================

    /** 외부에 노출되는 날씨 스냅샷. */
    @Getter @Builder
    public static class WeatherSnapshot {
        private String city;
        private double tempC;
        private double humidityPct;
        private boolean heatwave;     // 폭염주의보
        private boolean coldwave;     // 한파주의보
        private boolean rainy;        // 강수
        private String source;        // KMA / MOCK
        private LocalDateTime observedAt;
    }

    private static class CachedSnapshot {
        final WeatherSnapshot snapshot;
        final LocalDateTime expireAt;
        CachedSnapshot(WeatherSnapshot s, LocalDateTime e) { this.snapshot = s; this.expireAt = e; }
    }
}
