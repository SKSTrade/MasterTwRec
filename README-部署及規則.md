# Master Trade System V1.30.8
## Master Trade Matrix V1.3 — Frozen
### 2025 H2 Retest Acceptance Shadow

## 新增Shadow欄位

> Retest Acceptance

只分：

- Hold
- Close Through

## 固定定義

### Hold

Retest可以wick／test穿reclaimed level，但Entry TF實體close仍守住level附近／原本reclaim嗰邊，
未形成另一邊acceptance。

Long例：
- Reclaim上某level
- Retest可以影線落穿
- 但Entry TF close仍守返level附近／上面

Short鏡像。

### Close Through

Entry TF candle實體close返去reclaimed level另一邊，
甚至一支或多支K開始喺嗰邊停留。

Long例：
- Reclaim上某level
- Retest後Entry TF實體close返level下面
- 甚至喺下面停留

代表原本reclaim acceptance可能開始流失。

## 同其他Shadow變數分工

Retest Strong Bar ATR Ratio：
> 反方向一支強Bar有幾大力

Retest Internal Structure：
> 反方向control有冇組織成結構

Retest Acceptance：
> Reclaimed level本身有冇守住acceptance

完成2025 H2後可研究：

- Acceptance × Internal Structure
- Acceptance × Retest ATR Ratio
- Acceptance × Reclaim ATR Ratio
- Acceptance × Market State
- Acceptance × Native Q / Q2-S
- Acceptance × Win/Loss / MFE / MAE / RF / TP2

## Frozen規則

Retest Acceptance純Shadow，唔自動修改：

- Native Q
- Q2-S
- Raw / Execution P
- Enhancement E
- Final Size
- Valid Candidate
- Trade Objective
- Obstacle / RR
- Management

2025 H2仍照Frozen V1.3原判斷。

## 紀錄庫

Retest Acceptance可以事後修改。

## CSV

V1.30.7 = 166欄  
V1.30.8 = 167欄

新增：
- Retest Acceptance

舊CSV冇呢欄時保持空白，正常匯入。
