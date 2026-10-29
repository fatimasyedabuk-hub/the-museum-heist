/* THE MUSEUM HEIST – vanilla JS (CCT 360 Interactive Discovery)
   Story, clue wording, dialogue, unlock rules and endings follow the team's Story Bible (Lama Hamdan).
   Structure: 1) data  2) state + localStorage  3) helpers  4) navigation  5) scene renderers  6) modals  7) events  8) init
   One state object `S` is the single source of truth; every click updates S, saves it, then re-renders the scene. */
const IMG = 'assets/images/';
const KEY = 'museumHeistProgress_v1';
const CORE = ['C1', 'C2', 'C3'];
const LOCKED_MSG = 'Find the gallery schedule, badge record, and transfer slip before accusing anyone.';

/* ---------- Data ---------- */
const SCENES = [
  { id: 1, name: 'Introduction', icon: 'map', bg: 'museum-exterior.jpg' },
  { id: 2, name: 'Investigation Board', icon: 'notebook', bg: 'investigation-board.jpg' },
  { id: 3, name: 'Gallery', icon: 'search', bg: 'gallery.jpg' },
  { id: 4, name: 'Security Room', icon: 'cctv', bg: 'security-room.jpg' },
  { id: 5, name: 'Suspect Interviews', icon: 'fingerprint', bg: 'suspect-interviews.jpg' },
  { id: 6, name: 'Final Reveal', icon: 'fingerprint', bg: 'final-reveal.jpg' }
];
const ICON_FILES = { search: 'search-icon.png', map: 'map-icon.png', notebook: 'icon-notebook.png', lock: 'lock-icon.png', fingerprint: 'finger-print.png', cctv: 'cctv-icon.png' };
const ico = n => n === 'arrow' ? '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>' : `<img class="ico pic" src="assets/icons/${ICON_FILES[n]}" alt="">`;

const CLUES = {
  C1: { name: 'Gallery Plaque', img: 'clue-gallery-plaque.jpg', core: true, where: 3,
    pop: '“Transfer permit: The Moonlit Garden must remain in Gallery A until 9:30 p.m. tonight.”',
    note: 'The work could not have been legitimately moved before 9:30.', hint: 'Unlocks a challenge for Iris Chen.' },
  C2: { name: 'Badge Log', img: 'clue-badge-log.jpg', core: true, where: 4,
    pop: '“SERVICE CORRIDOR — 8:42 p.m. — M. VALE — ACCESS GRANTED.”',
    note: 'Mara entered the corridor shortly before the disappearance.', hint: 'Unlocks a challenge for Mara Vale.' },
  C3: { name: 'Transfer Slip', img: 'clue-transfer-slip.jpg', core: true, where: 3,
    pop: '“Crate 17 / Service Exit / 8:44 p.m. / Authorized: M. Vale.”',
    note: 'Mara personally approved an unlisted move.', hint: 'Unlocks a challenge for Mara Vale.' },
  C4: { name: 'Frame Fabric', img: 'clue-frame-fabric.jpg', where: 3,
    pop: '“A strip of protective conservation cloth is caught behind a nail.”',
    note: 'The painting was likely wrapped before being moved.', hint: 'Supports how the painting was moved.' },
  C5: { name: 'Footage Summary', img: 'cctv-loading.jpg', where: 4,
    pop: '“8:46 p.m.: a covered trolley moves toward the loading corridor. Person not visible.”',
    note: 'A covered trolley headed for the loading corridor at 8:46. Nobody can be identified from it.', hint: 'Context only; it does not identify anyone.' },
  C6: { name: 'Guard Report', where: 4,
    pop: '“Reception desk check-in at 8:41 and 8:45 p.m. recorded under Leo Grant.”',
    note: 'Leo was logged at reception during the camera outage.', hint: 'Unlocks a challenge for Leo Grant.' },
  R1: { name: 'Guest Book', where: 3, red: true,
    pop: '“A visitor wrote: ‘I would steal this painting if I could!’”',
    note: 'An odd joke, not evidence of access.', hint: 'A red herring.' }
};
const CLUE_IDS = Object.keys(CLUES);
const IMAGE_CLUES = ['C1', 'C2', 'C3', 'C4'];

