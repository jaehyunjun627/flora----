package com.flora.backend.controller;

import com.flora.backend.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * TODO: 현재 미구현된 기능들의 플레이스홀더 Controller
 * 
 * 프론트엔드에서 요청하는 다음 기능들은 현재 구현되지 않았습니다:
 * 1. 축제 정보 조회 (/api/festivals)
 * 2. 로컬 거래 기능 (/api/local-trade/posts)
 * 3. 일기 상세 조회 (GET /api/calendar/{id}/diaries)
 * 4. 회원 정보 조회 (/api/members/me)
 * 
 * 각 기능별로 아래를 결정해주세요:
 * - 구현할 예정인가? (그러면 Service 클래스와 Entity를 작성하세요)
 * - 삭제하려는가? (그러면 프론트엔드에서 해당 API 호출을 제거하세요)
 * - 보류중인가? (그러면 이 TODO를 그대로 두세요)
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class UnimplementedFeaturesController {

    /**
     * 축제 정보 조회 (현재 미구현)
     * 
     * TODO: Festival 엔티티 및 FestivalService 구현 필요
     */
    @GetMapping("/api/festivals")
    public ResponseEntity<ApiResponse<?>> getFestivals() {
        log.warn("축제 정보 조회: 미구현 기능 호출");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                ApiResponse.error("이 기능은 아직 구현되지 않았습니다.")
        );
    }

    /**
     * 로컬 거래 게시글 조회 (현재 미구현)
     * 
     * TODO: LocalTrade 엔티티 및 LocalTradeService 구현 필요
     */
    @GetMapping("/api/local-trade/posts")
    public ResponseEntity<ApiResponse<?>> getLocalTradePosts() {
        log.warn("로컬 거래 게시글 조회: 미구현 기능 호출");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                ApiResponse.error("이 기능은 아직 구현되지 않았습니다.")
        );
    }

    /**
     * 일기 상세 조회 (현재 GET만 미구현, POST는 있음)
     * 
     * TODO: CalendarService에 getDiaries() 메서드 추가 필요
     */
    @GetMapping("/api/calendar/{calendarId}/diaries")
    public ResponseEntity<ApiResponse<?>> getDiaries(@PathVariable Long calendarId) {
        log.warn("일기 조회: 미구현 기능 호출 - calendarId={}", calendarId);
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                ApiResponse.error("이 기능은 아직 구현되지 않았습니다.")
        );
    }

    /**
     * 회원 정보 조회 (현재 미구현)
     * 
     * 참고: /api/auth/me 엔드포인트가 있으므로, /api/members/me는 삭제하거나
     * 동일한 기능으로 수정하는 것을 권장합니다.
     * 
     * TODO: 프론트에서 /api/auth/me 사용으로 통일하거나 구현 필요
     */
    @GetMapping("/api/members/me")
    public ResponseEntity<ApiResponse<?>> getMemberInfo(Authentication authentication) {
        log.warn("회원 정보 조회: 미구현 기능 호출");
        // 참고: /api/auth/me 사용 권장
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                ApiResponse.error("이 기능은 아직 구현되지 않았습니다. /api/auth/me를 사용하세요.")
        );
    }
}
