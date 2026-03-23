package com.example.demo.repository;

import com.example.demo.entity.PlantCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlantCardRepository extends JpaRepository<PlantCard, Long> {

    Optional<PlantCard> findByUserUserId(Long userId);

    Optional<PlantCard> findByShareLinkToken(String token);
}
