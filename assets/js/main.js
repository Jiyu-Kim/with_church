/* W1th Church — shared site JS
 * Handles: nav injection, footer injection, hamburger toggle,
 *          loading content from /content/*.txt, people parser, video helpers.
 *
 * Pages live at varying depths (root, /pages/<area>/<page>.html).
 * Rather than hardcode "../" in every page, this script derives an absolute
 * site root from its OWN <script src> URL — all internal links and fetches
 * are then built relative to that root. So every page can include this same
 * script with a relative path and Just Work.
 */
(function () {
  "use strict";

  // ----- Site root resolution -----
  // main.js lives at <root>/assets/js/main.js, so going up two levels
  // from the script URL gives us the absolute site root.
  const SCRIPT_URL = new URL(document.currentScript.src, window.location.href);
  const SITE_ROOT = new URL("../../", SCRIPT_URL).href; // trailing slash

  function url(path) {
    // path is relative to site root; never starts with /
    return new URL(path.replace(/^\/+/, ""), SITE_ROOT).href;
  }

  // ----- Site map -----
  // Authoritative list of pages. The "file" is relative to site root.
  // Pages that don't exist yet still appear in the nav and route to the
  // shared "준비 중" page so menu state stays consistent.
  const NAV = [
    {
      title: "w1th 교회소개",
      items: [
        { label: "인사말",        file: "pages/about/intro.html" },
        { label: "섬기는 사람들", file: "pages/about/people.html" },
        { label: "예배 시간",     file: "pages/about/service.html" },
        { label: "예배 장소",     file: "pages/about/location.html" },
        { label: "찾아오시는 길", file: "pages/about/directions.html" },
      ],
    },
    {
      title: "w1th 예배영상",
      items: [
        { label: "주일 예배 영상", file: "pages/worship/sunday.html" },
        { label: "금요 예배 영상", file: "pages/worship/friday.html" },
        { label: "새벽 묵상",      file: "pages/worship/dawn.html" },
        { label: "찬양",           file: "pages/worship/praise.html" },
      ],
    },
    {
      title: "w1th 교회학교",
      items: [
        { label: "Children", file: "pages/school/children.html" },
        { label: "Teens",    file: "pages/school/teens.html" },
        { label: "Youth",    file: "pages/school/youth.html" },
      ],
    },
    {
      title: "w1th 교회행사",
      items: [
        { label: "일정",     file: "pages/events/schedule.html" },
        { label: "행사 사진", file: "pages/events/photos.html" },
      ],
    },
  ];

  // ----- Current page detection -----
  function currentPath() {
    // Strip trailing index.html, query, hash
    let p = window.location.pathname;
    if (p.endsWith("/")) p += "index.html";
    return p;
  }

  // ----- Header / nav -----
  function buildHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;

    const here = currentPath();

    const groupsHtml = NAV.map((group) => {
      const subItems = group.items
        .map((it) => {
          const href = url(it.file);
          const isCurrent = here.endsWith("/" + it.file);
          return `<li><a href="${href}"${isCurrent ? ' aria-current="page"' : ""}>${it.label}</a></li>`;
        })
        .join("");
      return `
        <li class="menu-group">
          <span class="menu-title">${group.title}</span>
          <ul class="submenu">${subItems}</ul>
        </li>`;
    }).join("");

    host.innerHTML = `
      <div class="container header-inner">
        <a class="brand" href="${url("index.html")}" aria-label="위드교회 홈으로">
          <img src="${url("src/logo.png")}" alt="위드교회 로고" />
          <span class="brand-name">위드교회</span>
        </a>
        <button class="hamburger" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="main-nav">
          <span></span><span></span><span></span>
        </button>
        <nav class="main-nav" id="main-nav" aria-label="주요 메뉴">
          <ul>${groupsHtml}</ul>
        </nav>
      </div>`;

    // Hamburger behavior
    const burger = host.querySelector(".hamburger");
    const nav = host.querySelector(".main-nav");
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    // Close nav when a link is tapped on mobile
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && window.matchMedia("(max-width: 1023px)").matches) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ----- Footer -----
  async function buildFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    let text = "";
    try {
      const res = await fetch(url("content/footer.txt"));
      if (res.ok) text = await res.text();
    } catch (e) {
      console.warn("footer.txt 로드 실패:", e);
    }
    host.innerHTML = `
      <div class="container">
        <div class="footer-content">${escapeHtml(text || "위드교회")}</div>
        <div class="footer-meta">© ${new Date().getFullYear()} 위드교회 W1th Church</div>
      </div>`;
  }

  // ----- Content loaders -----
  // Whitelist of inline HTML tags allowed when allowHtml=true.
  // Anything else is escaped, so authors can use <strong>/<em>/<u>/<br>/<a>
  // safely without opening XSS holes in their .txt content.
  const ALLOWED_TAGS = ["strong", "em", "b", "i", "u", "br", "a", "small", "mark"];

  function safeHrefOrFallback(href) {
    return /^(https?:|mailto:|tel:|\/|\.\.?\/|#)/i.test(href || "") ? href : "#";
  }

  function sanitizeHtml(s) {
    const allowed = new Set(ALLOWED_TAGS);

    // Step 1: Convert Markdown links [text](url) → <a href="url">text</a>
    // so authors can use either Markdown or HTML for links. We do this BEFORE
    // tag whitelisting so the resulting <a> still flows through validation.
    let out = String(s).replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
      return `<a href="${href}">${text}</a>`;
    });

    // Step 2: Whitelist-filter HTML tags; escape anything not allowed.
    out = out.replace(/<(\/)?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (m, slash, tag, attrs) => {
      const tagLc = tag.toLowerCase();
      if (!allowed.has(tagLc)) return escapeHtml(m);
      const isClose = slash === "/";
      if (tagLc === "a") {
        if (isClose) return "</a>";
        const href = (attrs.match(/href\s*=\s*"([^"]*)"/i) || [])[1] || "";
        return `<a href="${escapeHtml(safeHrefOrFallback(href))}" target="_blank" rel="noopener">`;
      }
      return `<${isClose ? "/" : ""}${tagLc}>`;
    });

    return out;
  }

  async function loadText(filename, targetId, { firstLineAsTitle = false, allowHtml = false } = {}) {
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      const res = await fetch(url("content/" + filename));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const raw = await res.text();
      const lines = raw.replace(/\r\n/g, "\n").split("\n");
      let title = null;
      let body = raw;
      if (firstLineAsTitle) {
        // Pull the first non-empty line out as title
        const idx = lines.findIndex((l) => l.trim() !== "");
        if (idx >= 0) {
          title = lines[idx].trim();
          body = lines.slice(idx + 1).join("\n").replace(/^\n+/, "");
        }
      }
      const renderedBody = allowHtml
        ? sanitizeHtml(body).replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br />")
        : escapeHtml(body).replace(/\n\n+/g, "</p><p>");
      target.innerHTML = `
        ${title ? `<h1 class="page-title">${escapeHtml(title)}</h1>` : ""}
        <div class="prose"><p>${renderedBody}</p></div>`;
    } catch (e) {
      target.innerHTML = `<p class="muted text-center">콘텐츠를 불러올 수 없습니다. 로컬에서 보시는 경우 <code>python3 -m http.server</code> 등 정적 서버로 실행해 주세요.</p>`;
      console.warn(filename + " 로드 실패:", e);
    }
  }

  // ----- People parser -----
  // people.txt format (see PROMPT §4-3):
  //   title (first non-empty line)
  //   [blank line]
  //   group header
  //   [blank line]
  //   person line  (2+ spaces between entries; each entry = "<name> <role>")
  //   [blank lines]  → next group...
  function parsePeople(raw) {
    const lines = raw.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/g, ""));
    let i = 0;
    const skipBlanks = () => { while (i < lines.length && lines[i].trim() === "") i++; };

    skipBlanks();
    const title = (lines[i] || "섬기는 사람들").trim();
    i++;

    const groups = [];
    while (i < lines.length) {
      skipBlanks();
      if (i >= lines.length) break;

      const header = lines[i].trim();
      i++;
      skipBlanks();

      const persons = [];
      while (i < lines.length && lines[i].trim() !== "") {
        const row = lines[i];
        // 2+ spaces between entries; tabs OK
        const entries = row.split(/\s{2,}|\t+/).map((s) => s.trim()).filter(Boolean);
        entries.forEach((entry) => {
          const parts = entry.split(/\s+/);
          if (parts.length >= 2) {
            const role = parts[parts.length - 1];
            const name = parts.slice(0, -1).join(" ");
            persons.push({ name, role });
          } else {
            persons.push({ name: entry, role: "" });
          }
        });
        i++;
      }
      if (header) groups.push({ header, persons });
    }
    return { title, groups };
  }

  async function loadPeople(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      const res = await fetch(url("content/people.txt"));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const raw = await res.text();
      const { title, groups } = parsePeople(raw);

      const titleEl = document.getElementById("people-title");
      if (titleEl) titleEl.textContent = title;

      target.innerHTML = groups
        .map((g) => {
          const blocks = g.persons
            .map((p) => personBlock(p))
            .join("");
          return `
            <div class="people-group">
              <h3>${escapeHtml(g.header)}</h3>
              <div class="people-row">${blocks}</div>
            </div>`;
        })
        .join("");
    } catch (e) {
      target.innerHTML = `<p class="muted text-center">사람 목록을 불러올 수 없습니다.</p>`;
      console.warn("people.txt 로드 실패:", e);
    }
  }

  // Roles that get an "학력 및 경력" details placeholder beside their card.
  // 사모 and other supporting roles only show the photo card.
  const ROLES_WITH_DETAILS = new Set(["목사", "강도사", "전도사", "장로"]);

  function personBlock(person) {
    const hasDetails = ROLES_WITH_DETAILS.has(person.role);
    // Image filename convention in this repo: "<이름>_프로필_사진.jpeg"
    // (Spec mentioned name+role in filename, but actual files use name only —
    //  we adopt the actual on-disk convention. See README "인물 사진 추가" 섹션.)
    const filename = `${person.name}_프로필_사진.jpeg`;
    const src = url("src/people/" + encodeURIComponent(filename));
    const cardHtml = `
      <div class="person-card">
        <div class="person-photo">
          <img src="${src}" alt="${escapeHtml(person.name + " " + person.role)} 프로필 사진" loading="lazy"
               onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'person-photo',innerHTML:'&#128100;'}))" />
        </div>
        <div class="person-info">
          <div class="name">${escapeHtml(person.name)}</div>
          <div class="role">${escapeHtml(person.role)}</div>
        </div>
      </div>`;
    const detailsHtml = hasDetails
      ? `<div class="person-details">
           <h4>학력 및 경력</h4>
           <p class="placeholder">준비 중입니다.</p>
         </div>`
      : "";
    return `<div class="person-block${hasDetails ? " has-details" : ""}">${cardHtml}${detailsHtml}</div>`;
  }

  // ----- YouTube playlist embed (single iframe fallback) -----
  function embedPlaylist(targetId, playlistId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = `
      <div class="video-wrap">
        <div class="video-frame">
          <iframe
            src="https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}"
            title="YouTube 플레이리스트"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
            loading="lazy"></iframe>
        </div>
        <p class="text-center mt-3">
          <a class="btn btn--ghost" href="https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}" target="_blank" rel="noopener">유튜브에서 플레이리스트 보기</a>
        </p>
      </div>`;
  }

  // ----- YouTube: embed the single latest video from a playlist -----
  // Used on the homepage's "최근 주일 예배" teaser. The playlistItems.list
  // endpoint returns items in playlist position order (not date), so we sort
  // by snippet.publishedAt (= date added to playlist) descending and take the
  // newest. Falls back to embedPlaylist() if the API is unavailable.
  async function embedLatestVideo(targetId, playlistId, { apiKey } = {}) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const key = apiKey || (window.W1TH_CONFIG && window.W1TH_CONFIG.YOUTUBE_API_KEY);
    if (!key || /YOUR_.+_HERE$/.test(key)) {
      return embedPlaylist(targetId, playlistId);
    }
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(key)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const items = (data.items || [])
        .filter((it) => it.snippet && it.snippet.resourceId && it.snippet.resourceId.kind === "youtube#video")
        .filter((it) => !/^(Private|Deleted) video$/i.test(it.snippet.title))
        .sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
      if (items.length === 0) {
        target.innerHTML = `<p class="muted text-center">아직 영상이 업로드되지 않았습니다.</p>`;
        return;
      }
      const v = items[0];
      target.innerHTML = `
        <div class="video-wrap">
          <div class="video-frame">
            <iframe
              src="https://www.youtube.com/embed/${encodeURIComponent(v.snippet.resourceId.videoId)}?rel=0"
              title="${escapeHtml(v.snippet.title)}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
              loading="lazy"></iframe>
          </div>
          <div class="video-featured-info">
            <h3 class="video-featured-title">${escapeHtml(v.snippet.title)}</h3>
            <div class="video-featured-meta">${formatDate(v.snippet.publishedAt)}</div>
          </div>
        </div>`;
    } catch (e) {
      console.warn("최신 영상 로드 실패 — 단일 임베드로 폴백:", e);
      embedPlaylist(targetId, playlistId);
    }
  }

  // ----- YouTube playlist grid (Data API v3) -----
  // Renders: large featured player on top + grid of remaining thumbnails.
  // Click on a thumbnail swaps it into the featured player.
  // Falls back to embedPlaylist() if API key is missing or the request fails.
  async function embedPlaylistGrid(targetId, playlistId, { apiKey, maxResults = 16 } = {}) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const key = apiKey || (window.W1TH_CONFIG && window.W1TH_CONFIG.YOUTUBE_API_KEY);
    if (!key || /YOUR_.+_HERE$/.test(key)) {
      console.warn("YOUTUBE_API_KEY 없음 또는 placeholder — 단일 임베드로 폴백");
      return embedPlaylist(targetId, playlistId);
    }
    target.innerHTML = `<p class="muted text-center">영상 목록을 불러오는 중...</p>`;
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(key)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        const errText = await res.text();
        console.warn("YouTube API 응답 에러:", res.status, errText);
        throw new Error("HTTP " + res.status);
      }
      const data = await res.json();
      const items = (data.items || []).filter(
        (it) => it.snippet && it.snippet.resourceId && it.snippet.resourceId.kind === "youtube#video"
        // Skip private/deleted videos which show up with placeholder titles
      ).filter((it) => !/^(Private|Deleted) video$/i.test(it.snippet.title));

      if (items.length === 0) {
        target.innerHTML = `<p class="muted text-center">아직 영상이 업로드되지 않았습니다.</p>`;
        return;
      }

      const featured = items[0];
      const rest = items.slice(1);
      const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;

      target.innerHTML = `
        <div class="video-gallery">
          <div class="video-wrap">
            <div class="video-frame">
              <iframe id="${escapeAttr(targetId)}__player"
                src="https://www.youtube.com/embed/${encodeURIComponent(featured.snippet.resourceId.videoId)}?rel=0"
                title="${escapeHtml(featured.snippet.title)}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                referrerpolicy="strict-origin-when-cross-origin"
                loading="lazy"></iframe>
            </div>
            <div class="video-featured-info">
              <h3 class="video-featured-title">${escapeHtml(featured.snippet.title)}</h3>
              <div class="video-featured-meta">${formatDate(featured.snippet.publishedAt)}</div>
            </div>
          </div>

          ${rest.length ? `
            <h3 class="video-grid-heading">지난 영상</h3>
            <div class="video-grid">
              ${rest.map((it) => videoThumbCard(it)).join("")}
            </div>` : ""}

          <p class="text-center mt-4">
            <a class="btn btn--ghost" href="${playlistUrl}" target="_blank" rel="noopener">유튜브에서 전체 영상 보기</a>
          </p>
        </div>`;

      // Click handlers: swap the featured player
      const playerEl = document.getElementById(`${targetId}__player`);
      const titleEl = target.querySelector(".video-featured-title");
      const metaEl = target.querySelector(".video-featured-meta");
      target.querySelectorAll(".video-card").forEach((card) => {
        card.addEventListener("click", () => {
          const vid = card.getAttribute("data-video-id");
          const title = card.getAttribute("data-video-title") || "";
          const date = card.getAttribute("data-video-date") || "";
          if (!vid || !playerEl) return;
          playerEl.src = `https://www.youtube.com/embed/${encodeURIComponent(vid)}?autoplay=1&rel=0`;
          playerEl.title = title;
          if (titleEl) titleEl.textContent = title;
          if (metaEl) metaEl.textContent = date;
          playerEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    } catch (e) {
      console.warn("YouTube 플레이리스트 그리드 로드 실패 — 단일 임베드로 폴백:", e);
      embedPlaylist(targetId, playlistId);
    }
  }

  function videoThumbCard(item) {
    const sn = item.snippet;
    const vid = sn.resourceId.videoId;
    const title = sn.title;
    const thumb =
      (sn.thumbnails.medium && sn.thumbnails.medium.url) ||
      (sn.thumbnails.high && sn.thumbnails.high.url) ||
      (sn.thumbnails.default && sn.thumbnails.default.url) ||
      "";
    const date = formatDate(sn.publishedAt);
    return `
      <button class="video-card" type="button"
        data-video-id="${escapeAttr(vid)}"
        data-video-title="${escapeAttr(title)}"
        data-video-date="${escapeAttr(date)}"
        aria-label="${escapeAttr(title)} 재생">
        <div class="video-card-thumb">
          <img src="${escapeAttr(thumb)}" alt="" loading="lazy" />
          <span class="video-card-play" aria-hidden="true">▶</span>
        </div>
        <div class="video-card-info">
          <div class="video-card-title">${escapeHtml(title)}</div>
          <div class="video-card-date">${escapeHtml(date)}</div>
        </div>
      </button>`;
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  // ----- Utilities -----
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Expose helpers used by individual pages
  window.W1TH = {
    url,
    loadText,
    loadPeople,
    embedPlaylist,
    embedLatestVideo,
    embedPlaylistGrid,
    copyToClipboard(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = "복사 완료";
          setTimeout(() => (btn.textContent = orig), 1500);
        }
      });
    },
  };

  // ----- Boot -----
  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    buildFooter();
  });
})();
