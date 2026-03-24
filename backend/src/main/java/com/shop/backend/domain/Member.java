package com.shop.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MEMBER")
@Data
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;
}