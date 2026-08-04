# Master Trade System V1.26.3｜紀錄庫批量刪除

## V1.26.3新增功能

紀錄庫新增批量刪除：

- 按「選取多個紀錄」進入選取模式
- 點擊多張紀錄卡逐一勾選／取消
- 可全選目前篩選結果
- 顯示已選紀錄數量
- 一次刪除所有已選文字紀錄及相關圖片
- 刪除前會顯示確認提示
- 原有單筆查看、編輯及刪除功能保留

介面繼續維持簡化版：

- UK100／GER40 Opening Story詳細紀錄區仍然隱藏
- Rulebook第一真實障礙詳細輸入區仍然隱藏
- 障礙預設按≥2R標準模式
- 紀錄庫、圖片、交易日期及左下角Default按鍵保持不變

## EU-B／EU-C／EU-D最新P規則

| Setup | P來源 | 最終待遇 |
|---|---|---|
| EU-B Asia Sweep＋Full Repair | POR另一邊Breakout＋Acceptance＋首次Retest | 原生P2 |
| EU-C Pure Full Repair | 同上 | 原生P2 |
| EU-D只有微結構＋普通位置 | Asia Sweep＋正式開市後確認嘅完整Setup Edge | P3 → P2-effective |
| EU-D突破15M／1H真實結構 | 實際Breakout／Swap結構 | 原生P2，甚至P1 |
| 只有Asia Sweep，冇開市後確認 | 無 | 唔入場 |

## 核心分別

EU-B／EU-C係市場本身創造咗：

> Breakout＋Acceptance＋首次Retest

所以屬於原生P2。

EU-D未必突破POR另一邊，但完整具備：

> Asia Sweep＋正式開市後Opening Drive確認＋破微結構／工作結構＋第一次弱Retest

普通P3可以獲P2-effective待遇。

若EU-D實際已經突破15M／1H真實結構，Entry本身就按原生P2或P1，唔需要亦唔容許再用Setup升級。

## 唔可以重複計分

EU-D只可以揀一種P來源：

> 原生P1／P2

或者：

> 原始P3 → P2-effective

唔可以寫成：

> Asia Sweep加一次＋Opening Drive加一次＋0.618再加一次

EU-D取得P2-effective後：

- 唔再因Asia Sweep額外升Q
- 唔再因Opening Drive另加一次P
- 實際位置已經係P2，就保持P2，唔變P1
- 仍然唔創造方向權限
- P4仍然0注
- 開市前直接以Asia 2B入場仍然無效

## 資料保存

LocalStorage Key維持：

`masterTradePracticeJournalV1Records`

圖片IndexedDB維持：

- DB：`masterTradePracticeJournalImages`
- Store：`chartImages`

同一GitHub Pages URL／Origin更新時，設計上舊紀錄及圖片繼續保留。
