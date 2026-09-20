# Master Trade System V1.31.0
## Master Trade Matrix V1.4 — Candidate｜2026/09

V1.4唔推翻V1.3。Direction Permission、Market State、Raw P、E、Native Q、RR／Obstacle同Route Cap骨架保留；V1.4將Location Quality、Execution Quality、Failure Interaction同Right-tail extraction正式拆開。

## 正式計算順序

Direction Permission → Relationship Route → Route Size Cap → Raw P → P3 Context → E / E Source → Execution P → Native Q → Q2 Interaction → Location / RR / Obstacle → Final Entry Size → Objective → Runner Eligibility → Post-entry Initiative Gate。

後面永遠唔可以救返前面嘅0：Direction Permission 0、P4／Range middle、冇Space等都唔會被Q3、E或Runner救返。

## V1.4 Scenario Matrix

1. 雙健康同向：Cap 1.0。Raw P1/P2 Q3＝1.0；Q2＝0.5；P3 Q3＝0.5；P3 Q2＝0.25。Raw P3→P2-E＋Q3 Candidate max 0.5。
2. 同向有弱勢：Cap 0.5。P1/P2/P2-E Q3＝0.5；Q2＝0.25；P3 Q3＝0.25；P3 Q2＝0。
3. Single Transition同方向：同Scenario 2；Objective Reaction-first。
4. 雙Transition同向：Cap 0.25。P1/P2/P2-E Q3＝0.25；Q2＝0；P3 Q3只限特殊清晰位置。
5. Directional + Neutral：Cap 0.5。P1/P2/P2-E Q3＝0.5；Q2＝0.25；P3 Q3只限meaningful boundary；Range middle＝0。
6. Neutral / Range Transition：True Boundary P1 Q3＝0.5、Q2＝0.25；P2/P2-E Q3＝0.25；Q2＝0；P3 Q3只限clear boundary；middle＝0。
7. Mixed Transition：順Main bias、P1/P2/P2-E＋Q3＝0.5 Candidate；Medium Negative／MID+Structured／control deterioration會阻止upgrade。逆Main通常0。
8. Direction Conflict：保留V1.3 permission skeleton，P2-E Q3唔當Raw P2 full treatment。
9. Hard Healthy-vs-Healthy Conflict：Default 0。
10. Counter Weak Main：只限既有Route A/B＋meaningful P1/P2＋Q3，0.25；Q2/P3＝0；Runner entry時No。
11. Counter Healthy Main：Default 0；Active HTF P1 reversal probe例外最高0.25，Reaction only，Runner No。
12. P4 / Middle / Chase：0；Q3/E救唔返。

## P3 Context

Raw P3身份永久保留：
- PB：正常參與P2-E待遇及Entry edge研究。
- MID：唔主動食V1.4 Size Upgrade；MID + Structured會阻止upgrade。
- EXT：唔會因Q3／P2-E變成真正Raw P2；Entry Size保守，成功後仍可研究Runner tail。

## E / E Source

E只可以P3→P2-E，唔可以P2→P1、Q2→Q3、P4→P2，亦唔會創造Direction Permission。

E Source正式記：Session / Mon H-L / PDH-PDL / HTF Structure / Other。
Mon H-L要求fresh first meaningful sweep／reclaim；PDH/PDL屬Conditional E，Raw P3最好再有HTF／working structure／range boundary等confluence。

## Q2 Negative Interaction

High：R + S + Structured；F + S。
Medium：S + Structured；F + Close Through。

Candidate處理：Medium只阻止Size Upgrade；High一級降注（1.0→0.5→0.25→0）仍待2026 H1確認先Freeze。單獨S、Structured、Close Through都唔會直接Hard Veto。

## Objective

- Expansion：主要雙健康同向＋高質Location＋Q3＋clean ≥2R。
- Reaction-first：同向弱勢、Single Transition、Directional + Neutral，或者P3-MID / P3-EXT等仍要市場證明嘅位置。
- Reaction：Neutral / Range、Mixed Transition、Direction Conflict、Counter-main、HTF reversal probe。

Post-entry Objective Upgrade只記 No / Reaction→Expansion；仍要求Break → Acceptance → Hold → Space，唔可以用事後MFE倒推Entry label。

## Runner Overlay

Runner Eligibility只分 No / Conditional。Q2、P4、Counter Healthy Main、Counter Weak Main entry、RR壓縮、control deterioration、MID+Structured預設No。

Conditional主要俾Q3 trade。到2R再過Initiative Gate：
- Responsive only → 100%@2R。
- Initiative Confirmed（Break → Acceptance → Hold → Extend，冇反向重新Acceptance）→ 80%@2R + 20%@4R。

Runner 4R成功＝2.4R；Runner BE＝1.6R。Entry Size同Runner資格完全分開。

## Opening Context

Shadow only：Inside-Mid / Inside-Edge / Outside-Hold / Outside-Fail。唔直接加減Size，用嚟研究Market State × P/Q × MFE × Runner hit rate。

## 保留

- Retest Internal Structure：None / One-leg；Structured。
- Retest vs Reclaim Structure：N/A / Hold / Sweep-Reclaim / Break-Accept。
- Retest Acceptance：Hold / Close Through。
- Deep-RF規則維持。
- Control Alignment保留描述／研究，唔直接double count Size。
- HSI-C保持獨立，仍要求主次雙同向。
- XAU-A保留V1.30.13修訂：Raw P3可以直接按P3 Matrix做，P4仍0。

## 仍待2026 H1確認先Freeze

1. Mixed Transition P1/P2/P2-E Q3：0.25→0.5。
2. Raw P3→P2-E + Q3 Full-size限制：Candidate暫時max 0.5。
3. High Q2 Negative Interaction正式降注幅度。
4. Runner 80/20實際Expectancy。
5. Opening Context / Initiative對4R hit rate嘅穩定性。

## Journal / CSV

V1.31.0 Active CSV＝166欄。新增：E Source V1.4、Q2 Negative Interaction V1.4、Runner Eligibility V1.4、Opening Context V1.4、Auction Move V1.4；移除舊Active export「Aligned Transition Shadow Size」。舊CSV仍可Import。

ZIP Round-trip（V1.30.14）完整保留：匯出ZIP → 改trades.csv → 一般Store/Deflate重新壓ZIP → 匯入後只更新CSV有實際改動嘅同ID紀錄；未改重複紀錄Skip。唔好改紀錄ID。
