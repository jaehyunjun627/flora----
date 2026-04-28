package com.flora.backend.controller;

import com.flora.backend.dto.ApiResponse;
import com.flora.backend.dto.SubscriptionDto;
import com.flora.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getMySubscriptions(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(subscriptionService.getMySubscriptions(userId)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionDto>> cancelSubscription(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("구독 취소 요청: 구독ID={}, 사용자={}", id, userId);
        SubscriptionDto result = subscriptionService.cancelSubscription(id, userId);
        return ResponseEntity.ok(ApiResponse.success("구독이 취소되었습니다.", result));
    }
}
