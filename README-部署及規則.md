# Master Trade System V1.30.22
## Master Trade Matrix V1.3

### 1. 移除 Auction Move

`Auction Move` 已由正式操作介面、Record Detail及CSV Export移除。

舊V1.30.17–V1.30.21資料如果本身有 `Auction Move`：
- 唔會影響舊紀錄載入；
- 舊CSV含 `Auction Move` 欄仍可Import；
- 但V1.30.22唔再顯示／匯出呢個欄位。

### 2. Entry-TF Working Structure 說明改為條件式

選項維持：
- Opposing Intact
- Opposing Broken / Transition
- Aligned

而家唔會長期顯示三段說明。

只有揀咗某個選項，先會喺該欄下面顯示對應說明：

- `Opposing Intact` → 入場TF原本同交易方向相反嘅工作結構，入場時仍未被有效破壞。
- `Opposing Broken / Transition` → 反向工作結構已被有效破，但新嘅順交易方向工作結構仲未正式建立。
- `Aligned` → 入場TF工作結構已經同交易方向一致。

未記錄時說明保持隱藏。

Record Library Edit亦使用同一套行為。

### 3. 性質

Entry-TF Working Structure仍然係純Shadow：
- 唔改 Direction Permission
- 唔改 Raw / Execution P
- 唔改 Native Q
- 唔改 Matrix / Final Size
- 唔改 Valid Candidate
- 唔改 Objective / Management

CSV由167欄減至166欄，原因只係移除 `Auction Move`。
V1.4未啟用。
