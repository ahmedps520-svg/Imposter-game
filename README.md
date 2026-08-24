# Imposter — Video Game Edition

A pass-and-play party game for **4 players** on one iPad (or any phone, tablet or laptop).

Three players get the **same famous video game**. One player gets nothing but the words
*"You are the imposter."* Everybody describes the game one word at a time — and the imposter
has to bluff their way through it.

## How to play

1. Tap **Start Game** and hand the iPad to Player 1.
2. Each player taps their card to reveal it privately, then taps **Hide & Pass On**.
3. Once all four have seen their card, put the iPad down and play:
   going clockwise, everyone says **one word** describing the game.
   Too obvious and the imposter figures it out; too vague and you look guilty.
4. Discuss, then point at whoever you think the imposter is on the count of three.
5. Tap **Finished Game — Reveal** to see who the imposter was and what the secret game was.
6. Tap **New Game** to deal a fresh round.

## Running it

There is no build step and no server needed — it is three static files.

- **On an iPad:** put `index.html`, `styles.css` and `script.js` in the same folder
  (e.g. in iCloud Drive / Files) and open `index.html` in Safari.
  Tap Share → *Add to Home Screen* to get a fullscreen, app-like icon.
- **On a computer:** just double-click `index.html`.
- **Serving it locally** (handy for testing on the iPad over Wi-Fi):

  ```bash
  python3 -m http.server 8000
  ```

  then open `http://<your-computer-ip>:8000` on the iPad.

Everything runs offline — no internet, no accounts, no data leaves the device.

## Notes

- The game pool is ~110 mainstream titles in `GAMES` at the top of `script.js`.
  Add or remove titles there to tune it for your family — keep them ones everyone
  actually recognises, or the imposter wins by default.
- The same game never comes up twice in a row.
- The 🔊 button in the corner mutes the sound effects; the choice is remembered.
- Respects `prefers-reduced-motion` — animations and confetti are dropped if the
  device is set to reduce motion.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | The five screens: home, pass, card, discuss, reveal |
| `styles.css` | Glassmorphism styling, aurora background, all animations |
| `script.js` | Game state, the video game list, sound effects, confetti |
