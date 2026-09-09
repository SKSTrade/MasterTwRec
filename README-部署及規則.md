# Master Trade System V1.30.10
## Master Trade Matrix V1.3 — Frozen
### 2025 H2 Reclaim Micro Control Shadow

## 新增兩個Shadow欄位

### Reclaim Internal Structure

- None
- Structured

Structured固定定義：

Long Reclaim唔係幾支陽K就算，而係要清晰形成micro bullish control，例如：

> HH → HL → 再破micro HH

或者至少有一個明確defended HL，之後由呢個HL再推高完成reclaim／control expansion。

Short鏡像：

> LL → LH → 再LL

### Reclaim Active Micro Structure

如果Reclaim有多個HL／LH，固定用：

> Retest開始前最後一個已確認、並直接推動下一次micro HH／LL或完成control expansion嘅 defended HL／LH。

唔可以事後揀最方便嗰條舊swing。
如果最後一個候選只係noise、未形成清晰swing，就唔勉強記Structured。

### Retest vs Reclaim Structure

- N/A
- Hold
- Sweep-Reclaim
- Break-Accept

定義：

- N/A：Reclaim本身冇清晰Internal Structure
- Hold：Retest守住active reclaim defended HL／LH
- Sweep-Reclaim：插穿active micro structure，但迅速收返，冇另一邊acceptance
- Break-Accept：有效破壞active micro structure，close／企喺另一邊並有acceptance／follow-through

資料一致性：
- Reclaim Internal Structure = None → Retest vs Reclaim Structure自動N/A
- Reclaim Internal Structure = Structured → 先可選Hold / Sweep-Reclaim / Break-Accept

## 同現有Retest Shadow分工

- Retest Strong Bar ATR Ratio = 反方向force有幾大
- Retest Internal Structure = 對手有冇建立micro control
- Reclaim Internal Structure = 原本我方有冇建立micro control
- Retest vs Reclaim Structure = 對手有冇摧毀原本micro control
- Retest Acceptance = 較大reclaimed setup level有冇失去acceptance

Micro structure loss同setup-level acceptance loss唔係同一回事。

## Frozen V1.3

兩個新欄純Shadow，唔會自動改：

- Native Q
- Q2-S
- Raw / Execution P
- Enhancement E
- Final Size
- Valid Candidate
- Trade Objective
- Obstacle / RR
- Management

2025 H2仍然完全照Frozen V1.3原判斷。

## 紀錄庫

兩項都可以事後edit。

## CSV

V1.30.9 = 167欄
V1.30.10 = 169欄

新增：
- Reclaim Internal Structure
- Retest vs Reclaim Structure

舊CSV冇呢兩欄時保持空白，正常匯入。
