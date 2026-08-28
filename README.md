# Imposter — Video Game Edition

A pass-and-play party game for **4 players** on one iPad (or any phone, tablet or laptop).

Three players get the **same famous video game**. One player gets nothing but the words
*"You are the imposter."* Everybody describes the game one word at a time — and the imposter
has to bluff their way through it.

## How to play

1. Tap **Start Game** and enter all four players' names — it won't let you
   continue until every field is filled in.
2. Hand the iPad to the first player. Each player taps their card to reveal it
   privately, then taps **Hide & Pass On**.
3. Once all four have seen their card, put the iPad down and play:
   going clockwise, everyone says **one word** describing the game.
   Too obvious and the imposter figures it out; too vague and you look guilty.
4. Discuss, then point at whoever you think the imposter is on the count of three.
5. Tap **Finished Game — Reveal** to see who the imposter was and what the secret game was.
6. Tap **New Game** to deal a fresh round with the same players, or
   **Change Players** to edit names first.

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

- The game pool is the `GAMES` array at the top of `script.js` — kept short on
  purpose to titles young kids instantly recognise (Minecraft, Fortnite, Roblox,
  Among Us, Mario Kart, Pokémon). Add or remove titles there to tune it for
  your family; an unfamiliar title just hands the round to the imposter.
- Names are capped at 16 characters and only live in memory for the session —
  nothing is saved to disk or sent anywhere.
- The same game never comes up twice in a row, and neither is the same
  player picked as imposter two rounds in a row.
- The 🔊 button in the corner mutes the sound effects; the choice is remembered.
- Respects `prefers-reduced-motion` — animations and confetti are dropped if the
  device is set to reduce motion.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | The six screens: home, name entry, pass, card, discuss, reveal |
| `styles.css` | Glassmorphism styling, aurora background, all animations |
| `script.js` | Game state, the video game list, sound effects, confetti |
