## V1.30.46｜US100-POR 改用 GER40 EU-A Session 2B（2026-11-12）

- US100-POR 由 Type B `sweep` 改為指定 Type A `session2B`，共用 GER40 EU-A 的6項Checklist、方向配對、5/6高質門檻及 Raw P3→P2-effective (E) 待遇；Native Q不升級。
- Cash Open：美東09:30；只使用 08:30–09:30 ET Primary POR H/L，09:30 K線不入POR。已知 Entry 分鐘為負數時，US100-POR失效；缺少分鐘數仍可作歷史研究草稿，首個開市後Sweep須由交易者按圖核實。
- US100-POR只係研究模擬：不啟用Live，不納入Production總表。US100-C、US100普通結構Sweep維持原有規則；GER40 EU-A原碼不變。
- US100 POR High/Low/Width/Sequence及OPR價格輸入保持V1.30.45的簡化狀態；舊CSV仍相容。
- 測試與注意事項詳見 `V1.30.46-US100-POR-EU-A-2B-更新及測試.md`。

## V1.30.45｜US100 研究欄位精簡及 Entry ET 自動計算（2026-11-12）

- 移除新建／編輯畫面的 Primary POR、US100-C OPR 價格／Width／Sweep Sequence 手動記錄區，並移除相應 POR Research Filter。舊資料仍可經 CSV 保留。
- 輸入 `Time from Cash Open to Entry (Min)` 後，由 09:30 America/New_York 自動計算唯讀 Entry Time (ET)，支援歷史 DST 及跨日。
- US100 三種 Research Setup、HSI-C Contract、V1.4 Production、V1.5 Shadow 均維持原有邏輯；原有六市場不變。
- 詳細內容見 `V1.30.45-US100-記錄精簡與EntryET-更新說明.md`。

## V1.30.44｜三個指數市場新增普通結構 Sweep（2026-11-12）

- UK100：新增 `uk100_structure_sweep`，顯示「UK100｜普通結構Sweep（Type B）」。
- GER40：新增 `ger40_structure_sweep`，顯示「GER40｜普通結構Sweep（Type B）」。
- US100：新增 `us100_structure_sweep`，顯示「US100｜普通結構Sweep（Type B｜Research）」。現有US100-POR、US100-C及舊 `us100_other_sweep` 保留。
- 三者使用同 HSI-B 一樣嘅通用 `type: B` + `variant: sweep` 路徑；冇新增 P／Q／E Promotion、專屬Size規則、Direction Permission或Runner。
- US100 研究頁新增 Structure Only 篩選；舊 Legacy Filter 不會錯誤包括呢個新分類。去重邏輯保持不變；三個Setup均保留既有 Shared Execution ID。
- Journal 儲存同 CSV 使用舊有 `Setup代碼`／`核心Setup`／`Setup子類型` 欄位，無新增欄位，不影響舊CSV；US100繼續不允許 Live。
- 改動：`app.js`、`index.html`、`manifest.webmanifest`、`service-worker.js`、兩份 README；PWA Cache升級至 V1.30.44。既有 V1.4 Production、V1.5 Shadow 及 GER40／HSI-C 原有條件不變。
- 驗收詳情見 `V1.30.44-普通結構Sweep-更新及回歸測試.md`。

---

## V1.30.43｜S3 Runner Event Sequence 改為 MFE Auto / Manual（2026-11-10）

- **只修改 V1.5 S3 Runner 研究層**；V1.4 Production、S1／S2、S3 Eligibility、原有六市場與 US100 雙 Setup 不變。
- 標準模式 `Auto｜按MFE自動計`：MFE 按已確認定義只記 RF 首次觸發前最高有利 R。
  - `MFE >= 4R`：S3 Runner Result = `4R`，單位收益 `0.5×2 + 0.5×4 = +3 Unit R`。
  - `2R <= MFE < 4R`：S3 Runner Result = `RF`，剩餘半倉原RF=入場價（0R），單位收益 `0.5×2 + 0.5×0 = +1 Unit R`。
  - `MFE < 2R`：未啟動2R分注，Runner `Not Reached`，維持原交易 Unit R，**Applied Count 不計入 Runner 操作**。
  - MFE 空白：沒有手動佐證則 `Unresolved`，絕不假設盈利。
