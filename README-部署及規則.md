# Master Trade System V1.28.6｜Obstacle Presence Gate

## 障礙速查更新

Rulebook新增：

> ☐ 有第一真實障礙阻住

未Tick：
- Obstacle層唔限制Size
- 唔需要填第一障礙R
- 唔會因空白／預設數值產生RR Veto

Tick後先展開：
- 第一真實障礙距離R
- 障礙類型：普通／Soft 或 重大HTF／Hard
- 預定管理：正常、到障礙推RF、Partial＋RF

## Size規則

- 冇第一真實障礙：正常按Matrix／Range修正
- 普通障礙 ≥2R：Size不變，可按其他條件判Expansion
- 普通障礙 1.5–<2R：Size不變，Objective預設Reaction
- 重大HTF／Hard obstacle，且距離≥1.5R：Size降一級，Objective預設Reaction
- 任何第一真實障礙 <1.5R：Hard Veto＝0
- Tick有障礙但未填距離：暫時0，避免未量度空間就落單

## Live Decision

Live STEP 5同步改成同一套checkbox＋距離＋類型＋管理方式。

## Journal

「第一真實障礙R」由結果紀錄區移到「障礙速查」，避免令人以為每單Trade都一定要填。

CSV維持149欄：
- 冇障礙時「第一障礙R」留空
- 舊CSV仍可讀
- 原有障礙RF／Partial欄繼續保存管理選擇

Matrix V1.3其他Route、P/Q、E/E+、Q2 subtype、Trade Objective規則不改。
