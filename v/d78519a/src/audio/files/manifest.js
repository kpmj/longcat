/* The sound files the game plays, and what was measured on each after encoding. WRITTEN BY
   tools/audio/export.py: do not edit by hand (tests/audio.test.mjs compares it with the files).
   How these are made: docs/audio/playbook.md. What each sound is for: docs/audio/cue-sheet.md. */
export const FILES = {
  "drill.chord.trial": {
    "path": "drill/chord-trial.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "trial_chord",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 19955,
    "sha256": "1b45c6150ebbd0e65eab936e8754e8ce88aa48f41466f00e38200c297fe930ee",
    "seconds": 1.5347,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.6,
    "lead": 0.0015,
    "below300": 0.187,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0235,
    "clicks": 0,
    "midis": [
      60,
      64,
      67
    ],
    "cents": [
      0.0,
      0.0,
      0.0
    ]
  },
  "music.home.yuzu": {
    "path": "music/home-yuzu.m4a",
    "family": "music_long",
    "kind": "loop",
    "piece": "home_yuzu",
    "version": 2,
    "libraries": [
      "vcsl",
      "sneakybass"
    ],
    "loopStart": 0.125,
    "loopEnd": 152.85227083333334,
    "loopSeconds": 152.72727083333334,
    "bpm": 88,
    "bars": 56,
    "beatsPerBar": 4,
    "bytes": 2482372,
    "sha256": "11534721740663b152e8544e3b2c8d00bbdf45bb2fe7e248697c44e9b516c21f",
    "seconds": 153.2573,
    "channels": 2,
    "lufs": -18.0,
    "measure": "I",
    "peak": -3.1,
    "lead": 0.0,
    "below300": 0.35,
    "monoLoss": 1.15,
    "tags": [],
    "joinJump": 1.88,
    "loopResidual": -27.8,
    "clicks": 0
  },
  "music.trial.loop": {
    "path": "music/trial-loop.m4a",
    "family": "music",
    "kind": "loop",
    "piece": "trial_loop",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "loopStart": 0.125,
    "loopEnd": 13.458333333333334,
    "loopSeconds": 13.333333333333334,
    "bpm": 72,
    "bars": 4,
    "beatsPerBar": 4,
    "bytes": 225804,
    "sha256": "7f465f62d3a5b5c09da8fb95715e8679693538f1db58dd3368780048a86ad5a5",
    "seconds": 13.8653,
    "channels": 2,
    "lufs": -18.0,
    "measure": "I",
    "peak": -3.8,
    "lead": 0.0,
    "below300": 0.317,
    "monoLoss": 0.99,
    "tags": [],
    "joinJump": 0.05,
    "loopResidual": -37.3,
    "clicks": 0
  }
};
