package com.flora.backend.repository.mongo;

import com.flora.backend.document.UserCalendar;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserCalendarRepository extends MongoRepository<UserCalendar, String> {
    Optional<UserCalendar> findByUserId(Long userId);
}
