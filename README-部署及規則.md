# Master Trade System V1.30.34

## V1.30.34｜紀錄類型版面更新

- 「紀錄類型與市場」的 Practice／Live／Review 改為三欄等寬，同一行並排。
- 手機版同樣維持單行顯示。
- 只作用於紀錄類型選擇，不影響 Long／Short 兩欄方向選擇。


### 三層Size架構

V1.3 Direction Permission、Market State、P/Q、E、RR、Hard Veto、P4全部保留。

`V1.3 Base Size`只作基準；`V1.4 Production Size`套正式Rule 1／3，係Final Size同Valid Candidate來源；`V1.4 Shadow Size / Runner`只作研究。V1.4唔救Hard 0。

### V1.4 Rule 1｜正式

`P2-E + Q2同時含F+S` → 降一級。

### V1.4 Rule 2｜Shadow

`P2-E + Aligned With Weakness` → 降一級。

只限Healthy / Weak同向、至少一層Weak，而且Trade必須順共同方向；唔包括Single Transition或反共同方向。

### V1.4 Rule 3｜正式

`P2-E + Raw P3-PB + Q3 + 明確方向Conflict + 順Main逆Effective Secondary` → 升一級，Max 1.0。

Directional State包括H↑/W↑/T↑及H↓/W↓/T↓；任何一邊T0均排除。

Structural Gap Off用Secondary Main；Gap On用Secondary Working，即Effective Secondary Judge。

### V1.4 Rule 4｜Runner Shadow

`Raw P3-PB + Q3 + 明確方向Conflict + 順Main逆Effective Secondary` → `50%@2R + 50% Runner→4R`。

唔要求P2-E，亦唔需要Initiative @2R gate。

### Interaction

- Multiple upgrades：最多+1 step
- Multiple downgrades：最多-1 step
- Upgrade + Downgrade：互相抵消，回到V1.3 Base
- Hard 0：V1.4永遠唔救返

### Pruned fields

已由操作UI／Record Detail／新CSV Export移除：
- Initiative Trigger Level
- Initiative @2R
- Control Alignment
- Auction Move維持刪除
- ATR / Body-ATR研究欄維持不再記錄

舊CSV仍可Import；Legacy欄位只作向後兼容，唔再係新紀錄欄位。

### CSV三層Size

新CSV直接分開：
- V1.3 Base Size
- V1.4 Production Size
- V1.4 Shadow Size
- V1.4 Runner Result

另保留Rule trigger／Adjustment欄，方便之後拆Production、Shadow、Runner來源。


## V1.30.33｜紀錄庫操作更新

- 紀錄類型新增 **覆盤 Review**，可於新紀錄及歷史編輯使用。
- 紀錄庫 **類型** 與 **商品** 篩選改為多選；同一篩選內採 OR，不同篩選組之間採 AND。未勾任何選項代表全部。
- 多選紀錄模式新增 **匯出已選CSV** 及 **匯出已選CSV＋照片 ZIP**；原本全量匯出保留。
- CSV 匯入兼容 `Review`／`覆盤`／`复盘`，統一正規化為 `Review`。
