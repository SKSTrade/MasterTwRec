# Master Trade System V1.30.5
## 紀錄庫｜交易商品／品種可修改

紀錄庫打開任何一筆交易後，新增：

> 交易商品／品種

例如可以將：
- EURUSD → GBPUSD
- GER40 → UK100
- XAUUSD → XAUUSD（修正輸入）
- 其他自訂symbol

儲存時會自動Trim並轉成大寫。

## 修改後同步影響

修改symbol後會同步反映：
- 紀錄卡商品名稱
- 紀錄詳情
- 紀錄庫商品Filter
- 商品A→Z排序
- CSV匯出「品種」欄
- Backup ZIP圖片folder命名（下次匯出時）

圖片本身仍以Record ID儲存，唔會因改symbol而遺失。

## 歷史決策保護

修改「交易商品／品種」只係修正紀錄metadata。

唔會重新計算或更改：
- 市場分類
- 核心Setup
- Market State
- Direction / Market Route
- Raw P / Execution P
- Native Q
- Final Size
- Trade Objective
- Valid Candidate

即係例如原本一筆FX trade由EURUSD修正做GBPUSD，
只會改symbol，唔會重跑Matrix。

## Validation

交易商品唔可以留空。
如果留空，App會阻止儲存並提示：

> 請輸入交易商品／品種

## Frozen V1.3

Matrix sizing / permission / obstacle / objective / shadow research全部保持不變。
CSV schema欄數保持164欄，冇新增或刪除欄位；只係原有「品種」欄可以由紀錄庫修改。
