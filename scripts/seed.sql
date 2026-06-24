-- =============================================
-- STEP 1: INFLUENCERS
-- =============================================
INSERT INTO influencers (id, name, handle, platform, followers, category, profile_url, thumbnail_url, country) VALUES

('11111111-1111-1111-1111-000000000001',
 '화장하는 청담언니', '@cookingmua', 'youtube', '182만', '라이프스타일 / 건강',
 'https://www.youtube.com/@cookingmua',
 'https://yt3.googleusercontent.com/8D0xYRMWpHCKy6vgNjuzAazEuRKQeYdArJdMBI-iiPIuxhH9ASc4Xrwv2s4yeOXmbYTfCrwg=s400-c-k-c0x00ffffff-no-rj',
 'us'),

('11111111-1111-1111-1111-000000000002',
 '진우와 해티', '@JinandHattie', 'youtube', '94만', '뷰티 / 웰니스',
 'https://www.youtube.com/c/JinandHattie',
 'https://yt3.googleusercontent.com/WSL028L6Ogb4s4F3SvKcZ7z_j53_cCu9HLhfWWJ9OdUUhGRtv3PGCYkbo5VJgx2qIycsNM5kGQ=s400-c-k-c0x00ffffff-no-rj',
 'us'),

('11111111-1111-1111-1111-000000000003',
 '흑백리뷰', '@흑백리뷰', 'youtube', '340만', '푸드 / 먹방',
 'https://www.youtube.com/@흑백리뷰',
 'https://yt3.googleusercontent.com/IH2MK-J2Xlxzpm7LH6fDtcve-bogZdVKozRtoXKfwX-zRwd9s0QXzKFt9RUjyr9oAI7-FfZF=s400-c-k-c0x00ffffff-no-rj',
 'jp'),

('11111111-1111-1111-1111-000000000004',
 '핏스타 지수', '@fitstar_jisu', 'tiktok', '51만', '피트니스 / 다이어트',
 'https://i.pravatar.cc/300?img=20',
 'https://i.pravatar.cc/300?img=20',
 'jp'),

('11111111-1111-1111-1111-000000000005',
 '여행하는 서연', '@travel_seoyeon', 'instagram', '128만', '여행 / 라이프',
 'https://i.pravatar.cc/300?img=25',
 'https://i.pravatar.cc/300?img=25',
 'jp'),

('11111111-1111-1111-1111-000000000006',
 '테크리뷰 현우', '@tech_hyunwoo', 'youtube', '67만', '테크 / IT',
 'https://i.pravatar.cc/300?img=33',
 'https://i.pravatar.cc/300?img=33',
 'us'),

('11111111-1111-1111-1111-000000000007',
 '청담언니', '@청담언니', 'youtube', '73만', '뷰티 / K-뷰티',
 'https://www.youtube.com/@청담언니',
 'https://yt3.googleusercontent.com/8D0xYRMWpHCKy6vgNjuzAazEuRKQeYdArJdMBI-iiPIuxhH9ASc4Xrwv2s4yeOXmbYTfCrwg=s400-c-k-c0x00ffffff-no-rj',
 'cn'),

('11111111-1111-1111-1111-000000000008',
 '중국 라이프 밍밍', '@mingming_kr_life', 'xiaohongshu', '41만', '라이프스타일 / 음식',
 'https://i.pravatar.cc/300?img=53',
 'https://i.pravatar.cc/300?img=53',
 'cn'),

('11111111-1111-1111-1111-000000000009',
 '바다', '@pada_heli', 'instagram', '100만', '뷰티 / 라이프스타일',
 'https://www.instagram.com/pada_heli',
 'https://scontent-nrt1-1.cdninstagram.com/v/t51.71878-15/497524825_1687303171927436_4834775452833210417_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-nrt1-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gFjGf7ZPEcoEvL83yCRpWJunXyp779mgigao1nir-yWczCU_jWksfZ-iKP513K7Hfo&_nc_ohc=HT9TAjj8mmMQ7kNvwEYlCVU&_nc_gid=8exFK2T0supHEZ-pxq-Yew&edm=ALY_pVYBAAAA&ccb=7-5&oh=00_Af-B-QQTLPDC459rSm3ZHqP1UIUjRyYmfeyv2LbpQYcXtg&oe=6A409945&_nc_sid=57e406',
 'us'),

