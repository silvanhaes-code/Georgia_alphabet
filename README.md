# ქართული ანბანი — Georgian Alphabet Learner

A small, installable web app (PWA) for learning the 33 letters of the modern
Georgian alphabet (Mkhedruli). Works on an iPhone with no App Store and no Mac.

## Features

- **Cards** — flip through flashcards: glyph → letter name (Latin + Georgian),
  transliteration, pronunciation hint, and an example word.
- **Chart** — the full 33-letter grid; tap any letter for detail + audio.
- **Learn** — a study *game*: pick a set of letters and get continuously quizzed
  on just those. Each question randomly mixes three styles (see letter → pick
  sound, see sound → pick letter, hear audio → pick letter). Letters you miss
  come back more often (adaptive drilling), with a streak and a best-score saved
  per set, plus a "Review misses" pile that collects the letters you get wrong.
  - Sets: **Vowels** (5), **Simple consonants** (11), **Aspirated** (3),
    **Ejective / “popped”** (6), **Fricatives & affricates** (8), **All 33**.
- **Real audio** — genuine Georgian neural-voice recordings for every letter
  name and example word (falls back to the device's speech synthesis if a clip
  can't load).
- **Offline + installable** — add it to your Home Screen and it runs fullscreen
  like a native app, even without a connection (audio clips cache on first play).

## Run it on your iPhone

1. Open the deployed URL in **Safari** on your iPhone.
2. Tap the **Share** button → **Add to Home Screen**.
3. Launch it from the new icon — it opens fullscreen, no browser bars.

## Run it locally

Any static file server works, for example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Pushing to `main` (or any `claude/**` branch) triggers the GitHub Actions
workflow in `.github/workflows/deploy.yml`, which publishes the site to
GitHub Pages. Enable it once under **Settings → Pages → Build and deployment →
Source: GitHub Actions**.

## Project layout

```
index.html              # app shell + three tabbed views (Cards / Chart / Learn)
css/styles.css          # styling, light/dark, responsive
js/data.js              # the 33 letters, study-set groups, metadata
js/app.js               # cards, chart, Learn game engine, audio, service-worker reg
manifest.webmanifest    # PWA manifest
sw.js                   # offline cache (shell precache + runtime audio cache)
icons/                  # app icons (letter ა on a wine background)
audio/                  # <id>-name.mp3 / <id>-word.mp3 per letter
tools/gen_audio.py      # regenerates the audio clips
```

## Audio

Each letter has two committed MP3 clips — its Georgian name (e.g. `ბანი`) and its
example word — synthesized with Microsoft Edge's neural Georgian voice
(`ka-GE-EkaNeural`). Because the clips are committed, the app needs no network at
runtime. If a clip ever fails to load, playback falls back to the browser's
built-in `SpeechSynthesis`.

To regenerate the audio (e.g. after editing `js/data.js`):

```bash
pip install edge-tts
python3 tools/gen_audio.py          # only fills in missing clips
python3 tools/gen_audio.py --force  # regenerate everything
# pick a different voice: KA_VOICE=ka-GE-GiorgiNeural python3 tools/gen_audio.py --force
```

The script reads the letters straight from `js/data.js`, so adding a letter and
re-running it is all that's needed.
