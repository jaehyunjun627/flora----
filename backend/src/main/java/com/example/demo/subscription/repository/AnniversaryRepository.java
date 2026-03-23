package com.example.demo.subscription.repository;

import com.example.demo.subscription.entity.Anniversary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnniversaryRepository extends JpaRepository<Anniversary, Long> {
    List<Anniversary> findBySubscriptionId(Long subscriptionId);
    List<Anniversary> findBySubscriptionIdAndActive(Long subscriptionId, boolean active);
}
