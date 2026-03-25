package com.flora.backend.service;

import com.flora.backend.entity.Notice;
import com.flora.backend.repository.jpa.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeRepository noticeRepository;

    public Page<Map<String, Object>> getNotices(int page, int size) {
        return noticeRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(PageRequest.of(page, size))
            .map(n -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", n.getId());
                map.put("title", n.getTitle());
                map.put("tag", n.getTag());
                map.put("isPinned", n.getIsPinned());
                map.put("createdAt", n.getCreatedAt());
                return map;
            });
    }

    public List<Map<String, Object>> getRecentNotices() {
        return noticeRepository.findTop5ByOrderByIsPinnedDescCreatedAtDesc().stream()
            .map(n -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", n.getId());
                map.put("title", n.getTitle());
                map.put("tag", n.getTag());
                map.put("isPinned", n.getIsPinned());
                map.put("createdAt", n.getCreatedAt());
                return map;
            }).toList();
    }

    public Map<String, Object> getNotice(Long id) {
        Notice n = noticeRepository.findById(id).orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다"));
        Map<String, Object> map = new HashMap<>();
        map.put("id", n.getId());
        map.put("title", n.getTitle());
        map.put("content", n.getContent());
        map.put("tag", n.getTag());
        map.put("isPinned", n.getIsPinned());
        map.put("createdAt", n.getCreatedAt());
        return map;
    }
}
