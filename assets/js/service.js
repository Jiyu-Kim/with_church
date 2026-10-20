/* W1th Church — 예배 시간 페이지 전용 JS
 *
 * service.md 형식을 파싱해서 표로 렌더링:
 *   첫 비어있지 않은 라인 → 페이지 제목
 *   이어지는 라인들      → "<구분> : <시간> <장소>"
 * 시간/장소 분리는 "N시" 또는 "N시 M분" 패턴을 경계로 사용.
 * 같은 <구분>이 연달아 나오면 한 행으로 묶고 시간 칸을 나눔 (예: 주일 1부/2부).
 * 시간 앞의 "N부" 는 배지로 표시.
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

      // Consecutive lines with the same 구분 (e.g. 주일 1부/2부) become one row
      // whose 시간 cell is split into slots; 장소 is shared if identical.
      const groups = [];
      rows.forEach((r) => {
        const last = groups[groups.length - 1];
        if (last && last.label === r.label) last.items.push(r);
        else groups.push({ label: r.label, items: [r] });
      });

      // "1부 주일 오전 8시" → badge "1부" + rest
      const timeHtml = (t) => {
        const pm = t.match(/^(\d+\s*부)\s+(.+)$/);
        return pm
          ? `<span class="service-part">${escapeHtml(pm[1])}</span>${escapeHtml(pm[2])}`
          : escapeHtml(t);
      };
      const slots = (values) => `<div class="service-slots">${
        values.map((v) => `<div class="service-slot">${v}</div>`).join("")}</div>`;

      // data-label attrs are used by the mobile CSS to label each cell when
      // the table reflows into a stacked card layout on narrow viewports.
      rowsEl.innerHTML = groups.map((g) => {
        const split = g.items.length > 1;
        const places = [...new Set(g.items.map((r) => r.place))];
        const timeCell = split
          ? slots(g.items.map((r) => timeHtml(r.time)))
          : timeHtml(g.items[0].time);
        const placeCell = places.length > 1
          ? slots(g.items.map((r) => escapeHtml(r.place)))
          : escapeHtml(places[0]);
        return `
        <tr>
          <th scope="row">${escapeHtml(g.label)}</th>
          <td data-label="시간"${split ? ' class="is-split"' : ""}>${timeCell}</td>
          <td data-label="장소"${places.length > 1 ? ' class="is-split"' : ""}>${placeCell}</td>
        </tr>`;
      }).join("");
    } catch (e) {
      rowsEl.innerHTML = `<tr><td colspan="3" class="muted text-center">예배 시간 정보를 불러올 수 없습니다.</td></tr>`;
      console.warn("service.md 로드 실패:", e);
    }
  }

  document.addEventListener("DOMContentLoaded", loadServiceTimes);
})();
