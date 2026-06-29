/* W1th Church — 예배 시간 페이지 전용 JS
 *
 * service.md 형식을 파싱해서 표로 렌더링:
 *   첫 비어있지 않은 라인 → 페이지 제목
 *   이어지는 라인들      → "<구분> : <시간> <장소>"
 * 시간/장소 분리는 "N시" 또는 "N시 M분" 패턴을 경계로 사용.
 */
(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  async function loadServiceTimes() {
    const titleEl = document.getElementById("service-title");
    const rowsEl = document.getElementById("service-rows");
    if (!rowsEl) return;

    try {
      const res = await fetch(W1TH.url("content/service.md"));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const raw = await res.text();
      const lines = raw.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      if (titleEl) titleEl.textContent = lines[0];

      const rows = lines.slice(1).map((line) => {
        const [label, ...rest] = line.split(/\s*:\s*/);
        const detail = rest.join(" : ");
        // Split detail into "시간" + "장소" by the time tail "N시" or "N시 N분"
        const m = detail.match(/^(.*?\d+\s*시(?:\s*\d+\s*분)?)\s+(.+)$/);
        const time = m ? m[1].trim() : detail;
        const place = m ? m[2].trim() : "";
        return { label: (label || "").trim(), time, place };
      }).filter((r) => r.label);

      // data-label attrs are used by the mobile CSS to label each cell when
      // the table reflows into a stacked card layout on narrow viewports.
      rowsEl.innerHTML = rows.map((r) => `
        <tr>
          <th scope="row">${escapeHtml(r.label)}</th>
          <td data-label="시간">${escapeHtml(r.time)}</td>
          <td data-label="장소">${escapeHtml(r.place)}</td>
        </tr>`).join("");
    } catch (e) {
      rowsEl.innerHTML = `<tr><td colspan="3" class="muted text-center">예배 시간 정보를 불러올 수 없습니다.</td></tr>`;
      console.warn("service.md 로드 실패:", e);
    }
  }

  document.addEventListener("DOMContentLoaded", loadServiceTimes);
})();
