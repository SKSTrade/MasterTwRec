# Master Trade System V1.30.19
## Master Trade Matrix V1.3

### Skip → 獲利R自動0

當 `有冇入到市` 選擇：

> `Skip｜主動放棄`

App會自動：

- 將 `獲利R` 填成 `0`
- 暫時鎖住獲利R欄，避免Skip狀態下誤填其他數字
- 儲存時再次強制使用 `0`
- Record Library Edit同樣適用
- CSV Import遇到 `Entry Status = Skip` 時亦會將Profit R / Actual R正規化為 `0`

如果由 `Skip` 改返 `Entry` 或 `Miss`，由Skip自動產生嘅0會清空，獲利R恢復可輸入。

### 其他規則保持

- Valid Candidate：Final Size > 0 → Yes；否則No
- 去唔去到TP2：MFE R > 3.9 → Yes；否則No
- Auction Move / Opening Context
- Initiative Trigger Level / Initiative @ 2R
- XAU / FX Mon H/L E+
- CSV schema維持166欄
- V1.4未啟用