('11111111-1111-1111-1111-000000000010',
 'Jennifer', '@jenniferwohner', 'instagram', '46만', '뷰티 / 라이프스타일',
 'https://www.instagram.com/jenniferwohner',
 'https://scontent-nrt6-1.cdninstagram.com/v/t51.71878-15/684841662_989122356807979_6164005633872958037_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-nrt6-1.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2gHkkk0n3hEan1JUvfE0wSfgq19jXKp-oKhZ-SWGBd3OYYnQtuAzRxFZ51VnTaCiUXc&_nc_ohc=3jcIQgirgC8Q7kNvwH38Ske&_nc_gid=5uHkv9zUVqus_2WO5kHS8Q&edm=ALY_pVYBAAAA&ccb=7-5&oh=00_Af-CRITcCQGc5Yr_3l4EkYTHjfpT43Osnq5sLf4VBpT_rg&oe=6A408D89&_nc_sid=57e406',
 'us');


-- =============================================
-- STEP 2: CAMPAIGNS
-- =============================================
INSERT INTO campaigns (id, influencer_id, content_title, content_type, recruit_deadline, shooting_date, publish_date, total_slots, per_slot_cost, total_cost, content_guide, restrictions, status, country, thumbnail_url) VALUES

('22222222-2222-2222-2222-000000000001',
 '11111111-1111-1111-1111-000000000001',
 'OWM 약국 브이로그 – 건강 루틴 공개', '약국 방문 촬영 브이로그',
 '2026-07-01', '2026-07-08', '2026-07-13',
 5, 4000000, 20000000,
 json_build_array(
   '약국 내 제품 자연스러운 픽업 장면 (5~8초 노출)',
   '제품 효능 1줄 멘션 (사전 협의된 스크립트 기반)',
   '영상 말미 브랜드 로고 자막 3초 삽입',
   '인스타그램 스토리 1회 추가 노출 포함'
 )::jsonb,
 json_build_array(
   '경쟁사 동일 카테고리 브랜드 동시 탑승 불가',
   '의약품, 주류 카테고리 불가',
   '노출 순서는 선착순 신청 기준 배정'
 )::jsonb,
 'open', 'us',
 'https://yt3.googleusercontent.com/8D0xYRMWpHCKy6vgNjuzAazEuRKQeYdArJdMBI-iiPIuxhH9ASc4Xrwv2s4yeOXmbYTfCrwg=s400-c-k-c0x00ffffff-no-rj'),

('22222222-2222-2222-2222-000000000002',
 '11111111-1111-1111-1111-000000000002',
 '나의 아침 루틴 – 뷰티&헬스 하울', '모닝루틴 릴스 + 스토리',
 '2026-07-03', '2026-07-10', '2026-07-15',
 4, 3000000, 12000000,
 json_build_array(
   '아침 스킨케어 루틴 중 제품 사용 장면 (10초 내)',
   '제품명 + 브랜드 태그 스토리 1회',
   '릴스 캡션 브랜드 언급 포함'
 )::jsonb,
 json_build_array(
   '동일 카테고리 경쟁 브랜드 불가',
   '화장품 4종 이하 노출 가능'
 )::jsonb,
 'open', 'us',
 'https://yt3.googleusercontent.com/WSL028L6Ogb4s4F3SvKcZ7z_j53_cCu9HLhfWWJ9OdUUhGRtv3PGCYkbo5VJgx2qIycsNM5kGQ=s400-c-k-c0x00ffffff-no-rj'),

('22222222-2222-2222-2222-000000000003',
 '11111111-1111-1111-1111-000000000003',
 '편의점 신상 털기 – 7월 PICK', '편의점 하울 + 리뷰',
 '2026-06-26', '2026-07-03', '2026-07-08',
 6, 5000000, 30000000,
 json_build_array(
   '편의점에서 제품 직접 구매 및 시식 장면',
   '맛 평가 + 추천 멘션 (20초~30초)',
   '영상 설명란 브랜드 링크 포함',
   '유튜브 커뮤니티 포스팅 1회'
 )::jsonb,
 json_build_array(
   '주류/담배 카테고리 불가',
   '동일 식품군 브랜드 2개 이상 불가'
 )::jsonb,
 'closing', 'jp',
 'https://yt3.googleusercontent.com/IH2MK-J2Xlxzpm7LH6fDtcve-bogZdVKozRtoXKfwX-zRwd9s0QXzKFt9RUjyr9oAI7-FfZF=s400-c-k-c0x00ffffff-no-rj'),

