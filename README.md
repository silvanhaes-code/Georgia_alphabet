# ქართული ანბანი — Georgian Alphabet Learner

A small, installable web app (PWA) for learning the 33 letters of the modern
Georgian alphabet (Mkhedruli). Works on an iPhone with no App Store and no Mac.

## Features

- **Learn** — flip through flashcards: glyph → letter name, transliteration,
  pronunciation hint, and an example word.
- **Chart** — the full 33-letter grid; tap any letter for detail.
- **Quiz** — multiple-choice practice in both directions (letter → sound and
  sound → letter) with running score.
- **Audio** — pronunciation via the device's speech synthesis (best on devices
  that have a Georgian voice installed).
- **Offline + installable** — add it to your Home Screen and it runs fullscreen
  like a native app, even without a connection.

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
index.html              # app shell + three tabbed views
css/styles.css          # styling, light/dark, responsive
js/data.js              # the 33 letters and metadata
js/app.js               # flashcards, chart, quiz, audio, service-worker reg
manifest.webmanifest    # PWA manifest
sw.js                   # offline cache
icons/                  # app icons (letter ა on a wine background)
```

## A note on audio

Pronunciation uses the browser's built-in `SpeechSynthesis`. iOS may not ship a
Georgian (`ka-GE`) voice by default, in which case it falls back to a generic
voice — the on-screen pronunciation hints always describe the sound in English.
Recorded native-speaker audio clips are a natural next enhancement.
