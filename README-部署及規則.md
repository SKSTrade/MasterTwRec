# Master Trade System V1.30.24
## V1.3 Production｜Entry-TF Main Structure Shadow + T0-Balance / T0-Post-Break

### 今版新增：Entry-TF Main Structure

新增一個同 `Entry-TF Working Structure` 完全平行嘅入場時研究欄位：

`Entry-TF Main Structure`

只判斷 **Entry TF喺真正入場嗰一刻** 嘅 Official Main Structure 狀態，相對於交易方向分三類：

- `Opposing Intact`：入場TF原本反交易方向嘅 Official Main Structure 入場時仍未被有效破壞。
- `Opposing Broken / Transition`：反向 Official Main Structure 已被有效破壞，但新嘅順交易方向 Main Structure / Trend 尚未正式建立。
- `Aligned`：入場TF Official Main Structure 已經同交易方向一致。

同 Working Structure 一樣：

- Main Journal可直接記錄；
- Record Library可事後補填／修改；
- Record Detail會顯示；
- CSV可以Export / Import；
- 舊CSV冇呢欄時自動留空；
- **Shadow only：唔改P、Q、Direction Permission、Size、Valid Candidate、Objective、Obstacle/RR或Management。**

Shadow Research Version：`2025 H2 Shadow Overlay v13`。

### T0-Balance / T0-Post-Break

V1.30.23已落實嘅T0修正完整保留，今版冇再改數值或route邏輯。

核心原則仍然係：

> **25% Rule屬於 Auction Balance Location Filter，唔屬於 Transition Neutral 本身。**

同時：

> **T0-Post-Break解除25% hard restriction，但唔解除Neutral size cap；Post-Break Direction唔係正式Direction Vote。**

流程：

> Market State → T0 subtype → Direction Permission → Location eligibility → P → Q → Route cap → Size

### T0-Balance

真正Two-way Auction / Range。如果Entry仍然受該Balance Auction直接約束：

- True Boundary P1 + Q3 = 0.5
- True Boundary P1 + Q2 = 0.25
- P2 / P2-E + Q3 = 0.25
- P2 / P2-E + Q2 = 0
- P3 + Q3 = 0.25 / 0，只限Meaningful Boundary
- P3 + Q2 = 0
- Balance Middle = 0

只有呢類情況先套25% / true-boundary filter。

如果Entry已離開／唔再受該Auction直接約束，可設：

`T0-Balance Auction Constraint = Released`

解除25% Filter，但Neutral route cap唔會提高。

### T0-Post-Break

代表：

- 舊Trend authority已失效；
- Break方向有repricing / momentum；
- 新Working Control未正式建立。

所以：

- 唔套25% hard restriction；
- Break Direction唔係正式Direction Vote；
- 唔會因Break + Hold + Extend直接當Healthy / Weak Trend；
- Neutral Size Cap仍然保留。

Directional + T0-Post-Break沿用現有Directional + Neutral待遇：P1/P2/P2-E + Q3最高0.5、Q2最高0.25；P3 + Q3只限meaningful location。

### T0-Post-Break × T0-Post-Break

兩層都未有正式Directional Control。如果兩層Post-Break Direction相同，而且Trade順共同Break方向：

- P1 / P2 / P2-E + Q3 = 0.25
- P3 + Q3 = 0.25 / 0，只限Meaningful Location
- Q2 = 0
- P4 = 0

共同Break方向只係Momentum Context，唔係Trend confirmation。

### T0-Balance × T0-Post-Break

未有正式Directional Control前：

- Max 0.25
- Q3 only
- P1/P2/P2-E要有Meaningful Location
- P3 + Q3只限Meaningful Location
- Q2 = 0

Entry仍喺Balance Auction內就保留25% Filter；已離開該Auction就解除Filter，但Max仍然0.25。

### Journal / CSV

T0既有保存欄位保持：

- 主判T0 Subtype
- 主判T0 Post-Break Direction
- 次判T0 Subtype
- 次判T0 Post-Break Direction
- T0-Balance Auction Constraint

今版再新增：

- `Entry-TF Main Structure`

CSV由171欄增加至 **172欄**。

舊CSV：

- 冇T0 subtype時，`轉換中－中性` 仍自動按 `T0-Balance` 處理；
- Auction Constraint預設 `Inside / Active`；
- 冇 `Entry-TF Main Structure` 欄時，該欄留空，唔會猜測歷史狀態。

### 保持不變

- V1.4未啟用
- T0 Production size數值／route邏輯保持V1.30.23
- Native Q規則不變
- P / E規則不變
- Obstacle / RR規則不變
- Valid Candidate Auto不變
- MFE > 3.9 → TP2 Yes不變
- Skip → Profit R 0不變
- localStorage / IndexedDB key不變
- ZIP round-trip、圖片、紀錄庫、舊CSV兼容保持
