# Page Quest

A reading game for kids who are building fluency and decoding. Each story starts with a
tricky-word warm-up in syllable chunks, every page is read out loud (the microphone follows
along where Safari allows it, otherwise a highlighter paces the reading), and a question after
each page has to be answered to move on. Finished stories come back in the Memory Vault after
1, 3, 7 and 14 days. Coins, levels, a story path and a treasure shop are the rewards.

The **Game Arcade** is earned by reading: 2 tickets per finished story, 1 per Memory Vault visit,
1 ticket per game. Word Catcher (catch real words, dodge made-up ones), Syllable Smash (build
long words from chunks against the clock) and Memory Match (match words to pictures).

Play: https://bradludington-ui.github.io/page-quest/

## Put it on an iPad
1. Open the link above in **Safari**.
2. Tap **Share → Add to Home Screen → Add**.
3. For the microphone: **Settings → General → Keyboard → Enable Dictation** must be on, and tap
   **Allow** when Page Quest first asks to use the microphone.

Progress is saved on each iPad, in the home-screen app. Nothing is sent anywhere.

## Files
- `index.html` — the whole game (stories, screens and logic in one file)
- `manifest.webmanifest`, `icons/` — the home-screen icon and full-screen settings
- `sw.js` — keeps a copy for offline use; always checks for a newer version first
