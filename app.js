const IMAGE_BASE_URL = "https://ccnareponses.com/wp-content/uploads/2022/06/";
const ALL_QUESTIONS = [...QUESTIONS_5_6, ...QUESTIONS_7_9].map((q, i) => ({
  ...q,
  id: i + 1,
}));

let quiz = [];
let idx = 0;
let score = 0;
let sel = [];
let done = false;
let filt = "all";
let qCountLimit = null;
let roundNumber = 1;
let failedQuestions = [];

function getFilteredPool() {
  if (filt === "stp") return ALL_QUESTIONS.filter((q) => q.c === "stp");
  if (filt === "dhcp") return ALL_QUESTIONS.filter((q) => q.c === "dhcp");
  return ALL_QUESTIONS;
}

function setF(f, el) {
  filt = f;
  document.querySelectorAll(".fb").forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  updateQCountMeta();
}

function shuffle(a) {
  const copy = [...a];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getTargetCount(poolSize) {
  if (poolSize <= 0) return 0;
  if (qCountLimit === null) return poolSize;
  return Math.max(1, Math.min(Math.trunc(qCountLimit), poolSize));
}

function toggleQCountPanel() {
  const panel = document.getElementById("qcountPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}

function setQCountPreset(value, el) {
  document.querySelectorAll(".qp").forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  if (value === "all") {
    qCountLimit = null;
    document.getElementById("qcountInput").value = "";
  } else {
    qCountLimit = Number(value);
    document.getElementById("qcountInput").value = value;
  }
  updateQCountMeta();
}

function setQCountCustom(value) {
  const allPreset = document.querySelector(".qp");
  document.querySelectorAll(".qp").forEach((b) => b.classList.remove("active"));
  if (value.trim() === "") {
    qCountLimit = null;
    if (allPreset) allPreset.classList.add("active");
  } else {
    const customCount = Number.parseInt(value, 10);
    qCountLimit = Number.isNaN(customCount) || customCount < 1 ? 1 : customCount;
  }
  updateQCountMeta();
}

function updateQCountMeta() {
  const max = getFilteredPool().length;
  const meta = document.getElementById("qcountMeta");
  if (!meta) return;
  if (qCountLimit === null) {
    meta.textContent = `Questionnaire complet (${max} questions disponibles)`;
    return;
  }
  const used = getTargetCount(max);
  const plural = used > 1 ? "s" : "";
  meta.textContent =
    used < max
      ? `${used} question${plural} seront tirées au hasard`
      : `${used} question${plural} (maximum disponible pour ce filtre)`;
}

function startRound(questions, retryOnly = false) {
  if (!questions.length) return;
  if (retryOnly) roundNumber += 1;
  else roundNumber = 1;
  quiz = shuffle(questions);
  idx = 0;
  score = 0;
  sel = [];
  done = false;
  failedQuestions = [];
  document.getElementById("ss").style.display = "none";
  document.getElementById("ra").style.display = "none";
  document.getElementById("qa").style.display = "block";
  document.getElementById("hscore").style.display = "block";
  render();
}

function startQ() {
  const pool = getFilteredPool();
  const targetCount = getTargetCount(pool.length);
  const selected = shuffle(pool).slice(0, targetCount);
  startRound(selected, false);
}

function render() {
  done = false;
  sel = [];
  const q = quiz[idx];
  const n = quiz.length;
  const letters = "ABCDEFGH";
  document.getElementById("qctr").textContent =
    `Manche ${roundNumber} • ${idx + 1} / ${n}`;
  document.getElementById("qsl").textContent = `${score} pts`;
  document.getElementById("hscore").textContent = `Score : ${score}/${idx}`;
  document.getElementById("pfill").style.width = `${(idx / n) * 100}%`;
  const srcUrl =
    q.c === "stp"
      ? "https://ccnareponses.com/modules-5-6-examen-de-reseaux-redondants-reponses/"
      : "https://ccnareponses.com/modules-7-9-examen-des-reseaux-disponibles-et-fiables-reponses/";
  const tag =
    q.c === "stp"
      ? '<span class="qtag ts">📡 Modules 5–6 · STP & EtherChannel</span>'
      : '<span class="qtag td">🌐 Modules 7–9 · DHCP & FHRP</span>';
  const sourceLabel = q.n ? `Q${q.n}` : "Question";
  const sourceLink = `<a href="${srcUrl}" target="_blank" style="margin-left:auto;font-family:monospace;font-size:11px;background:rgba(210,153,34,.15);color:#d29922;border:1px solid rgba(210,153,34,.3);border-radius:4px;padding:3px 9px;text-decoration:none;">${sourceLabel} sur le site ↗</a>`;
  const hint = q.m
    ? '<div class="qhint">⚠ Plusieurs réponses correctes — cochez toutes les bonnes réponses</div>'
    : "";
  const img = q.i
    ? `<img class="qimg" src="${IMAGE_BASE_URL}${q.i}" alt="Illustration" onerror="this.style.display='none'">`
    : "";
  const opts = q.o
    .map(
      (o, i) =>
        `<button class="opt" id="o${i}" onclick="sel2(${i})"><span class="ol">${letters[i]}</span><span>${o}</span></button>`,
    )
    .join("");
  document.getElementById("qb").innerHTML =
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">${tag}${sourceLink}</div>${hint}<div class="qtxt">${q.q}</div>${img}<div class="opts">${opts}</div><div class="fb2" id="fb"></div>`;
  const bchk = document.getElementById("bchk");
  const bnxt = document.getElementById("bnxt");
  bchk.disabled = true;
  bchk.style.display = "inline-block";
  bnxt.style.display = "none";
  bnxt.textContent = idx < quiz.length - 1 ? "Suivant →" : "Voir les résultats →";
}

function sel2(i) {
  if (done) return;
  const q = quiz[idx];
  const el = document.getElementById(`o${i}`);
  if (q.m) {
    if (sel.includes(i)) {
      sel = sel.filter((x) => x !== i);
      el.classList.remove("sel");
    } else {
      sel.push(i);
      el.classList.add("sel");
    }
  } else {
    document.querySelectorAll(".opt").forEach((o) => o.classList.remove("sel"));
    sel = [i];
    el.classList.add("sel");
  }
  document.getElementById("bchk").disabled = sel.length === 0;
}

function check() {
  done = true;
  const q = quiz[idx];
  const ok =
    JSON.stringify(q.a.slice().sort()) === JSON.stringify(sel.slice().sort());
  if (ok) score++;
  else failedQuestions.push(q);
  document.querySelectorAll(".opt").forEach((el, i) => {
    el.classList.add("dis");
    el.classList.remove("sel");
    if (q.a.includes(i)) el.classList.add(sel.includes(i) ? "ok" : "rv");
    else if (sel.includes(i)) el.classList.add("ng");
  });
  const fb = document.getElementById("fb");
  fb.className = `fb2 ${ok ? "ok" : "ng"}`;
  fb.innerHTML = `<strong>${ok ? "✓ Correct !" : "✗ Incorrect."}</strong> ${q.e}`;
  document.getElementById("bchk").style.display = "none";
  document.getElementById("bnxt").style.display = "inline-block";
  document.getElementById("qsl").textContent = `${score} pts`;
  document.getElementById("hscore").textContent = `Score : ${score}/${idx + 1}`;
}

function next() {
  idx++;
  if (idx >= quiz.length) showR();
  else render();
}

function showR() {
  document.getElementById("qa").style.display = "none";
  document.getElementById("ra").style.display = "block";
  document.getElementById("pfill").style.width = "100%";
  const n = quiz.length;
  const p = n ? Math.round((score / n) * 100) : 0;
  const w = n - score;
  document.getElementById("rpct").textContent = `${p}%`;
  document.getElementById("sc").textContent = score;
  document.getElementById("sw").textContent = w;
  document.getElementById("st").textContent = n;
  const arc = document.getElementById("sarc");
  setTimeout(() => {
    arc.style.strokeDashoffset = 414.7 - (p / 100) * 414.7;
  }, 200);
  let e;
  let t;
  let s;
  if (p >= 90) {
    e = "🏆";
    t = "Excellent !";
    s = "Tu maîtrises parfaitement ces modules CCNA2 !";
  } else if (p >= 75) {
    e = "🎯";
    t = "Très bien !";
    s = "Bonne maîtrise. Encore quelques révisions pour atteindre l'excellence.";
  } else if (p >= 60) {
    e = "📚";
    t = "Pas mal !";
    s = "Tu es sur la bonne voie. Continue à réviser !";
  } else if (p >= 40) {
    e = "💪";
    t = "Courage !";
    s = "Il faut consolider les bases. Relis tes cours et recommence.";
  } else {
    e = "🔄";
    t = "À retravailler";
    s = "Pas de panique, relis bien tes modules et retente le quiz.";
  }
  const retryBtn = document.getElementById("brw");
  if (failedQuestions.length > 0) {
    const plural = failedQuestions.length > 1 ? "s" : "";
    retryBtn.textContent = `Refaire les ${failedQuestions.length} question${plural} ratée${plural}`;
    retryBtn.style.display = "inline-block";
  } else {
    retryBtn.style.display = "none";
  }
  document.getElementById("remo").textContent = e;
  document.getElementById("rtitle").textContent = `${t} (manche ${roundNumber})`;
  document.getElementById("rsub").textContent =
    failedQuestions.length > 0
      ? `${s} ${failedQuestions.length} question${failedQuestions.length > 1 ? "s" : ""} à retravailler.`
      : s;
}

function retryWrong() {
  if (failedQuestions.length === 0) return;
  startRound(failedQuestions, true);
}

function goMenu() {
  document.getElementById("ra").style.display = "none";
  document.getElementById("qa").style.display = "none";
  document.getElementById("ss").style.display = "block";
  document.getElementById("hscore").style.display = "none";
  document.getElementById("brw").style.display = "none";
  document.getElementById("pfill").style.width = "0%";
}

updateQCountMeta();