- `特殊情況｜手動覆蓋 Runner Unit R`：輸入經實際減倉／出場證實的總 Unit R，可覆寫 MFE 自動收益；未填數值則 `Unresolved`。若記錄明示 `Post-entry Reduce`／`Exit`，即使達標也須核實 Unit R，防止虛構收益。單純 TP Plan 非「2R全平」不再等同已經發生特殊減倉。
- Runner Event Sequence 介面默認只需 Auto／Manual 兩種選擇，手動明細在選 Manual 時才展開。舊 CSV `reached4`、`reachedRf`、`notReached` 仍保留匯入、編輯及復原；若已記 MFE，以最新 MFE 自動規則優先。
- **R 乘注碼**：以上係未乘 Size 的 Unit R，Shadow Actual R 仍由 Unit R × 模擬注碼計算；不修改正式 Actual R。
- 無新增任何 CSV 欄名或新 Sizing Rule；升級 PWA 快取至 V1.30.43。
- 驗收報告：`V1.30.43-Runner-MFE-Auto-Manual-更新及回歸測試.md`。

## V1.30.42｜V1.4 Overlay 還原（2026-11-10）

- V1.4 Research Overlay 恢復原始位置與展開外觀，內部的 Size Rules 一列隱藏但保留 ID 供 JS 寫入。
- V1.5 Shadow Research 繼續在表單底部預設收起；Runner 判斷及所有交易／研究計算不變。
- 詳見 `V1.30.42-UI還原及回歸檢查.md`。

## V1.30.41｜研究面板精簡布局

- 「V1.4 Research Overlay｜Pruned」及「V1.5 Shadow Research｜Simulation Only」已移至新增交易表單底部、儲存按鈕之前，預設收起。
- 點擊各區塊標題可以展開；所有原有欄位、計算、Journal 儲存、CSV 欄位及研究結果均原樣保留。
- 純 UI 排版更新：`app.js`、V1.4 Production、V1.5 Shadow、US100、HSI-C 既有邏輯完全不變。
- Service Worker 快取版本已更新，部署時請上載全部檔案並重新載入頁面。

# Master Trade System V1.30.40

## V1.30.40｜US100 雙 Setup Research（2026-11-10）

- US100 新研究選單：`US100-POR｜Sweep + Reclaim`、`US100-C｜OPR Continuation & Retest`。後者沿用 HSI-C `oprContinuation` Trigger、Native Q 及雙同向硬條件，但不複製任何專屬 P／E 升級。
- 使用 America/New_York 交易日和歷史 DST：POR 08:30–09:30、US100-C OPR 09:15–09:30、Full Premarket 04:00–09:30 ET；09:30 K線均不計入開市前 Range。
- POR / OPR 分開記錄可選 High、Low、Width；價格資料由用戶手動核對，不接行情資料、不虛構。
- 各個 US100-C Subtype、Acceptance、First Retest 等使用原有 OPR 紀錄流程，OPR Direction Context 可以留白。
- 提供 US100-POR Only、US100-C Only、All US100 Research｜Deduplicated 研究視圖；同一實際 Entry 共享 `US100 Shared Execution ID` 可去重。若收益矛盾，合併結果排除該 Entry、保留獨立紀錄待核對。
- US100 TP2 嚴格採 MFE ≥ 4R（缺失即空白）；Runner 僅遵守原有 S3 eligibility／收益函式。
- **正式交易仍 V1.4 Production**；V1.5 及 US100 均 Research / Shadow Only。六市場核心計算不變。
- 詳見 `V1.30.40-US100雙Setup-更新及回歸測試.md`。

