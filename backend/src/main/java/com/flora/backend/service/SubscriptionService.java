package com.flora.backend.service;

import com.flora.backend.dto.SubscriptionDto;
import com.flora.backend.entity.Subscription;
import com.flora.backend.repository.jpa.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public List<SubscriptionDto> getMySubscriptions(Long userId) {
        return subscriptionRepository.findByUserIdOrderBySubscribedAtDesc(userId)
                .stream().map(SubscriptionDto::from).collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionDto cancelSubscription(Long subscriptionId, Long userId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("구독을 찾을 수 없습니다"));

        if (!subscription.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 구독만 취소할 수 있습니다");
        }
        if ("CANCELLED".equals(subscription.getStatus())) {
            throw new IllegalArgumentException("이미 취소된 구독입니다");
        }

        subscription.setStatus("CANCELLED");
        return SubscriptionDto.from(subscriptionRepository.save(subscription));
    }
}