const SUSPECTS = {
  mara: { name: 'Mara Vale', tag: 'MARA', role: 'Head Curator', img: 'mara-vale.jpg',
    intro: 'I hope you understand the gravity of this. This museum is my life.',
    blurb: 'Polished, controlling and persuasive.',
    q: [
      { t: 'Where were you before the alarm?', a: 'In my east office, reviewing donor materials. I never went near the service corridor.' },
      { t: 'Who could access the painting?', a: 'Iris handles the conservation covers. She knows how to move a painting unnoticed.' },
      { t: 'What do you know about the camera outage?', a: 'Security handles that. You should ask Leo.' }],
    ch: [
      { t: 'Your badge opened the service corridor at 8:42.', need: 'C2', a: 'Staff sometimes borrow badges. That log proves very little.', flag: 'She said she never went near the corridor, yet her badge opened it.' },
      { t: 'Then why did you sign Crate 17 at 8:44?', need: 'C3', a: '...I authorized the move. I thought it was a routine shipment. I never asked what was inside.', flag: 'She admits the signature after denying any involvement.' }] },
  iris: { name: 'Iris Chen', tag: 'IRIS', role: 'Museum Conservator', img: 'iris-chen.jpg',
    intro: 'I have spent years protecting paintings. Please do not assume this is my doing.',
    blurb: 'Meticulous and anxious.',
    q: [
      { t: 'Why is there blue paint on your sleeve?', a: 'I restored River at Dawn this evening. You can check the studio inventory.' },
      { t: 'Was anything unusual in the gallery?', a: 'The padded conservation cover was missing from our supply rack.' },
      { t: 'Did you move The Moonlit Garden?', a: 'No. It was not approved for transfer before the preview.' }],
    ch: [
      { t: 'The plaque forbids an early transfer.', need: 'C1', a: 'Exactly. Only someone ignoring the official schedule would move it tonight.', flag: 'She points to whoever ignored the schedule.' }] },
  leo: { name: 'Leo Grant', tag: 'LEO', role: 'Security Guard', img: 'leo-grant.jpg',
    intro: 'I was doing my job. The cameras were not my idea.',
    blurb: 'Defensive but reliable.',
    q: [
      { t: 'Why was the camera feed missing?', a: 'The restart was scheduled for 8:38 to 8:46. I filed the maintenance notice.' },
      { t: 'Where were you during the outage?', a: 'At reception. My checkpoints are recorded in the desk log.' },
      { t: 'Could someone move a trolley unseen?', a: 'During a restart? Yes. But badge logs kept running.' }],
    ch: [
      { t: 'Your report places you at reception.', need: 'C6', a: 'Right. Search the access log. It will show who went down that corridor.', flag: 'He points you to the badge log.' }] }
};

const FRAMES = [
  { name: 'Hallway', img: 'cctv-hallway.jpg', cam: 'CAM 03', time: '20:38:12', text: 'The east hallway is quiet and the busts on their plinths are untouched. The camera restart begins at 8:38.' },
  { name: 'Trolley', img: 'cctv.trolley.jpg', alt: 'cctv-trolley.jpg', cam: 'CAM 05', time: '20:44:03', text: 'A covered trolley stands in the service corridor. A large flat shape is draped in cloth.' },
  { name: 'Loading Bay', img: 'cctv-loading.jpg', cam: 'CAM 07', time: '20:46:17', text: 'The cameras are back. The covered trolley waits near the doors to the loading corridor.' }
];

const OBJECTS = {
  gallery: [
    { id: 'C1', label: 'Plaque', x: 59, y: 52 },
    { id: 'C4', label: 'Frame', x: 50.5, y: 41 },
    { id: 'C3', label: 'Trolley', x: 76, y: 66 },
    { id: 'R1', label: 'Guest book', x: 27, y: 53 }]
};
const SECURITY_NOTES = {
  restart: { title: 'Restart Notice', text: 'Maintenance notice: camera server restart scheduled 8:38–8:46 p.m., filed by Leo Grant. A camera restart erased eight minutes of footage, but badge access kept recording.' }
};

