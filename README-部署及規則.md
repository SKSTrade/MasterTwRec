# Master Trade System V1.26

現行引擎：

`Master Trade Matrix｜All Markets V1.1｜EU Opening Matrix`

核心流程：

> 方向權限 → 市場關係及總注碼上限 → 位置P → Setup類型 → Entry-time Q → 第一真實障礙及管理模式 → 最終注碼

最終注碼由方向／市場關係上限、P×Q許可、Range 25%及障礙限制取最低。

## V1.26核心更新

### 1｜新增EU-D

> EU-D｜Asia Sweep＋Post-open Confirmation

Long：

> POR期間Sweep Asia L → 開市前唔入場 → 正式開市後Opening Buy Drive → 有效破微結構／工作結構 → 同一Opening Drive第一次弱Retest → Long

Short完全鏡像。

EU-D：

- 唔要求完整修復POR；
- 入場可以仍然喺POR內；
- Asia Sweep只提供背景，唔提供P2-effective升級；
- P由實際入場結構決定，可以係P3、P2或P1；
- 必須屬正式現貨開市後確認；
- 必須係同一Opening Drive第一次實質Retest。

仍然禁止：

> POR期間Sweep Asia H／L後，正式開市前單靠Asia 2B直接入場。

### 2｜UK100／GER40四種正式Setup

| Setup | 核心結構 | P待遇 |
|---|---|---|
| EU-A｜POR H／L 2B | 開市後Sweep POR邊界 → Reclaim → 破微結構 → 弱Retest | 純POR原始P3；高質Type A可P2-effective |
| EU-B｜Asia Sweep＋Full Repair | Asia Sweep → 開市後完整修復POR → 突破另一邊界 → Acceptance → 首次Retest | 原生P2 |
| EU-C｜Pure Full Repair | 冇Asia Sweep → 開市後完整修復POR → 突破另一邊界 → Acceptance → 首次Retest | 原生P2 |
| EU-D｜Asia Sweep＋Post-open Confirmation | Asia Sweep → 開市後Opening Drive破微／真實結構 → 首次弱Retest | 無特殊升級；P由實際結構決定，最高可至P1 |

## EU時間

UTC+8圖表：

| 時制 | POR | 正式現貨開市 |
|---|---|---|
| 夏令 | 14:00–15:00 | 15:00 |
| 冬令 | 15:00–16:00 | 16:00 |

Asia Range全年維持原定UTC+8時間，唔跟歐洲冬夏令移動。

## Opening Drive有效期

EU-B、EU-C、EU-D只交易同一Opening Drive第一次實質Retest。

以下情況令舊Setup過期：

1. 已完成清晰HL＋HH或LH＋LL循環；
2. 已形成新5M／15M Range；
3. 原突破位被反覆測試；
4. 價格重新Acceptance返原Range／POR；
5. 進入下一主要Session並形成新Opening Drive；
6. Retest快、深、強，足以否定原Opening Drive。

第一次Retest唔等於第一次精準掂返某條線。市場完成一個新結構循環後，再返原位已經唔係原Opening Drive首次Retest。

美盤先成交唔會機械取消，但必須確認冇新結構循環、新Range、相反Opening Drive或重新Acceptance；Entry-time Q要重新評估。

## 障礙／R:R正式分級

### 第一障礙 ≥2R

標準模式：

- 正常按Matrix；
- 固定2R TP；
- 唔因障礙降注。

### 第一障礙 1.5R–2R

RF-managed模式。

軟障礙要求：

- P1／P2＋Q3，或者已降低注碼嘅P1＋Q2；
- 障礙後仍有清楚空間去2R；
- 事前寫明到障礙推RF。

符合時唔自動降注，去到障礙推RF，再博2R。

硬障礙要額外選擇：

- 注碼下降一級；或
- 障礙前部分食糊；或
- 突破障礙係交易必要條件時直接Skip。

### 第一障礙 1R–1.5R

只限：

- P1＋Q3；
- 健康同向，或者明確結構轉換；
- 軟障礙；
- 已寫明30%–50%障礙前食糊，餘倉推RF。

缺少任何一項都係0注。

### 第一障礙 <1R

> Hard Veto，0注。

## 軟障礙與硬障礙

軟障礙例子：

- 當日日內高／低；
- Opening high／low；
- 暫時Mon H／L；
- 1M／5M普通Swing；
- 局部Range邊界；
- 普通PDH／PDL且當前動能清楚。

硬障礙例子：

- Daily／4H P1；
- 1H大型Range頂底；
- 主判主結；
- 多重HTF重疊；
- 已明確拒絕過嘅大位。

## EU-D Q規則

Q3：

- Asia Sweep有效；
- 正式開市後Opening Drive方向清楚；
- 有效破微結構／工作結構；
- 推進冇立即被否定；
- 同一Opening Drive第一次弱Retest；
- 障礙管理資格完整。

Q2：

- Retest稍快／稍深；
- 反方向K線較大；
- Breakout後延續一般；
- 但Opening Drive故事未失效。

Q1：

- 開市前直接入場；
- Opening Drive已過期；
- Retest V形、快、深、強；
- Opening Drive被吞噬；
- 重新Acceptance返POR／原Range；
- 冇有效結構突破或控制權轉移。

## 同一Opening Story

同一日可以先形成EU-D，再完成EU-B。Backtest可以分開記錄，但必須使用同一個：

> Opening Story ID

實盤總風險唔會因Setup名稱由EU-D轉成EU-B而重新歸零。

## Backtest新增欄位

EU-D記錄包括：

- Asia Sweep方向及時間；
- Sweep發生於POR邊個階段；
- Opening Drive方向；
- 有冇破微結構；
- 有冇破15M／1H主結；
- 實際P級；
- Opening Drive至Retest相隔時間；
- 有冇完成新結構循環；
- Retest深度及推進效率；
- Entry-time Q；
- 第一障礙R；
- 軟／硬障礙；
- 標準2R、RF-managed或部分食糊模式；
- 障礙管理結果；
- Opening Story ID。

CSV現行為108欄，並保留舊欄位匯入兼容。

## 方向及P規則保持不變

- Setup唔會創造方向權限；
- EU-D Asia Sweep唔會升P；
- Type A P3→P2-effective只適用指定高質Session 2B；
- Type A唔救P4、快深強Retest、最低R:R或HTF障礙；
- 同一Opening Story分開兩張Limit仍共用總注碼上限。

## 資料保存

LocalStorage Key維持：

`masterTradePracticeJournalV1Records`

圖片IndexedDB維持：

- DB：`masterTradePracticeJournalImages`
- Store：`chartImages`

同一GitHub Pages URL／Origin更新時，V1.26沿用原有Storage Key，設計上舊紀錄及圖片繼續保留。清除Safari／瀏覽器網站資料仍可能刪除本機資料，重要紀錄應定期匯出CSV＋照片ZIP。
