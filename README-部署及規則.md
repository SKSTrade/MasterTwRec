# Master Trade System V1.25

現行引擎：

`Master Trade Matrix｜HSI／UK100／GER40／外匯／黃金整合版`

核心流程：

> 方向權限 → 市場關係及注碼上限 → 位置P → Setup類型 → Trigger質素Q → 第一真實障礙及R:R → 最終注碼

最終注碼由方向／市場關係上限、P×Q許可、Range 25%修正及大局障礙限制取最低。

## 今次核心改動

已刪除：

> UK100／GER40：Asia 2B during POR作為獨立Setup

仍然保留：

- HSI OPR H/L 2B
- 外匯／黃金 Asia／OPR 2B
- UK100／GER40正式開市後POR H/L 2B
- EU-B Asia Sweep＋POR Full Repair
- EU-C Pure POR Full Repair

## 市場時間框架

| 市場 | 大局 | 主判 | 次判 | Trigger |
|---|---|---|---|---|
| HSI | 4H | 1H | 15M | 1M |
| UK100／GER40 | 4H | 1H | 15M | 5M／1M |
| 外匯／黃金 | Daily | 4H | 1H | 15M／5M／1M |

## 方向／Matrix

- 健康同向：最高1注
- 同向含弱勢／轉換：最高0.5
- 衝突順主判：最高0.5
- 順次判、逆主判：
  - P1 Q3最高0.5
  - P1 Q2最高0.25
  - P2 Q3一般最高0.25
- 逆主判P2：
  - 主判健康：要有效P1順風
  - 主判弱勢：要主判次結突破＋第一次Retest
- 雙轉換／Range：
  - P1 Q3 0.5
  - P1 Q2 0.25
  - P2 Q3 0.25
  - P3 Q3 0.25或0
  - Range中間0

## 窄義HTF P1反轉例外

當正常方向權限為0，只有同時具備：

- 清晰Daily／Weekly P1
- 原生至少P2
- Q3右側反轉
- Sweep＋Reclaim＋微結構轉向
- 第一段反應仍新鮮
- 空間足夠

先可最高0.25 Probe。

Type A P3→P2-effective唔會創造方向權限。

## Setup Type

### Type A｜高質Session 2B

指定：

- HSI OPR 2B
- FX／XAU Asia／OPR 2B
- UK100／GER40正式開市後POR 2B

待遇：

- 原始P3可獲P2-effective
- 基礎Q2只有單一Sweep／Reclaim質素邊緣，先可獲Q3待遇

### Type B｜普通Sweep＋Reclaim

冇自動P／Q升級。

### Type C｜Breakout／No Sweep

- Breakout＋Acceptance＋First Retest可以係原生P2
- EU Full Repair屬Breakout結構原生P2
- 普通No-Sweep反轉只限真正P1
- 強趨勢Pullback只限真實P1／P2結構

## EU POR

UTC+8圖表：

- 夏令POR：14:00–15:00
- 冬令POR：15:00–16:00

只喺正式現貨開市後執行EU Setup。

EU-B／EU-C成交前要喺POR外側重新Reclaim；如果已喺POR內形成Acceptance，Full Repair失效。

## Q與障礙

Q3核心：

- 有效Sweep或Breakout
- 有效Reclaim／Acceptance
- 微結構或控制權轉移
- Retest明顯較弱
- 第一真實障礙前有足夠空間

障礙近但仍達最低R:R：降一級。  
第一障礙前R:R不足：0注。

## Hard Veto

1. P4／Range中間／追價
2. 冇有效Sweep-Reclaim或Breakout Setup
3. Retest快、深、強
4. 第一真實目標前冇最低R:R
5. 違反交易時間或總風險限制

## 交易管理

- Limit落去入場位方式會重新改變Entry-time Q
- 深但仍弱：Hold
- 深兼強但未Invalid：返Entry／BE附近減半
- Thesis Invalid：即時Exit
- 統計優先固定2R全平

## 資料保存

LocalStorage Key維持：

`masterTradePracticeJournalV1Records`

圖片IndexedDB維持：

- DB：`masterTradePracticeJournalImages`
- Store：`chartImages`

同一GitHub Pages URL／Origin更新時，V1.25沿用舊Storage Key，設計上舊紀錄及圖片繼續保留。清除Safari／瀏覽器網站資料仍可能刪除本機資料，重要紀錄應定期匯出完整ZIP。
