package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** 현재 레벨 설정과 함께 조회 */
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByIdWithDetails(@Param("userId") Long userId);
}
