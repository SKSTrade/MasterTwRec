# Master Trade System V1.31.1
## Matrix V1.4 Candidate — Automatic Journal Fields

今版將三個Journal欄位改為全自動，唔再人手輸入。

### Valid Candidate｜Auto
- V1.4 Final Entry Size > 0 → Yes
- V1.4 Final Entry Size = 0 → No

### 去唔去到TP2｜Auto
- MFE R > 3.9 → Yes
- 其他，包括3.9或未填MFE → No

### TP計劃｜Auto
- Runner Eligibility = Conditional → 80%於2R＋20%於4R Runner
- 其他 → 2R全平

TP計劃係Entry plan。Post-entry Gate仍跟V1.4：Responsive到2R就100%走；Initiative Confirmed先真正保留20%去4R。

### Record Library
三項都係readonly自動欄。修改MFE會更新TP2；修改P3 Context / Retest Structure / Acceptance / Auction Move會更新Runner-derived TP Plan；Valid Candidate由歷史Final Size自動決定。

### CSV / ZIP
CSV欄位數不變。匯出使用自動值；舊CSV / ZIP匯入亦會正規化。ZIP round-trip保持不變。

### Matrix
冇改V1.4 Candidate Direction Permission、Scenario Matrix、P3、E、Q2 Interaction、RR或Runner Eligibility規則；今版只自動化三個Journal衍生欄。
