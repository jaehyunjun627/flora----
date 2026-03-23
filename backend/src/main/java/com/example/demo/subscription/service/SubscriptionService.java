package com.example.demo.subscription.service;

import com.example.demo.subscription.dto.*;
import com.example.demo.subscription.entity.Anniversary;
import com.example.demo.subscription.entity.Subscription;
import com.example.demo.subscription.entity.Subscription.PlanType;
import com.example.demo.subscription.repository.AnniversaryRepository;
import com.example.demo.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final AnniversaryRepository anniversaryRepository;

    // ── 구독 ─────────────────────────────────────────

    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionRequest req) {
        LocalDate startDate = LocalDate.now();
        LocalDate nextBilling = req.getPlanType() == PlanType.ANNUAL
                ? startDate.plusYears(1)
                : startDate.plusMonths(1);

        Subscription subscription = Subscription.builder()
                .userId(req.getUserId())
                .planType(req.getPlanType())
                .startDate(startDate)
                .nextBillingDate(nextBilling)
                .deliveryAddress(req.getDeliveryAddress())
                .receiverName(req.getReceiverName())
                .receiverPhone(req.getReceiverPhone())
                .seasonalFlower(req.isSeasonalFlower())
                .build();

        return SubscriptionResponse.from(subscriptionRepository.save(subscription));
    }

    public List<SubscriptionResponse> getSubscriptionsByUser(Long userId) {
        return subscriptionRepository.findByUserId(userId)
                .stream().map(SubscriptionResponse::from).collect(Collectors.toList());
    }

    public SubscriptionResponse getSubscription(Long id) {
        return SubscriptionResponse.from(findSubscription(id));
    }

    @Transactional
    public SubscriptionResponse cancelSubscription(Long id) {
        Subscription sub = findSubscription(id);
        sub.setStatus(Subscription.SubscriptionStatus.CANCELLED);
        return SubscriptionResponse.from(sub);
    }

    @Transactional
    public SubscriptionResponse pauseSubscription(Long id) {
        Subscription sub = findSubscription(id);
        sub.setStatus(Subscription.SubscriptionStatus.PAUSED);
        return SubscriptionResponse.from(sub);
    }

    @Transactional
    public SubscriptionResponse resumeSubscription(Long id) {
        Subscription sub = findSubscription(id);
        sub.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        return SubscriptionResponse.from(sub);
    }

    // ── 기념일 ───────────────────────────────────────

    @Transactional
    public AnniversaryResponse addAnniversary(Long subscriptionId, AnniversaryRequest req) {
        Subscription subscription = findSubscription(subscriptionId);

        Anniversary anniversary = Anniversary.builder()
                .subscription(subscription)
                .name(req.getName())
                .anniversaryDate(req.getAnniversaryDate())
                .active(req.isActive())
                .daysBefore(req.getDaysBefore())
                .flowerNote(req.getFlowerNote())
                .build();

        return AnniversaryResponse.from(anniversaryRepository.save(anniversary));
    }

    public List<AnniversaryResponse> getAnniversaries(Long subscriptionId) {
        return anniversaryRepository.findBySubscriptionId(subscriptionId)
                .stream().map(AnniversaryResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public AnniversaryResponse updateAnniversary(Long anniversaryId, AnniversaryRequest req) {
        Anniversary anniversary = anniversaryRepository.findById(anniversaryId)
                .orElseThrow(() -> new IllegalArgumentException("기념일을 찾을 수 없습니다."));

        anniversary.setName(req.getName());
        anniversary.setAnniversaryDate(req.getAnniversaryDate());
        anniversary.setActive(req.isActive());
        anniversary.setDaysBefore(req.getDaysBefore());
        anniversary.setFlowerNote(req.getFlowerNote());

        return AnniversaryResponse.from(anniversary);
    }

    @Transactional
    public void deleteAnniversary(Long anniversaryId) {
        anniversaryRepository.deleteById(anniversaryId);
    }

    private Subscription findSubscription(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("구독 정보를 찾을 수 없습니다."));
    }
}
