"use strict";

/* ---------- Audio (Web Speech API) ---------- */
function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang || "ka-GE";
  u.rate = 0.85;
  // Prefer a Georgian voice if the device has one installed.
  const voices = window.speechSynthesis.getVoices();
  const ka = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("ka"));
  if (ka) u.voice = ka;
  window.speechSynthesis.speak(u);
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
    if (tab.dataset.view === "quiz") startQuiz();
  });
});

/* ---------- Learn / flashcards ---------- */
let fcIndex = 0;
const flashcard = document.getElementById("flashcard");

function renderFlashcard() {
  const L = LETTERS[fcIndex];
  flashcard.classList.remove("flipped");
  document.getElementById("fc-char").textContent = L.char;
  document.getElementById("fc-name").textContent = L.name;
  document.getElementById("fc-latin").textContent = "“" + L.latin + "”";
  document.getElementById("fc-sound").textContent = L.sound;
  document.getElementById("fc-example").innerHTML =
    "<b>" + L.example + "</b> — " + L.exampleLatin + " (" + L.meaning + ")";
  document.getElementById("fc-counter").textContent = (fcIndex + 1) + " / " + LETTERS.length;
  document.getElementById("learn-progress").style.width =
    ((fcIndex + 1) / LETTERS.length * 100) + "%";
}

flashcard.addEventListener("click", (e) => {
  if (e.target.closest(".speak-btn")) return; // don't flip when hitting the speaker
  flashcard.classList.toggle("flipped");
});
document.getElementById("fc-speak").addEventListener("click", (e) => {
  e.stopPropagation();
  speak(LETTERS[fcIndex].char);
});
document.getElementById("fc-next").addEventListener("click", () => {
  fcIndex = (fcIndex + 1) % LETTERS.length;
  renderFlashcard();
});
document.getElementById("fc-prev").addEventListener("click", () => {
  fcIndex = (fcIndex - 1 + LETTERS.length) % LETTERS.length;
  renderFlashcard();
});

/* ---------- Browse / chart ---------- */
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
  document.getElementById("m-name").textContent = L.name;
  document.getElementById("m-latin").textContent = "“" + L.latin + "”";
  document.getElementById("m-sound").textContent = L.sound;
  document.getElementById("m-example").innerHTML =
    "<b>" + L.example + "</b> — " + L.exampleLatin + " (" + L.meaning + ")";
  document.getElementById("m-speak").onclick = () => speak(L.char);
  modal.hidden = false;
}
document.getElementById("modal-close").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

/* ---------- Quiz ---------- */
let quizScore = 0, quizTotal = 0, quizAnswer = null;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  quizScore = 0;
  quizTotal = 0;
  nextQuestion();
}

function nextQuestion() {
  const feedback = document.getElementById("quiz-feedback");
  feedback.textContent = "";
  feedback.className = "quiz-feedback";
  document.getElementById("quiz-next").hidden = true;

  // Ask in both directions: sometimes show the letter, sometimes the sound.
  const showLetter = Math.random() < 0.5;
  const correct = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  quizAnswer = correct;

  const distractors = shuffle(LETTERS.filter(l => l !== correct)).slice(0, 3);
  const options = shuffle([correct, ...distractors]);

  const promptEl = document.getElementById("quiz-prompt");
  const optionsEl = document.getElementById("quiz-options");
  optionsEl.innerHTML = "";

  if (showLetter) {
    promptEl.innerHTML =
      '<div class="q-label">Which sound is this letter?</div>' +
      '<div class="big-letter">' + correct.char + "</div>";
    speak(correct.char);
    options.forEach(opt => {
      const b = document.createElement("button");
      b.className = "quiz-opt";
      b.textContent = opt.latin;
      b.addEventListener("click", () => checkAnswer(b, opt, options, "latin"));
      optionsEl.appendChild(b);
    });
  } else {
    promptEl.innerHTML =
      '<div class="q-label">Which letter makes “' + correct.latin + '” (' + correct.name + ")?</div>";
    options.forEach(opt => {
      const b = document.createElement("button");
      b.className = "quiz-opt";
      b.style.fontSize = "34px";
      b.textContent = opt.char;
      b.addEventListener("click", () => checkAnswer(b, opt, options, "char"));
      optionsEl.appendChild(b);
    });
  }
}

function checkAnswer(btn, chosen, options, field) {
  const buttons = document.querySelectorAll(".quiz-opt");
  buttons.forEach(b => (b.disabled = true));
  quizTotal++;
  const feedback = document.getElementById("quiz-feedback");

  if (chosen === quizAnswer) {
    quizScore++;
    btn.classList.add("correct");
    feedback.textContent = "Correct! " + quizAnswer.char + " = “" + quizAnswer.latin + "”";
    feedback.className = "quiz-feedback ok";
  } else {
    btn.classList.add("wrong");
    feedback.textContent = "It was " + quizAnswer.char + " = “" + quizAnswer.latin + "”";
    feedback.className = "quiz-feedback no";
    buttons.forEach(b => {
      if (b.textContent === quizAnswer[field]) b.classList.add("correct");
    });
  }
  speak(quizAnswer.char);
  document.getElementById("quiz-score").textContent = "Score: " + quizScore + " / " + quizTotal;
  document.getElementById("quiz-next").hidden = false;
}
document.getElementById("quiz-next").addEventListener("click", nextQuestion);

/* ---------- init ---------- */
renderFlashcard();
// Warm up voice list (some browsers load voices async).
if ("speechSynthesis" in window) window.speechSynthesis.getVoices();

/* ---------- Service worker (offline) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
