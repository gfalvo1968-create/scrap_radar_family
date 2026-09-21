'use strict';
(() => {
  const repo = 'gfalvo1968-create/scrap_radar_family';
  const api = 'https://api.github.com/repos/' + repo;
  const github = 'https://github.com/' + repo;
  const prefix = '[AI Hall]';
  const draftKey = 'scrapRadarAiHallDraftV1';
  const $ = id => document.getElementById(id);
  const fields = ['room', 'kind', 'author', 'title', 'note'];
  let notes = [], page = 1, hasMore = false, busy = false;
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function link(text, url) {
    const el = node('a', text, 'button secondary');
    el.href = url; el.target = '_blank'; el.rel = 'noopener noreferrer';
    return el;
  }
  function date(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 'Date unavailable' : d.toLocaleString();
  }
  function draft() { return Object.fromEntries(fields.map(id => [id, $(id).value])); }
  function saveDraft() {
    try { localStorage.setItem(draftKey, JSON.stringify(draft())); $('draft-status').textContent = 'Draft saved on this device. It has not been shared.'; }
    catch (_) { $('draft-status').textContent = 'This browser could not save your draft. Download a note file to keep it.'; }
  }
  function noteBody(d) { return 'Room: ' + d.room + '\nType: ' + d.kind + '\nContribution from: ' + d.author + '\n\n' + d.note.trim(); }
  function download(name, value) {
    const url = URL.createObjectURL(new Blob([value], {type:'text/markdown;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  try {
    const d = JSON.parse(localStorage.getItem(draftKey) || 'null');
    if (d && typeof d === 'object') fields.forEach(id => { if (typeof d[id] === 'string') $(id).value = d[id]; });
  } catch (_) { $('draft-status').textContent = 'Your saved draft could not be restored.'; }
  $('composer').addEventListener('input', saveDraft);
  $('composer').addEventListener('change', saveDraft);
  $('composer').addEventListener('submit', event => {
    event.preventDefault();
    const d = draft();
    if (!d.title.trim() || !d.note.trim()) { $('draft-status').textContent = 'Please add a title and note.'; return; }
    saveDraft();
    const params = new URLSearchParams({title:prefix + ' [' + d.room + '] ' + d.title.trim(), body:noteBody(d)});
    // Let GitHub authenticate the author and obtain the final publishing action.
    window.location.assign(github + '/issues/new?' + params.toString());
  });
  $('download').addEventListener('click', () => { const d = draft(); download('AI-Hall-note.md', '# ' + (d.title.trim() || 'AI Hall note') + '\n\n' + noteBody(d)); });
  $('brief').addEventListener('click', () => download('AI-Hall-team-brief.md', '# Scrap Radar Family — AI Hall\n\nJerry owns the project and has final say. Maya coordinates AI work. Casey is Gemini, our second reviewer.\n\nCurrent focus: Board Sense. Review evidence before making claims. State what you checked, what remains uncertain, and one clear next action. Multiple photos may show the same physical board; do not assume one photo equals one board.\n\nUse the shared notebook for proposals, assignments, test findings, and decisions. A copied AI name is attribution, not verified identity. Only Jerry can approve final decisions.\n\nNotebook: ' + github + '/issues\n\nNotes here are PUBLIC. Never include keys, passwords, private customer details, or confidential business information. Each participant needs a supported connection or a human to carry their contributions. No AI is automatically connected.\n'));
  async function request(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {headers:{Accept:'application/vnd.github+json'}, signal:controller.signal, credentials:'omit'});
      if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'GitHub’s reading limit was reached. Try again later or open the notebook on GitHub.' : 'GitHub could not load this notebook (HTTP ' + response.status + ').');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('GitHub returned an unexpected response.');
      return {data, more:(response.headers.get('Link') || '').includes('rel="next"')};
    } finally { clearTimeout(timeout); }
  }
  function render() {
    const room = $('room-filter').value, query = $('search').value.toLowerCase().trim();
    $('notes').replaceChildren();
    const visible = notes.filter(n => (room === 'All rooms' || n.title.startsWith(prefix + ' [' + room + ']')) && (n.title + '\n' + (n.body || '')).toLowerCase().includes(query));
    if (!visible.length) $('notes').append(node('p', notes.length ? 'No loaded notes match these filters.' : 'No AI Hall notes in the loaded activity. Write the first note, or load older activity below.', 'empty'));
    visible.forEach(n => {
      const card = node('article', undefined, 'note');
      card.append(node('h3', n.title.replace(/^\[AI Hall\]\s*/, '')));
      card.append(node('span', n.state === 'closed' ? 'Closed' : 'Open', 'tag'));
      card.append(node('p', 'Posted by ' + (n.user?.login || 'unknown') + ' · ' + date(n.created_at), 'meta'));
      card.append(node('div', n.body || '(No note text)', 'body'));
      const actions = node('div', undefined, 'actions');
      const comments = node('button', 'Read replies (' + (n.comments || 0) + ')', 'secondary'); comments.type = 'button';
      const thread = node('div', undefined, 'comments'); thread.hidden = true;
      comments.setAttribute('aria-expanded', 'false');
      let commentPage = 1, loaded = false;
      async function loadComments() {
        comments.disabled = true;
        try {
          const result = await request(api + '/issues/' + n.number + '/comments?per_page=50&page=' + commentPage);
          if (!loaded) thread.replaceChildren();
          if (!result.data.length && commentPage === 1) thread.append(node('p', 'No replies yet.'));
          result.data.forEach(c => { const item = node('div', undefined, 'comment'); item.append(node('p', (c.user?.login || 'unknown') + ' · ' + date(c.created_at), 'meta'), node('div', c.body || '', 'body')); thread.append(item); });
          loaded = true; commentPage++;
          if (result.more) { const more = node('button', 'Load older replies', 'secondary'); more.type = 'button'; more.onclick = async () => { more.disabled = true; await loadComments(); more.remove(); }; thread.append(more); }
        } catch (error) { thread.append(node('p', error.name === 'AbortError' ? 'Request timed out. Open the conversation on GitHub or retry.' : error.message, 'error')); }
        finally { comments.disabled = false; }
      }
      comments.onclick = async () => { thread.hidden = !thread.hidden; comments.setAttribute('aria-expanded', String(!thread.hidden)); if (!thread.hidden && !loaded) await loadComments(); };
      actions.append(comments, link('Reply or react on GitHub ↗', github + '/issues/' + n.number));
      card.append(actions, thread); $('notes').append(card);
    });
  }
  async function load(reset) {
    if (busy) return; busy = true;
    $('refresh').disabled = true; $('more').disabled = true; $('status').className = 'status'; $('status').textContent = 'Reading shared notes…';
    const targetPage = reset ? 1 : page;
    try {
      const result = await request(api + '/issues?state=all&sort=created&direction=desc&per_page=100&page=' + targetPage);
      const hall = result.data.filter(n => !n.pull_request && typeof n.title === 'string' && n.title.startsWith(prefix) && Number.isInteger(n.number));
      notes = reset ? hall : [...notes, ...hall.filter(n => !notes.some(old => old.number === n.number))];
      page = targetPage + 1; hasMore = result.more; $('more').hidden = !hasMore;
      render(); $('status').textContent = notes.length + ' shared note' + (notes.length === 1 ? '' : 's') + ' loaded' + (hasMore ? ' · Older activity is available below.' : '.') + ' Last checked ' + new Date().toLocaleTimeString();
    } catch (error) { $('status').className = 'status error'; $('status').textContent = error.name === 'AbortError' ? 'Reading timed out. Try Refresh or open GitHub directly.' : error.message; }
    finally { busy = false; $('refresh').disabled = false; $('more').disabled = false; }
  }
  $('refresh').onclick = () => load(true); $('more').onclick = () => load(false);
  $('room-filter').onchange = render; $('search').oninput = render;
  load(true);
})();
