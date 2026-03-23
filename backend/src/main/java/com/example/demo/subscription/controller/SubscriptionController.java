package com.example.demo.subscription.controller;

import com.example.demo.subscription.dto.*;
import com.example.demo.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    // ── 구독 CRUD ─────────────────────────────────────

    /** 구독 신청 */
    @PostMapping
    public ResponseEntity<SubscriptionResponse> create(@RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(subscriptionService.createSubscription(request));
    }

    /** 유저의 구독 목록 조회 */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubscriptionResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUser(userId));
    }

    /** 구독 단건 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getSubscription(id));
    }

    /** 구독 취소 */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SubscriptionResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.cancelSubscription(id));
    }

    /** 구독 일시정지 */
    @PatchMapping("/{id}/pause")
    public ResponseEntity<SubscriptionResponse> pause(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.pauseSubscription(id));
    }

    /** 구독 재개 */
    @PatchMapping("/{id}/resume")
    public ResponseEntity<SubscriptionResponse> resume(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.resumeSubscription(id));
    }

    // ── 기념일 ─────────────────────────────────────────

    /** 기념일 추가 */
    @PostMapping("/{subscriptionId}/anniversaries")
    public ResponseEntity<AnniversaryResponse> addAnniversary(
            @PathVariable Long subscriptionId,
            @RequestBody AnniversaryRequest request) {
        return ResponseEntity.ok(subscriptionService.addAnniversary(subscriptionId, request));
    }

    /** 기념일 목록 조회 */
    @GetMapping("/{subscriptionId}/anniversaries")
    public ResponseEntity<List<AnniversaryResponse>> getAnniversaries(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(subscriptionService.getAnniversaries(subscriptionId));
    }

    /** 기념일 수정 */
    @PutMapping("/anniversaries/{anniversaryId}")
    public ResponseEntity<AnniversaryResponse> updateAnniversary(
            @PathVariable Long anniversaryId,
            @RequestBody AnniversaryRequest request) {
        return ResponseEntity.ok(subscriptionService.updateAnniversary(anniversaryId, request));
    }

    /** 기념일 삭제 */
    @DeleteMapping("/anniversaries/{anniversaryId}")
    public ResponseEntity<Void> deleteAnniversary(@PathVariable Long anniversaryId) {
        subscriptionService.deleteAnniversary(anniversaryId);
        return ResponseEntity.noContent().build();
    }
}
