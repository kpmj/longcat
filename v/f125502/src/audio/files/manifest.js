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
  "drill.count": {
    "path": "drill/count.m4a",
    "family": "drill_beat",
    "kind": "sound",
    "piece": "drill_sounds@count",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 5135,
    "sha256": "75687a9b0f966af9ae95e281eb9a445f9329b057ff0165d20d3b9cc0305aa434",
    "seconds": 0.3187,
    "channels": 1,
    "lufs": -6.0,
    "measure": "TP",
    "peak": -6.0,
    "lead": 0.0018,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0104,
    "clicks": 0,
    "tracker": {
      "frames": 28,
      "heard": 27,
      "midis": [
        77,
        78
      ]
    }
  },
  "drill.count.go": {
    "path": "drill/count-go.m4a",
    "family": "drill_beat",
    "kind": "sound",
    "piece": "drill_sounds@count-go",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 5395,
    "sha256": "9f3ca6e12f205dbb3c4ba49c034b5c71e6ca9a73f3cf12990f0d215ccc2ce2e1",
    "seconds": 0.34,
    "channels": 1,
    "lufs": -6.0,
    "measure": "TP",
    "peak": -6.0,
    "lead": 0.0003,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0159,
    "clicks": 0,
    "tracker": {
      "frames": 30,
      "heard": 27,
      "midis": [
        70,
        76,
        77
      ]
    }
  },
  "drill.cue.good.0": {
    "path": "drill/cue/good-0.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@0",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "01928422789fece90541e2580e8969f65ce437a5fb40789095735ab98c17170a",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.2,
    "lead": 0.0006,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0782,
    "clicks": 0,
    "midis": [
      84,
      91
    ],
    "cents": [
      0.0,
      0.0
    ],
    "partials": [
      1,
      3,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        53,
        56,
        60,
        71,
        72,
        83
      ]
    }
  },
  "drill.cue.good.1": {
    "path": "drill/cue/good-1.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@1",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "d0290aae38fae04b01fc7413be7b89be75a277e072dcf4ca7ff7535133ba16fd",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.2,
    "lead": 0.0006,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.078,
    "clicks": 0,
    "midis": [
      85,
      92
    ],
    "cents": [
      0.0,
      0.0
    ],
    "partials": [
      1,
      3,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        38,
        54,
        57,
        61,
        72,
        73
      ]
    }
  },
  "drill.cue.good.10": {
    "path": "drill/cue/good-10.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@10",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "790643bcd9623c9b0f20aaec8edd1e8dea0da27c05a9cffd5616faca84dd5944",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.1,
    "measure": "M",
    "peak": -3.3,
    "lead": 0.0006,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0793,
    "clicks": 0,
    "midis": [
      82,
      89
    ],
    "cents": [
      0.0,
      0.0
    ],
    "partials": [
      1,
      3,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        51,
        54,
        58,
        69,
        70,
        81
      ]
    }
  },
  "drill.cue.good.11": {
    "path": "drill/cue/good-11.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@11",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "a8bb8dd3664a8cc6aa2a16ead77fe205152e8b28018546bcf5c05ce1d25f213d",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -2.9,
    "lead": 0.0006,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0784,
    "clicks": 0,
    "midis": [
      83,
      90
    ],
    "cents": [
      0.0,
      0.0
    ],
    "partials": [
      1,
      3,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        52,
        55,
        59,
        70,
        71,
        82
      ]
    }
  },
  "drill.cue.good.2": {
    "path": "drill/cue/good-2.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@2",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "cf1dc4549f3a8c942cb78cd7a119e6beebcc54e7ea4b783b7e0455f7a6ee40cf",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -2.0,
    "lead": 0.0013,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0771,
    "clicks": 0,
    "midis": [
      86,
      93
    ],
    "cents": [
      0.0,
      0.0
    ],
    "partials": [
      1,
      3,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        38,
        39,
        55,
        58,
        62,
        73,
        74
      ]
    }
  },
  "drill.cue.good.3": {
    "path": "drill/cue/good-3.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@3",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "bce5742ed8981d34c7346c77a9836698c2e48e96e4482612ef03fade266af291",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.0,
    "lead": 0.0005,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0819,
    "clicks": 0,
    "midis": [
      87,
      94
    ],
    "cents": [
      0.0,
      0.5
    ],
    "partials": [
      1,
      3,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        40,
        59,
        63,
        75
      ]
    }
  },
  "drill.cue.good.4": {
    "path": "drill/cue/good-4.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@4",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "4b5c707668e169927b894835402c5719171dc198952e75e868e8d0ed44059e49",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.9,
    "lead": 0.0009,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0761,
    "clicks": 0,
    "midis": [
      88,
      95
    ],
    "cents": [
      0.0,
      0.5
    ],
    "partials": [
      1,
      6,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        52,
        54,
        57,
        68,
        70,
        76
      ]
    }
  },
  "drill.cue.good.5": {
    "path": "drill/cue/good-5.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@5",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "4946143ab03907b80b69017b4dec68f4d004e5b9828e7ddf524e8c44394282e1",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.6,
    "lead": 0.0009,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.076,
    "clicks": 0,
    "midis": [
      89,
      96
    ],
    "cents": [
      0.0,
      0.6
    ],
    "partials": [
      1,
      6,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        53,
        55,
        58,
        69,
        71,
        77
      ]
    }
  },
  "drill.cue.good.6": {
    "path": "drill/cue/good-6.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@6",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "7363ac0dc3f916996c8fa4a44280ccaf1463702ab3545aaa046eea22331b90f9",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.4,
    "lead": 0.0002,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0863,
    "clicks": 0,
    "midis": [
      78,
      85
    ],
    "cents": [
      0.0,
      0.0
    ],
    "partials": [
      1,
      3,
      6,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 45,
      "midis": [
        38,
        54,
        64,
        66,
        70,
        73,
        74,
        80
      ]
    }
  },
  "drill.cue.good.7": {
    "path": "drill/cue/good-7.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@7",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "d9bf0cc719cd4163fa55274193c4fbdbb3813b2fdf352de2b131d4391471bc75",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.1,
    "lead": 0.0002,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0759,
    "clicks": 0,
    "midis": [
      79,
      86
    ],
    "cents": [
      0.1,
      -0.1
    ],
    "partials": [
      1,
      3,
      6,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 45,
      "midis": [
        39,
        65,
        67,
        71,
        74,
        75,
        81
      ]
    }
  },
  "drill.cue.good.8": {
    "path": "drill/cue/good-8.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@8",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "0a3a4588c571e7f63e42c4273981c22a35a9006b190fd6854467741b78991853",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.7,
    "lead": 0.0002,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0814,
    "clicks": 0,
    "midis": [
      80,
      87
    ],
    "cents": [
      -0.1,
      0.0
    ],
    "partials": [
      1,
      3,
      6,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        40,
        66,
        68,
        72,
        75,
        76,
        82
      ]
    }
  },
  "drill.cue.good.9": {
    "path": "drill/cue/good-9.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-good@9",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 7215,
    "sha256": "f7f7503b9d91e046c480b91c61d83527672a3009ac63eaa04a3e45de97fb08b1",
    "seconds": 0.4893,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -2.5,
    "lead": 0.0004,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0791,
    "clicks": 0,
    "midis": [
      81,
      88
    ],
    "cents": [
      0.0,
      0.0
    ],
    "partials": [
      1,
      3,
      8
    ],
    "tracker": {
      "frames": 45,
      "heard": 44,
      "midis": [
        50,
        57,
        68,
        69,
        77,
        83
      ]
    }
  },
  "drill.cue.mid.0": {
    "path": "drill/cue/mid-0.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@0",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "5447cce1ad7c8408426fcc3d49bd3bf7eb0e3bcd56e51d6df19d4663d37f55bc",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.1,
    "lead": 0.0019,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0235,
    "clicks": 0,
    "midis": [
      72
    ],
    "cents": [
      0.3
    ],
    "partials": [
      1,
      4
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        72
      ]
    }
  },
  "drill.cue.mid.1": {
    "path": "drill/cue/mid-1.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@1",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "8ea15d3f1c9150ddfb4e43de7944daa20db4d5593809293379e0b6ec01c510b4",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.7,
    "lead": 0.0017,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0591,
    "clicks": 0,
    "midis": [
      73
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1,
      4
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        73
      ]
    }
  },
  "drill.cue.mid.10": {
    "path": "drill/cue/mid-10.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@10",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "d12c0af52eadbf0d2844e57acd71127d0f4a632bbcbcf024217c202e9d53082f",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -7.4,
    "lead": 0.0005,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0868,
    "clicks": 0,
    "midis": [
      82
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        82
      ]
    }
  },
  "drill.cue.mid.11": {
    "path": "drill/cue/mid-11.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@11",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "3ba27dfae5649febfb2db0ffb8ad64e9d0d48edc1a8749a6bc82a1494e67caf9",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -15.9,
    "measure": "M",
    "peak": -8.0,
    "lead": 0.0016,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1242,
    "clicks": 0,
    "midis": [
      83
    ],
    "cents": [
      -0.4
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        83
      ]
    }
  },
  "drill.cue.mid.2": {
    "path": "drill/cue/mid-2.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@2",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "849ad0a350130ed728f29e06a6f3270cb4e3045fe53009de48e03f99b60e8e00",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.0,
    "lead": 0.0016,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0592,
    "clicks": 0,
    "midis": [
      74
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1,
      4
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        74
      ]
    }
  },
  "drill.cue.mid.3": {
    "path": "drill/cue/mid-3.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@3",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "64880d91bac7d2ebd11a5425a0e82860c5369dea1d5cd224cc8777f19a7be0f8",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.0,
    "lead": 0.0015,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0575,
    "clicks": 0,
    "midis": [
      75
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      4
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        75
      ]
    }
  },
  "drill.cue.mid.4": {
    "path": "drill/cue/mid-4.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@4",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4875,
    "sha256": "d0c80cc91766a2a48de0ed56d37ab55267cea30ad0ec29e7ec5c60b0b59dfcdf",
    "seconds": 0.2973,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -7.5,
    "lead": 0.0006,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0444,
    "clicks": 0,
    "midis": [
      76
    ],
    "cents": [
      0.6
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 26,
      "heard": 24,
      "midis": [
        76
      ]
    }
  },
  "drill.cue.mid.5": {
    "path": "drill/cue/mid-5.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@5",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "f19978d5f4b829747f5dccbcac01a0d1783f6a4d2c691b5476ed3e92ca270304",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -7.5,
    "lead": 0.0008,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0439,
    "clicks": 0,
    "midis": [
      77
    ],
    "cents": [
      0.5
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        77
      ]
    }
  },
  "drill.cue.mid.6": {
    "path": "drill/cue/mid-6.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@6",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "3bdc1f6475ac9c6435da461096ca2c23dbf9ca949e10923746bf5232f6bf1aff",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -7.0,
    "lead": 0.0004,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0249,
    "clicks": 0,
    "midis": [
      78
    ],
    "cents": [
      0.3
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        78
      ]
    }
  },
  "drill.cue.mid.7": {
    "path": "drill/cue/mid-7.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@7",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "6d4ff53836eb3249cdd0904e000b9fa21115be0be28b4832b7bf0911d94fa56e",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.1,
    "measure": "M",
    "peak": -7.8,
    "lead": 0.0005,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0234,
    "clicks": 0,
    "midis": [
      79
    ],
    "cents": [
      0.4
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        79
      ]
    }
  },
  "drill.cue.mid.8": {
    "path": "drill/cue/mid-8.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@8",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "964a9625b3e30805fabeac3a81f797d27df6c299d7db2a4ed64f45af40b6a0c1",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -7.2,
    "lead": 0.0008,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0876,
    "clicks": 0,
    "midis": [
      80
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        80
      ]
    }
  },
  "drill.cue.mid.9": {
    "path": "drill/cue/mid-9.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-mid@9",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "185b3e5d99d6046dc19e53bfa068e875650a3a5d0066b363a2ee5aab8a0ba4de",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -7.2,
    "lead": 0.0009,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0819,
    "clicks": 0,
    "midis": [
      81
    ],
    "cents": [
      0.2
    ],
    "partials": [
      1
    ],
    "tracker": {
      "frames": 23,
      "heard": 23,
      "midis": [
        81
      ]
    }
  },
  "drill.cue.off.0": {
    "path": "drill/cue/off-0.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@0",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "92436142241108d912da3d087295388f6fc8a1b1844e22ec29f28b9cbcd50ca5",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.1,
    "lead": 0.002,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0359,
    "clicks": 0,
    "midis": [
      72,
      67
    ],
    "cents": [
      0.6,
      -1.0
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        48,
        55,
        67,
        68,
        72
      ]
    }
  },
  "drill.cue.off.1": {
    "path": "drill/cue/off-1.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@1",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "5e4079a1fd080883ee54fba0705e6528c1bafcd69c32f49f1f1b976a5e3fc323",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.2,
    "lead": 0.0019,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0357,
    "clicks": 0,
    "midis": [
      73,
      68
    ],
    "cents": [
      -0.6,
      -0.9
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        49,
        68,
        73
      ]
    }
  },
  "drill.cue.off.10": {
    "path": "drill/cue/off-10.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@10",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "02d9a24529c8b0949f4ec586f31c61d6396658d9f90c39239e59f633e2ea6d46",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.2,
    "lead": 0.0022,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0403,
    "clicks": 0,
    "midis": [
      70,
      65
    ],
    "cents": [
      -2.0,
      -2.0
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        46,
        53,
        65,
        66,
        70
      ]
    }
  },
  "drill.cue.off.11": {
    "path": "drill/cue/off-11.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@11",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "e3a20bf8e294f840d545628a9f8d03b7f06e6462ba46d555c0f611b0d8444ac6",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.1,
    "lead": 0.0021,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.038,
    "clicks": 0,
    "midis": [
      71,
      66
    ],
    "cents": [
      0.6,
      -1.3
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        47,
        54,
        66,
        67,
        71
      ]
    }
  },
  "drill.cue.off.2": {
    "path": "drill/cue/off-2.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@2",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "f8bf0079e84bbf6b799433de891c005624c68f6456dbd46fe7fec105cf0afc73",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.4,
    "lead": 0.0018,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.141,
    "clicks": 0,
    "midis": [
      74,
      69
    ],
    "cents": [
      -0.4,
      0.9
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        50,
        69,
        74
      ]
    }
  },
  "drill.cue.off.3": {
    "path": "drill/cue/off-3.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@3",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "6c6d0c61e9644cc808c80e671377a2b6bd11acd9eaec786022fa58984f473aa4",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.8,
    "lead": 0.0022,
    "below300": 0.378,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1128,
    "clicks": 0,
    "midis": [
      63,
      58
    ],
    "cents": [
      0.4,
      -2.5
    ],
    "partials": [
      1,
      3,
      4
    ],
    "tracker": {
      "frames": 38,
      "heard": 37,
      "midis": [
        39,
        46,
        58,
        63
      ]
    }
  },
  "drill.cue.off.4": {
    "path": "drill/cue/off-4.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@4",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "0f462a9b395064b99a3ece8868d2da719390d57f1a1f8ee67565db15e6a39be0",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.4,
    "lead": 0.0021,
    "below300": 0.417,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1247,
    "clicks": 0,
    "midis": [
      64,
      59
    ],
    "cents": [
      0.6,
      -2.3
    ],
    "partials": [
      1,
      3,
      4
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        40,
        59,
        60,
        64
      ]
    }
  },
  "drill.cue.off.5": {
    "path": "drill/cue/off-5.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@5",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "dd2f82b8d3a27bc6cacfa71ccf9eb9f9277818e646770f4f4480c586f111480d",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.4,
    "lead": 0.002,
    "below300": 0.386,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1217,
    "clicks": 0,
    "midis": [
      65,
      60
    ],
    "cents": [
      -0.3,
      -1.9
    ],
    "partials": [
      1,
      3,
      4
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        41,
        60,
        61,
        65
      ]
    }
  },
  "drill.cue.off.6": {
    "path": "drill/cue/off-6.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@6",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "46407d8b90d9bd3d4cacae51427fb7423b8489b0036f21ebb9a6c7c25be2d591",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.7,
    "lead": 0.0019,
    "below300": 0.397,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1175,
    "clicks": 0,
    "midis": [
      66,
      61
    ],
    "cents": [
      0.2,
      -0.9
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        42,
        61,
        66
      ]
    }
  },
  "drill.cue.off.7": {
    "path": "drill/cue/off-7.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@7",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "b52941666a2829cd6f526a4511f397a304c7318362c651aeba2d69221bd75564",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.2,
    "lead": 0.0018,
    "below300": 0.372,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1239,
    "clicks": 0,
    "midis": [
      67,
      62
    ],
    "cents": [
      0.6,
      -0.7
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        43,
        62,
        67
      ]
    }
  },
  "drill.cue.off.8": {
    "path": "drill/cue/off-8.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@8",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "2267d62cdc366f88324889d6d67e9e88dac2b54f9658924e0f6c13cdb25272d5",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.7,
    "lead": 0.0017,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1349,
    "clicks": 0,
    "midis": [
      68,
      63
    ],
    "cents": [
      0.2,
      -2.3
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        44,
        63,
        64,
        68
      ]
    }
  },
  "drill.cue.off.9": {
    "path": "drill/cue/off-9.m4a",
    "family": "drill",
    "kind": "sound",
    "piece": "drill_sounds@cue-off@9",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 6435,
    "sha256": "ee351821fc6ab75ab39177141e4dd6fca2ad7823937525c081f783b73b880053",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.4,
    "lead": 0.0024,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1313,
    "clicks": 0,
    "midis": [
      69,
      64
    ],
    "cents": [
      0.2,
      -1.8
    ],
    "partials": [
      1,
      3
    ],
    "tracker": {
      "frames": 38,
      "heard": 38,
      "midis": [
        45,
        64,
        69
      ]
    }
  },
  "drill.piano.40": {
    "path": "drill/piano/40.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@40",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38415,
    "sha256": "9edb5c1072ef2ad03b87ae2416368b856e65455102e295e07e5a786858d61918",
    "seconds": 3.0493,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -6.4,
    "lead": 0.0012,
    "below300": 0.776,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0327,
    "clicks": 0,
    "midis": [
      40
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.41": {
    "path": "drill/piano/41.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@41",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38675,
    "sha256": "9eb63d25a5a3869ecc5b227df344511ce8ef7e08f4c192f18a3473c8a3f345a2",
    "seconds": 3.0707,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -7.3,
    "lead": 0.0011,
    "below300": 0.538,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0109,
    "clicks": 0,
    "midis": [
      41
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.42": {
    "path": "drill/piano/42.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@42",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38675,
    "sha256": "3d28607fe0e5bbc76934e5098106f10ee3dfbc5f8632fc264740f909db2e51a1",
    "seconds": 3.0707,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -7.8,
    "lead": 0.0014,
    "below300": 0.532,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.01,
    "clicks": 0,
    "midis": [
      42
    ],
    "cents": [
      -0.9
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.43": {
    "path": "drill/piano/43.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@43",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37922,
    "sha256": "e2228f1436406d0591be9abc727ee7d69ae2af0b99f9a53848b8efffd7e5d5dd",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -7.7,
    "lead": 0.0009,
    "below300": 0.896,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0445,
    "clicks": 0,
    "midis": [
      43
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.44": {
    "path": "drill/piano/44.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@44",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38004,
    "sha256": "802a1c73463629eb8ab66e34472726c58380b39d9afe6a4aa4ddd7b1581e98e0",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.0,
    "lead": 0.0009,
    "below300": 0.812,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0419,
    "clicks": 0,
    "midis": [
      44
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.45": {
    "path": "drill/piano/45.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@45",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38415,
    "sha256": "84b964666b7fafa14947a19404faa3a50d0c1592094590371a4f0f469953087f",
    "seconds": 3.0493,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -9.8,
    "lead": 0.0009,
    "below300": 0.62,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0294,
    "clicks": 0,
    "midis": [
      45
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.46": {
    "path": "drill/piano/46.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@46",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "d157dc07f269c4b9ad794e306ba9a6896f8293f777add87fcd1ddce13ef414a4",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -9.3,
    "lead": 0.0009,
    "below300": 0.634,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0277,
    "clicks": 0,
    "midis": [
      46
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ]
  },
  "drill.piano.47": {
    "path": "drill/piano/47.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@47",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38155,
    "sha256": "6a6c8ff0d06811370ef8f872abf450a1070f6eb248943f90253d1382fcd75770",
    "seconds": 3.028,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -10.9,
    "lead": 0.0008,
    "below300": 0.955,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0213,
    "clicks": 0,
    "midis": [
      47
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.48": {
    "path": "drill/piano/48.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@48",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "502f3576245f99d489c5bc0f78b1c798118875ad1c17ea399e0069a38c9d8d0e",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -10.6,
    "lead": 0.0018,
    "below300": 0.953,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0192,
    "clicks": 0,
    "midis": [
      48
    ],
    "cents": [
      -0.3
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.49": {
    "path": "drill/piano/49.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@49",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "74cd95c8f14eb121f7af71547f98eef0111bcf4be43769775c92fb638257073d",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -9.4,
    "lead": 0.0018,
    "below300": 0.704,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0959,
    "clicks": 0,
    "midis": [
      49
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.50": {
    "path": "drill/piano/50.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@50",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "b692dd2ee828f4fa4f7eff1327b3450fa32cc6a8e88bcbe213b186beab84ac1c",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -9.2,
    "lead": 0.0017,
    "below300": 0.704,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0702,
    "clicks": 0,
    "midis": [
      50
    ],
    "cents": [
      0.4
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.51": {
    "path": "drill/piano/51.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@51",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37115,
    "sha256": "48bed517d1affd063b149df60a347b43984abbf747584867b00918f3fa489902",
    "seconds": 2.9427,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -6.4,
    "lead": 0.0012,
    "below300": 0.085,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0289,
    "clicks": 0,
    "midis": [
      51
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      7,
      8
    ]
  },
  "drill.piano.52": {
    "path": "drill/piano/52.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@52",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37115,
    "sha256": "bf6c2012be8b4de620f15bece91033d6ced1e33b7c810c1dfaf72a82a13b3bc9",
    "seconds": 2.9427,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -6.4,
    "lead": 0.0011,
    "below300": 0.075,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0274,
    "clicks": 0,
    "midis": [
      52
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      7,
      8
    ]
  },
  "drill.piano.53": {
    "path": "drill/piano/53.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@53",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "02a193e7afc551d7de09bf1671b5ee9b82c352a80dfce98554632f59196dfcef",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.4,
    "lead": 0.0017,
    "below300": 0.456,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0167,
    "clicks": 0,
    "midis": [
      53
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ]
  },
  "drill.piano.54": {
    "path": "drill/piano/54.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@54",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "72c171ff93f8fd329db14e9ab57fbf00e785bc62065861ff356daaef710c29b5",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.2,
    "lead": 0.0018,
    "below300": 0.496,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0155,
    "clicks": 0,
    "midis": [
      54
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ]
  },
  "drill.piano.55": {
    "path": "drill/piano/55.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@55",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "0d536aac79cb3d3578532d07adac7798bcb826427e04ea33238f7cb44e7b7a69",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.1,
    "measure": "M",
    "peak": -10.9,
    "lead": 0.0017,
    "below300": 0.725,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0484,
    "clicks": 0,
    "midis": [
      55
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "drill.piano.56": {
    "path": "drill/piano/56.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@56",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38155,
    "sha256": "678b6250a04ef7f7598f2b409dad31c101a4ce45a5d43aacb0d21f54b2e4f175",
    "seconds": 3.028,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -10.7,
    "lead": 0.0016,
    "below300": 0.73,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0408,
    "clicks": 0,
    "midis": [
      56
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "drill.piano.57": {
    "path": "drill/piano/57.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@57",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38155,
    "sha256": "5e669d88cf274a87a8c7a8cd556120691c1be36a5da4ea8b2c703d4881a56ce1",
    "seconds": 3.028,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -3.1,
    "lead": 0.0019,
    "below300": 0.233,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0099,
    "clicks": 0,
    "midis": [
      57
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.58": {
    "path": "drill/piano/58.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@58",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "1115f85977662af49183f658c22a97383b983dd25d09080d92579dadbfe98141",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -3.1,
    "lead": 0.0018,
    "below300": 0.196,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0093,
    "clicks": 0,
    "midis": [
      58
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]
  },
  "drill.piano.59": {
    "path": "drill/piano/59.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@59",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "66d7aa5fee4e9e30f189a5ae76c356b76af0c6ccccd00e8291f06d9b3f5852b7",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -10.5,
    "lead": 0.0019,
    "below300": 0.433,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.06,
    "clicks": 0,
    "midis": [
      59
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6
    ]
  },
  "drill.piano.60": {
    "path": "drill/piano/60.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@60",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "d2f892a70255f1be582c8317ad620bd5b2b81cb046a16040de014827b91d8321",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -10.7,
    "lead": 0.0016,
    "below300": 0.402,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0568,
    "clicks": 0,
    "midis": [
      60
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6
    ]
  },
  "drill.piano.61": {
    "path": "drill/piano/61.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@61",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "5ad07e6b922947731691ffdc96338df491c9bd6e1bb175de2252b299f50ada88",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.7,
    "lead": 0.0018,
    "below300": 0.115,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0061,
    "clicks": 0,
    "midis": [
      61
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      8
    ]
  },
  "drill.piano.62": {
    "path": "drill/piano/62.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@62",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "9184a65e3e218710c2334ce3145564639fc23304270693fde1c834e3b7d9f753",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.5,
    "lead": 0.0016,
    "below300": 0.097,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0058,
    "clicks": 0,
    "midis": [
      62
    ],
    "cents": [
      0.2
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5,
      6,
      8
    ]
  },
  "drill.piano.63": {
    "path": "drill/piano/63.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@63",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 38155,
    "sha256": "66e6562217307cdddbbbaac6720ea042e4b4b62d1784fc6652af233055f79afd",
    "seconds": 3.028,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.3,
    "lead": 0.0008,
    "below300": 0.021,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0344,
    "clicks": 0,
    "midis": [
      63
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "drill.piano.64": {
    "path": "drill/piano/64.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@64",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37685,
    "sha256": "2d227fbf7a7863b0553cb9b7158b31851490d035689966971a3f58889a222ad7",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.1,
    "lead": 0.0008,
    "below300": 0.013,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0323,
    "clicks": 0,
    "midis": [
      64
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "drill.piano.65": {
    "path": "drill/piano/65.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@65",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "99cc621355bcb23bc4161cde843272d2295de43a03ceb4f22b01b8a00282479c",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.1,
    "measure": "M",
    "peak": -9.5,
    "lead": 0.0011,
    "below300": 0.01,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0443,
    "clicks": 0,
    "midis": [
      65
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2,
      3,
      4,
      6
    ]
  },
  "drill.piano.66": {
    "path": "drill/piano/66.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@66",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37635,
    "sha256": "f6285f223b37e9315f37252c931d61ccc13538aa35d3c35e89073927e005c4d2",
    "seconds": 2.9853,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -9.5,
    "lead": 0.0018,
    "below300": 0.009,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0411,
    "clicks": 0,
    "midis": [
      66
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1,
      2,
      3,
      4,
      6
    ]
  },
  "drill.piano.67": {
    "path": "drill/piano/67.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@67",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36855,
    "sha256": "4441413229f47433e1bd28d251f32cef6b91f9ddc2a617d27292f6b4d8bca41f",
    "seconds": 2.9213,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.3,
    "lead": 0.0008,
    "below300": 0.006,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0216,
    "clicks": 0,
    "midis": [
      67
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4
    ]
  },
  "drill.piano.68": {
    "path": "drill/piano/68.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@68",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36855,
    "sha256": "4a92e9cae5f037f88edee72e0a0632171841909d4d95bfb512986e6f0bcb12fa",
    "seconds": 2.9213,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.4,
    "lead": 0.0008,
    "below300": 0.005,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0203,
    "clicks": 0,
    "midis": [
      68
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1,
      2,
      3,
      4
    ]
  },
  "drill.piano.69": {
    "path": "drill/piano/69.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@69",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36855,
    "sha256": "e576749870ab0055ddc20862b61180e5c391f620dc5d4e0f9986d59b451896e9",
    "seconds": 2.9213,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -8.1,
    "lead": 0.0016,
    "below300": 0.011,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0229,
    "clicks": 0,
    "midis": [
      69
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "drill.piano.70": {
    "path": "drill/piano/70.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@70",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36855,
    "sha256": "9e21f1a792125ef1b2d9ffa7f76d2fdf7ec3af14258ec6c25bc17938877851bf",
    "seconds": 2.9213,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -7.0,
    "lead": 0.0015,
    "below300": 0.014,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0216,
    "clicks": 0,
    "midis": [
      70
    ],
    "cents": [
      0.4
    ],
    "partials": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "drill.piano.71": {
    "path": "drill/piano/71.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@71",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "6f41caddef1fef602d3bfd5f6e46b83ba2424f011c23e3b18d4f02d4b3b5cebd",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -6.6,
    "lead": 0.0012,
    "below300": 0.021,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.022,
    "clicks": 0,
    "midis": [
      71
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4
    ]
  },
  "drill.piano.72": {
    "path": "drill/piano/72.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@72",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37115,
    "sha256": "dbefdf9346a42bf3877b585338b96f8cc9ef7fd1c64d006fe78da35315fd6cd9",
    "seconds": 2.9427,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -7.2,
    "lead": 0.0012,
    "below300": 0.017,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0207,
    "clicks": 0,
    "midis": [
      72
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3
    ]
  },
  "drill.piano.73": {
    "path": "drill/piano/73.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@73",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36335,
    "sha256": "e290ecfb6b8fc33b82032a73aea8533777c817381f7389c9a98aa6156944393c",
    "seconds": 2.8787,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -6.2,
    "lead": 0.001,
    "below300": 0.016,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0216,
    "clicks": 0,
    "midis": [
      73
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      5
    ]
  },
  "drill.piano.74": {
    "path": "drill/piano/74.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@74",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36335,
    "sha256": "3428f570e9010c6484bf69b71fb8c4ab1fa9d36c394b32feb62696e04364b634",
    "seconds": 2.8787,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -6.6,
    "lead": 0.001,
    "below300": 0.015,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0203,
    "clicks": 0,
    "midis": [
      74
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2,
      3
    ]
  },
  "drill.piano.75": {
    "path": "drill/piano/75.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@75",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37375,
    "sha256": "146e882147dbb5386215de83d04214aff9022b6402f12e239b40ef4d02eb9ac0",
    "seconds": 2.964,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -9.9,
    "lead": 0.0015,
    "below300": 0.021,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0073,
    "clicks": 0,
    "midis": [
      75
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1,
      2
    ]
  },
  "drill.piano.76": {
    "path": "drill/piano/76.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@76",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37375,
    "sha256": "64dde3e6b6a8b7b4dc9982aeb4f8acf8258a79ccbd944ede0886915d98afd589",
    "seconds": 2.964,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -9.3,
    "lead": 0.0014,
    "below300": 0.022,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0069,
    "clicks": 0,
    "midis": [
      76
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2
    ]
  },
  "drill.piano.77": {
    "path": "drill/piano/77.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@77",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37115,
    "sha256": "9d9a99a6c645ad00c990a295b9562d976f4900b4f51cd848cbe5d6e5889d8989",
    "seconds": 2.9427,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -5.0,
    "lead": 0.002,
    "below300": 0.066,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0136,
    "clicks": 0,
    "midis": [
      77
    ],
    "cents": [
      0.1
    ],
    "partials": [
      1,
      2,
      3,
      4
    ]
  },
  "drill.piano.78": {
    "path": "drill/piano/78.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@78",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36658,
    "sha256": "148281aeddc052ab736155771584f619a3712cdb24a1e39835c0308336f42fed",
    "seconds": 2.9,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -4.0,
    "lead": 0.0019,
    "below300": 0.076,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0128,
    "clicks": 0,
    "midis": [
      78
    ],
    "cents": [
      -0.2
    ],
    "partials": [
      1,
      2,
      3,
      4
    ]
  },
  "drill.piano.79": {
    "path": "drill/piano/79.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@79",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37115,
    "sha256": "b3c70ea9db1b35f93620e02e2e5d35e374fcdf239f9ff5818d869596188fe0fb",
    "seconds": 2.9427,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -5.1,
    "lead": 0.0007,
    "below300": 0.153,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0076,
    "clicks": 0,
    "midis": [
      79
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2,
      3,
      4
    ]
  },
  "drill.piano.80": {
    "path": "drill/piano/80.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@80",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37115,
    "sha256": "4910de85c20224842acc68b23f9edb71590387e6bd92cd33db414acd21a7eaa9",
    "seconds": 2.9427,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -5.7,
    "lead": 0.0006,
    "below300": 0.138,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0071,
    "clicks": 0,
    "midis": [
      80
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2,
      3,
      4
    ]
  },
  "drill.piano.81": {
    "path": "drill/piano/81.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@81",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37895,
    "sha256": "422e3f7cd2d18157b78c9dafc5f40d8d9705c8b22e8f1c29a00d267a0f3b5aaa",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -4.1,
    "lead": 0.001,
    "below300": 0.142,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0215,
    "clicks": 0,
    "midis": [
      81
    ],
    "cents": [
      0.6
    ],
    "partials": [
      1,
      2,
      3
    ]
  },
  "drill.piano.82": {
    "path": "drill/piano/82.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@82",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 37939,
    "sha256": "d08082fc1836024c2e9b72c091d3a409a7dd54406f39142cca3cc95610627d06",
    "seconds": 3.0067,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -3.1,
    "lead": 0.0009,
    "below300": 0.177,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0204,
    "clicks": 0,
    "midis": [
      82
    ],
    "cents": [
      -0.9
    ],
    "partials": [
      1,
      2,
      3
    ]
  },
  "drill.piano.83": {
    "path": "drill/piano/83.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@83",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36595,
    "sha256": "3e91091d02ec3c02e29f45e41ce42015b5e1e6995cc34fb9b6cbd5ea9a980dbc",
    "seconds": 2.9,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -7.9,
    "lead": 0.0012,
    "below300": 0.035,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0226,
    "clicks": 0,
    "midis": [
      83
    ],
    "cents": [
      0.0
    ],
    "partials": [
      1,
      2
    ]
  },
  "drill.piano.84": {
    "path": "drill/piano/84.m4a",
    "family": "drill_note",
    "kind": "sound",
    "piece": "piano_note@84",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 36335,
    "sha256": "1dd45a315b85e0405b65c21fa4680ee5a9fcec45e9a226d8a9d386a214a11e08",
    "seconds": 2.8787,
    "channels": 1,
    "lufs": -20.0,
    "measure": "M",
    "peak": -6.9,
    "lead": 0.0013,
    "below300": 0.042,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0212,
    "clicks": 0,
    "midis": [
      84
    ],
    "cents": [
      -0.1
    ],
    "partials": [
      1,
      2
    ]
  },
  "drill.tick": {
    "path": "drill/tick.m4a",
    "family": "drill_beat",
    "kind": "sound",
    "piece": "drill_sounds@tick",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4615,
    "sha256": "fe985832f4bc13fdbb96fe8c212efd2ea8af102cfd79203042773266d3c398a6",
    "seconds": 0.276,
    "channels": 1,
    "lufs": -6.0,
    "measure": "TP",
    "peak": -6.0,
    "lead": 0.0002,
    "below300": 0.085,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.031,
    "clicks": 0,
    "tracker": {
      "frames": 23,
      "heard": 0,
      "midis": []
    }
  },
  "drill.tick.accent": {
    "path": "drill/tick-accent.m4a",
    "family": "drill_beat",
    "kind": "sound",
    "piece": "drill_sounds@tick-accent",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 4875,
    "sha256": "9e42a83f5514f4b616294d81ce762d9d8cd8ef815fe10e7b6246c7dbf5beccb2",
    "seconds": 0.2973,
    "channels": 1,
    "lufs": -5.3,
    "measure": "TP",
    "peak": -5.3,
    "lead": 0.0002,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.031,
    "clicks": 0,
    "tracker": {
      "frames": 26,
      "heard": 0,
      "midis": []
    }
  },
  "fx.chime.beat": {
    "path": "fx/drill/chime-beat.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "drill_sounds@chime-beat",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 25935,
    "sha256": "45e36528526e89058ad8e52e2c3452489351bf3910ff2542a4e1358d9dfe0aca",
    "seconds": 2.0253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.0,
    "lead": 0.0007,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3388,
    "clicks": 0
  },
  "fx.chime.caught": {
    "path": "fx/drill/chime-caught.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "drill_sounds@chime-caught",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 23855,
    "sha256": "cef05cedf49eccd6303a40efdc8761adefa8522ae1c1fcb4a717810648cbf18d",
    "seconds": 1.8547,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.9,
    "lead": 0.0002,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1271,
    "clicks": 0
  },
  "fx.chime.take": {
    "path": "fx/drill/chime-take.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "drill_sounds@chime-take",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 24635,
    "sha256": "eab7a4dfe60fbd74a0479bc197194b73359cc58e24284fd0830bc888e92a42b1",
    "seconds": 1.9187,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.9,
    "lead": 0.0004,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.2665,
    "clicks": 0
  },
  "fx.combo.1": {
    "path": "fx/drill/combo-1.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "drill_sounds@combo-1",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 19695,
    "sha256": "2b3f29215ab0c1e9762614c629af54396541b7a108bcb1ae014eda0f51cf4596",
    "seconds": 1.5133,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -2.6,
    "lead": 0.0011,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1127,
    "clicks": 0
  },
  "fx.combo.2": {
    "path": "fx/drill/combo-2.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "drill_sounds@combo-2",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 20995,
    "sha256": "c8d6db9267679273b463c264336c90f398d27420a43723f05b5831bceca892b6",
    "seconds": 1.62,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.0,
    "lead": 0.001,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1128,
    "clicks": 0
  },
  "fx.combo.3": {
    "path": "fx/drill/combo-3.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "drill_sounds@combo-3",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 22342,
    "sha256": "7cb8412c2ad5c99e7ee0f64d5eb7d7bded45a9bc7dbaecc6f3f1082f81395676",
    "seconds": 1.7267,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.8,
    "lead": 0.001,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3309,
    "clicks": 0
  },
  "fx.combo.4": {
    "path": "fx/drill/combo-4.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "drill_sounds@combo-4",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 23855,
    "sha256": "9806f46725932be785596704c19456fe15f91c059f596b1253658b80178f0aa9",
    "seconds": 1.8547,
    "channels": 1,
    "lufs": -16.1,
    "measure": "M",
    "peak": -5.0,
    "lead": 0.001,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3342,
    "clicks": 0
  },
  "fx.place.camping.hit": {
    "path": "fx/camping/hit.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "camping_fire@hit",
    "version": 1,
    "libraries": [
      "freesound-414767"
    ],
    "bytes": 12415,
    "sha256": "474bc8f65946b9a2b4588a7bf56890fbbcf0fc6d5757706833b01bcaf1abb6ed",
    "seconds": 0.916,
    "channels": 1,
    "lufs": -6.5,
    "measure": "TP",
    "peak": -6.5,
    "lead": 0.0011,
    "below300": 0.002,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.2865,
    "clicks": 0
  },
  "fx.place.jungle.hit": {
    "path": "fx/jungle/chirp.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_taps@chirp",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 11375,
    "sha256": "7910f39dc0905ab86c75f08aa616134013779f6d22183ac8cbde5290d2a3fe58",
    "seconds": 0.8307,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.4,
    "lead": 0.0009,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0425,
    "clicks": 0
  },
  "fx.place.jungle.miss": {
    "path": "fx/jungle/hoot.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_voices@hoot",
    "version": 1,
    "libraries": [
      "designer-voice"
    ],
    "bytes": 6175,
    "sha256": "dc40a0c38ed8565bf632f63a2474bec5158b6f05c2ae98ecc94d83bd7a2d70b8",
    "seconds": 0.404,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.6,
    "lead": 0.0015,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0673,
    "clicks": 0
  },
  "fx.place.onsen.hit": {
    "path": "fx/onsen/hit.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "onsen_taps@hit",
    "version": 1,
    "libraries": [
      "freesound-771257"
    ],
    "bytes": 4095,
    "sha256": "b515fa80db4740958d675985321de1efe46477d669d8771ac2a7e3d035d2dbc4",
    "seconds": 0.2333,
    "channels": 1,
    "lufs": -6.2,
    "measure": "TP",
    "peak": -6.2,
    "lead": 0.003,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0244,
    "clicks": 0
  },
  "fx.place.onsen.miss": {
    "path": "fx/onsen/miss.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "onsen_taps@miss",
    "version": 1,
    "libraries": [
      "freesound-771257"
    ],
    "bytes": 4355,
    "sha256": "07a249c92d63c5cc5c6152c5d6b0b5afff785838e07bd9c94837cb91b24caed9",
    "seconds": 0.2547,
    "channels": 1,
    "lufs": -6.1,
    "measure": "TP",
    "peak": -6.1,
    "lead": 0.003,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0153,
    "clicks": 0
  },
  "fx.place.station.hit": {
    "path": "fx/station/hit.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@hit",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 21515,
    "sha256": "1cb6c798aba5db17d8b392fee4a290e467fdf8782d44459cd8c9ae0c1b6463c0",
    "seconds": 1.6627,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -10.4,
    "lead": 0.0004,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0137,
    "clicks": 0
  },
  "fx.place.station.miss": {
    "path": "fx/station/miss.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@miss",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 13195,
    "sha256": "b3040506a11492faf4da8b183a3c810ed3b3b38967ec8ee580f41eb9f46c5534",
    "seconds": 0.98,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.2,
    "lead": 0.0002,
    "below300": 0.023,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0625,
    "clicks": 0
  },
  "fx.tap.acorn": {
    "path": "fx/jungle/acorn.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "jungle_taps@acorn",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 9555,
    "sha256": "5e192cb2ef8c7ff80214985502c64be853978039294338528e7cb13e9d430702",
    "seconds": 0.6813,
    "channels": 1,
    "lufs": -6.1,
    "measure": "TP",
    "peak": -6.1,
    "lead": 0.0003,
    "below300": 0.333,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0152,
    "clicks": 0
  },
  "fx.tap.bird-1": {
    "path": "fx/jungle/bird-1.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_taps@bird-1",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 15344,
    "sha256": "d7026a0ca4d329eb866b5f2478759e821e87731012f0ff466988d0aac7aa41cc",
    "seconds": 1.1507,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -10.6,
    "lead": 0.0009,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3863,
    "clicks": 0
  },
  "fx.tap.bird-2": {
    "path": "fx/jungle/bird-2.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_taps@bird-2",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 16055,
    "sha256": "c1c3d756e139700eb0c113ea7eb91eed50881a1429367604e7f1f3a9515dbe9c",
    "seconds": 1.2147,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -10.9,
    "lead": 0.0009,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.5353,
    "clicks": 0
  },
  "fx.tap.bird-3": {
    "path": "fx/jungle/bird-3.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_taps@bird-3",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 15795,
    "sha256": "b1f00df762a90d0702cbb08a1065f1e4e5792320ea25a8b25db3d972b304d51d",
    "seconds": 1.1933,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -10.5,
    "lead": 0.0006,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.4102,
    "clicks": 0
  },
  "fx.tap.carriage": {
    "path": "fx/station/carriage.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@carriage",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 30615,
    "sha256": "d3fc805f8a867e7832359da55d9dcfecbef9be9baed722c167f78f671bef773d",
    "seconds": 2.4093,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.7,
    "lead": 0.0005,
    "below300": 0.122,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.4246,
    "clicks": 0
  },
  "fx.tap.cat": {
    "path": "fx/onsen/cat.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "onsen_taps@cat",
    "version": 1,
    "libraries": [
      "freesound-262311"
    ],
    "bytes": 6435,
    "sha256": "40deed45abde406ddb3cf1768c89425573fcd65daaddfb382c51f08ddfde0123",
    "seconds": 0.4253,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.9,
    "lead": 0.0023,
    "below300": 0.007,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1834,
    "clicks": 0
  },
  "fx.tap.cat@jungle": {
    "path": "fx/jungle/cat.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_voices@cat",
    "version": 1,
    "libraries": [
      "freesound-714179"
    ],
    "bytes": 12155,
    "sha256": "36559d5402781761bb0af6e9e0e48e02c5f58aafd25241b14c9835be65a1ed63",
    "seconds": 0.8947,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -7.7,
    "lead": 0.0017,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.2592,
    "clicks": 0
  },
  "fx.tap.chime": {
    "path": "fx/station/chime.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@chime",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 31738,
    "sha256": "64f1ee8f6eccc8a2e1c1e9b699160a7219d340cfc6e406165a8fdc57f0c1f954",
    "seconds": 2.4947,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.9,
    "lead": 0.0001,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.492,
    "clicks": 0
  },
  "fx.tap.clock": {
    "path": "fx/station/clock.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@clock",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 39715,
    "sha256": "ba9e8ac11d6ec8f76fd082f039c62cd72bc5ec7f1c8d8fe550c66a20e36e5d83",
    "seconds": 3.156,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.7,
    "lead": 0.0019,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1612,
    "clicks": 0
  },
  "fx.tap.dunk": {
    "path": "fx/onsen/dunk.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "onsen_taps@dunk",
    "version": 1,
    "libraries": [
      "freesound-771257"
    ],
    "bytes": 5395,
    "sha256": "09ac5adbdb7746727eefd3ddb3b433f1e1c0d5b48ecf617eb86f6509687d391b",
    "seconds": 0.34,
    "channels": 1,
    "lufs": -6.0,
    "measure": "TP",
    "peak": -6.0,
    "lead": 0.003,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0075,
    "clicks": 0
  },
  "fx.tap.ekiben": {
    "path": "fx/station/ekiben.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@ekiben",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 15535,
    "sha256": "4ae14073050968123c62c53328b6ee92ad09732508f24cd92d76e49f6a0c0184",
    "seconds": 1.172,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.5,
    "lead": 0.0003,
    "below300": 0.131,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3442,
    "clicks": 0
  },
  "fx.tap.fire": {
    "path": "fx/camping/fire.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "camping_fire@fire",
    "version": 1,
    "libraries": [
      "freesound-475879",
      "freesound-414767"
    ],
    "bytes": 16055,
    "sha256": "7117cd1fc1d9c9925f25bc87be096680e5354770595e6ef94d330ecae79606c8",
    "seconds": 1.2147,
    "channels": 1,
    "lufs": -5.7,
    "measure": "TP",
    "peak": -5.7,
    "lead": 0.0027,
    "below300": 0.03,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.4401,
    "clicks": 0
  },
  "fx.tap.heart": {
    "path": "fx/jungle/heart.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_taps@heart",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 22035,
    "sha256": "f1d74350fcb8721ddafb77ae8dada0960f7a0295bab4eb1c6994bbed431878c9",
    "seconds": 1.7053,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -8.1,
    "lead": 0.0003,
    "below300": 0.01,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1988,
    "clicks": 0
  },
  "fx.tap.judge": {
    "path": "fx/onsen/judge.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "onsen_taps@judge",
    "version": 1,
    "libraries": [
      "vcsl",
      "designer-voice"
    ],
    "bytes": 13715,
    "sha256": "64b89261ba55dc4b60711df2c47a27bf166d55e59cd01c6bfe582d94b66c295a",
    "seconds": 1.0227,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.5,
    "lead": 0.002,
    "below300": 0.704,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.255,
    "clicks": 0
  },
  "fx.tap.lamp": {
    "path": "fx/onsen/lamp.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "onsen_taps@lamp",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 23595,
    "sha256": "eef6ef9a967abbb86c533c28b0803a8ecdd1782295eb4ae62f9d0c8a8ea9fe42",
    "seconds": 1.8333,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -9.9,
    "lead": 0.0004,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0137,
    "clicks": 0
  },
  "fx.tap.leaf": {
    "path": "fx/jungle/leaf.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_leaf",
    "version": 1,
    "libraries": [
      "freesound-437356"
    ],
    "bytes": 14495,
    "sha256": "b4a962b263c4e749bee58e19872598e18e5ea61ad5db66f9e17aaf1335096994",
    "seconds": 1.0867,
    "channels": 1,
    "lufs": -16.1,
    "measure": "M",
    "peak": -4.8,
    "lead": 0.0017,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.2286,
    "clicks": 0
  },
  "fx.tap.monkey": {
    "path": "fx/jungle/monkey.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "jungle_voices@monkey",
    "version": 1,
    "libraries": [
      "designer-voice"
    ],
    "bytes": 9295,
    "sha256": "4071582b33cc6090885683705c7afa9ddd0bb918b8722bfd3d1c2bfbf95d3275",
    "seconds": 0.66,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -6.5,
    "lead": 0.0027,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3155,
    "clicks": 0
  },
  "fx.tap.onsen-monkey": {
    "path": "fx/onsen/monkey.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "onsen_new_taps@monkey",
    "version": 1,
    "libraries": [
      "vcsl",
      "freesound-771257"
    ],
    "bytes": 12155,
    "sha256": "d8fea3757a68826aa109d5b8e99b248465e556bdf496ec22e16a1cbef1ad79fa",
    "seconds": 0.8947,
    "channels": 1,
    "lufs": -6.0,
    "measure": "TP",
    "peak": -6.0,
    "lead": 0.003,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0175,
    "clicks": 0
  },
  "fx.tap.postbox": {
    "path": "fx/station/postbox.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@postbox",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 23335,
    "sha256": "96b68a1606359ee5a8552418b1833c63d535427f621241b3096c757ba13786b8",
    "seconds": 1.812,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -2.2,
    "lead": 0.003,
    "below300": 0.146,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.2791,
    "clicks": 0
  },
  "fx.tap.shishi": {
    "path": "fx/onsen/shishi.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "onsen_new_taps@shishi",
    "version": 1,
    "libraries": [
      "vcsl",
      "freesound-771257"
    ],
    "bytes": 20269,
    "sha256": "9960ef7f90ba8aa60190d3116769142c4ece9de012293451e91ab756e7c071af",
    "seconds": 1.556,
    "channels": 1,
    "lufs": -6.1,
    "measure": "TP",
    "peak": -6.1,
    "lead": 0.003,
    "below300": 0.426,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.6165,
    "clicks": 0
  },
  "fx.tap.signal": {
    "path": "fx/station/signal.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@signal",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 29575,
    "sha256": "ebb10337e330513673f508218dae191a61a43c2617248e07cab63fa248465a5b",
    "seconds": 2.324,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.1,
    "lead": 0.0018,
    "below300": 0.314,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3669,
    "clicks": 0
  },
  "fx.tap.ticket": {
    "path": "fx/station/ticket.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@ticket",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 20475,
    "sha256": "46649e4273c99508a3fba87b91721f52ad5f2c7984d41fc05ae8d668d331621b",
    "seconds": 1.5773,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -3.8,
    "lead": 0.0018,
    "below300": 0.013,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.2201,
    "clicks": 0
  },
  "fx.tap.toyloco": {
    "path": "fx/station/toyloco.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@toyloco",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 16575,
    "sha256": "c9c048efc85a877defee4338acb7edeaf58ad6ffb98b8764a6890013f975f9f1",
    "seconds": 1.2573,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -9.2,
    "lead": 0.0007,
    "below300": 0.011,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.1398,
    "clicks": 0
  },
  "fx.tap.train": {
    "path": "fx/station/train.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "station_taps@train",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 29315,
    "sha256": "316c87e519ffdb337ee3bc3a6ca03ab79688b8a0f595012b5e6c55630cb3faa9",
    "seconds": 2.3027,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -5.7,
    "lead": 0.0002,
    "below300": 0.009,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3026,
    "clicks": 0
  },
  "fx.tap.train-in": {
    "path": "fx/station/train-in.m4a",
    "family": "fx_long",
    "kind": "sound",
    "piece": "station_taps@train-in",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 51935,
    "sha256": "7ca91d6b150faa9327ab50eeee1cac98aaa3abef533d96d262d0f14f6827e269",
    "seconds": 4.1587,
    "channels": 1,
    "lufs": -18.0,
    "measure": "M",
    "peak": -5.9,
    "lead": 0.0002,
    "below300": 0.031,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.3094,
    "clicks": 0
  },
  "fx.tap.train-out": {
    "path": "fx/station/train-out.m4a",
    "family": "fx_long",
    "kind": "sound",
    "piece": "station_taps@train-out",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 46995,
    "sha256": "0597a47af2fdfe92a5c0038099e0cfda7a5b0034227a706b61492a4b5c5c0874",
    "seconds": 3.7533,
    "channels": 1,
    "lufs": -18.0,
    "measure": "M",
    "peak": -8.0,
    "lead": 0.0021,
    "below300": 0.003,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 1.5805,
    "clicks": 0
  },
  "fx.tap.waterfall": {
    "path": "fx/jungle/waterfall.m4a",
    "family": "fx_knock",
    "kind": "sound",
    "piece": "jungle_water",
    "version": 1,
    "libraries": [
      "freesound-364700",
      "freesound-454340",
      "freesound-660259",
      "freesound-771257"
    ],
    "bytes": 20995,
    "sha256": "be03488a6d92056cdb3b3ad004c8d11440010de8911f87b727a778a8e4cc013f",
    "seconds": 1.62,
    "channels": 1,
    "lufs": -6.1,
    "measure": "TP",
    "peak": -6.1,
    "lead": 0.003,
    "below300": 0.048,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0274,
    "clicks": 0
  },
  "fx.tap.window": {
    "path": "fx/onsen/window.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "onsen_taps@window",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 20735,
    "sha256": "8ecd2e20b2027febab2747d0248fe51a940c3862f1125423072f782d18671f9e",
    "seconds": 1.5987,
    "channels": 1,
    "lufs": -16.0,
    "measure": "M",
    "peak": -4.8,
    "lead": 0.0006,
    "below300": 0.0,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0734,
    "clicks": 0
  },
  "fx.tap.yuzu": {
    "path": "fx/onsen/yuzu.m4a",
    "family": "fx",
    "kind": "sound",
    "piece": "onsen_taps@yuzu",
    "version": 1,
    "libraries": [
      "vcsl"
    ],
    "bytes": 11635,
    "sha256": "5b01fac49f5801fd3dbe3c7b945786d0f6c22455666903bd3b482a8c9c48b9e9",
    "seconds": 0.852,
    "channels": 1,
    "lufs": -16.1,
    "measure": "M",
    "peak": -2.7,
    "lead": 0.0018,
    "below300": 0.001,
    "monoLoss": 0.0,
    "tags": [],
    "attack": 0.0958,
    "clicks": 0
  },
  "music.home.yuzu.golden": {
    "path": "music/home-yuzu-golden.m4a",
    "family": "music_long",
    "kind": "loop",
    "piece": "home_yuzu_golden",
    "version": 1,
    "libraries": [
      "vcsl",
      "sneakybass"
    ],
    "loopStart": 0.125,
    "loopEnd": 162.125,
    "loopSeconds": 162.0,
    "bpm": 80,
    "bars": 54,
    "beatsPerBar": 4,
    "bytes": 2632665,
    "sha256": "061fbcafad4595564c72724d9cd943b8c95aaf080a534e421b0f184d9bec3456",
    "seconds": 162.5373,
    "channels": 2,
    "lufs": -18.1,
    "measure": "I",
    "peak": -2.1,
    "lead": 0.0,
    "below300": 0.336,
    "monoLoss": 1.14,
    "tags": [],
    "joinJump": 1.36,
    "loopResidual": -30.2,
    "clicks": 0,
    "head": {
      "path": "music/home-yuzu-golden-head.m4a",
      "bytes": 488163,
      "sha256": "0a4df00a91e354a3eba541d2f710db5c35052e9527ec5055895ef44f09851b32",
      "seconds": 30.0147,
      "same": -200.0,
      "tags": []
    }
  },
  "music.home.yuzu.morning": {
    "path": "music/home-yuzu-morning.m4a",
    "family": "music_long",
    "kind": "loop",
    "piece": "home_yuzu",
    "version": 4,
    "libraries": [
      "vcsl",
      "sneakybass"
    ],
    "loopStart": 0.125,
    "loopEnd": 147.39772916666666,
    "loopSeconds": 147.27272916666666,
    "bpm": 88,
    "bars": 54,
    "beatsPerBar": 4,
    "bytes": 2393839,
    "sha256": "a35d1499cb4a4e6c80ebf1c50cc6458edf30ef666ac3c3ecfc80399b24cd0c30",
    "seconds": 147.796,
    "channels": 2,
    "lufs": -18.0,
    "measure": "I",
    "peak": -2.9,
    "lead": 0.0,
    "below300": 0.341,
    "monoLoss": 1.13,
    "tags": [],
    "joinJump": 1.55,
    "loopResidual": -28.4,
    "clicks": 0,
    "head": {
      "path": "music/home-yuzu-morning-head.m4a",
      "bytes": 488157,
      "sha256": "72f07acf6de41b8b711cd663a4398578a2f988a75941185587211e1f3ff3a5c6",
      "seconds": 30.0147,
      "same": -200.0,
      "tags": []
    }
  },
  "music.home.yuzu.night": {
    "path": "music/home-yuzu-night.m4a",
    "family": "music_long",
    "kind": "loop",
    "piece": "home_yuzu_night",
    "version": 2,
    "libraries": [
      "vcsl",
      "sneakybass"
    ],
    "loopStart": 0.125,
    "loopEnd": 145.38816666666668,
    "loopSeconds": 145.26316666666668,
    "bpm": 76,
    "bars": 46,
    "beatsPerBar": 4,
    "bytes": 2361841,
    "sha256": "909b10596dbfd07b87d7230652a65d79e499a434109f3d0cbaabe70dbbed25f2",
    "seconds": 145.7907,
    "channels": 2,
    "lufs": -18.0,
    "measure": "I",
    "peak": -3.6,
    "lead": 0.0,
    "below300": 0.307,
    "monoLoss": 1.36,
    "tags": [],
    "joinJump": 1.31,
    "loopResidual": -27.9,
    "clicks": 0,
    "head": {
      "path": "music/home-yuzu-night-head.m4a",
      "bytes": 487589,
      "sha256": "82dbef7fe6c19cf77b5c9dc270c1f6acf39b3afb96d3e225384ae040d951f7ce",
      "seconds": 30.0147,
      "same": -200.0,
      "tags": []
    }
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