('22222222-2222-2222-2222-000000000004',
 '11111111-1111-1111-1111-000000000004',
 '홈트 챌린지 30일 – 필수템 공개', '챌린지 + 제품 리뷰 쇼츠',
 '2026-07-13', '2026-07-20', '2026-07-25',
 3, 3000000, 9000000,
 json_build_array(
   '운동 중 제품 사용/착용 자연스러운 노출',
   '제품 효과 짧은 멘션 (5초 이내)',
   '틱톡 챌린지 태그 + 브랜드 태그'
 )::jsonb,
 json_build_array(
   '보충제 2개 이상 탑승 불가',
   '의약품 불가'
 )::jsonb,
 'open', 'jp',
 'https://i.pravatar.cc/300?img=20'),

('22222222-2222-2222-2222-000000000005',
 '11111111-1111-1111-1111-000000000005',
 '제주 3박4일 여행 – 나만의 짐 꾸리기', '여행 패킹 + 릴스',
 '2026-07-11', '2026-07-18', '2026-07-23',
 5, 3200000, 16000000,
 json_build_array(
   '짐 꾸리기 영상 내 제품 클로즈업 노출',
   '제품 특징 캡션 언급',
   '스토리 제품 스와이프업 링크 포함',
   '릴스 댓글 고정 브랜드 멘션'
 )::jsonb,
 json_build_array(
   '동일 여행 카테고리 브랜드 2개 이상 불가',
   '경쟁사 항공/렌터카 불가'
 )::jsonb,
 'open', 'jp',
 'https://i.pravatar.cc/300?img=25'),

('22222222-2222-2222-2222-000000000006',
 '11111111-1111-1111-1111-000000000006',
 '2026 하반기 갤럭시 언박싱 + 액세서리 추천', '언박싱 + 리뷰',
 '2026-07-21', '2026-07-28', '2026-08-02',
 4, 4000000, 16000000,
 json_build_array(
   '스마트폰 언박싱 후 액세서리 즉시 적용 장면',
   '제품 상세 기능 30초 설명',
   '영상 말미 구매 링크 고정'
 )::jsonb,
 json_build_array(
   '삼성 공식 파트너사 경쟁 브랜드 불가'
 )::jsonb,
 'open', 'us',
 'https://i.pravatar.cc/300?img=33'),

('22222222-2222-2222-2222-000000000007',
 '11111111-1111-1111-1111-000000000007',
 'K-뷰티 하울 – 한국 드러그스토어 직구템', '샤오홍슈 노트 + 숏비디오',
 '2026-07-05', '2026-07-12', '2026-07-17',
 5, 3600000, 18000000,
 json_build_array(
   '제품 사용 Before/After 비교 사진 포함',
   '한국어 + 중국어 병기 제품 설명 (사전 제공 자료 기반)',
   '샤오홍슈 노트 내 브랜드 공식 계정 태그',
   '숏비디오 1편 + 이미지 노트 2편 게시'
 )::jsonb,
 json_build_array(
   '동일 카테고리 경쟁 브랜드 동시 탑승 불가',
   '광고 표기 필수 (#광고 #브랜드협찬)',
   '의약품·의료기기 카테고리 불가'
 )::jsonb,
 'open', 'cn',
 'https://yt3.googleusercontent.com/8D0xYRMWpHCKy6vgNjuzAazEuRKQeYdArJdMBI-iiPIuxhH9ASc4Xrwv2s4yeOXmbYTfCrwg=s400-c-k-c0x00ffffff-no-rj'),

('22222222-2222-2222-2222-000000000008',
 '11111111-1111-1111-1111-000000000008',
 '한국 편의점 신상 전격 리뷰 – 중국인이 먹어봤다', '샤오홍슈 리뷰 노트 시리즈',
 '2026-07-15', '2026-07-22', '2026-07-27',
 4, 2500000, 10000000,
 json_build_array(
   '제품 개봉 + 시식 리뷰 영상 (30초~1분)',
   '중국어 제품 설명 + 구매처 정보 포함',
   '한국 편의점 현장 촬영으로 진정성 강조',
   '노트 3개 + 숏비디오 1개 게시'
 )::jsonb,
 json_build_array(
   '주류/담배 카테고리 불가',
   '동일 식품군 브랜드 2개 이상 불가'
 )::jsonb,
 'open', 'cn',
 'https://i.pravatar.cc/300?img=53'),

