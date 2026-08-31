# Master Trade System V1.30.1
## Master Trade Matrix V1.3 — Frozen
### 2025 H2 Backtest Operating Matrix + Shadow Research Overlay

## V1.30.1 修正

### 1. Trade Objective正式分開顯示

「完整判斷」及Live Decision會直接顯示：

- Expansion
- Reaction
- Not sure
- Skip（Final Size = 0 / Hard Veto）

Reaction-first唔再當正式Trade Objective。

另外獨立顯示：

> Reaction-first Shadow = Reaction-first / Expansion-eligible

主要用於同向有弱勢、Aligned Transition、Single Directional Transition + Confirmed等Q3 context，研究post-entry control confirmation。

### 2. Strong Retest Shadow可以正式收數據

新增：

- ATR14 at Entry
- Largest Opposing Candle Body
- Strong Retest Shadow Metric = Largest Opposing Candle Body / ATR14

輸入ATR14及Body後，App自動計ratio。
如果已經自行計好ratio，可以直接輸入Strong Retest Shadow Metric。

呢個metric只作Shadow Research：
- 唔自動改Native Q
- 唔改Size
- 唔改Valid Candidate
- 唔反改歷史Decision
- 暫時唔設Strong threshold

紀錄庫可以事後修改三項Strong Shadow數據。

## Frozen V1.3保持不變

Direction Permission、Market Cap、P/Q Matrix、E/P2-E、Q2 subtype、
Range、Obstacle、Hard Veto、Final Size、Deep-RF Frozen management全部不變。

Fast Ratio、Reclaim/Retest Bars及Distance仍然唔新增。

## CSV

V1.30.0 = 160欄
V1.30.1 = 164欄

新增：
- Reaction-first Shadow Class
- ATR14 at Entry
- Largest Opposing Candle Body
- Strong Retest Shadow Metric

舊CSV仍可匯入。
