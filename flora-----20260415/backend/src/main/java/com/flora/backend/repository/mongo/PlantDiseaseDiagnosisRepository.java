package com.flora.backend.repository.mongo;

import com.flora.backend.document.PlantDiseaseDiagnosis;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PlantDiseaseDiagnosisRepository extends MongoRepository<PlantDiseaseDiagnosis, String> {
    List<PlantDiseaseDiagnosis> findByUserIdOrderByDiagnosedAtDesc(Long userId);
}