/* ---------- State ---------- */
const blank = () => ({ clues: {}, visited: {}, frames: {}, asked: {}, accused: null, ending: null, scene: 1, begun: false });
let S = load();
function load() { try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY))); } catch (e) { return blank(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }
const count = () => CLUE_IDS.filter(c => S.clues[c]).length;
const coreDone = () => CORE.every(c => S.clues[c]);
const footageComplete = () => FRAMES.every((f, i) => S.frames[i]);
let ui = { frame: 0, suspect: 'mara', pick: null, confirm: false };

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const img = (f, alt, cls = '', alt2 = '') => `<img class="${cls}" src="${IMG + f}" alt="${alt}" loading="lazy" ${alt2 ? `data-alt="${alt2}"` : ''}>`;
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName !== 'IMG') return;
  if (t.dataset.alt) { t.src = IMG + t.dataset.alt; delete t.dataset.alt; return; }
  t.classList.add('missing');
}, true);
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3200); }
const isOpen = id => id !== 6 || coreDone();
const tally = ids => ids.filter(c => S.clues[c]).length + '/' + ids.length;

function collect(id) {
  if (S.clues[id]) return;
  const wasLocked = !coreDone();
  S.clues[id] = true; save(); renderChrome();
  toast(`Added to notebook: ${CLUES[id].name}` + (wasLocked && coreDone() ? ' – Final Reveal unlocked!' : ''));
}

