"use strict";

/* ---------- Audio ----------
   Play the committed neural-voice clip; fall back to the browser's speech
   synthesis only if the file can't be loaded. `which` is "name" or "word". */
let currentAudio = null;
function playSound(letter, which) {
  which = which || "name";
  try {
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    const a = new Audio("audio/" + letter.id + "-" + which + ".mp3");
    currentAudio = a;
    a.addEventListener("error", () => speak(letter.nameKa || letter.char));
    const p = a.play();
    if (p && p.catch) p.catch(() => {}); // ignore autoplay-gesture rejections
  } catch (e) {
    speak(letter.nameKa || letter.char);
  }
}
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ka-GE";
  u.rate = 0.85;
  const ka = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("ka"));
  if (ka) u.voice = ka;
  window.speechSynthesis.speak(u);
}

/* ---------- Shared helpers ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Tab switching ---------- */
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("is-active"));
    views.forEach(v => v.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.getElementById("view-" + tab.dataset.view).classList.add("is-active");
    if (tab.dataset.view === "learn") showPicker();
  });
});

/* ---------- Cards (flashcards) ---------- */
let fcIndex = 0;
const flashcard = document.getElementById("flashcard");

function renderFlashcard() {
  const L = LETTERS[fcIndex];
  flashcard.classList.remove("flipped");
  document.getElementById("fc-char").textContent = L.char;
  document.getElementById("fc-name").textContent = L.name + " (" + L.nameKa + ")";
  document.getElementById("fc-latin").textContent = "“" + L.latin + "”";
  document.getElementById("fc-sound").textContent = L.sound;
  document.getElementById("fc-example").innerHTML =
    "<b>" + L.example + "</b> — " + L.exampleLatin + " (" + L.meaning + ")";
  document.getElementById("fc-counter").textContent = (fcIndex + 1) + " / " + LETTERS.length;
  document.getElementById("fc-progress").style.width =
    ((fcIndex + 1) / LETTERS.length * 100) + "%";
}
flashcard.addEventListener("click", (e) => {
  if (e.target.closest(".speak-btn")) return;
  flashcard.classList.toggle("flipped");
});
document.getElementById("fc-speak").addEventListener("click", (e) => {
  e.stopPropagation();
  playSound(LETTERS[fcIndex], "name");
});
document.getElementById("fc-next").addEventListener("click", () => {
  fcIndex = (fcIndex + 1) % LETTERS.length;
  renderFlashcard();
});
document.getElementById("fc-prev").addEventListener("click", () => {
  fcIndex = (fcIndex - 1 + LETTERS.length) % LETTERS.length;
  renderFlashcard();
});

/* ---------- Chart ---------- */
const grid = document.getElementById("letter-grid");
LETTERS.forEach((L, i) => {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.innerHTML = '<div class="c">' + L.char + '</div><div class="l">' + L.latin + "</div>";
  cell.addEventListener("click", () => openModal(i));
  grid.appendChild(cell);
});
const modal = document.getElementById("modal");
function openModal(i) {
  const L = LETTERS[i];
  document.getElementById("m-char").textContent = L.char;
  document.getElementById("m-name").textContent = L.name + " (" + L.nameKa + ")";
  document.getElementById("m-latin").textContent = "“" + L.latin + "”";
  document.getElementById("m-sound").textContent = L.sound;
  document.getElementById("m-example").innerHTML =
    "<b>" + L.example + "</b> — " + L.exampleLatin + " (" + L.meaning + ")";
  document.getElementById("m-speak").onclick = () => playSound(L, "name");
  playSound(L, "name");
  modal.hidden = false;
}
document.getElementById("modal-close").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