## V1.30.39｜S3 Runner MFE ≥ 4R 自動確認（2026-11-10）

使用者確認 `MFE R` 只記錄 **原本RF觸發前最高到達的R**。因此在符合V1.5 S3條件的已執行交易，`MFE R >= 4` 直接證明 `2R → 4R` 均在原RF之前，並自動輸出 Runner Result = `4R`，不要求另填 Runner Event Sequence。若沒有特別減倉／管理，Runner Unit R = 50%×2 + 50%×4 = 3；依模擬注碼計算S3和Combined Shadow R。若有 Reduce、部分平倉或特殊TP安排，即使4R已確認，沒有核實的 Runner Unit R 時，Shadow R仍為`Unresolved`，不得虛構總收益。MFE不足4R時，其他路徑維持原本手動證據規則。MFE判斷優先於可能矛盾的舊手動路徑欄位。**V1.4 Production完全不變。**

## V1.30.38｜V1.5 Shadow Research（2026-11-10）

**Frozen Production維持 Master Trade Matrix V1.4。** V1.5只加模擬計算，絕不改動 Direction Permission、P/Q/E、V1.3 Base、V1.4 Production、Final Size、Valid Candidate或舊交易正式Actual R。

### 三個Shadow規則

- **S1 EXT Weak Alignment Downgrade**：Raw P3-EXT；Main、Effective Secondary方向相同且交易順向；至少一層為Weak／Directional Transition，另一層可為Healthy／Weak／Directional Transition；Production Size >0 → 模擬降一級。雙健康、反方向或T0均唔觸發。
- **S2 Healthy Main + Opposite Original Secondary Transition**：Main Healthy；Original Secondary為反方向Directional Transition；交易順Main；Production Size >0 → 模擬升一級，上限1.0。**Gap On仍只讀Original Secondary**，Working唔取代Original；不限P/Q/E。Transition Broken Structure只記錄，不作S2條件。
- **S3 Conflict Runner A**：Raw P3-PB + Native Q3 + **strict Direction Conflict（主次均為Healthy／Weak已確認反向趨勢，V1.4 `conflictMain` route）** + 順Main逆Effective Secondary + Production Size>0。排除Mixed／Single-layer Transition、T0、Q2、EXT／MID。只有可信嘅2R、4R、RF事件先後資料先計算替代出場；未有資料輸出`Unresolved`，**不可根據MFE>=4R推斷成功**。

### Non-stacking

注碼階梯`0 → 0.25 → 0.5 → 1.0`，本次V1.5只比較相對Production嘅一級，最高1.0；Production已相對Base升降則阻止Shadow再升降。S1＋S2同時符合會記兩個Trigger，分別輸出S1 Only、S2 Only，但Combined Size維持Production，Reason=`S1/S2 Conflict`。Production Hard 0不得救返。

### 研究欄位

- Main Transition Broken Structure
- Original Secondary Transition Broken Structure
- Working Transition Broken Structure

各有兩個選項：`Bullish Structure Broken`（舊升結構被向下破壞）及`Bearish Structure Broken`（舊跌結構被向上破壞）。無法確認可留空，T0也可留空，從不根據Transition Bull/Bear自動猜測。Gap Off隱藏Working選單但**不清除已選值**。

### Runner Path Evidence（新增／編輯）

新增可選的研究證據欄位，與Production出場完全獨立：

- `Runner Event Sequence`：Unresolved／2R→4R／2R→RF／RF或原出場先於2R。
- `Runner RF Exit Unit R`：2R→RF時需記錄剩餘倉位真實RF（例如0）；未填則Unresolved。
- `Runner Verified Unit R`：有特別減倉、Reduce或其他管理時，須提供核實後Runner總單位R，否則Unresolved。
- `Runner Evidence Notes`：手動記述價格路徑及執行次序。

