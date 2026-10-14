# BIO HUNTER v18.10.2 RC1 — Queen Adaptive Flank Read

Latest base: v18.10.1 RC1. Works on its own in Full Source and Deploy builds; Patch ONLY applies to v18.10.1 RC1.

**New:** Queen learns repeated lateral dodge direction from real button inputs; after at least 3 consistent samples, Perimeter/Flank squad staging and shot direction subtly favor the familiar escape route. The new attack target is capped at 54 world units offset, warning is at least 1.4 seconds, and a gold marker shows the fixed target. The player can reverse dodge direction, parry or eliminate the marked minion. No homing attack; no extra damage.

Tests: Node 3,485/3,485; Chromium headless 3,206/3,206 using simulated storage. Still RC: no real device, genuine HTTPS save or verified minimum 60 FPS. GitHub has not been updated.

- `BOSS_QUEEN_ADAPTIVE_READ_18.10.2_RC1.md` — design and mechanics
- `BIO_HUNTER_CHECKPOINT_18.10.2_RC1.md` — continuation
- `qa/18102-rc1/` — QA logs and screenshots

`python3 tools/build.py` to regenerate distribution; `python3 tools/qa-hive-adaptive-18102.py --browser` to run QA. Save key remains `bio-hunter-warden-v3`.
