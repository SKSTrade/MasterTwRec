# Master Trade System V1.28.0｜Master Trade Matrix V1.3 Frozen｜2026/08

## Frozen核心流程

> 大局背景 → 主／次Market State → Direction Permission → Control Alignment → Raw P → Setup／E → Native Q → Obstacle／RR → Final Size → Expansion／Reaction／Skip

## V1.3正式更新

- Transition拆成 Aligned／Mixed／Neutral；Aligned Transition P2＋Native Q3正式0.25，0.5只做Shadow Test。
- Control Alignment新增 Confirmed／Transitioning／Opposing，V1.3只記錄、不直接改Size。
- Raw P、Enhancement E、Execution P永久分開。
- Native Q3／Q2永久分開，取消所有E／Session Q2→Q3升級。
- Q2記錄Subtype：R／F／D／S／RR；Fast＋Deep＋Strong通常Q1。
- Trade Objective新增 Expansion／Reaction／Skip。
- RR：≥2R正常；1.5–<2R仍可交易但預設Reaction；<1.5R通常RR Veto；身處重大HTF障礙Size再降一級。
- Counter-main Q2正式0注，只作Research Candidate。
- P2-E＋Q2：Aligned最高0.25；Conflict／Transition可直接0。
- HSI-C OPR Continuation正式加入Research／Provisional，暫時冇E。
- EU正式核心：EU-A POR 2B、EU-B Asia Sweep＋Post-open Confirmation、EU-D POR Full Repair；同一Opening thesis唔Double E／Size。
- XAU：PWH/PWL、PDH/PDL高質Sweep＝E+；Asia H/L＝E；可P3→P2-effective，但Native Q唔升級。
- Journal新增Frozen Matrix、Transition Type、Control Alignment、Native Q/Q2 subtype、Trade Objective、MFE/MAE、Time to RF/MFE、Reviewed Session、Valid Candidate等研究欄位。
- Opportunity Rate＝Valid Candidate ÷ Reviewed Session。

## 資料相容

- localStorage Key保持 `masterTradePracticeJournalV1Records`。
- IndexedDB保持 `masterTradePracticeJournalImages` / `chartImages`。
- 舊CSV缺少V1.3欄位時以Legacy／N/A匯入，不影響既有文字紀錄。
