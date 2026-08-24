/* ============================================================
   IMPOSTER — Video Game Edition
   Pass-and-play: 4 players, 3 share a game, 1 is the imposter.
   ============================================================ */

const PLAYER_COUNT = 4;

/* A deliberately mainstream list — everyone at the table should
   recognise the title, otherwise the imposter wins by default. */
const GAMES = [
  "Minecraft",
  "Roblox",
  "Fortnite",
  "Among Us",
  "Mario Kart",
  "Super Mario Bros."
];

/* ── DOM ───────────────────────────────────────────────── */

const $ = (id) => document.getElementById(id);

const el = {
  nameForm:     $("name-form"),
  namesStart:   $("btn-names-start"),
  nameInputs:   [$("name-1"), $("name-2"), $("name-3"), $("name-4")],
  nameError:    $("name-error"),
  passNumber:   $("pass-number"),
  passName:     $("pass-name"),
  readyNumber:  $("ready-number"),
  readyName:    $("ready-name"),
  cardNumber:   $("card-number"),
  cardName:     $("card-name"),
  cardKicker:   $("card-kicker"),
  cardWord:     $("card-word"),
  cardNote:     $("card-note"),
  flipCard:     $("flip-card"),
  flipInner:    $("flip-inner"),
  flipBack:     $("flip-back"),
  btnNext:      $("btn-next"),
  btnNextLabel: $("btn-next-label"),
  dotsPass:     $("dots-pass"),
  dotsCard:     $("dots-card"),
  resultNum:    $("result-imposter"),
  resultGame:   $("result-game"),
  confetti:     $("confetti"),
  soundBtn:     $("btn-sound"),
  soundIcon:    $("sound-icon")
};

/* ── State ─────────────────────────────────────────────── */

const state = {
  game: null,
  imposter: null,
  current: 1,        // player whose turn it is (1-based)
  players: ["Player 1", "Player 2", "Player 3", "Player 4"],
  revealed: false,   // has the current player flipped their card?
  lastGame: null,    // avoid drawing the same title twice in a row
  busy: false        // lock inputs during a screen transition
};

/* ── Sound (WebAudio, no assets) ───────────────────────── */

const sound = {
  ctx: null,
  on: localStorage.getItem("imposter-sound") !== "off",

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  },

  tone(freq, start, dur, type = "sine", peak = 0.16) {
    if (!this.on || !this.ctx) return;
    const t0 = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  tap()      { this.tone(520, 0, 0.12, "triangle", 0.1); },
  whoosh()   { this.tone(300, 0, 0.18, "sine", 0.08); this.tone(620, 0.06, 0.2, "sine", 0.07); },
  safe()     { [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.07, 0.4, "sine", 0.12)); },
  imposter() { this.tone(180, 0, 0.45, "sawtooth", 0.1); this.tone(120, 0.12, 0.5, "sawtooth", 0.09); },
  fanfare()  { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * 0.1, 0.45, "triangle", 0.13)); }
};

/* ── Screens ───────────────────────────────────────────── */

function goTo(name) {
  const next = $("screen-" + name);
  if (!next) return;

  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("is-active", "is-leaving");
  });

  next.classList.add("is-active");
}

/* ── Progress dots ─────────────────────────────────────── */

function renderDots() {
  [el.dotsPass, el.dotsCard].forEach((container) => {
    container.innerHTML = "";
    for (let i = 1; i <= PLAYER_COUNT; i++) {
      const dot = document.createElement("span");
      dot.className = "dot";
      if (i < state.current) dot.classList.add("is-done");
      else if (i === state.current) dot.classList.add("is-current");
      container.appendChild(dot);
    }
  });
}

/* ── Player names ───────────────────────────────────────── */

function showNameEntry() {
  el.nameError.textContent = "";
  el.nameInputs.forEach((input, index) => {
    input.value = state.players[index].startsWith("Player ")
      ? ""
      : state.players[index];
  });
  goTo("names");
}

function startNamedRound() {
  const names = el.nameInputs.map((input) => input.value.trim());

  if (names.some((name) => !name)) {
    el.nameError.textContent = "Please enter all 4 player names.";
    return;
  }

  state.players = names;
  state.busy = false;
  el.nameError.textContent = "";
  newRound();
}

/* ── Game flow ─────────────────────────────────────────── */

function newRound() {
  let pick;
  do {
    pick = GAMES[Math.floor(Math.random() * GAMES.length)];
  } while (GAMES.length > 1 && pick === state.lastGame);

  state.game = pick;
  state.lastGame = pick;

  // Pick a fresh random imposter for every round and avoid repeating
  // the previous position when there is more than one player.
  let nextImposter;
  do {
    nextImposter = 1 + Math.floor(Math.random() * PLAYER_COUNT);
  } while (
    PLAYER_COUNT > 1 &&
    state.lastImposter != null &&
    nextImposter === state.lastImposter
  );

  state.imposter = nextImposter;
  state.lastImposter = nextImposter;
  state.current = 1;
  state.revealed = false;

  showPass();
}

