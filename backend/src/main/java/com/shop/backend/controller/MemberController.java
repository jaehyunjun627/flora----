package com.shop.backend.controller;

import com.shop.backend.service.MemberService;
import com.shop.backend.web.dto.MemberDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    // 회원 가입
    @PostMapping("/register")
    public ResponseEntity<MemberDto> register(@RequestBody RegisterRequest request) {
        try {
            MemberDto memberDto = new MemberDto(request.getUsername(), request.getEmail(), request.getName());
            MemberDto response = memberService.register(memberDto, request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<MemberDto> login(@RequestBody LoginRequest request) {
        try {
            MemberDto response = memberService.login(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 요청 DTO들
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private String name;

        // getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class LoginRequest {
        private String username;
        private String password;

        // getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}