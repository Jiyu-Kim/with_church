/* W1th Church — 찾아오시는 길 페이지 전용 JS
 *
 * 책임:
 *   - Naver Maps 스크립트를 동적으로 로드 (Client ID는 config.js)
 *   - 교회 좌표 마커 + InfoWindow
 *   - 주소 복사 버튼
 *   - config 없거나 placeholder 일 때 graceful fallback
 *
 * Naver Maps API는 Google Maps와 달리 ?callback= URL 파라미터를 자동
 * 호출하지 않으므로 <script> 의 onload 이벤트로 init 합니다.
 */

// ===== 교회 위치 좌표 =====
// Geocoding API는 별도 상품이라 Dynamic Map만 구독한 경우 사용 불가 →
// 좌표를 직접 박아 마커를 표시합니다.
//
// 정확한 좌표 찾는 법:
//   1) https://map.naver.com 에서 "위드교회" 또는 주소 검색
//   2) 교회 위치 우클릭 → "거리 재기" / "좌표 보기" 또는 URL 끝의 ?c=...
//      파라미터에 lng,lat 형태로 들어 있음
//   3) 또는 map.naver.com 에서 교회를 화면 정중앙에 두면 URL이
//      .../map.naver.com/p/?c=15.00,0,0,0,dh@127.10428,37.30353,15 와 같이
//      바뀌고 그 안에 lng,lat 가 있음 (※ 네이버는 lng,lat 순서!)
// 위드교회 위치 좌표 (Naver Place 2076622438 기준)
//   도로명: 경기 용인시 수지구 상현로11번길 26 상가동 101호, 201호
//   지번:   경기 용인시 수지구 상현동 825 (우편 16938)
const CHURCH_LAT = 37.3039504;
const CHURCH_LNG = 127.0765200;

function initNaverMap() {
  const mapEl = document.getElementById("naver-map");
  if (!mapEl || typeof naver === "undefined") return;

  const latlng = new naver.maps.LatLng(CHURCH_LAT, CHURCH_LNG);
  const map = new naver.maps.Map(mapEl, {
    center: latlng,
    zoom: 17,
    zoomControl: true,
    zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
  });

  const marker = new naver.maps.Marker({
    position: latlng,
    map: map,
    title: "위드교회",
  });

  const info = new naver.maps.InfoWindow({
    content:
      '<div style="padding:8px 12px;font-weight:600;color:#3252a7;font-family:Pretendard,sans-serif;">위드교회</div>',
    borderColor: "#a9b6d7",
    anchorSize: new naver.maps.Size(8, 8),
    pixelOffset: new naver.maps.Point(0, -4),
  });
  info.open(map, marker);

  // Re-open info window on marker click in case user closes it
  naver.maps.Event.addListener(marker, "click", () => info.open(map, marker));
}

function showMapFallback(msg) {
  const el = document.getElementById("naver-map");
  if (!el) return;
  el.innerHTML =
    '<div class="map-fallback">' +
      '<div class="icon">📍</div>' +
      '<h3>위드교회</h3>' +
      '<p>' + msg + '</p>' +
    '</div>';
}

document.addEventListener("DOMContentLoaded", () => {
  // ===== Naver Maps 스크립트 동적 로드 =====
  // Graceful degradation: if config.js was not deployed (e.g. GitHub Pages
  // without committed keys) or the placeholder value is still in place,
  // show a fallback message instead of crashing.
  const cfg = window.W1TH_CONFIG;
  const id = cfg && cfg.NAVER_MAPS_CLIENT_ID;
  const isPlaceholder = !id || /YOUR_.+_HERE$/.test(id);

  if (isPlaceholder) {
    showMapFallback("지도를 불러올 수 없습니다. 아래 '네이버 지도에서 보기' 버튼을 이용해 주세요.");
  } else {
    // Try ncpKeyId first (2024+ keys); if Naver returns auth error, swap to
    // ncpClientId in config.js comment guidance.
    const PARAM = "ncpKeyId"; // ← 인증 실패 시 "ncpClientId" 로 바꿔 보세요
    const s = document.createElement("script");
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${PARAM}=` + encodeURIComponent(id);
    s.async = true;
    s.defer = true;
    s.onload = initNaverMap;
    s.onerror = () => showMapFallback("지도 스크립트 로드에 실패했습니다.");
    document.head.appendChild(s);
  }

  // ===== 주소 복사 버튼 =====
  const copyBtn = document.getElementById("copy-address");
  if (copyBtn) {
    copyBtn.addEventListener("click", (e) => {
      const addr = document.getElementById("church-address").textContent.trim();
      W1TH.copyToClipboard(addr, e.currentTarget);
    });
  }
});