標準沒有減倉且已核實的路徑：2R→4R＝`0.5×2+0.5×4=3 Unit R`；2R→RF＝`1+0.5×RF Unit R`；未到2R則維持原交易結果。**不新增2R移RF到BE規則。** S1/S2按原交易Normalized R乘Shadow Size，S3按核實Runner Unit R乘模擬Size；Combined逐筆重算，不能直接相加其他方案Delta。

### CSV及績效

保留舊欄位名稱不變，在尾部追加三個Transition Origin、Shadow Trigger／Size／Actual R／Delta R／Reasons、Runner證據等研究欄。新CSV可匯出→匯入，舊CSV缺新欄仍可匯入，原交易日期、品種、正式Size及Actual R保持不變。舊CSV未保留Route Code時，S3只可用明確舊分類文字`方向衝突｜順主判...逆次判`及雙已確認反向市場狀態重建；不會單憑方向相反作推斷。

紀錄庫新增五版本比較：V1.4 Production、V1.5 S1 Only、S2 Only、S3 Only、Combined。可按Backtest Half-year、Instrument、Setup、P/Q、Market State、Structural Gap、Transition Origin及S1/S2/S3 Trigger等分類。顯示Trigger／Applied／Blocked、Win/Loss/BE、Gross Profit/Loss、Profit Factor、Total/Normalized R、Max DD、MFE/MAE及Delta R。**只計已執行且有Actual R之交易**；Runner Unresolved會顯示獨立筆數，並從該方案已核算Actual R排除，因此部分樣本指標不代表完整Performance。相同交易日缺入場時間時，DD依日期與紀錄順序估算。

研究篩選範圍沿用原US100 Production/Research隔離；US100仍然只可Practice／Review，佢嘅Production Size依舊只作Simulated Research。

## V1.30.37｜FX-B Previous H/L Enhancement更新

- FX-B 的 Previous H/L Sweep：PWH／PWL、Mon H／L、PDH／PDL三者現在享有相同位置Enhancement權利。
- 只要屬高質有效Sweep／Reclaim、Control transfer成立、Retest未Invalid，Raw P3可升為P2-effective（P2-E）。
- Native Q維持原級，E+只改Execution P，唔會將Q2升做Q3。
- XAU-B原本已經對PWH／PWL、Mon H／L、PDH／PDL三者提供相同P3→P2-E權利，今版維持不變。

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


## V1.30.37｜Matrix V1.4 表單精簡

- 全部市場嘅「核心 Setup」移除共用 Type C 強趨勢 Pullback，外匯移除 FX-C Breakout／Retest。保留 HSI-C 與 EU-B／EU-D 等獨立市場 Setup，原有 Setup Type 分類計算不改。
- 移除 Opening Context 的填寫、歷史記錄詳情／編輯欄位，以及新 CSV 匯出欄位。現有 LocalStorage 歷史紀錄不作清除。
- 品種改用下拉選單：HSI、UK100、GER40、外匯（EURUSD／GBPUSD／USDCHF）、XAUUSD；歷史記錄編輯支援保留舊有非標準品種。
- 其他 V1.4 Production／Shadow 及入場 Matrix 公式保持原狀。


## V1.30.37｜US100 Research / Shadow（2026-11-10）
- US100新增獨立市場／品種（Index），僅完整Journal Practice／Review／Backtest，Live Quick沒有US100。
- 共用既有V1.4計算，不複製GER40專屬POR P/E優惠。US100 Production Size只係Simulation。
- ET Session-based Primary POR [08:30,09:30)，Full Premarket [04:00,09:30)，IANA America/New_York歷史DST。沒有連接K線數據；POR Width手動輸入，9:30現貨開市K線須排除。
- 7項US100研究欄位（加可選Entry Time ET與10:00新聞名稱），未填為Missing；不影響Sizing。
- Production統計及Live與US100分隔；Research Scope有獨立US100篩選，CSV新增欄位並可round-trip，舊CSV依然可匯入。
- 保留舊數據／LocalStorage格式；Service Worker Cache key更新。
