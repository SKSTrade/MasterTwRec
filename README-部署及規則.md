# Master Trade System V1.26.4｜EU專屬分類＋Type A原因提示

## EU-B／EU-D顯示

EU-B同EU-D唔再顯示成普通「Type C｜Breakout／No Sweep」，改為：

- EU-B｜Asia Sweep＋Full Repair
- EU-D｜Asia Sweep＋Post-open Confirmation

內部Matrix待遇保持原規則：

- EU-B完整Full Repair＝原生P2
- EU-D普通P3＋完整開市後確認＝P2-effective
- EU-D實際15M／1H Breakout／Swap＝原生P2，甚至P1
- 唔會錯誤套用一般Type A Q2→Q3待遇
- 唔會重複升P或升Q
- 仍然唔創造方向權限

## 自訂Setup點解6／6仍未達Type A

Type A有兩層Gate：

1. 核心Setup身份必須係指定市場Session 2B
2. 方向一致，而且六項質素至少符合5項

指定Type A：

- HSI OPR H／L 2B
- FX／XAU Asia／OPR 2B
- UK100／GER40正式開市後POR H／L 2B（EU-A）

「自訂｜按實際Setup分類」唔係指定Type A身份。因此手動揀Type A兼勾滿6／6，仍然按Type B處理。

介面會直接顯示：

> 未達A｜6／6｜核心Setup身份唔屬指定Type A｜按Type B

## V1.26.3功能保留

紀錄庫批量選取及一拼刪除保持不變。

## 資料保存

LocalStorage Key維持 `masterTradePracticeJournalV1Records`。

圖片IndexedDB維持：

- DB：`masterTradePracticeJournalImages`
- Store：`chartImages`