/* ---------- Learn: persistence ---------- */
const LS_BEST = "ka_best_v1";     // { groupKey: bestStreak }
const LS_MISS = "ka_misses_v1";   // [letterId, ...]
function lsGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (e) { return fallback; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function getBest(key) { return lsGet(LS_BEST, {})[key] || 0; }
function setBest(key, val) { const m = lsGet(LS_BEST, {}); m[key] = val; lsSet(LS_BEST, m); }
function getMisses() { return lsGet(LS_MISS, []); }
function addMiss(id) { const m = getMisses(); if (!m.includes(id)) { m.push(id); lsSet(LS_MISS, m); } }
function removeMiss(id) { lsSet(LS_MISS, getMisses().filter(x => x !== id)); }

/* ---------- Learn: set picker ---------- */
const picker = document.getElementById("learn-picker");
const gameEl = document.getElementById("learn-game");
const setList = document.getElementById("set-list");

function showPicker() {
  gameEl.hidden = true;
  picker.hidden = false;
  renderPicker();
}

function renderPicker() {
  setList.innerHTML = "";
  const cards = GROUPS.map(g => ({
    key: g.id, label: g.label, desc: g.desc, letters: lettersInGroup(g.id),
  }));
  cards.push({ key: "all", label: "All 33 letters", desc: "The whole alphabet.", letters: LETTERS.slice() });

  cards.forEach(c => setList.appendChild(makeSetCard(c)));

  // Review misses (letters answered wrong before)
  const missIds = getMisses();
  const missLetters = LETTERS.filter(l => missIds.includes(l.id));
  const review = document.createElement("div");
  review.className = "set-card review";
  if (missLetters.length) {
    review.innerHTML =
      '<div class="set-head"><span class="set-label">Review misses</span>' +
      '<span class="set-count">' + missLetters.length + " letters</span></div>" +
      '<div class="set-desc">Letters you\'ve gotten wrong — drill them until they stick.</div>' +
      '<div class="set-letters">' + missLetters.map(l => l.char).join(" ") + "</div>";
    review.addEventListener("click", () => startSession(missLetters, "Review misses", "review"));
  } else {
    review.innerHTML =
      '<div class="set-head"><span class="set-label">Review misses</span></div>' +
      '<div class="set-desc">Nothing here yet — play a set and the letters you miss will collect here.</div>';
    review.style.opacity = "0.6";
  }
  setList.appendChild(review);
}

function makeSetCard(c) {
  const el = document.createElement("div");
  el.className = "set-card";
  el.innerHTML =
    '<div class="set-head"><span class="set-label">' + c.label + "</span>" +
    '<span class="set-count">' + c.letters.length + " letters · best " + getBest(c.key) + "</span></div>" +
    '<div class="set-desc">' + c.desc + "</div>" +
    '<div class="set-letters">' + c.letters.map(l => l.char).join(" ") + "</div>";
  el.addEventListener("click", () => startSession(c.letters, c.label, c.key));
  return el;
}

/* ---------- Learn: the Mixed game ---------- */
let curSet = [], weights = {}, curLetter = null, curField = null, curGroupKey = "";
let score = 0, streak = 0, best = 0;

const promptEl = document.getElementById("quiz-prompt");
const optionsEl = document.getElementById("quiz-options");
const feedbackEl = document.getElementById("quiz-feedback");
const nextBtn = document.getElementById("quiz-next");

function startSession(subset, label, groupKey) {
  curSet = subset.slice();
  curGroupKey = groupKey;
  weights = {};
  curSet.forEach(l => (weights[l.id] = 1));
  score = 0; streak = 0; best = getBest(groupKey);
  curLetter = null;
  picker.hidden = true;
  gameEl.hidden = false;
  document.getElementById("game-set-name").textContent = label;
  updateStats();
  document.getElementById("quiz-score").textContent = "";
  nextQuestion();
}

function updateStats() {
  document.getElementById("game-streak").textContent = "🔥 " + streak;
  document.getElementById("game-best").textContent = "Best " + best;
}

// Weighted random pick — missed letters carry more weight so they recur.
function pickWeighted() {
  const pool = curSet.length > 1 && curLetter
    ? curSet.filter(l => l.id !== curLetter.id) : curSet;
  let total = 0;
  pool.forEach(l => (total += weights[l.id] || 1));
  let r = Math.random() * total;
  for (const l of pool) {
    r -= (weights[l.id] || 1);
    if (r <= 0) return l;
  }
  return pool[pool.length - 1];
}

function fourOptions(correct, field) {
  // Distractors from the whole alphabet, distinct on the answered field.
  const others = shuffle(LETTERS.filter(l => l[field] !== correct[field]));
  return shuffle([correct, others[0], others[1], others[2]]);
}

function nextQuestion() {
  feedbackEl.textContent = "";
  feedbackEl.className = "quiz-feedback";
  nextBtn.hidden = true;
  optionsEl.innerHTML = "";

  const L = pickWeighted();
  curLetter = L;
  const style = ["see", "sound", "audio"][Math.floor(Math.random() * 3)];

  if (style === "see") {
    // Show the glyph, pick the transliteration.
    curField = "latin";
    promptEl.innerHTML =
      '<div class="q-label">Which sound is this letter?</div>' +
      '<div class="big-letter">' + L.char + "</div>";
    fourOptions(L, "latin").forEach(opt => {
      const b = mkOpt(opt.latin, opt);
      optionsEl.appendChild(b);
    });
  } else if (style === "sound") {
    // Show the name/sound, pick the glyph.
    curField = "char";
    promptEl.innerHTML =
      '<div class="q-label">Which letter makes “' + L.latin + '” (' + L.name + ")?</div>";
    fourOptions(L, "char").forEach(opt => {
      const b = mkOpt(opt.char, opt);
      b.classList.add("opt-glyph");
      optionsEl.appendChild(b);
    });
  } else {
    // Play the audio, pick the glyph.
    curField = "char";
    promptEl.innerHTML =
      '<button class="play-big" id="play-audio" aria-label="Play sound">▶</button>' +
      '<div class="replay-hint">Listen, then pick the letter</div>';
    document.getElementById("play-audio").addEventListener("click", () => playSound(L, "name"));
    playSound(L, "name");
    fourOptions(L, "char").forEach(opt => {
      const b = mkOpt(opt.char, opt);
      b.classList.add("opt-glyph");
      optionsEl.appendChild(b);
    });
  }
}

function mkOpt(text, letter) {
  const b = document.createElement("button");
  b.className = "quiz-opt";
  b.textContent = text;
  b.addEventListener("click", () => checkAnswer(b, letter));
  return b;
}

function checkAnswer(btn, chosen) {
  const buttons = optionsEl.querySelectorAll(".quiz-opt");
  buttons.forEach(b => (b.disabled = true));

  if (chosen.id === curLetter.id) {
    score++; streak++;
    if (streak > best) { best = streak; setBest(curGroupKey, best); }
    weights[curLetter.id] = Math.max(1, (weights[curLetter.id] || 1) - 2);
    if (curGroupKey === "review") removeMiss(curLetter.id);
    btn.classList.add("correct");
    feedbackEl.textContent = "Correct! " + curLetter.char + " = “" + curLetter.latin + "” (" + curLetter.name + ")";
    feedbackEl.className = "quiz-feedback ok";
  } else {
    streak = 0;
    weights[curLetter.id] = Math.min(10, (weights[curLetter.id] || 1) + 4);
    addMiss(curLetter.id);
    btn.classList.add("wrong");
    feedbackEl.textContent = "It was " + curLetter.char + " = “" + curLetter.latin + "” (" + curLetter.name + ")";
    feedbackEl.className = "quiz-feedback no";
    buttons.forEach(b => { if (b.textContent === curLetter[curField]) b.classList.add("correct"); });
  }
  playSound(curLetter, "name");
  document.getElementById("quiz-score").textContent = "Correct: " + score;
  updateStats();
  nextBtn.hidden = false;
}
nextBtn.addEventListener("click", nextQuestion);
document.getElementById("game-back").addEventListener("click", showPicker);

// Test hook (used by the headless smoke test; harmless in production).
window.__learn = {
  start: startSession,
  pickStats: (n) => {
    const counts = {};
    const saved = curLetter; curLetter = null;
    for (let i = 0; i < n; i++) { const l = pickWeighted(); counts[l.id] = (counts[l.id] || 0) + 1; }
    curLetter = saved;
    return counts;
  },
  setWeight: (id, w) => { weights[id] = w; },
  state: () => ({ set: curSet.map(l => l.id), streak, best, groupKey: curGroupKey }),
};

/* ---------- init ---------- */
renderFlashcard();
if ("speechSynthesis" in window) window.speechSynthesis.getVoices();

/* ---------- Service worker (offline) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
