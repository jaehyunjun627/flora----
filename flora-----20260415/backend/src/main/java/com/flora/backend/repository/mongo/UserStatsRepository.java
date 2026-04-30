package com.flora.backend.repository.mongo;

import com.flora.backend.document.UserStats;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserStatsRepository extends MongoRepository<UserStats, String> {
    Optional<UserStats> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
