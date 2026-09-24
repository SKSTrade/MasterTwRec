# Master Trade System V1.30.21
## Master Trade Matrix V1.3

### Entry-TF Working Structure

正式改名為：

> `Entry-TF Working Structure`

三個互斥狀態：

#### Opposing Intact
入場TF原本同交易方向相反嘅工作結構，入場時仍未被有效破壞。

#### Opposing Broken / Transition
反向工作結構已被有效破，但新嘅順交易方向工作結構仲未正式建立。

#### Aligned
入場TF工作結構已經同交易方向一致。

### 舊資料兼容

V1.30.20舊值會自動映射：

- `未破` → `Opposing Intact`
- `已破` → `Opposing Broken / Transition`
- `與交易方向一致` → `Aligned`

CSV欄名更新為：
- `Entry-TF Working Structure`

Import仍兼容舊欄名：
- `Entry TF Working Structure`
- `入場TF工作結構`

### 性質

純紀錄／Shadow：
- 唔改 Direction Permission
- 唔改 Raw / Execution P
- 唔改 Native Q
- 唔改 Matrix Size / Final Size
- 唔改 Valid Candidate
- 唔改 Objective / Management

CSV schema維持167欄。
V1.4未啟用。
