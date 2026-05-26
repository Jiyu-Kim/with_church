/* W1th Church — Client-side API keys
 *
 * ⚠️ 보안 원칙
 *   - 이 파일은 GitHub Pages에 함께 배포되어 누구나 소스에서 볼 수 있습니다.
 *   - 따라서 이 파일에는 *클라이언트 전용 + 도메인 제한이 가능한* 키만 둡니다.
 *   - 서버 시크릿(예: Naver Maps Client Secret, 결제 API Secret 등)은 절대 금지.
 *
 * ⚠️ 키 보호 책임
 *   - Naver Cloud Console: Maps 앱 > Web 서비스 URL 에 등록된 도메인만 허용.
 *     (http://localhost:8000, https://jiyu-kim.github.io)
 *   - Google Cloud Console: API 키 > 애플리케이션 제한 > "HTTP 리퍼러" 로 제한.
 *     허용 리퍼러: http://localhost:8000/*, https://jiyu-kim.github.io/*
 *   - 제한 안 걸면 누가 키를 복사해서 마음대로 쓸 수 있음 → 비용/쿼터 손실 가능.
 *
 * 키 교체 시 이 파일만 수정하면 모든 페이지에 반영됩니다.
 */
window.W1TH_CONFIG = {
  // Naver Cloud Platform — Maps Dynamic Map (Client ID only, never Secret)
  NAVER_MAPS_CLIENT_ID: "7ksqung85w",

  // Google Cloud — YouTube Data API v3 (도메인 제한 필수)
  YOUTUBE_API_KEY: "AIzaSyCtIKfnOFH4X3-2HsauKnKFlf41KuSAbOo",
};
