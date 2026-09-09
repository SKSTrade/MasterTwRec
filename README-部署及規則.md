# Master Trade System V1.30.9
## Master Trade Matrix V1.3 — Frozen
### 2025 H2 P3 Context Shadow｜PB / MID / EXT

## P3 Context正式分三類

當 Raw P = P3：

- P3-PB｜Pullback
- P3-MID｜Neutral / Mid-location
- P3-EXT｜Extension

### P3-PB
價格有明確回調到次判次結／working support附近（Short鏡像working resistance），有location advantage。

### P3-MID
價格已離開次判次結，但又未去到最新走勢尾部。位置中性：唔算靚pullback，亦唔算chase。

### P3-EXT
價格已去到最新走勢較尾／premium區（Short鏡像discount區），冇真正pullback，再做順勢setup。

## 暫時唔用固定Fib Threshold
2025 H2第一輪只用結構語義分類；唔加入0.5 Fib／0.75 Fib等未驗證threshold。

## Frozen規則
P3 Context只係Shadow分類，三類完全唔改注碼。

- Raw P3-PB + E → P2-E
- Raw P3-MID + E → P2-E
- Raw P3-EXT + E → P2-E

之後全部照Frozen V1.3 P2-E Matrix計。

PB唔額外加Size；MID唔額外加減Size；EXT唔額外減Size；EXT亦唔取消E升級。

## Research
完成2025 H2後比較：

- P3-PB vs P3-MID vs P3-EXT
- P2-E（Raw P3-PB）
- P2-E（Raw P3-MID）
- P2-E（Raw P3-EXT）

再配合 Market State、Native Q / Q2 subtype、Enhancement E、
Retest ATR Ratio、Retest Internal Structure、Retest Acceptance、
Expectancy / PF / MFE / MAE / RF / TP2。

## CSV
CSV欄位數維持167。
原有 `P3 Context` 欄直接支援 PB / MID / EXT，唔需要新增新欄。
舊CSV嘅PB／EXT保持兼容。
