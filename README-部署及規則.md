# Master Trade System V1.22

現行判斷引擎：

`Master Trade Decision Matrix V3.4｜Setup Type＋精簡方向規則版`

核心流程：

> 大局背景 → 主判 × 次判市場關係 → Setup Type → P位置 → Q質素 → Range 25%修正 → P1順風／大局障礙 → 最終注碼

## V1.22｜Type A Q2→Q3一致性修正

修正Type A評分同Q欄可能出現互相矛盾嘅情況。

例如：

- Type A勾選「Retest明顯較慢、較弱」
- 但Q欄仍保留預設「Retest有瑕疵」

舊版會將Q2原因判作Retest瑕疵，因此唔會升Q3。

V1.22改為：

- 勾選Type A「Sweep乾淨」→ 同步有效Sweep
- 勾選Type A「Reclaim破微結構」→ 同步有效Reclaim
- 勾選Type A「Retest明顯較弱」→ 同步Q欄Retest＝Weak
- Q欄改成相反判斷 → 取消對應Type A條件
- Q待遇欄會直接顯示未升Q3嘅原因

Type A Q2→Q3仍然只限：

> 基礎Q2唯一問題係Sweep／Reclaim質素處於邊緣＋Retest弱＋完整R:R＋Setup核心有效

Retest瑕疵、空間一般／不足、多項瑕疵或Setup被否定，仍然維持Q2／Q1。

## V1.21方向權重修正

逆主判P2特殊資格簡化為：

> 主判仍係Trend＋次判已不再同主判同向＋P1順風仍有效＋P2＋Q3 → 最高0.25

不再要求「主判次結有效突破＋首次Retest」。

同時：

- 次判仍同主判同向 → 逆主判P2仍然0
- 順主判／順已確認方向交易 → P1順風只係Context，唔會額外加注
- 例如主判弱升＋次判轉換偏升＋Long＋P2＋Q3 → 仍按包含轉換順已確認方向，最高0.5

## V3.4核心更新

### 1｜方向規則直接整合入主判 × 次判

- 雙同向只做共同方向，反向固定0。
- 衝突順主判優先。
- 順次判逆主判，P1＋Q3正常最高0.25。
- 逆主判P2正常0；只要：
  - 主判仍係健康／弱勢Trend；
  - 次判已不再同主判同向；
  - P1順風仍有效；
  - P2＋Q3
  就可最高0.25。
- 唔需要等主判次結先被突破。
- 包含轉換可順已確認方向；反向正常以Transition層真正P1＋Q3為主，但符合以上「次判不再同向＋有效P1順風」時，P2＋Q3亦可0.25。
- 雙轉換／橫行只做邊界。

### 2｜Market State硬規則

> 主結未實收穿，一律仍屬原趨勢，最多降成弱勢。

Wick穿、Sweep主結收返、次結失守、深回調，都唔等於Transition。

只有有效實收穿主結，先由Trend進Transition，再判偏升／中性／偏跌。

### 3｜Setup Type

#### Type A｜高質 OPR／Asia 2B

方向一致＋現有6項評分5／6以上先成立。

特殊待遇：

- 原始P3 → P2-effective
- P2唔升P1
- P4救唔到
- Q2只有唯一問題係Sweep／Reclaim質素邊緣時，先可Q2 → Q3
- Retest太快／深／強、空間不足、Setup被否定都救唔到

Type A候選未達高質資格時，App自動按Type B普通Sweep-Reclaim處理。

#### Type B｜普通 Sweep & Reclaim

普通Swing、PDH／PDL、結構高低位Sweep等。

> 冇任何P／Q特殊升級。

#### Type C｜No Sweep

冇真正Liquidity Sweep。

只考慮：

> P1＋明顯Rejection＋Micro Structure Break＋Weak Retest＋合理空間

P2／P3普通No-Sweep Setup＝0。

### 4｜取消Trigger加分證據

唔再逐項RVOL＋1、Close＋1、2B＋1等。

> P決定位置，Setup Type決定模式Edge，Q決定執行質素。

避免Double Counting。

### 5｜大局實際結構重疊

定義：

> Entry zone本身同HTF真實價格結構有實際空間交集。

裸K測試：

Hide晒Fib、Asia、OPR、Mon H/L、PDH／PDL後，仍會獨立畫出該區，先算真實結構。

可以直接影響P級。

### 6｜P1順風

P1順風唔改P級。

只計：

> P1直接引發第一段反轉＋第一次回調Setup

完成第一個LH／HL循環、轉橫行、正式確認新趨勢、或者關鍵結構被反向Reclaim後，順風失效。

### 7｜次判轉換中性 Range 25%

- Long底25% → 不降級
- Long非底25% → 降一級
- Short頂25% → 不降級
- Short非頂25% → 降一級
- 真正Range正中 → 0

只改Size，唔改P級。

### 8｜大局障礙

#### Entry Obstacle

第一真實障礙壓縮Entry空間。

- RR不足 → 0
- 仍可交易但空間明顯壓縮 → 降一級

#### Target Obstacle

到障礙之前已有完整最低RR，例如2R。

> 唔影響Entry注碼。

只影響TP、Runner及突破預期。

#### 已處於大局障礙區內仍順向延伸

- P1＋Q3最多0.5
- P2＋Q3最多0.25
- P3／P4＝0

## Q質素

### Type A／B

Q3：

- Reclaim有效
- Retest明顯弱
- Setup冇即時被否定
- 第一真實目標有合理空間

Q2：

核心仍成立，但Retest稍快／深／強、Reclaim一般或結構確認未完整。

Q1：

Reclaim失敗、Retest否定Setup、反方向Micro Structure主動建立或空間不足。

### Type C

睇：

- P1 Rejection
- 右側Micro Structure Break
- Weak Retest
- 合理空間

## Price Action優先次序

> 價格推進效率 → 深度 → K線力度 → 時間 → Volume

Volume唔再獨立加分。

## Hard Veto

1. P4／Range正中／追價
2. Setup核心確認失敗
3. Retest快＋深＋強到否定Setup
4. 第一真實目標前RR不足
5. 違反交易時間／總風險上限

## 資料功能

保留：

- Live Decision
- Rulebook
- 紀錄庫
- 規則
- Practice／Live紀錄
- Entry／Miss／Skip
- 多張Chart Screenshot
- Clipboard貼圖
- RF／TP2 N/A
- Entry-time Q／Post-entry Q
- 勝率、平均R、RF率、TP2率
- CSV匯出／匯入
- CSV＋照片ZIP完整備份／還原
- UUID紀錄ID去重
- Rulebook側邊快捷導覽
- 返回頂部按鍵

## 資料保存

文字紀錄仍使用：

`masterTradePracticeJournalV1Records`

圖片仍使用IndexedDB：

- DB：`masterTradePracticeJournalImages`
- Store：`chartImages`

同一網站Origin更新時，V1.22沿用原有Storage Key，設計上舊紀錄及圖片繼續保留。

清除瀏覽器／Safari網站資料仍可能刪除本機資料，重要紀錄應定期匯出完整ZIP。
