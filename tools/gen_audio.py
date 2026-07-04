#!/usr/bin/env python3
"""Generate Georgian pronunciation clips for the alphabet app.

Reads the letters straight out of ../js/data.js and, for each one, writes:
    audio/<id>-name.mp3   the letter's Georgian name (e.g. ბანი)
    audio/<id>-word.mp3   the example word (e.g. გული)

Uses Microsoft Edge's neural Georgian voice via the `edge-tts` package. The
clips are committed to the repo, so the app never needs network at runtime.

Usage:
    pip install edge-tts
    python3 tools/gen_audio.py            # generate any missing/all clips
    python3 tools/gen_audio.py --force    # regenerate everything

Note: this environment routes HTTPS through a proxy whose CA must be trusted.
The script auto-detects HTTPS_PROXY and appends the proxy CA to certifi if
present; on a normal machine neither step is needed.
"""
import asyncio
import os
import re
import sys
import ssl

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA_JS = os.path.join(ROOT, "js", "data.js")
AUDIO_DIR = os.path.join(ROOT, "audio")
VOICE = os.environ.get("KA_VOICE", "ka-GE-EkaNeural")

# Match one letter object literal and pull id / nameKa / example out of it.
FIELD = lambda key: re.compile(key + r'\s*:\s*"([^"]+)"')
OBJ_RE = re.compile(r"\{[^{}]*\bid\s*:[^{}]*\}")


def parse_letters():
    src = open(DATA_JS, encoding="utf-8").read()
    letters = []
    for obj in OBJ_RE.findall(src):
        def grab(k):
            m = FIELD(k).search(obj)
            return m.group(1) if m else None
        lid, name_ka, example = grab("id"), grab("nameKa"), grab("example")
        if lid and name_ka and example:
            letters.append({"id": lid, "nameKa": name_ka, "example": example})
    return letters


def trust_proxy_ca():
    """In the proxied build environment, make certifi trust the proxy CA."""
    ca = "/root/.ccr/ca-bundle.crt"
    if not os.path.exists(ca):
        return
    try:
        import certifi
        bundle = certifi.where()
        current = open(bundle, encoding="utf-8").read()
        add = open(ca, encoding="utf-8").read()
        if add.strip() and add not in current:
            with open(bundle, "a", encoding="utf-8") as fh:
                fh.write("\n" + add)
    except Exception as exc:  # best-effort; ignore on normal machines
        print("  (proxy CA setup skipped: %s)" % exc)


async def synth(text, out, proxy):
    import edge_tts
    kwargs = {"proxy": proxy} if proxy else {}
    await edge_tts.Communicate(text, VOICE, **kwargs).save(out)


async def main():
    force = "--force" in sys.argv
    trust_proxy_ca()
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    os.makedirs(AUDIO_DIR, exist_ok=True)
    letters = parse_letters()
    print("Parsed %d letters; voice=%s" % (len(letters), VOICE))

    jobs = []
    for L in letters:
        jobs.append((L["nameKa"], os.path.join(AUDIO_DIR, L["id"] + "-name.mp3")))
        jobs.append((L["example"], os.path.join(AUDIO_DIR, L["id"] + "-word.mp3")))

    made = 0
    for text, out in jobs:
        if not force and os.path.exists(out) and os.path.getsize(out) > 0:
            continue
        await synth(text, out, proxy)
        size = os.path.getsize(out)
        print("  %-28s %5d bytes  %r" % (os.path.basename(out), size, text))
        if size == 0:
            raise SystemExit("ERROR: empty clip for %r" % text)
        made += 1
    print("Done. Generated %d clips (%d total)." % (made, len(jobs)))


if __name__ == "__main__":
    asyncio.run(main())
