-- ====================================================
-- 꽃담(Kkotdam) 관리자(ADMIN) 계정 생성 스크립트
-- Spring Boot 서버 시작 후 Oracle SQL Developer에서 실행
-- ====================================================

-- 비밀번호: admin123 (BCrypt 해시)
-- BCrypt 해시는 Spring Boot 서버에서 생성됨
-- 아래 INSERT 대신 서버 시작 후 아래 방법으로 생성 가능:
-- 1) 일반 회원가입 (email: admin@flora.com, pw: admin123)
-- 2) 그 다음 role 업데이트

-- 방법 1: 기존 계정을 ADMIN으로 승격
-- UPDATE USERS SET role = 'ADMIN' WHERE email = 'admin@flora.com';

-- 방법 2: 직접 INSERT (BCrypt 해시를 먼저 생성해야 함)
-- 아래 해시는 'admin123'의 BCrypt 인코딩 결과입니다
INSERT INTO USERS (email, password_hash, nickname, role, is_active, points, streak_days, profile_emoji, created_at, updated_at)
VALUES ('admin@flora.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '꽃담관리자',
        'ADMIN',
        1,
        0,
        0,
        '🛡️',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP);

COMMIT;

-- 확인
SELECT id, email, nickname, role FROM USERS WHERE role = 'ADMIN';

-- ====================================================
-- 추천 방법: 일반 회원가입 후 role 변경
-- ====================================================
-- 1. 프론트엔드에서 admin@flora.com / admin123 으로 회원가입
-- 2. 아래 SQL 실행:
--    UPDATE USERS SET role = 'ADMIN' WHERE email = 'admin@flora.com';
--    COMMIT;
