const IMAGE_BASE_URL = "https://ccnareponses.com/wp-content/uploads/2022/06/";
const ALL_QUESTIONS = [...QUESTIONS_5_6, ...QUESTIONS_7_9];

let quiz = [];
let idx = 0;
let score = 0;
let sel = [];
let done = false;
let filt = "all";

function setF(f, el) {
  filt = f;
  document.querySelectorAll(".fb").forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
}

function shuffle(a) {
  return a.sort(() => Math.random() - 0.5);
}

function startQ() {
  quiz = shuffle(
    filt === "all"
      ? [...ALL_QUESTIONS]
      : filt === "stp"
        ? ALL_QUESTIONS.filter((q) => q.c === "stp")
        : ALL_QUESTIONS.filter((q) => q.c === "dhcp"),
  );
  idx = 0;
  score = 0;
  document.getElementById("ss").style.display = "none";
  document.getElementById("ra").style.display = "none";
  document.getElementById("qa").style.display = "block";
  document.getElementById("hscore").style.display = "block";
  render();
}

function render() {
  done = false;
  sel = [];
  const q = quiz[idx];
  const n = quiz.length;
  const letters = "ABCDEFGH";
  document.getElementById("qctr").textContent = `${idx + 1} / ${n}`;
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
  const p = Math.round((score / n) * 100);
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
  document.getElementById("remo").textContent = e;
  document.getElementById("rtitle").textContent = t;
  document.getElementById("rsub").textContent = s;
}

function goMenu() {
  document.getElementById("ra").style.display = "none";
  document.getElementById("qa").style.display = "none";
  document.getElementById("ss").style.display = "block";
  document.getElementById("hscore").style.display = "none";
  document.getElementById("pfill").style.width = "0%";
}
