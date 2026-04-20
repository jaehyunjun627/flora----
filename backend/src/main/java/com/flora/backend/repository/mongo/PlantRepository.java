package com.flora.backend.repository.mongo;

import com.flora.backend.document.Plant;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PlantRepository extends MongoRepository<Plant, String> {
    List<Plant> findByNameContaining(String name);
    List<Plant> findByScientificNameContainingIgnoreCase(String sciName);
    List<Plant> findByEngNameContainingIgnoreCase(String engName);
    List<Plant> findByFamilyKorNameContaining(String family);
    List<Plant> findByTagsContaining(String tag);
    List<Plant> findByIsToxicToPets(Boolean isToxic);
    List<Plant> findBySeasonContaining(String season);
}