/* ---------- Navigation ---------- */
function go(n) {
  const sc = SCENES[n - 1];
  if (!sc) return;
  if (!isOpen(n)) { toast(LOCKED_MSG); return; }
  if (n > 1) S.begun = true;
  if (n === 3) S.visited.gallery = true;
  if (n === 4) S.visited.security = true;
  if (n === 5) S.visited.interviews = true;
  S.scene = n; save();
  document.querySelectorAll('.scene').forEach(s => s.classList.toggle('show', s.id === 's' + n));
  $('#topbar').hidden = n === 1;
  renderScene(n); renderChrome();
  if (location.hash !== '#scene-' + n) history.pushState(null, '', '#scene-' + n);
  window.scrollTo({ top: 0 });
  const h = $('#s' + n + ' h1, #s' + n + ' h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
}
function renderChrome() {
  $('#nav').innerHTML = SCENES.map(sc => {
    const open = isOpen(sc.id);
    return `<button data-go="${sc.id}" class="${S.scene === sc.id ? 'on' : ''} ${open ? '' : 'locked'}" aria-label="${sc.name}${open ? '' : ' (locked)'}" ${S.scene === sc.id ? 'aria-current="page"' : ''}>${ico(open ? sc.icon : 'lock')}<span>${sc.name}</span></button>`;
  }).join('');
  $('#tracker').innerHTML = `<button class="btn out small" data-act="notebook">${ico('notebook')} Notebook (${count()})</button><span class="pips" title="Core evidence">${CORE.map(c => `<i class="pip ${S.clues[c] ? 'got' : ''}" title="${CLUES[c].name}"></i>`).join('')}</span>`;
}

/* ---------- Scene renderers ---------- */
function shell(n, inner) {
  const el = $('#s' + n);
  el.style.setProperty('--bg', `url("../${IMG}${SCENES[n - 1].bg}")`);
  el.innerHTML = inner;
}
const head = (n, title, copy) => `<p class="eyebrow">Scene ${n} · ${SCENES[n - 1].name}</p><h2>${title}</h2><p class="purpose">${copy}</p>`;
const nextBtns = (...ns) => `<div class="sec">${ns.map(n => `<button class="btn out" data-go="${n}">${ico(SCENES[n - 1].icon)} ${SCENES[n - 1].name}</button> `).join('')}</div>`;
function renderScene(n) { [null, s1, s2, s3, s4, s5, s6][n](); }

function s1() {
  const title = 'The Museum Heist'.split(' ').map((word, w) =>
    `<span class="w">${[...word].map((ch, i) => `<span style="animation-delay:${(0.5 + (w * 4 + i) * 0.06).toFixed(2)}s">${ch}</span>`).join('')}</span>`).join(' ');
  shell(1, `<div class="s1-bg" aria-hidden="true"></div><div class="s1-fog" aria-hidden="true"></div>
    <div class="hero"><div class="wrap intro">
      <p class="stamp">Case file No. 17 · Confidential</p>
      <p class="eyebrow">A detective mystery</p>
      <h1 aria-label="The Museum Heist">${title}</h1>
      <div class="rule" aria-hidden="true"><i></i></div>
      <p class="tag">An interactive mystery. Six scenes. One stolen painting. Can you uncover the truth?</p>
      <p class="trio" aria-hidden="true"><span>Priceless.</span> <span>Guarded.</span> <span>Gone.</span></p>
      <p class="lead late"><strong>9:05 p.m.</strong> <em>The Moonlit Garden</em> has vanished from its frame. No doors have opened since the alarm. Three museum employees are still inside. Study the evidence. Question their stories. Name the thief.</p>
      <p class="late"><button class="btn glow" data-go="2">${S.begun ? 'Continue Investigation' : 'Begin Investigation'} ${ico('arrow')}</button> <button class="btn out" data-act="howto">How to play</button></p>
      ${S.begun ? '<p class="hint late"><button class="btn out" data-act="restart">Start over</button></p>' : ''}
      <p class="hint late"><em>The truth is always in the details.</em></p></div></div>`);
}

function roomCard(go, title, image, line) {
  return `<button class="card" data-go="${go}">${img(image, title)}<div class="pad"><h3>${title}</h3><p>${line}</p></div></button>`;
}
function s2() {
  shell(2, `<div class="wrap">${head(2, 'Case Board — The Moonlit Garden', 'Three places may hold the truth. Where will you begin?')}
    <div class="grid g3">
      ${roomCard(3, 'Gallery', 'gallery.jpg', `${S.visited.gallery ? 'Visited' : 'Not visited'} · Clues ${tally(['C1', 'C3', 'C4', 'R1'])}`)}
      ${roomCard(4, 'Security Room', 'security-room.jpg', `${S.visited.security ? 'Visited' : 'Not visited'} · Clues ${tally(['C2', 'C5', 'C6'])}`)}
      ${roomCard(5, 'Suspect Interviews', 'suspect-interviews.jpg', `${S.visited.interviews ? 'Visited' : 'Not visited'} · Questions asked ${Object.values(S.asked).reduce((n, o) => n + Object.keys(o).length, 0)}`)}
    </div>
    <h3 class="sec">Suspects</h3>
    <div class="grid g3">${Object.entries(SUSPECTS).map(([k, p]) => `<button class="card person" data-suspect="${k}">${img(p.img, 'Portrait of ' + p.name)}<div class="pad"><h3>${p.name}</h3><p>${p.role}</p></div></button>`).join('')}</div>
    <h3 class="sec">Key evidence (${CORE.filter(c => S.clues[c]).length}/3 core clues)</h3>
    <div class="grid g4">${IMAGE_CLUES.map(id => { const c = CLUES[id], g = S.clues[id];
      return `<button class="card ${g ? 'got' : 'unk'}" data-clue="${id}">${img(c.img, g ? c.name : 'Undiscovered clue')}<div class="pad"><h3>${g ? c.name : 'Undiscovered'}</h3><p>${g ? 'Tap to review' : 'Hint: look in the ' + SCENES[c.where - 1].name}</p></div></button>`; }).join('')}</div>
    <div class="sec panel board-actions"><button class="btn out" data-act="notebook">${ico('notebook')} Open notebook (${count()})</button>
      <button class="btn ${coreDone() ? 'red' : 'out'}" data-go="6">${coreDone() ? 'Final Reveal' : 'Final Reveal (locked)'}</button>
      ${coreDone() ? '' : `<p style="margin:.8rem 0 0">${LOCKED_MSG}</p>`}</div></div>`);
}

function s3() {
  shell(3, `<div class="wrap">${head(3, 'The Empty Gallery', 'The velvet ropes are untouched. The frame is empty. A covered trolley stands too close to the service exit.')}
    <div class="imgbox">${img('gallery.jpg', 'The gallery with the empty frame where The Moonlit Garden hung')}
      <div class="empty" style="left:45.8%;top:33%;width:9.4%;height:22.5%" aria-hidden="true">Missing</div>
      ${OBJECTS.gallery.map(o => `<button class="hot ${S.clues[o.id] ? 'got' : ''}" style="left:${o.x}%;top:${o.y}%" data-clue="${o.id}" aria-label="${o.label}${S.clues[o.id] ? ' (collected)' : ''}"></button>`).join('')}</div>
    <div class="panel sec"><strong>Inspect:</strong> ${OBJECTS.gallery.map(o => `<button class="btn out small" data-clue="${o.id}">${o.label}${S.clues[o.id] ? ' ✓' : ''}</button>`).join(' ')}
      <p style="margin:.8rem 0 0">Click the glowing circles, or use the buttons. Each find can be added to your notebook.</p></div>
    ${nextBtns(2, 4, 5)}</div>`);
}

function s4() {
  const f = FRAMES[ui.frame];
  S.frames[ui.frame] = true; save();
  const seen = FRAMES.filter((x, i) => S.frames[i]).length;
  shell(4, `<div class="wrap">${head(4, 'Security Office', 'The screens flicker awake. A camera restart erased eight minutes of footage, but not every record.')}
    <div class="split"><div>
      <div class="imgbox monitor">${img(f.img, f.name + ' CCTV still', '', f.alt || '')}<div class="ov"><span>${f.cam} · ${f.name.toUpperCase()}</span><span class="rec">REC ${f.time}</span></div></div>
      <div class="feeds" role="tablist">${FRAMES.map((x, i) => `<button role="tab" aria-selected="${i === ui.frame}" class="${i === ui.frame ? 'on' : ''}" data-frame="${i}">${img(x.img, x.name, '', x.alt || '')}<span>${x.cam} · ${x.name}</span></button>`).join('')}</div>
      <p style="margin:.8rem 0 0"><button class="btn" data-frame="${(ui.frame + 1) % 3}">Next Frame</button> <span class="hint">Frame ${ui.frame + 1} of 3 · viewed ${seen}/3</span></p>
    </div><div class="panel" aria-live="polite">
      <h3>${f.name} <small style="font:600 .8rem var(--sans);color:var(--gold-l)">${f.time}</small></h3><p>${f.text}</p>
      ${footageComplete() ? `<p class="ok">All three stills reviewed.</p><button class="btn" data-clue="C5">${S.clues.C5 ? 'Footage summary ✓' : 'Open footage summary'}</button>` : '<p class="no">View all three frames to unlock the footage summary.</p>'}
      <hr style="border-color:var(--gold);opacity:.4;margin:1.2rem 0">
      <h4>Office records</h4>
      <p class="btn-row"><button class="btn out small" data-clue="C2">Badge log${S.clues.C2 ? ' ✓' : ''}</button>
      <button class="btn out small" data-note="restart">Restart notice</button>
      <button class="btn out small" data-clue="C6">Guard report${S.clues.C6 ? ' ✓' : ''}</button></p></div></div>
    ${nextBtns(2, 3, 5)}</div>`);
}

function s5() {
  const p = SUSPECTS[ui.suspect], asked = S.asked[ui.suspect] || {};
  const lines = [...p.q.map((q, i) => ['b' + i, q]), ...p.ch.map((q, i) => ['c' + i, q])];
  shell(5, `<div class="wrap">${head(5, 'Question the Staff', 'Everyone has a story. Listen closely—and check it against the evidence.')}
    <div class="tabs">${Object.entries(SUSPECTS).map(([k, x]) => `<button class="btn ${k === ui.suspect ? '' : 'out'}" data-suspect-tab="${k}">${x.name}</button>`).join('')}</div>
    <div class="row"><div style="flex:0 0 230px;min-width:200px">${img(p.img, 'Portrait of ' + p.name, 'portrait')}<h3 style="margin-top:.8rem">${p.name}</h3><p class="eyebrow">${p.role}</p><p>${p.blurb}</p></div>
    <div><h3>Questions</h3>${p.q.map((q, i) => `<button class="q ${asked['b' + i] ? 'done' : ''}" data-ask="b${i}">${q.t}</button>`).join('')}
      <h3 class="sec" style="margin-top:1.2rem">Challenges</h3>${p.ch.map((q, i) => { const ok = S.clues[q.need];
        return `<button class="q chal ${asked['c' + i] ? 'done' : ''}" data-ask="c${i}" ${ok ? '' : 'disabled'}>${ok ? '⚑ CHALLENGE: ' + q.t : '🔒 Challenge locked. Find the ' + CLUES[q.need].name.toLowerCase() + '.'}</button>`; }).join('')}
      <div class="log panel" aria-live="polite" style="margin-top:1rem"><h4>Interview notes</h4>
        <div class="line"><div class="you">${p.tag}</div><div>“${p.intro}”</div></div>
        ${lines.map(([k, q]) => asked[k] ? `<div class="line ${q.flag ? 'flag' : ''}"><div class="you">Detective: ${q.need ? 'CHALLENGE: ' : ''}${q.t}</div><div><strong>${p.tag}:</strong> “${q.a}”</div>${q.flag ? `<div class="flag-t">⚠ ${q.flag}</div>` : ''}</div>` : '').join('')}
      </div></div></div>
    ${nextBtns(2, 3, 4, 6)}</div>`);
}

function s6() {
  const sel = ui.pick;
  if (!coreDone()) {
    shell(6, `<div class="wrap">${head(6, 'Your Accusation', LOCKED_MSG)}<div class="panel">${CORE.map(c => `<p class="${S.clues[c] ? 'ok' : 'no'}" style="margin:.2rem 0">${S.clues[c] ? '✓' : '✗'} ${CLUES[c].name}</p>`).join('')}</div>${nextBtns(2, 3, 4)}</div>`);
    return;
  }
  if (S.ending) { shell(6, `<div class="wrap">${head(6, 'Your Accusation', 'The evidence is on the table.')}${endingHTML()}</div>`); return; }
  shell(6, `<div class="wrap">${head(6, 'Your Accusation', 'The evidence is on the table. Who stole The Moonlit Garden?')}
    <div class="panel">${CORE.map(c => `<p class="ok" style="margin:.2rem 0">✓ ${CLUES[c].name}: ${CLUES[c].note}</p>`).join('')}</div>
    <div class="grid g3 sec" role="radiogroup" aria-label="Choose a suspect">${Object.entries(SUSPECTS).map(([k, x]) => `<button class="card person ${sel === k ? 'sel' : ''}" role="radio" aria-checked="${sel === k}" data-pick="${k}">${img(x.img, 'Portrait of ' + x.name)}<div class="pad"><h3>${x.name}</h3><p>${x.role}</p></div></button>`).join('')}</div>
    ${sel && ui.confirm ? `<div class="panel"><h3>Accuse ${SUSPECTS[sel].name.toUpperCase()}?</h3><button class="btn red" data-act="confirm">Confirm</button> <button class="btn out" data-act="goback">Go Back</button></div>`
      : `<button class="btn red" data-act="accuse" ${sel ? '' : 'disabled'}>${sel ? 'Accuse ' + SUSPECTS[sel].name : 'Select a suspect'}</button>`}
    ${nextBtns(2, 3, 4, 5)}</div>`);
}

function endingHTML() {
  if (S.ending === 'A') return `<div class="panel"><h3 style="color:var(--gold-l)">CASE CLOSED</h3>
    <p>The badge log places Mara in the corridor at 8:42. The transfer slip places her with Crate 17 two minutes later. The gallery schedule proves the move was unauthorized. Confronted with the evidence, Mara confesses. The Moonlit Garden is recovered from the loading bay. The museum opens tomorrow.</p>
    <h4>How the clues fit</h4><ul>${CORE.map(c => `<li><strong>${CLUES[c].name}:</strong> ${CLUES[c].note}</li>`).join('')}
    ${S.clues.C4 ? `<li><strong>${CLUES.C4.name}:</strong> ${CLUES.C4.note}</li>` : ''}${S.clues.C5 ? `<li><strong>${CLUES.C5.name}:</strong> ${CLUES.C5.note}</li>` : ''}</ul>
    <h4>Why the others looked suspicious</h4><ul>
    <li><strong>Iris Chen:</strong> blue pigment on her sleeve and knowledge of conservation covers. The pigment came from restoring a different painting, and Mara steered suspicion toward her.</li>
    <li><strong>Leo Grant:</strong> he scheduled the camera outage, but he was at reception during it${S.clues.C6 ? ' (see the guard report)' : ''}.</li></ul>
    <p class="hint">Mara’s motive: she planned to sell the original to a private buyer to cover personal debts.</p></div>
    <div class="sec"><button class="btn" data-act="restart">Restart the investigation</button> <button class="btn out" data-go="2">Review the board</button></div>`;
  return `<div class="panel"><h3 style="color:#f0b3b3">WRONG TURN</h3>
    <p>Your accusation does not explain the signed crate transfer or corridor access. While the staff argue, the loading bay is cleared for overnight shipping. The real thief nearly escapes. Review the evidence and try again.</p></div>
    <div class="sec"><button class="btn" data-act="retry">Try again</button> <button class="btn out" data-go="2">Review the board</button></div>`;
}

/* ---------- Modals ---------- */
function openClue(id) {
  const c = CLUES[id], got = S.clues[id];
  $('#modal-card').innerHTML = `${c.img ? img(c.img, c.name) : ''}<div class="pad"><span class="badge">${c.core ? 'Core evidence' : c.red ? 'Possible red herring' : 'Optional evidence'}</span>
    <h3 id="modal-title">${c.name}</h3><p>${c.pop}</p>
    ${got ? `<p class="why"><strong>Notebook:</strong> ${c.note}</p><p class="okm">Collected ✓</p>` : '<button class="btn" data-add="' + id + '">Add to notebook</button>'}
    <button class="btn out" data-act="close">Close</button></div>`;
  showModal();
}
function openNote(title, html) { $('#modal-card').innerHTML = `<div class="pad"><h3 id="modal-title">${title}</h3><p>${html}</p><button class="btn" data-act="close">Close</button></div>`; showModal(); }
function openNotebook() {
  const got = CLUE_IDS.filter(c => S.clues[c]);
  openNote('Evidence notebook', got.length ? `<ul>${got.map(c => `<li><strong>${c} · ${CLUES[c].name}:</strong> ${CLUES[c].note}<br><small>${CLUES[c].hint}</small></li>`).join('')}</ul>` : 'Nothing saved yet. Inspect objects in the Gallery and Security Room.');
}
function openSuspect(k) {
  const p = SUSPECTS[k];
  $('#modal-card').innerHTML = `${img(p.img, 'Portrait of ' + p.name)}<div class="pad"><span class="badge">${p.role}</span><h3 id="modal-title">${p.name}</h3><p>“${p.intro}”</p><p>${p.blurb}</p>
    <button class="btn" data-act="close" data-then="5" data-who="${k}">Interview ${p.name.split(' ')[0]}</button> <button class="btn out" data-act="close">Close</button></div>`;
  showModal();
}
let lastFocus;
function showModal() { if ($('#modal').hidden) lastFocus = document.activeElement; $('#modal').hidden = false; $('#modal-card button').focus(); }
function hideModal() { $('#modal').hidden = true; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-go]'); if (!t) { if (e.target.id === 'modal') hideModal(); return; }
  const d = t.dataset;
  if (d.go) { if (!$('#modal').hidden) hideModal(); return go(+d.go); }
  if (d.add) { collect(d.add); openClue(d.add); return renderScene(S.scene); }
  if (d.clue) return openClue(d.clue);
  if (d.note) return openNote(SECURITY_NOTES[d.note].title, SECURITY_NOTES[d.note].text);
  if (d.suspect) return openSuspect(d.suspect);
  if (d.frame !== undefined) { ui.frame = +d.frame; return s4(); }
  if (d.suspectTab) { ui.suspect = d.suspectTab; return s5(); }
  if (d.ask) { (S.asked[ui.suspect] = S.asked[ui.suspect] || {})[d.ask] = true; save(); return s5(); }
  if (d.pick) { ui.pick = d.pick; ui.confirm = false; return s6(); }
  if (d.act === 'accuse' && ui.pick) { ui.confirm = true; return s6(); }
  if (d.act === 'goback') { ui.confirm = false; return s6(); }
  if (d.act === 'confirm' && ui.pick && coreDone()) { S.accused = ui.pick; S.ending = ui.pick === 'mara' ? 'A' : 'B'; save(); ui.confirm = false; return s6(); }
  if (d.act === 'retry') { S.accused = null; S.ending = null; ui.pick = null; save(); return s6(); }
  if (d.act === 'notebook') return openNotebook();
  if (d.act === 'howto') return openNote('How to play', 'Select rooms in any order. Click highlighted objects. Save clues to your notebook. Use what you find to challenge suspects. Return to the board whenever you like.');
  if (d.act === 'close') { hideModal(); if (d.who) ui.suspect = d.who; if (d.then) go(+d.then); return; }
  if (d.act === 'restart') {
    if (!confirm('Restart the investigation? Your notebook will be cleared.')) return;
    try { localStorage.removeItem(KEY); } catch (er) { }
    S = blank(); ui = { frame: 0, suspect: 'mara', pick: null, confirm: false };
    go(1); toast('Investigation reset.');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) hideModal(); });
window.addEventListener('popstate', () => { const n = +(location.hash.match(/scene-(\d)/) || [])[1]; if (n) go(n); });

/* ---------- Init ---------- */
(function init() {
  $('#stage').innerHTML = SCENES.map(s => `<section class="scene" id="s${s.id}" aria-label="${s.name}"></section>`).join('');
  const hashN = +(location.hash.match(/scene-(\d)/) || [])[1];
  go(hashN && isOpen(hashN) ? hashN : (isOpen(S.scene) ? S.scene : 1));
})();
