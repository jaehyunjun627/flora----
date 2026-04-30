package com.flora.backend.controller;

import com.flora.backend.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {
    private final CommunityService communityService;

    @GetMapping
    public ResponseEntity<?> getNotices(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(communityService.getNotices(page, size));
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentNotices() {
        return ResponseEntity.ok(communityService.getRecentNotices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNotice(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getPost(id, null));
    }
}
