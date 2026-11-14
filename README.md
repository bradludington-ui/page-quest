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

## Reading growth tools
- **Today's Quest**: a daily checklist (Fluency Gym, a story or chapter, Memory Vault, plus practice for each focus area a grown-up ticks).
- **Fluency Gym**: one passage read aloud three times, scored by the microphone or a grown-up, with a words-per-minute chart.
- **Word bank**: words a reader taps for help, skips, or gets stuck on come back in warm-ups and games until read correctly three times.
- **Chapter books**: one chapter a day; each chapter opens with a question about the one before.
- **Summary and retell** after every story; **word meanings** in warm-ups and the Memory Vault; **Word Parts** (prefixes and suffixes) in the arcade.
- **Reading minutes** toward a daily goal (15 or 20 minutes, like the class reading logs) and a **monthly one-minute check-in** compared with grade-level norms (Hasbrouck & Tindal, 2017).

No scores, names or school records are stored in this repository; each child's focus areas are set on their own iPad.

## Lined up with school (November 2026)
- 3rd grade: folktales, myths and poems ("Ways Characters Shape Stories", figurative language), a water-cycle story, and this month's spelling patterns (long e, long i, compound words) in Syllable Smash and Word Catcher.
- 5th grade: realistic fiction about character relationships, and true stories tied to landforms and fossils (Mary Anning), Ancient China (Cai Lun) and Ancient India (Aryabhata).

## Files
- `index.html` — the whole game (stories, screens and logic in one file)
- `manifest.webmanifest`, `icons/` — the home-screen icon and full-screen settings
- `sw.js` — keeps a copy for offline use; always checks for a newer version first
