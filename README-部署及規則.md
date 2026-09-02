# Master Trade System V1.30.4
## HSI-C｜OPR Continuation & Retest
### OPR Direction Context Research

HSI-C保持單一Setup Family：

> HSI-C｜OPR Continuation & Retest

新增研究Subtype：

> OPR Direction Context

只分兩類：

- 順向順勢
  - OPR方向 = 主判／次判方向 = Trade方向
  - Long例：HTF ↑ + OPR ↑ + Trade ↑
  - Short鏡像：HTF ↓ + OPR ↓ + Trade ↓

- 反向順勢
  - OPR方向 ≠ 主判／次判方向，但Trade仍順主判／次判
  - Long例：HTF ↑ + OPR ↓ + Trade ↑
  - Short鏡像：HTF ↓ + OPR ↑ + Trade ↓

「反向」只係OPR逆HTF，唔係Trade逆勢。

## HSI-C硬前提

兩個Subtype都維持：

- 主判 + 次判必須雙同向
- Trade方向必須順主判／次判
- 09:15–09:30 OPR完成
- 09:30後Full Reclaim / Break OPR H/L
- Acceptance / Follow-through
- First Retest

如果主判／次判唔雙同向，現有HSI-C core validation仍會判Setup不完整，
亦唔會將OPR Direction Context當成有效分類。

## Database / Record Library

新紀錄會保存：
- OPR Direction Context代碼
- OPR Direction Context顯示名稱

紀錄詳情會顯示Subtype。
紀錄卡會加Subtype tag。
紀錄庫打開HSI-C紀錄後，可以事後修改順向順勢／反向順勢。

其他Setup唔會顯示呢個編輯欄。

## CSV

V1.30.3 = 163欄
V1.30.4 = 164欄

新增：
- OPR Direction Context

舊CSV冇呢欄時會留空，仍可正常匯入。

## Frozen V1.3保持不變

OPR Direction Context係Research subtype，唔直接改：
- Direction Permission
- Raw P / Execution P
- Native Q
- Size
- Valid Candidate
- Trade Objective
- Management

HSI-C本身仍然Research／Provisional，暫時冇E；Raw P3仍然P3。