('22222222-2222-2222-2222-000000000009',
 '11111111-1111-1111-1111-000000000009',
 'OWM 신사점 방문 콘텐츠', '릴스 + 스토리',
 '2026-06-20', '2026-06-25', '2026-06-30',
 5, 2000000, 10000000,
 json_build_array(
   $$컨셉: '옆에 있는 남편도 몰랐던 걸, OWM에서 알았어요' — 남편과 티키타카 케미로 OWM 신사점의 프리미엄 웰니스 경험을 자연스럽게 소개. 외국인 시선으로 공간·상담·제품을 강조하며, 엔딩에서 '옆에 있던 너보다 처음 본 약사님이 날 더 잘 알더라' 대사로 마무리.$$,
   '유이크 (열감진정 물광세트)',
   '23yearsold (바데카실)',
   '헤브블루 (마스크팩)',
   '닥터리엔장 겔 마스크',
   '옵티마 이뮨'
 )::jsonb,
 json_build_array(
   '5개 지정 브랜드 외 타 제품 광고 병행 불가',
   '의약품 효능·효과 의학적 표현 및 과장 광고 금지',
   '매장 내 타 브랜드 광고물 노출 금지',
   '광고 표기 필수 (#광고 #협찬 #OWM)'
 )::jsonb,
 'closing', 'us',
 'https://scontent-nrt1-1.cdninstagram.com/v/t51.71878-15/497524825_1687303171927436_4834775452833210417_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-nrt1-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2gFjGf7ZPEcoEvL83yCRpWJunXyp779mgigao1nir-yWczCU_jWksfZ-iKP513K7Hfo&_nc_ohc=HT9TAjj8mmMQ7kNvwEYlCVU&_nc_gid=8exFK2T0supHEZ-pxq-Yew&edm=ALY_pVYBAAAA&ccb=7-5&oh=00_Af-B-QQTLPDC459rSm3ZHqP1UIUjRyYmfeyv2LbpQYcXtg&oe=6A409945&_nc_sid=57e406'),

('22222222-2222-2222-2222-000000000010',
 '11111111-1111-1111-1111-000000000010',
 'OWM 신사점 방문 콘텐츠', '릴스 + 스토리',
 '2026-06-21', '2026-06-28', '2026-07-03',
 5, 2000000, 10000000,
 json_build_array(
   $$컨셉: 남자친구의 시선으로 바라본 OWM — '여자친구가 가자고 해서 따라왔는데, 나도 모르게 진짜 필요한 게 생겼다.' 파트너와 함께하는 OWM 신사점 탐방 콘텐츠. 외국인 커플의 자연스러운 리액션으로 공간·상담·제품의 프리미엄 경험을 전달.$$,
   '유이크 (열감진정 물광세트)',
   '23yearsold (바데카실)',
   '헤브블루 (마스크팩)',
   '닥터리엔장 겔 마스크',
   '옵티마 이뮨'
 )::jsonb,
 json_build_array(
   '5개 지정 브랜드 외 타 제품 광고 병행 불가',
   '경쟁 제품 비교 금지',
   '가격 언급 금지',
   '거꾸로/미러 촬영 금지',
   '비판적 표현 금지',
   '광고 표기 필수 (#광고 #협찬 #OWM)'
 )::jsonb,
 'closing', 'us',
 'https://scontent-nrt6-1.cdninstagram.com/v/t51.71878-15/684841662_989122356807979_6164005633872958037_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-nrt6-1.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2gHkkk0n3hEan1JUvfE0wSfgq19jXKp-oKhZ-SWGBd3OYYnQtuAzRxFZ51VnTaCiUXc&_nc_ohc=3jcIQgirgC8Q7kNvwH38Ske&_nc_gid=5uHkv9zUVqus_2WO5kHS8Q&edm=ALY_pVYBAAAA&ccb=7-5&oh=00_Af-CRITcCQGc5Yr_3l4EkYTHjfpT43Osnq5sLf4VBpT_rg&oe=6A408D89&_nc_sid=57e406');