function showPass() {
  const playerName = state.players[state.current - 1];
  el.passNumber.textContent = state.current;
  el.passName.textContent = playerName;
  el.readyNumber.textContent = state.current;
  el.readyName.textContent = playerName;
  renderDots();
  goTo("pass");
}

function showCard() {
  state.revealed = false;
  el.cardNumber.textContent = state.current;
  el.cardName.textContent = state.players[state.current - 1];

  // reset the card face-down before the screen fades in
  el.flipInner.classList.remove("is-flipped");
  el.flipBack.classList.remove("is-imposter");
  el.btnNext.classList.add("is-hidden");
  el.btnNext.classList.remove("pop");
  el.flipCard.disabled = false;

  renderDots();
  goTo("card");
}

function revealCard() {
  if (state.revealed) return;
  state.revealed = true;

  const isImposter = state.current === state.imposter;

  if (isImposter) {
    el.flipBack.classList.add("is-imposter");
    el.cardKicker.textContent = "Uh oh";
    el.cardWord.textContent = "YOU ARE THE IMPOSTER";
    el.cardNote.textContent = "You don't know the game. Blend in and figure it out.";
  } else {
    el.flipBack.classList.remove("is-imposter");
    el.cardKicker.textContent = "Your secret game";
    el.cardWord.textContent = state.game;
    el.cardNote.textContent = "Describe it in one word — don't make it obvious.";
  }

  el.btnNextLabel.textContent =
    state.current === PLAYER_COUNT ? "Done — Let's Play" : "Hide & Pass On";

  sound.whoosh();
  el.flipInner.classList.add("is-flipped");
  el.flipCard.disabled = true;

  setTimeout(() => (isImposter ? sound.imposter() : sound.safe()), 420);

  setTimeout(() => {
    el.btnNext.classList.remove("is-hidden");
    el.btnNext.classList.add("pop");
  }, 900);
}

function nextPlayer() {
  if (state.current >= PLAYER_COUNT) {
    goTo("discuss");
    return;
  }
  state.current += 1;
  showPass();
}

function showResult() {
  el.resultNum.textContent = state.imposter;
  el.resultGame.textContent = state.game;
  goTo("result");
  sound.fanfare();
  burstConfetti();
}

/* ── Confetti ──────────────────────────────────────────── */

const CONFETTI_COLORS = ["#7c5cff", "#24d3ff", "#ff4d6d", "#ffb84d", "#ffffff", "#a05cff"];

function burstConfetti(count = 46) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const dur = 2.4 + Math.random() * 1.8;
    const delay = Math.random() * 0.5;

    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.setProperty("--dx", (Math.random() * 30 - 15) + "vw");
    piece.style.setProperty("--spin", Math.floor(Math.random() * 1080 - 540) + "deg");
    piece.style.setProperty("--dur", dur + "s");
    piece.style.setProperty("--delay", delay + "s");
    piece.style.width = 7 + Math.random() * 7 + "px";
    piece.style.height = 10 + Math.random() * 10 + "px";

    el.confetti.appendChild(piece);
    setTimeout(() => piece.remove(), (dur + delay) * 1000 + 200);
  }
}

/* ── Wiring ────────────────────────────────────────────── */

function tapped(handler) {
  return (event) => {
    event.preventDefault();
    if (state.busy) return;
    state.busy = true;
    setTimeout(() => (state.busy = false), 260);
    sound.unlock();
    handler();
  };
}

$("btn-imready").addEventListener("click", tapped(() => { sound.tap(); showCard(); }));
$("btn-next").addEventListener("click", tapped(() => { sound.tap(); nextPlayer(); }));
$("btn-finish").addEventListener("click", tapped(() => showResult()));
$("btn-skip").addEventListener("click", tapped(() => { sound.tap(); newRound(); }));
$("btn-again").addEventListener("click", tapped(() => { sound.tap(); newRound(); }));

el.flipCard.addEventListener("click", (event) => {
  event.preventDefault();
  sound.unlock();
  revealCard();
});

el.soundBtn.addEventListener("click", () => {
  sound.on = !sound.on;
  localStorage.setItem("imposter-sound", sound.on ? "on" : "off");
  el.soundIcon.textContent = sound.on ? "🔊" : "🔇";
  el.soundBtn.classList.toggle("is-muted", !sound.on);
  if (sound.on) { sound.unlock(); sound.tap(); }
});

/* Stop iPad Safari from bouncing / zooming mid-game. */
document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

/* ── Init ──────────────────────────────────────────────── */

el.soundIcon.textContent = sound.on ? "🔊" : "🔇";
el.soundBtn.classList.toggle("is-muted", !sound.on);
renderDots();
