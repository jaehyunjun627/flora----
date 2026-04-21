package com.flora.backend.repository.mongo;

import com.flora.backend.document.UserPlant;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserPlantRepository extends MongoRepository<UserPlant, String> {
    List<UserPlant> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserPlant> findByStatusOrderByCreatedAtDesc(String status);
    List<UserPlant> findAllByOrderByCreatedAtDesc();
}
