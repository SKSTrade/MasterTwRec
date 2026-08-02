# Master Trade System V1.26.1｜Simplified UI

今次只精簡介面，交易Matrix核心規則維持V1.26。

## 已移除畫面

- UK100／GER40 Opening Story詳細紀錄區
- Rulebook第一真實障礙距離／管理模式詳細輸入區

詳細欄位保留為內部兼容欄位，唔會阻止EU-D儲存。障礙預設按≥2R標準模式處理。

## EU Opening速查

- EU-A：開市後POR H／L 2B
- EU-B：Asia Sweep＋POR Full Repair
- EU-C：Pure POR Full Repair
- EU-D：Asia Sweep＋正式開市後破結構＋第一次弱Retest

硬規則：開市前Asia 2B唔入場；EU-D嘅Asia Sweep唔會升P。

## 障礙速查

- ≥2R：正常
- 1.5R–2R：推RF管理
- 1R–1.5R：只限P1＋Q3頂級Setup
- <1R：不做

## 資料保存

LocalStorage Key及圖片IndexedDB保持不變。同一GitHub Pages URL／Origin更新時，設計上舊紀錄及圖片繼續保留。