-- =============================================
-- STEP 3: SLOTS
-- =============================================
INSERT INTO slots (campaign_id, slot_number, status, brand_name) VALUES
-- camp-001
('22222222-2222-2222-2222-000000000001', 1, 'filled',    '뉴트리원'),
('22222222-2222-2222-2222-000000000001', 2, 'filled',    '에너씨슬'),
('22222222-2222-2222-2222-000000000001', 3, 'available', NULL),
('22222222-2222-2222-2222-000000000001', 4, 'available', NULL),
('22222222-2222-2222-2222-000000000001', 5, 'reserved',  '협의 중'),
-- camp-002
('22222222-2222-2222-2222-000000000002', 1, 'filled',    '이니스프리'),
('22222222-2222-2222-2222-000000000002', 2, 'available', NULL),
('22222222-2222-2222-2222-000000000002', 3, 'available', NULL),
('22222222-2222-2222-2222-000000000002', 4, 'available', NULL),
-- camp-003
('22222222-2222-2222-2222-000000000003', 1, 'filled',    '롯데웰푸드'),
('22222222-2222-2222-2222-000000000003', 2, 'filled',    'CJ제일제당'),
('22222222-2222-2222-2222-000000000003', 3, 'filled',    '농심'),
('22222222-2222-2222-2222-000000000003', 4, 'filled',    '오리온'),
('22222222-2222-2222-2222-000000000003', 5, 'available', NULL),
('22222222-2222-2222-2222-000000000003', 6, 'available', NULL),
-- camp-004
('22222222-2222-2222-2222-000000000004', 1, 'available', NULL),
('22222222-2222-2222-2222-000000000004', 2, 'available', NULL),
('22222222-2222-2222-2222-000000000004', 3, 'available', NULL),
-- camp-005
('22222222-2222-2222-2222-000000000005', 1, 'filled',    '제주항공'),
('22222222-2222-2222-2222-000000000005', 2, 'filled',    '쏘카'),
('22222222-2222-2222-2222-000000000005', 3, 'available', NULL),
('22222222-2222-2222-2222-000000000005', 4, 'available', NULL),
('22222222-2222-2222-2222-000000000005', 5, 'reserved',  '검토 중'),
-- camp-006
('22222222-2222-2222-2222-000000000006', 1, 'filled',    '벨킨'),
('22222222-2222-2222-2222-000000000006', 2, 'filled',    '스피겐'),
('22222222-2222-2222-2222-000000000006', 3, 'available', NULL),
('22222222-2222-2222-2222-000000000006', 4, 'available', NULL),
-- camp-007
('22222222-2222-2222-2222-000000000007', 1, 'filled',    '아모레퍼시픽'),
('22222222-2222-2222-2222-000000000007', 2, 'available', NULL),
('22222222-2222-2222-2222-000000000007', 3, 'available', NULL),
('22222222-2222-2222-2222-000000000007', 4, 'available', NULL),
('22222222-2222-2222-2222-000000000007', 5, 'reserved',  '협의 중'),
-- camp-008
('22222222-2222-2222-2222-000000000008', 1, 'available', NULL),
('22222222-2222-2222-2222-000000000008', 2, 'available', NULL),
('22222222-2222-2222-2222-000000000008', 3, 'available', NULL),
('22222222-2222-2222-2222-000000000008', 4, 'available', NULL),
-- camp-009
('22222222-2222-2222-2222-000000000009', 1, 'filled',    '유이크'),
('22222222-2222-2222-2222-000000000009', 2, 'filled',    '23yearsold'),
('22222222-2222-2222-2222-000000000009', 3, 'filled',    '헤브블루'),
('22222222-2222-2222-2222-000000000009', 4, 'filled',    '닥터리엔장'),
('22222222-2222-2222-2222-000000000009', 5, 'filled',    '옵티마 이뮨'),
-- camp-010
('22222222-2222-2222-2222-000000000010', 1, 'filled',    '유이크'),
('22222222-2222-2222-2222-000000000010', 2, 'filled',    '23yearsold'),
('22222222-2222-2222-2222-000000000010', 3, 'filled',    '헤브블루'),
('22222222-2222-2222-2222-000000000010', 4, 'filled',    '닥터리엔장'),
('22222222-2222-2222-2222-000000000010', 5, 'filled',    '옵티마 이뮨');
