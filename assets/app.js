/* 考研数学 · 知识卡片 —— 本地单页应用（离线可用） */
(function () {
  'use strict';

  const D = window.__KM_DATA__;
  const GROUP = D.group || { id: 'math', name: '考研数学', sub: '知识卡片 · 高数 / 线代' };
  const DAY = 86400000;
  const GID = (window.__KM_DATA__ && window.__KM_DATA__.group && window.__KM_DATA__.group.id) || 'math';
  const STORE_KEY = 'kaoyan-cards-app-v1-' + GID;
  const THEME_KEY = 'kaoyan-cards-theme-v1';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  /* ------------------------------------------------ 数据索引 */
  const cards = [];
  D.chapters.forEach((ch) => ch.cards.forEach((c) => cards.push(c)));
  const byId = new Map(cards.map((c) => [c.id, c]));
  const chaptersByDeck = new Map();
  D.chapters.forEach((ch) => {
    if (!chaptersByDeck.has(ch.subject)) chaptersByDeck.set(ch.subject, []);
    chaptersByDeck.get(ch.subject).push(ch);
  });
  const subjectCards = (s) => cards.filter((c) => c.subject === s);

  /* ------------------------------------------------ 持久化 */
  const blank = () => ({ v: 1, theme: 'light', srs: {}, reviews: 0, daily: {}, last: null });
  let storageOK = (() => {
    try {
      const k = STORE_KEY + '-probe';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();
  let memState = null;
  let state = (() => {
    try {
      const raw = storageOK ? localStorage.getItem(STORE_KEY) : null;
      if (!raw) return blank();
      return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { return blank(); }
  })();
  function readGlobalTheme() {
    try { return localStorage.getItem(THEME_KEY) || null; } catch (e) { return null; }
  }
  function writeGlobalTheme(t) {
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  }
  let saveTimer = null;
  let savedHintTimer = null;
  function flushSave() {
    clearTimeout(saveTimer);
    saveTimer = null;
    memState = state;
    if (!storageOK) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      localStorage.setItem(STORE_KEY + '-savedAt', String(Date.now()));
    } catch (e) { storageOK = false; }
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 140);
    if (typeof showSavedHint === 'function') showSavedHint();
  }
  function showSavedHint() {
    const el = document.getElementById('saveHint');
    if (!el) return;
    el.classList.add('on');
    clearTimeout(savedHintTimer);
    savedHintTimer = setTimeout(() => el.classList.remove('on'), 1100);
  }

  /* ------------------------------------------------ 学习记录 */
  const REVIEW = DAY;
  function rec(id) { return state.srs[id] || null; }
  const isNew = (id) => !rec(id);
  const isDue = (id) => { const r = rec(id); return !!r && r.due <= Date.now(); };
  const isGraduated = (id) => { const r = rec(id); return !!r && r.ivl >= 1; };
  const mastered = (id) => { const r = rec(id); return !!r && (r.ivl >= 4 || r.reps >= 3); };

  function rate(id, how) {
    const now = Date.now();
    const r = state.srs[id] || (state.srs[id] = { due: now, ivl: 0, ease: 2.5, reps: 0, lapses: 0, last: 0 });
    r.reps = (r.reps || 0) + 1;
    r.last = now;
    r.updatedAt = now;
    r.device = cloud.deviceName || '';
    if (how === 'again') {
      r.lapses = (r.lapses || 0) + 1;
      r.ease = Math.max(1.3, (r.ease || 2.5) - 0.2);
      r.ivl = 0;
      r.due = now + 4 * 60 * 1000;
    } else if (how === 'hard') {
      r.ease = Math.max(1.3, (r.ease || 2.5) - 0.05);
      r.ivl = r.ivl >= 1 ? Math.max(1, Math.round(r.ivl * 1.15)) : 0;
      r.due = r.ivl >= 1 ? now + r.ivl * DAY : now + 30 * 60 * 1000;
    } else {
      r.ease = Math.min(3.2, (r.ease || 2.5) + 0.05);
      r.ivl = r.ivl >= 1 ? Math.max(2, Math.round(r.ivl * (r.ease || 2.5))) : 1;
      r.due = now + r.ivl * DAY;
    }
    state.reviews = (state.reviews || 0) + 1;
    const k = today();
    state.daily[k] = (state.daily[k] || 0) + 1;
    state.last = k;
    save();
    paintSideProgress();
    renderTree();
    scheduleSync();
  }

  function deckStats(subject) {
    const list = subjectCards(subject);
    let due = 0, newc = 0, done = 0, total = list.length, rev = 0;
    list.forEach((c) => {
      const r = rec(c.id);
      if (!r) newc++;
      else if (r.due <= Date.now()) due++;
      if (r) rev++;
      if (mastered(c.id)) done++;
    });
    return { total, due, new: newc, rev, done };
  }

  function todayCount() { return state.daily[today()] || 0; }

  /* ------------------------------------------------ MathJax */
  let mjChain = Promise.resolve();
  let mjQueue = [];
  let mjTimer = null;
  function mjReady() {
    return !!(window.MathJax && MathJax.typesetPromise &&
              MathJax.startup && MathJax.startup.document);
  }
  function flushMj(el) {
    mjChain = mjChain.then(() => MathJax.typesetPromise([el])).catch(() => {});
  }
  function typeset(el) {
    if (!el) return mjChain;
    if (!mjReady()) {
      mjQueue.push(el);
      if (!mjTimer) {
        mjTimer = setInterval(() => {
          if (mjReady()) {
            clearInterval(mjTimer); mjTimer = null;
            const q = mjQueue.splice(0);
            q.forEach((x) => typeset(x));
          }
        }, 120);
      }
      return mjChain;
    }
    flushMj(el);
    return mjChain;
  }

  /* ------------------------------------------------ 视图与路由 */
  const VIEWS = ['browse', 'study', 'stats'];
  let cur = { view: 'browse', subject: 'all', chapter: null, type: null, q: '', id: null };
  function route(write) {
    if (write) {
      const p = new URLSearchParams();
      p.set('v', cur.view);
      if (cur.subject !== 'all') p.set('s', cur.subject);
      if (cur.chapter) p.set('c', cur.chapter);
      if (cur.id) p.set('i', cur.id);
      if (cur.type) p.set('t', cur.type);
      history.replaceState(null, '', '#' + p.toString());
    }
  }
  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    cur.view = VIEWS.includes(p.get('v')) ? p.get('v') : 'browse';
    cur.subject = p.get('s') || 'all';
    cur.chapter = p.get('c') || null;
    cur.id = p.get('i') || null;
    cur.type = p.get('t') || null;
  }

  function showView(v) {
    cur.view = v;
    if (v === 'study' && !study.running) renderPick();
    if (v === 'stats') renderStats();
    VIEWS.forEach((x) => {
      $('#view-' + x).classList.toggle('active', x === v);
      $('.nav-item[data-view="' + x + '"]').classList.toggle('active', x === v);
    });
    if (v === 'browse') renderList();
    updateCrumb();
    route(true);
  }

  /* ------------------------------------------------ 侧栏树 */
  const openSubjects = new Set(['高等数学', '线性代数', '串联总表']);
  function renderTree() {
    const tree = $('#tree');
    tree.innerHTML = '';
    D.decks.forEach((deck) => {
      const wrap = document.createElement('div');
      wrap.className = 'tree-subject';
      const st = deckStats(deck.name);
      const row = document.createElement('button');
      row.className = 'trow' + (openSubjects.has(deck.name) ? ' open' : '') +
        (cur.subject === deck.name && !cur.chapter ? ' active' : '');
      row.innerHTML = '<span class="caret">▶</span><span class="nm">' + esc(deck.name) +
        '</span><span class="cnt">' + st.rev + ' / ' + st.total + '</span>';
      row.onclick = () => {
        if (openSubjects.has(deck.name) && cur.subject === deck.name && !cur.chapter) {
          openSubjects.delete(deck.name);
        } else {
          openSubjects.add(deck.name);
          cur.subject = deck.name; cur.chapter = null; cur.type = null;
          cur.id = (cards.find((c) => c.subject === deck.name) || {}).id || null;
        }
        renderTree(); renderList(); route(true);
      };
      wrap.appendChild(row);

      const kids = document.createElement('div');
      kids.className = 'tree-children' + (openSubjects.has(deck.name) ? ' open' : '');
      (deck.chapters || []).forEach((ch) => {
        const full = chaptersByDeck.get(deck.name).find((x) => x.name === ch.name);
        const cst = chapterStats(full);
        const k = document.createElement('button');
        k.className = 'trow' + (cur.chapter === ch.name && cur.subject === deck.name ? ' active' : '');
        let lab = ch.deck;
        const m = lab.match(/^(\d+)\s+(.*)$/);
        if (m && ch.name.startsWith(m[1])) lab = m[2];
        k.innerHTML = '<span class="nm">' + esc(lab) + '</span><span class="cnt">' + cst.rev + ' / ' + cst.total + '</span>';
        k.onclick = () => {
          cur.subject = deck.name; cur.chapter = ch.name; cur.type = null;
          cur.id = (full.cards[0] || {}).id || null;
          renderTree(); renderList(); showView('browse');
        };
        kids.appendChild(k);
      });
      wrap.appendChild(kids);
      tree.appendChild(wrap);
    });
    paintSideProgress();
  }

  function chapterStats(ch) {
    let rev = 0, done = 0;
    ch.cards.forEach((c) => {
      if (rec(c.id)) rev++;
      if (mastered(c.id)) done++;
    });
    return { rev: rev, done: done, total: ch.cards.length };
  }

  function paintSideProgress() {
    let done = 0;
    cards.forEach((c) => { if (mastered(c.id)) done++; });
    const pct = cards.length ? Math.round((done / cards.length) * 100) : 0;
    $('#globalProgress').innerHTML = '<i style="width:' + pct + '%"></i>';
    $('#globalProgress').title = '已掌握 ' + done + ' / ' + cards.length;
    $('#todayCount').textContent = todayCount();
  }

  /* ------------------------------------------------ 浏览 */
  function currentPool() {
    let pool = cards;
    if (cur.subject !== 'all') pool = pool.filter((c) => c.subject === cur.subject);
    if (cur.chapter) pool = pool.filter((c) => c.chapter === cur.chapter);
    if (cur.type) pool = pool.filter((c) => c.type === cur.type);
    return pool;
  }
  function searchPool(q) {
    const pool = currentPool();
    if (!q) return pool;
    const needle = q.toLowerCase().replace(/[\s_^{}]+/g, '')
      .replace(/[−–—]/g, '-');
    return pool.filter((c) => (c.search || '').toLowerCase().replace(/[\s_^{}]+/g, '').includes(needle));
  }

  function renderList() {
    const pool = searchPool(cur.q);
    const list = $('#list');
    let title = '全部卡片';
    if (cur.chapter) title = cur.chapter;
    else if (cur.subject !== 'all') title = cur.subject;
    if (cur.type) title += ' · ' + cur.type + '卡';
    $('#listTitle').textContent = title;
    $('#listCount').textContent = pool.length + ' 张';
    list.innerHTML = '';
    if (!pool.length) {
      list.innerHTML = '<div class="empty" style="padding:30px 12px"><div class="empty-ic">🔍</div><p>没有匹配的卡片</p></div>';
      return;
    }
    let group = '';
    pool.forEach((c) => {
      const g = '';
      if (g && g !== group) {
        group = g;
        const h = document.createElement('div');
        h.className = 'list-group';
        h.textContent = g;
        list.appendChild(h);
      }
      const el = document.createElement('div');
      el.className = 'li' + (c.id === cur.id ? ' active' : '');
      el.dataset.id = c.id;
      const sb = statusBadge(c.id);
      el.innerHTML =
        '<div class="num">' + String(c.n).padStart(3, '0') + '</div>' +
        '<span class="dot ' + sb.cls + '" title="' + (sb.extra || sb.text) + '"></span>' +
        '<div style="min-width:0;flex:1"><div class="tt">' + c.front + '</div>' +
        '<div class="meta"><span class="tag ' + c.type + '">' + c.type + '</span>' +
        '<span class="ch">' + esc(c.deck) + '</span></div></div>';
      el.onclick = () => selectCard(c.id, true);
      list.appendChild(el);
    });
    if (cur.id) {
      const active = list.querySelector('.li.active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
    typeset(list);
  }

  function selectCard(id, fromList) {
    const c = byId.get(id);
    if (!c) return;
    cur.id = id;
    cur.subject = c.subject;
    if (cur.chapter && c.chapter !== cur.chapter) cur.chapter = c.chapter;
    updateCrumb();
    $('#preview').classList.remove('hidden');
    $('#previewEmpty').classList.add('hidden');
    $('#preview').innerHTML = cardHTML(c, { showTypeFilter: true });
    $$('#list .li').forEach((el) => el.classList.toggle('active', el.dataset.id === id));
    route(true);
    typeset($('#preview'));
    if (fromList) saveLastDeckView();
  }

  function updateCrumb() {
    const el = $('#crumb');
    if (cur.view === 'study') { el.innerHTML = '<b>开始学习</b>' + (study.running ? ' · ' + esc(study.label) : ''); return; }
    if (cur.view === 'stats') { el.innerHTML = '<b>学习统计</b>'; return; }
    const parts = ['<b>卡片浏览</b>'];
    if (cur.subject !== 'all') parts.push(esc(cur.subject));
    if (cur.chapter) parts.push(esc(cur.chapter));
    el.innerHTML = parts.join(' <span style="opacity:.45">/</span> ');
  }

  function saveLastDeckView() {
    // 记住当前浏览位置，刷新后仍停在同一张卡
    try { localStorage.setItem(STORE_KEY + '-last', cur.id || ''); } catch (e) {}
  }


  function statusBadge(id) {
    const r = rec(id);
    if (!r) return { cls: 'new', text: '新卡' };
    if (r.due <= Date.now()) return { cls: 'due', text: '到期', extra: r.ivl >= 1 ? '间隔 ' + r.ivl + ' 天' : '学习中' };
    const left = Math.max(0, Math.ceil((r.due - Date.now()) / 86400000));
    return { cls: 'ok', text: '已排期', extra: r.ivl >= 1 ? '间隔 ' + r.ivl + ' 天' : '稍后' };
  }

  function decodeEnt(v) {
    const t = document.createElement('textarea');
    t.innerHTML = v;
    return t.value;
  }

  function splitCodes(html) {
    const codes = [];
    const out = String(html).replace(/<code>([\s\S]*?)<\/code>/g, (m, inner) => {
      const text = decodeEnt(inner).trim();
      codes.push(text);
      return '<sup class="code-ref" title="见下方代码区">[' + codes.length + ']</sup>';
    });
    return { html: out, codes: codes };
  }

  function codeAreaHTML(codes) {
    return '<div class="code-box"><div class="code-head"><span>代码区</span>' +
      '<span class="code-tip">文中 [n] 对应下方第 n 段</span></div><pre class="code">' +
      codes.map((c, i) => '<span class="cl"><span class="ln">' + (i + 1) + '</span>' + esc(c) + '</span>').join('') +
      '</pre></div>';
  }

  function codeBox(id) {
    const lines = (window.KMAnim && KMAnim.code(id)) || [];
    if (!lines.length) return '';
    return '<div class="code-box"><div class="code-head"><span>算法代码</span>' +
      '<span class="code-tip">点右下角「动画演示」逐行播放</span></div>' +
      '<pre class="code">' + lines.map((l, i) =>
        '<span class="cl"><span class="ln">' + (i + 1) + '</span>' + esc(l) + '</span>').join('') + '</pre></div>';
  }

  function cardHTML(c, opt) {
    opt = opt || {};
    const r = rec(c.id);
    const sb = statusBadge(c.id);
    const types = [...new Set(cards.map((x) => x.type))];
    let body = c.back;
    let extraCode = '';
    if (!c.anim) {
      const sp = splitCodes(c.back);
      body = sp.html;
      if (sp.codes.length) extraCode = codeAreaHTML(sp.codes);
    }
    const typeChips = opt.showTypeFilter
      ? '<div class="typechips"><button class="chip' + (cur.type ? '' : ' on') + '" data-type="">全部</button>' + types
          .map((t) => '<button class="chip' + (cur.type === t ? ' on' : '') + '" data-type="' + t + '">' + t + '</button>')
          .join('') + '</div>'
      : '';
    return '' +
      '<div class="meta">' +
        '<span class="tag ' + c.type + '">' + c.type + '</span>' +
        '<span class="chapter">' + esc(c.subject) + ' · ' + esc(c.deck) + '</span>' +
        '<span class="status-badge ' + sb.cls + '" title="' + (sb.extra || '') + '">' + sb.text + '</span>' +
        '<span class="card-no">#' + String(c.n).padStart(3, '0') + '</span>' +
      '</div>' +
      '<div class="q">' + c.front + '</div>' +
      '<hr class="sep">' +
      '<div class="a">' + body + '</div>' +
      (c.app ? '<div class="app"><b>应用 / 提醒：</b>' + c.app + '</div>' : '') +
      (c.link ? '<div class="link">🔗 ' + esc(c.link) + '</div>' : '') +
      extraCode +
      (c.anim ? codeBox(c.anim) : '') +
      (typeChips ? '<div class="tags">' + typeChips + '</div>' : '') +
      (c.anim ? '<div class="card-actions"><button class="anim-btn" data-anim="' + c.anim + '">▶ 动画演示</button></div>' : '');
  }

  /* ------------------------------------------------ 学习 */
  const study = { running: false, queue: [], idx: 0, revealed: false, subject: 'all', label: '' };

  function buildQueue(subject, mode, limit) {
    let pool = subject === 'all' ? cards.slice() : subjectCards(subject);
    if (mode === 'new') pool = pool.filter((c) => isNew(c.id));
    else if (mode === 'due') pool = pool.filter((c) => isDue(c.id));
    else pool = pool.filter((c) => isNew(c.id) || isDue(c.id));
    // 新卡与待复习混排：先复习，后新卡
    pool.sort((a, b) => {
      const ra = rec(a.id), rb = rec(b.id);
      const da = ra ? ra.due : Infinity, db = rb ? rb.due : Infinity;
      return da - db;
    });
    if (limit && pool.length > limit) pool = pool.slice(0, limit);
    return pool;
  }

  function startStudy(subject, mode, limit) {
    const q = buildQueue(subject, mode || 'all', limit || 0);
    study.subject = subject;
    study.queue = q;
    study.idx = 0;
    study.revealed = false;
    study.running = true;
    const label = subject === 'all' ? '全部卡组' : subject;
    study.label = label + (mode === 'new' ? ' · 新卡' : mode === 'due' ? ' · 到期' : ' · 到期+新卡');
    showView('study');
    updateCrumb();
    if (!q.length) { renderDone(); return; }
    paintRun(true);
  }

  function startRandom(subject, count) {
    let pool = subject === 'all' ? cards.slice() : subjectCards(subject);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    pool = pool.slice(0, count || 20);
    study.subject = subject;
    study.queue = pool;
    study.idx = 0;
    study.revealed = false;
    study.running = true;
    study.label = '随机 · ' + (subject === 'all' ? '全部 408' : subject);
    showView('study');
    updateCrumb();
    if (!pool.length) { renderDone(); return; }
    paintRun(true);
  }

  function renderPick() {
    $('#studyPick').classList.remove('hidden');
    $('#studyRun').classList.add('hidden');
    let due = 0, nw = 0;
    cards.forEach((c) => { if (isDue(c.id)) due++; if (isNew(c.id)) nw++; });
    $('#studyDeckSub').textContent = '今日到期 ' + due + ' 张 · 未学 ' + nw + ' 张 · 共 ' + cards.length + ' 张';
    const box = $('#studyDeckList');
    box.innerHTML = '';
    D.decks.forEach((d) => {
      const st = deckStats(d.name);
      const el = document.createElement('button');
      el.className = 'pick-card';
      const pct = st.total ? Math.round((st.rev / st.total) * 100) : 0;
      el.innerHTML = '<div class="pk-t">' + esc(d.name) + '</div>' +
        '<div class="pk-c">到期 ' + st.due + ' · 新卡 ' + st.new + ' · 已学 ' + st.rev + '/' + st.total + '</div>' +
        '<div class="pk-n"><span>' + pct + '%</span><span class="mini-bar"><i style="width:' + pct + '%"></i></span></div>';
      el.onclick = () => startStudy(d.name, 'all', 0);
      box.appendChild(el);
    });
    $('#pickAll').onclick = () => startStudy('all', 'all', 30);
    $('#pickNew').onclick = () => startStudy('all', 'new', 30);

    const rb = $('#randomBar');
    if (rb) {
      rb.innerHTML = '';
      D.decks.forEach((d) => {
        const b = document.createElement('button');
        b.textContent = '随机 · ' + d.name;
        b.onclick = () => startRandom(d.name, 20);
        rb.appendChild(b);
      });
      const all = document.createElement('button');
      all.textContent = '随机 · 全部 ' + (D.group && D.group.id === '408' ? '408' : '数学') + '（20 张）';
      all.onclick = () => startRandom('all', 20);
      rb.appendChild(all);
    }
  }

  function paintRun(initial) {
    $('#studyPick').classList.add('hidden');
    $('#studyRun').classList.remove('hidden');
    const c = study.queue[study.idx];
    if (!c) { renderDone(); return; }
    $('#doneBox').classList.add('hidden');
    $('#studyCard').classList.remove('hidden');
    const total = study.queue.length;
    const done = study.idx;
    const pct = Math.round((done / total) * 100);
    $('#runBar').style.width = pct + '%';
    $('#runLabel').textContent = study.label;
    $('#runCount').textContent = (done + 1) + ' / ' + total;
    $('#runPct').textContent = '已完成 ' + pct + '%';
    const sb = statusBadge(c.id);
    let sBody = c.back;
    let sExtra = '';
    if (!c.anim) {
      const sp = splitCodes(c.back);
      sBody = sp.html;
      if (sp.codes.length) sExtra = codeAreaHTML(sp.codes);
    }
    $('#studyCard').innerHTML =
      '<div class="meta"><span class="tag ' + c.type + '">' + c.type + '</span>' +
      '<span class="chapter">' + esc(c.deck) + '</span>' +
      '<span class="status-badge ' + sb.cls + '" title="' + (sb.extra || '') + '">' + sb.text + '</span></div>' +
      '<div class="study-no">#' + String(c.n).padStart(3, '0') + ' · ' + esc(c.chapter) + '</div>' +
      '<div class="q">' + c.front + '</div>' +
      '<div id="studyAnswer" class="' + (study.revealed ? '' : 'hidden') + '">' +
      '<hr class="sep"><div class="a">' + sBody + '</div>' +
      (c.app ? '<div class="app"><b>应用 / 提醒：</b>' + c.app + '</div>' : '') +
      (c.link ? '<div class="link">🔗 ' + esc(c.link) + '</div>' : '') +
      sExtra + '</div>';
    $('#showBar').classList.toggle('hidden', study.revealed);
    $('#rateBar').classList.toggle('hidden', !study.revealed);
    typeset($('#studyCard'));
    if (initial) $('#studyCard').focus();
  }

  function reveal() {
    if (!study.running || study.revealed) return;
    study.revealed = true;
    $('#studyAnswer').classList.remove('hidden');
    $('#showBar').classList.add('hidden');
    $('#rateBar').classList.remove('hidden');
    typeset($('#studyAnswer'));
  }

  function grade(how) {
    if (!study.running || !study.revealed) return;
    const c = study.queue[study.idx];
    if (!c) return;
    rate(c.id, how);
    advance();
  }

  function advance() {
    study.idx++;
    study.revealed = false;
    if (study.idx >= study.queue.length) { renderDone(); return; }
    paintRun();
  }

  function renderDone() {
    $('#studyCard').classList.add('hidden');
    $('#showBar').classList.add('hidden');
    $('#rateBar').classList.add('hidden');
    $('#doneBox').classList.remove('hidden');
    $('#doneTitle').textContent = study.queue.length ? '这一轮学完了 🎉' : '暂时没有到期的卡片';
    $('#doneSub').textContent = study.queue.length
      ? '本轮 ' + study.queue.length + ' 张。今日累计 ' + todayCount() + ' 次。'
      : '可以去「卡片浏览」复习，或点下面按钮再学 20 张新卡。';
    $('#runBar').style.width = '100%';
    $('#runLabel').textContent = study.label || '学习';
    $('#runCount').textContent = study.queue.length + ' / ' + study.queue.length;
  }

  /* ------------------------------------------------ 统计 */
  function renderStats() {
    let learned = 0, masteredN = 0, due = 0, lapses = 0;
    cards.forEach((c) => {
      const r = rec(c.id);
      if (r) { learned++; lapses += r.lapses || 0; }
      if (mastered(c.id)) masteredN++;
      if (isDue(c.id)) due++;
    });
    const pct = cards.length ? Math.round((masteredN / cards.length) * 100) : 0;
    $('#kpis').innerHTML = [
      ['卡片总数', cards.length, D.decks.map((d) => d.name + ' ' + d.count).join(' · ')],
      ['累计复习', state.reviews || 0, '次学习'],
      ['已掌握', masteredN, pct + '% 卡片'],
      ['今日复习', todayCount(), '次'],
      ['待复习', due, '张已到期']
    ].map((k) => '<div class="kpi"><div class="k">' + k[0] + '</div><div class="v">' + k[1] + '</div><div class="s">' + k[2] + '</div></div>').join('');

    const rows = [];
    D.decks.forEach((d) => {
      rows.push('<div class="mrow subj"><span>' + esc(d.name) + '</span><span></span><span></span></div>');
      (d.chapters || []).forEach((c) => {
        const full = chaptersByDeck.get(d.name).find((x) => x.name === c.name);
        const st = chapterStats(full);
        const p = st.total ? Math.round((st.done / st.total) * 100) : 0;
        rows.push('<div class="mrow"><span title="' + esc(d.name) + ' / ' + esc(c.deck) + '">' + esc(c.deck) + '</span><span class="mbar"><i style="width:' + p + '%"></i></span><span class="mpct">' + p + '%</span></div>');
      });
    });
    $('#chapterMastery').innerHTML = rows.join('');

    const days = [];
    let max = 1;
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const v = state.daily[k] || 0;
      if (v > max) max = v;
      days.push({ k: k, v: v, lab: (d.getMonth() + 1) + '/' + d.getDate() });
    }
    $('#heat').innerHTML = days.map((d) =>
      '<div class="hcol" title="' + d.k + '：' + d.v + ' 次"><div class="hbar"><i style="height:' + Math.max(2, (d.v / max) * 86) + 'px"></i></div><div class="d">' + d.lab + '</div></div>'
    ).join('');

    const chains = cards.filter((c) => c.link && c.type === '串联');
    $('#chains').innerHTML = chains.map((c) =>
      '<button class="chain" data-id="' + c.id + '"><b>' + esc(c.deck) + '</b>' + esc(c.link) + '</button>'
    ).join('');
    $$('#chains .chain').forEach((b) => {
      b.onclick = () => {
        cur.subject = 'all'; cur.chapter = null; cur.type = null;
        showView('browse');
        selectCard(b.dataset.id, false);
      };
    });
  }


  /* ------------------------------------------------ 导入 / 导出 */
  let pendingImport = null;

  function exportData() {
    const payload = {
      app: '考研知识点梳理', version: 1, group: GID,
      exportedAt: new Date().toISOString(), cards: cards.length, data: state,
    };
    return payload;
  }

  function downloadExport() {
    const payload = exportData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '学习记录-' + (GROUP.name || GID) + '-' + today() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function normalizeImport(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('文件内容不是有效的 JSON 对象');
    let src = obj;
    if (obj.data && typeof obj.data === 'object') src = obj.data;
    else if (obj.srs && typeof obj.srs === 'object') src = obj;
    else if (obj.state && typeof obj.state === 'object') src = obj.state;
    else throw new Error('未找到学习记录（缺少 srs 字段）');
    const out = blank();
    const srs = (src.srs && typeof src.srs === 'object') ? src.srs : {};
    Object.keys(srs).forEach((id) => {
      const r = srs[id];
      if (!r || typeof r !== 'object') return;
      const due = Number(r.due), ivl = Number(r.ivl);
      if (!isFinite(due)) return;
      out.srs[id] = {
        due: due,
        ivl: isFinite(ivl) ? Math.max(0, ivl) : 0,
        ease: isFinite(Number(r.ease)) ? Math.min(3.2, Math.max(1.3, Number(r.ease))) : 2.5,
        reps: Math.max(0, parseInt(r.reps, 10) || 0),
        lapses: Math.max(0, parseInt(r.lapses, 10) || 0),
        last: isFinite(Number(r.last)) ? Number(r.last) : 0,
      };
    });
    out.reviews = Math.max(0, parseInt(src.reviews, 10) || 0);
    out.daily = {};
    if (src.daily && typeof src.daily === 'object') {
      Object.keys(src.daily).forEach((d) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) out.daily[d] = Math.max(0, parseInt(src.daily[d], 10) || 0);
      });
    }
    return out;
  }

  function openImport() {
    pendingImport = null;
    $('#importModal').classList.remove('hidden');
    $('#importPreview').innerHTML = '<p class="muted">选择导出的 JSON 文件（结尾是 <code>.json</code>）。支持本应用任意科目的学习记录。</p>';
    $('#impMerge').disabled = true;
    $('#impReplace').disabled = true;
    $('#importFile').value = '';
  }

  function closeImport() {
    $('#importModal').classList.add('hidden');
  }

  function handleImportFile(file) {
    const info = $('#importPreview');
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { info.innerHTML = '<p class="imp-err">文件过大（超过 8 MB），请确认是否选错。</p>'; return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        const normalized = normalizeImport(obj);
        const ids = Object.keys(normalized.srs);
        const mine = Object.keys(state.srs);
        const fresh = ids.filter((id) => !state.srs[id]).length;
        const newer = ids.filter((id) => state.srs[id] && (normalized.srs[id].last || 0) > (state.srs[id].last || 0)).length;
        const known = ids.filter((id) => byId.has(id)).length;
        const unknown = ids.length - known;
        const badge = obj.group && obj.group !== GID
          ? '<span class="imp-badge">来自：' + esc(obj.group === 'math' ? '数学' : obj.group) + '</span>'
          : '';
        info.innerHTML =
          '<div class="imp-sum">' + badge +
          '<b>' + ids.length + '</b> 张卡片记录 · 其中本应用可识别 <b>' + known + '</b> 张' +
          (unknown ? ' · 其他科目 ' + unknown + ' 张（忽略）' : '') + '</div>' +
          '<div class="imp-line">本机现有记录：' + mine.length + ' 张；“合并”会新增 ' + fresh + ' 张、更新 ' + newer + ' 张较旧记录。</div>';
        pendingImport = { data: normalized, known: known, fresh: fresh, newer: newer };
        $('#impMerge').disabled = known === 0;
        $('#impReplace').disabled = ids.length === 0;
      } catch (e) {
        info.innerHTML = '<p class="imp-err">解析失败：' + esc(e.message) + '</p>';
        pendingImport = null;
        $('#impMerge').disabled = true;
        $('#impReplace').disabled = true;
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function applyImport(mode) {
    if (!pendingImport) return;
    const inc = pendingImport.data;
    const oldKeys = Object.keys(state.srs).length;
    if (mode === 'replace') {
      const theme = state.theme;
      state = blank();
      state.theme = theme;
      Object.keys(inc.srs).forEach((id) => { if (byId.has(id)) state.srs[id] = inc.srs[id]; });
      state.reviews = inc.reviews;
      state.daily = inc.daily;
    } else {
      Object.keys(inc.srs).forEach((id) => {
        if (!byId.has(id)) return;
        const mine = state.srs[id];
        if (!mine || (inc.srs[id].last || 0) > (mine.last || 0)) state.srs[id] = inc.srs[id];
      });
      state.reviews = Math.max(state.reviews || 0, inc.reviews || 0);
      Object.keys(inc.daily).forEach((d) => {
        state.daily[d] = Math.max(state.daily[d] || 0, inc.daily[d] || 0);
      });
    }
    flushSave();
    closeImport();
    scheduleSync();
    renderTree();
    renderStats();
    paintSideProgress();
    const msg = mode === 'replace'
      ? '已用导入记录覆盖本机进度'
      : '已合并：' + oldKeys + ' → ' + Object.keys(state.srs).length + ' 张卡片记录';
    toast(msg);
  }

  function toast(text) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('on');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('on'), 2200);
  }


  /* ------------------------------------------------ 云同步（GitHub） */
  const CLOUD_KEY = 'kaoyan-cloud-v1';
  const DEVICE_KEY = 'kaoyan-device-v1';
  const DEFAULT_PATH = 'sync/study-records.json';

  function loadCloud() {
    try {
      const c = JSON.parse(localStorage.getItem(CLOUD_KEY) || '{}');
      return Object.assign({
        enabled: false, repo: '', branch: 'sync-data', path: DEFAULT_PATH,
        token: '', deviceId: '', deviceName: '',
      }, c);
    } catch (e) {
      return { enabled: false, repo: '', branch: 'sync-data', path: DEFAULT_PATH, token: '', deviceId: '', deviceName: '' };
    }
  }
  let cloud = loadCloud();
  function saveCloud() {
    try { localStorage.setItem(CLOUD_KEY, JSON.stringify(cloud)); } catch (e) {}
  }
  function ensureDevice() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(DEVICE_KEY) || 'null'); } catch (e) {}
    if (!d || !d.id) {
      const id = Math.random().toString(36).slice(2, 10);
      const plat = (navigator.platform || '设备');
      d = { id: id, name: plat + ' · ' + id.slice(0, 4) };
      try { localStorage.setItem(DEVICE_KEY, JSON.stringify(d)); } catch (e) {}
    }
    cloud.deviceId = cloud.deviceId || d.id;
    cloud.deviceName = cloud.deviceName || d.name;
    if (!cloud.repo) {
      const h = location.hostname;
      if (/\.github\.io$/.test(h)) {
        const owner = h.split('.')[0];
        const seg = location.pathname.split('/').filter(Boolean)[0];
        if (owner && seg) cloud.repo = owner + '/' + seg;
      }
      if (!cloud.repo) cloud.repo = 'JessonXu/kaoyan-cards';
    }
  }

  function cloudStatus(text, cls) {
    const el = document.getElementById('cloudStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'cloud-status' + (cls ? ' ' + cls : '');
  }

  function b64enc(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function b64dec(b64) {
    const bin = atob(String(b64).replace(/\s/g, ''));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  async function gh(method, path, body) {
    const headers = {
      'Authorization': 'Bearer ' + cloud.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (body) headers['Content-Type'] = 'application/json';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    let res;
    try {
      res = await fetch('https://api.github.com' + path, {
        method: method, headers: headers, body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
    } catch (e) {
      throw new Error(e.name === 'AbortError' ? '网络超时（15 秒）' : e.message);
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      let msg = '';
      try { msg = (await res.json()).message || ''; } catch (e) {}
      const err = new Error(res.status + (msg ? ' ' + msg : ''));
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  }

  async function ensureBranch() {
    try {
      await gh('GET', '/repos/' + cloud.repo + '/git/ref/heads/' + cloud.branch);
      return;
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    let base = 'main';
    try { await gh('GET', '/repos/' + cloud.repo + '/git/ref/heads/main'); }
    catch (e) { base = 'master'; }
    const b = await gh('GET', '/repos/' + cloud.repo + '/git/ref/heads/' + base);
    await gh('POST', '/repos/' + cloud.repo + '/git/refs', {
      ref: 'refs/heads/' + cloud.branch, sha: b.object.sha,
    });
  }

  async function readCloud() {
    try {
      const f = await gh('GET', '/repos/' + cloud.repo + '/contents/' + cloud.path +
        '?ref=' + encodeURIComponent(cloud.branch));
      return { sha: f.sha, data: JSON.parse(b64dec(f.content)) };
    } catch (e) {
      if (e.status === 404) return { sha: null, data: null };
      throw e;
    }
  }

  function writeCloud(data, sha) {
    const body = {
      message: 'sync: ' + cloud.deviceName + ' @ ' + new Date().toISOString(),
      content: b64enc(JSON.stringify(data, null, 2)),
      branch: cloud.branch,
    };
    if (sha) body.sha = sha;
    return gh('PUT', '/repos/' + cloud.repo + '/contents/' + cloud.path, body);
  }

  function mergeCloud(remote) {
    if (!remote || !remote.records) return 0;
    let n = 0;
    Object.keys(remote.records).forEach((id) => {
      if (!byId.has(id)) return;
      const r = remote.records[id];
      const l = state.srs[id];
      const rt = r.updatedAt || r.last || 0;
      const lt = l ? (l.updatedAt || l.last || 0) : -1;
      if (rt > lt) { state.srs[id] = r; n++; }
    });
    return n;
  }

  function buildCloud(prev) {
    const records = {};
    Object.keys(state.srs).forEach((id) => {
      const r = state.srs[id];
      records[id] = {
        due: r.due, ivl: r.ivl || 0, ease: r.ease || 2.5,
        reps: r.reps || 0, lapses: r.lapses || 0, last: r.last || 0,
        updatedAt: r.updatedAt || r.last || 0,
        device: r.device || cloud.deviceName,
      };
    });
    const devices = Object.assign({}, (prev && prev.devices) || {});
    devices[cloud.deviceId || 'local'] = { name: cloud.deviceName, lastSync: Date.now() };
    const updates = ((prev && prev.updates) || []).slice(-29);
    updates.push({ device: cloud.deviceName, at: Date.now(), cards: Object.keys(records).length });
    return { version: 1, updatedAt: Date.now(), devices: devices, records: records, updates: updates };
  }

  let cloudTimer = null;
  function scheduleSync() {
    if (!cloud.enabled || !cloud.token) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => syncNow(), 1600);
  }

  async function syncNow() {
    if (!cloud.enabled) { cloudStatus('未开启', ''); return; }
    if (!cloud.token || !cloud.repo) { cloudStatus('请先填写仓库与 Token', 'err'); return; }
    cloudStatus('同步中…', '');
    try {
      await ensureBranch();
      let rem = await readCloud();
      const merged = mergeCloud(rem.data);
      let out = buildCloud(rem.data);
      try {
        await writeCloud(out, rem.sha);
      } catch (e) {
        if (e.status !== 409) throw e;
        rem = await readCloud();
        mergeCloud(rem.data);
        out = buildCloud(rem.data);
        await writeCloud(out, rem.sha);
      }
      save();
      renderTree();
      paintSideProgress();
      if (cur.id && cur.view === 'browse') selectCard(cur.id, false);
      const t = new Date();
      cloudStatus('已同步 ' + t.toLocaleTimeString() + ' · 设备 ' + cloud.deviceName +
        (merged ? ' · 合并 ' + merged + ' 条云端记录' : ''), 'ok');
    } catch (e) {
      cloudStatus('同步失败：' + e.message, 'err');
    }
  }

  function renderCloudUI() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
    set('cloudRepo', cloud.repo);
    set('cloudBranch', cloud.branch);
    set('cloudPath', cloud.path);
    set('cloudDevice', cloud.deviceName);
    set('cloudToken', cloud.token);
    cloudStatus(cloud.enabled ? '已开启 · ' + (cloud.repo || '未填仓库') : '未开启', cloud.enabled ? 'ok' : '');
  }

  function bindCloud() {
    const read = () => {
      cloud.repo = (document.getElementById('cloudRepo').value || '').trim();
      cloud.branch = (document.getElementById('cloudBranch').value || 'sync-data').trim();
      cloud.path = (document.getElementById('cloudPath').value || DEFAULT_PATH).trim();
      cloud.deviceName = (document.getElementById('cloudDevice').value || '').trim() || cloud.deviceName;
      const t = document.getElementById('cloudToken').value || '';
      if (t) cloud.token = t.trim();
    };
    const saveBtn = document.getElementById('cloudSave');
    if (!saveBtn) return;
    saveBtn.onclick = () => { read(); cloud.enabled = true; saveCloud(); syncNow(); };
    document.getElementById('cloudPull').onclick = () => { read(); saveCloud(); syncNow(); };
    document.getElementById('cloudOff').onclick = () => {
      cloud.enabled = false; saveCloud(); cloudStatus('已关闭（本机记录仍保留）', '');
    };
  }

  /* ------------------------------------------------ 算法动画 */
  let animLoading = false;
  function loadAnim() {
    if (window.KMAnim || animLoading) return;
    const src = window.__KM_ANIM_SRC__;
    if (!src) return;
    animLoading = true;
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => { animLoading = false; onAnimReady(); };
    s.onerror = () => { animLoading = false; };
    document.head.appendChild(s);
  }
  function onAnimReady() {
    const lib = document.getElementById('animLib');
    if (lib) lib.classList.remove('loading');
    if (cur.id && byId.has(cur.id) && cur.view === 'browse') selectCard(cur.id, false);
    if (study.running) paintRun();
    toast('动画模块已就绪');
  }
  function openAnim(id) {
    if (window.KMAnim) { KMAnim.open(id); return; }
    loadAnim();
  }

  function openAnimPicker() {
    if (!cards.some((c) => c.anim)) return;
    if (!window.KMAnim) return;
    const items = KMAnim.list();
    const groups = {};
    items.forEach((a) => { (groups[a.group] = groups[a.group] || []).push(a); });
    let html = '<div class="modal-head"><h3>算法动画库</h3><button class="icon-btn" id="apClose">✕</button></div>' +
      '<p class="imp-note" style="margin-top:0">选择一个算法，逐步查看代码执行与数据结构变化。</p>';
    Object.keys(groups).forEach((g) => {
      html += '<div class="ap-group"><div class="ap-g">' + esc(g) + '</div><div class="ap-list">' +
        groups[g].map((a) => '<button class="ap-item" data-anim="' + a.id + '">' + esc(a.title) + '</button>').join('') +
        '</div></div>';
    });
    let box = document.getElementById('animPicker');
    if (!box) {
      box = document.createElement('div');
      box.id = 'animPicker';
      box.className = 'modal hidden';
      box.innerHTML = '<div class="modal-box ap-box"></div>';
      document.body.appendChild(box);
      box.addEventListener('click', (e) => { if (e.target === box) box.classList.add('hidden'); });
    }
    box.querySelector('.ap-box').innerHTML = html;
    box.classList.remove('hidden');
    box.querySelector('#apClose').onclick = () => box.classList.add('hidden');
    box.querySelectorAll('.ap-item').forEach((b) => {
      b.onclick = () => { box.classList.add('hidden'); openAnim(b.dataset.anim); };
    });
  }

  /* ------------------------------------------------ 快捷键 */
  function activeList() { return searchPool(cur.q); }
  function move(delta) {
    if (cur.view !== 'browse') return;
    const pool = activeList();
    if (!pool.length) return;
    let i = pool.findIndex((c) => c.id === cur.id);
    i = Math.max(0, Math.min(pool.length - 1, (i < 0 ? 0 : i) + delta));
    selectCard(pool[i].id, true);
  }

  function closeModals() {
    if (window.KMAnim) KMAnim.close();
    ['importModal', 'animPicker'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }

  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    // 全局页签：1 浏览 / 2 学习 / 3 统计 / 4 动画库（先关闭弹层）
    if (e.key === '1' || e.key === '2' || e.key === '3') {
      e.preventDefault();
      closeModals();
      showView({ '1': 'browse', '2': 'study', '3': 'stats' }[e.key]);
      return;
    }
    if (e.key === '4') {
      e.preventDefault();
      closeModals();
      if (cards.some((c) => c.anim)) openAnimPicker();
      return;
    }

    const modalOpen = ['animModal', 'importModal', 'animPicker'].some((id) => {
      const el = document.getElementById(id);
      return el && !el.classList.contains('hidden');
    });
    if (modalOpen) return;

    if (cur.view === 'study') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!study.revealed) reveal();
        return;
      }
      if (study.revealed && ['a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        grade({ a: 'again', s: 'hard', d: 'good' }[e.key.toLowerCase()]);
        return;
      }
      if (e.key === 'Escape') {
        study.running = false;
        showView('browse');
        return;
      }
    }

    if (cur.view === 'browse') {
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); move(1); return; }
      if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); move(-1); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (cur.id) goStudy(cur.id); return; }
    }

    if (e.key === '/') { e.preventDefault(); $('#search').focus(); return; }
    if (e.key === 't') toggleTheme();
  });

  function goStudy(id) {
    const c = byId.get(id);
    if (!c) return;
    study.subject = c.subject;
    study.queue = [c]; study.idx = 0; study.revealed = false; study.running = true;
    study.label = c.deck + ' · 单张';
    showView('study');
    paintRun(true);
  }

  /* ------------------------------------------------ 事件绑定 */
  function toggleTheme() {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    state.theme = document.documentElement.dataset.theme;
    writeGlobalTheme(state.theme);
    save();
  }

  function bind() {
    $$('.nav-item').forEach((b) => { b.onclick = () => showView(b.dataset.view); });
    $('#themeBtn').onclick = toggleTheme;
    $('#menuBtn').onclick = () => $('#sidebar').classList.toggle('open');
    const animLib = document.getElementById('animLib');
    if (animLib) {
      const hasAnim = cards.some((c) => c.anim);
      if (!hasAnim) {
        animLib.style.display = 'none';
      } else {
        animLib.onclick = openAnimPicker;
      }
    }
    $('#expandAll').onclick = () => {
      if (openSubjects.size === D.decks.length) openSubjects.clear();
      else D.decks.forEach((d) => openSubjects.add(d.name));
      renderTree();
    };
    $('#search').addEventListener('input', (e) => {
      cur.q = e.target.value.trim();
      renderList();
      const first = searchPool(cur.q)[0];
      if (first) selectCard(first.id, false);
    });
    $('#search').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.target.value = ''; cur.q = ''; renderList(); e.target.blur(); }
      if (e.key === 'Enter') { const f = searchPool(cur.q)[0]; if (f) { selectCard(f.id, false); e.target.blur(); } }
    });
    $('#showBtn').onclick = reveal;
    $('#runExit').onclick = () => { study.running = false; showView('study'); };
    $('#studyCard').onclick = () => { if (!study.revealed) reveal(); };
    $$('#rateBar .rate').forEach((b) => { b.onclick = () => grade(b.dataset.rate); });
    $('#doneAgain').onclick = () => startStudy('all', 'new', 20);
    $('#donePick').onclick = () => { study.running = false; renderPick(); };
    $('#exportBtn').onclick = downloadExport;
    $('#importBtn').onclick = openImport;
    $('#impClose').onclick = closeImport;
    $('#importModal').addEventListener('click', (e) => { if (e.target.id === 'importModal') closeImport(); });
    $('#importFile').addEventListener('change', (e) => handleImportFile(e.target.files[0]));
    $('#impDrop').addEventListener('click', () => $('#importFile').click());
    ['dragover', 'dragenter'].forEach((t) => $('#impDrop').addEventListener(t, (e) => { e.preventDefault(); $('#impDrop').classList.add('over'); }));
    ['dragleave', 'drop'].forEach((t) => $('#impDrop').addEventListener(t, (e) => { e.preventDefault(); $('#impDrop').classList.remove('over'); }));
    $('#impDrop').addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) handleImportFile(e.dataTransfer.files[0]); });
    $('#impMerge').onclick = () => applyImport('merge');
    $('#impReplace').onclick = () => applyImport('replace');
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#importModal').classList.contains('hidden')) closeImport(); }, true);
    $('#resetBtn').onclick = () => {
      if (!confirm('清空所有学习进度？此操作不可恢复。')) return;
      state = blank();
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      renderTree(); renderStats(); paintSideProgress();
    };
    $('#preview').addEventListener('click', (e) => {
      const ab = e.target.closest('.anim-btn');
      if (ab) { e.preventDefault(); openAnim(ab.dataset.anim); return; }
      const tb = e.target.closest('.typechips .chip');
      if (tb) {
        const t = tb.dataset.type;
        cur.type = (!t || cur.type === t) ? null : t;
        renderList(); route(true);
        const first = searchPool(cur.q)[0];
        if (first) selectCard(first.id, false);
      }
    });
  }

  /* ------------------------------------------------ 启动 */
  function boot() {
    ensureDevice();
    const globalTheme = readGlobalTheme();
    state.theme = globalTheme || state.theme || 'light';
    document.documentElement.dataset.theme = state.theme;
    document.title = GROUP.name + ' · 知识卡片';
    const logo = $('#brandLogo'); if (logo) logo.textContent = GROUP.logo || '∫';
    const bn = $('#brandName'); if (bn) bn.textContent = GROUP.name;
    const bs = $('#brandSub'); if (bs) bs.textContent = GROUP.sub || '';
    document.querySelectorAll('.subject-pill').forEach((a) => {
      a.classList.toggle('on', a.dataset.group === GROUP.id);
    });
    if (!storageOK) {
      const tip = document.getElementById('storageTip');
      if (tip) tip.classList.remove('hidden');
    }
    const onPhone = window.matchMedia('(max-width:860px)').matches;
    if (!onPhone) $('#sidebar').classList.add('open');
    if (!window.KMAnim && window.__KM_ANIM_SRC__) {
      const lib0 = document.getElementById('animLib');
      if (lib0) lib0.classList.add('loading');
      if (window.requestIdleCallback) requestIdleCallback(() => loadAnim(), { timeout: 1500 });
      else setTimeout(loadAnim, 700);
    }
    readHash();
    if (!cur.id) {
      const last = (() => { try { return localStorage.getItem(STORE_KEY + '-last'); } catch (e) { return null; } })();
      cur.id = last && byId.has(last) ? last : (cards[0] || {}).id;
    }
    if (cur.subject === 'all' && cur.id && byId.has(cur.id)) cur.subject = byId.get(cur.id).subject;
    renderTree();
    bind();
    bindCloud();
    renderCloudUI();
    if (cloud.enabled && cloud.token) setTimeout(() => syncNow(), 1500);
    showView(cur.view);
    if (cur.id && byId.has(cur.id) && cur.view !== 'study') selectCard(cur.id, false);
    paintSideProgress();
  }

  window.addEventListener('pagehide', flushSave);
  window.addEventListener('beforeunload', flushSave);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });

  boot();
})();
