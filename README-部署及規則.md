# Master Trade System V1.30.2
## Master Trade Matrix V1.3 — Frozen
### 2025 H2 Backtest Operating Matrix + Shadow Research Overlay

## V1.30.2｜Strong Bar ATR Ratio簡化

移除以下人手輸入：
- ATR14 at Entry
- Largest Opposing Candle Body

Shadow Research改為直接記錄兩個已計好嘅Ratio：

1. Reclaim Strong Bar ATR Ratio
2. Retest Strong Bar ATR Ratio

建議輸入形式：
- 1.20
- 0.82
- 0.55

兩者都係 Body / ATR14 ratio，但App唔再要求輸入ATR14同Body原始值。

用途：
- 比較Reclaim強度 vs Retest反向強度
- 研究Retest Strong程度同Expectancy / Loss Frequency
- 研究Reclaim/Retest strength relationship

呢兩項只作Shadow Research：
- 唔自動改Native Q
- 唔改Size
- 唔改Valid Candidate
- 唔改Trade Objective
- 暫時唔設Threshold

紀錄庫可以事後修改兩個Ratio。

## Trade Objective

正式Trade Objective仍然：
- Expansion
- Reaction
- Not sure
- Skip

Reaction-first / Expansion-eligible繼續獨立做Shadow分類，唔係正式Trade Objective。

## CSV

V1.30.1 = 164欄
V1.30.2 = 163欄

移除：
- ATR14 at Entry
- Largest Opposing Candle Body
- Strong Retest Shadow Metric

新增：
- Reclaim Strong Bar ATR Ratio
- Retest Strong Bar ATR Ratio

V1.30.1舊CSV嘅 Strong Retest Shadow Metric 匯入時會自動對應到 Retest Strong Bar ATR Ratio。
舊LocalStorage紀錄亦會繼續以舊 strongRetestShadowMetric 作Retest ratio fallback。

## Frozen V1.3保持不變

Direction Permission、Market Cap、P/Q Matrix、E/P2-E、Q2 subtype、
Range、Obstacle、Hard Veto、Final Size、Deep-RF Frozen management全部不變。
