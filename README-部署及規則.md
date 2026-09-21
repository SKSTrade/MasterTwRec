# Master Trade System V1.30.18
## Master Trade Matrix V1.3

### 新增 Initiative Research 欄位

#### Initiative Trigger Level
自由文字記錄實際要突破／接受嘅level，例如：
- Asia High
- 15M Working High
- PDH
- Range High

#### Initiative @ 2R
只分：
- No
- Attempt
- Confirmed

兩項都係純紀錄／Shadow欄位：
- 唔改 Direction Permission
- 唔改 Raw / Execution P
- 唔改 Native Q
- 唔改 Matrix Size / Final Size
- 唔改 Valid Candidate
- 唔改 Objective / Management

主介面可以直接填，Record Library可以事後Edit。

### CSV

CSV schema由164欄增加至166欄：
- `Initiative Trigger Level`
- `Initiative @ 2R`

舊CSV冇呢兩欄仍可正常Import，會當成未記錄。

### 既有欄位保留

- Auction Move：Responsive / Initiative
- Opening Context：Inside-Mid / Inside-Edge / Outside-Hold / Outside-Fail
- Valid Candidate：Final Size > 0 → Yes；否則No
- 去唔去到TP2：MFE R > 3.9 → Yes；否則No
- XAU / FX Mon H/L E+規則保持
- V1.4未啟用
