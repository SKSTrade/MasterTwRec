# Master Trade System V1.30.0
## Master Trade Matrix V1.3 — Frozen
### 2025 H2 Backtest Operating Matrix + Shadow Research Overlay

核心原則：

- 2025 H2全程用Frozen V1.3做當時Decision。
- Shadow Research只記錄，唔反過來改Valid Candidate、P/Q、Size、Objective、Entry、Management。
- 完成2025 H2後，先同2025 H1 + 2026 H1一齊研究V1.4。

## Objective at Entry

V1.30.0正式輸出：
- Expansion
- Reaction-first
- Reaction
- Skip

Expansion只畀成熟、方向一致、Native Q3、P1/P2/P2-E、Clean >=2R嘅情況。
同向有弱勢、Aligned Transition、Single Directional Transition + Confirmed嘅合資格Q3，會標記Reaction-first作Shadow Upgrade研究。
Direction Conflict、Counter-main、Q2、Mixed/Neutral、1.5–<2R obstacle等仍偏Reaction。

Size Matrix本身冇改。

## 0.25 Cap Reason

App自動產生：
- Primary Cap Reason
- Additional Cap Flags

Primary分類：
- Aligned Transition
- Counter Weak Main
- HTF P1 Probe
- Mixed Transition
- Obstacle / RR
- Raw P3 → P2-E
- Other

## Normalized R

App自動計：

Normalized R = Actual R / Final Size

目的係將Position Size影響同Setup本身表現拆開。
Final Size <= 0或冇Actual R時留空/N/A。

## Shadow Research人手欄位

- Post-entry Objective Upgrade
  - No
  - Reaction → Expansion
- Deep-RF Triggered
- RF後原SL有冇被打
- RF後Shadow MFE R
- 如果冇RF最終結果 R

呢批只係Counterfactual Research，唔改Frozen Management。

## Strong Retest / ATR

Fast Ratio、Reclaim Bars、Reclaim Distance、Retest Bars、Retest Distance全部唔加。

ATR14 at Entry同Largest Opposing Candle Body / ATR14只有喺App可以可靠自動取得OHLC market data先應該收。
目前Standalone PWA冇price-feed，所以V1.30.0唔增加ATR手填欄位，避免data-entry負擔。

## CSV

V1.29.2：150欄
V1.30.0：160欄

新增：
- Shadow Research Version
- 0.25 Primary Cap Reason
- 0.25 Additional Cap Flags
- Normalized R
- Objective at Entry
- Post-entry Objective Upgrade
- Deep-RF Triggered
- Deep-RF RF後原SL被打
- Deep-RF Shadow MFE R
- Deep-RF No-RF Final R

舊CSV冇呢啲欄仍可匯入。

## 保持不變

- Frozen V1.3 Size Matrix / Direction Permission
- Raw P / E / Execution P / Native Q separation
- Q2 subtype rules
- Obstacle / RR hard gate
- Deep Retest原Frozen management
- Valid Candidate定義
- Record numbering
- Product/date filters
- Record-library editing
- Image lightbox
- LocalStorage key
- IndexedDB image database
