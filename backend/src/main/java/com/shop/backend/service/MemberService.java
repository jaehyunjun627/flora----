package com.shop.backend.service;

import com.shop.backend.domain.Member;
import com.shop.backend.repository.MemberRepository;
import com.shop.backend.web.dto.MemberDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    // 회원 가입
    public MemberDto register(MemberDto memberDto, String password) {
        // 중복 체크
        if (memberRepository.findByUsername(memberDto.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (memberRepository.findByEmail(memberDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Member member = new Member();
        member.setUsername(memberDto.getUsername());
        member.setEmail(memberDto.getEmail());
        member.setName(memberDto.getName());
        member.setPassword(password); // 실제로는 암호화 필요

        Member savedMember = memberRepository.save(member);

        MemberDto responseDto = new MemberDto();
        responseDto.setId(savedMember.getId());
        responseDto.setUsername(savedMember.getUsername());
        responseDto.setEmail(savedMember.getEmail());
        responseDto.setName(savedMember.getName());

        return responseDto;
    }

    // 로그인
    public MemberDto login(String username, String password) {
        Optional<Member> memberOpt = memberRepository.findByUsername(username);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            if (member.getPassword().equals(password)) { // 실제로는 암호화 비교 필요
                MemberDto dto = new MemberDto();
                dto.setId(member.getId());
                dto.setUsername(member.getUsername());
                dto.setEmail(member.getEmail());
                dto.setName(member.getName());
                return dto;
            }
        }
        throw new RuntimeException("Invalid username or password");
    }
}