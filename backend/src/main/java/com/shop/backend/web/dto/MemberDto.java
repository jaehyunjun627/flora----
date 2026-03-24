package com.shop.backend.web.dto;

import lombok.Data;

@Data
public class MemberDto {

    private Long id;
    private String username;
    private String email;
    private String name;
    private int points;

    // 회원 가입용 생성자
    public MemberDto(String username, String email, String name) {
        this.username = username;
        this.email = email;
        this.name = name;
    }

    // 기본 생성자
    public MemberDto() {}
}