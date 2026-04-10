package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserIdOrderBySubscribedAtDesc(Long userId);
}
