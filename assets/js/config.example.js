/* W1th Church — Client-side API keys (example template)
 *
 * 이 파일을 복사해서 `config.js` 로 저장한 뒤, 아래 값들을 실제 키로 교체하세요.
 * 실제 키가 담긴 `config.js` 는 `.gitignore` 에 의해 커밋되지 않습니다.
 *
 *   cp assets/js/config.example.js assets/js/config.js
 *   # 그 후 에디터로 assets/js/config.js 열고 값 채우기
 *
 * ⚠️ 보안 원칙
 *   - 도메인/리퍼러 제한이 가능한 키만 둡니다 (Naver Cloud Console, Google Cloud Console).
 *   - 서버 시크릿(예: Naver Maps Client Secret)은 절대 금지.
 *
 * ⚠️ 키 보호 책임
 *   - Naver Cloud Console: Maps 앱 > Web 서비스 URL 에 도메인 등록
 *     (http://localhost:8000, https://jiyu-kim.github.io)
 *   - Google Cloud Console: API 키 > 애플리케이션 제한 > "HTTP 리퍼러"
 *     허용 리퍼러: http://localhost:8000/*, https://jiyu-kim.github.io/*
 *
 * 키가 없거나 잘못 설정되어도 사이트 자체는 동작합니다:
 *   - 지도 페이지 → "지도를 불러올 수 없습니다" 폴백 메시지
 *   - 주일/금요 예배 영상 → 단일 플레이리스트 임베드(폴백)
 */
window.W1TH_CONFIG = {
  // Naver Cloud Platform — Maps Dynamic Map
  // 신규 키는 ncpKeyId 로 인증(2024+), 레거시 키는 ncpClientId 로 인증.
  // 코드 동작은 동일; 인증 실패 시 directions.html 에서 PARAM 상수 바꿔 시도.
  NAVER_MAPS_CLIENT_ID: "YOUR_NAVER_CLIENT_ID_HERE",

  // Google Cloud — YouTube Data API v3
  // HTTP 리퍼러 제한 필수 (제한 안 걸면 누가 키를 베껴 사용 가능 → 쿼터/비용 손실).
  YOUTUBE_API_KEY: "YOUR_YOUTUBE_API_KEY_HERE",
};
