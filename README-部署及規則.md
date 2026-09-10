# Master Trade System V1.30.11
## Master Trade Matrix V1.3 — Frozen
### 2025 H2 Field Pruning

## 1. Raw P3 Type可喺紀錄庫修改

當歷史紀錄 Raw P = P3，紀錄庫會顯示：

- P3-PB
- P3-MID
- P3-EXT

只修改P3 Context Shadow，唔會重新計算Execution P、E、Native Q、Size或Objective。

## 2. 停止手動填／移出操作介面

以下欄位停止做2025 H2 active research：

- Reclaim Strong Bar ATR Ratio
- Retest Strong Bar ATR Ratio
- Relative ATR Ratio
- Reclaim Internal Structure獨立欄
- 入市後 Price Pattern正式欄
- Time to MFE

舊CSV仍可匯入以上舊欄，App會保留相容性；新版CSV唔再輸出佢哋。

入市後Price Pattern如有需要，寫入Notes。

## 3. Retest核心Shadow保留

- V1.3 Fast / Deep / Strong：Frozen Q判斷本身，唔改
- Retest Internal Structure：None / One-leg；Structured
- Retest vs Reclaim Structure：N/A / Hold / Sweep-Reclaim / Break-Accept
- Retest Acceptance：Hold / Close Through

Retest vs Reclaim Structure嘅 N/A 已同時代表：
> Reclaim本身冇清晰micro structure

所以唔再需要另外填Reclaim Internal Structure。

## 4. Objective欄簡化

Active source of truth只留：

### Objective at Entry
- Reaction
- Reaction-first
- Expansion

舊版：
- Not sure + Reaction-first Shadow eligible → Reaction-first
- Expansion → Expansion
- Reaction → Reaction
- 其他Not sure → Reaction
- Final Size 0 / Skip → N/A

### Post-entry Objective Upgrade
- No
- Yes

舊版 `Reaction→Expansion` 匯入時自動轉成 `Yes`。

Trade Objective V1.3同Reaction-first Shadow Class唔再作新版CSV active欄。

## 5. Conditional UI

### Deep-RF
平時只見：
- Deep-RF Triggered

只有選Yes先展開：
- RF後原SL有冇被打
- Shadow MFE
- No-RF Final R

### 0.25 Cap Reason
只有 Final Size = 0.25 先顯示：
- Primary Cap Reason
- Additional Cap Flags

兩項由App自動計。

### P3 Context
只有 Raw P = P3 先顯示PB / MID / EXT。

## 6. MFE / MAE / Time

保留：
- MFE
- MAE
- Time to RF

停止active填寫：
- Time to MFE

## 7. CSV

V1.30.10：169欄
V1.30.11：162欄

移除7個active export欄：
- Trade Objective V1.3
- Time to MFE
- 入市後 Price Pattern
- Reaction-first Shadow Class
- Reclaim Strong Bar ATR Ratio
- Retest Strong Bar ATR Ratio
- Reclaim Internal Structure

舊CSV保持匯入兼容。

## 8. Frozen V1.3

Field pruning唔會改：
- Direction Permission
- Market Route
- Raw / Execution P
- Enhancement E
- Native Q / Q2-S
- Final Size
- Valid Candidate
- Obstacle / RR
- Management
