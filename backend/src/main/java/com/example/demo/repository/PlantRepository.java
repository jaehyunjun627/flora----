package com.example.demo.repository;

import com.example.demo.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlantRepository extends JpaRepository<Plant, Long> {

    List<Plant> findByUserUserIdOrderByAddedDateDesc(Long userId);

    long countByUserUserId(Long userId);
}
