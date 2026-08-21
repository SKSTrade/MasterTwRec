# Master Trade System V1.28.7｜Obstacle Render Null Fix

## 修正Bug

V1.28.6新增「有第一真實障礙阻住」checkbox後，當使用者**冇Tick障礙**時：

- `firstObstacleR = null`
- 結果畫面仍然執行 `firstObstacleR.toFixed(2)`
- JavaScript因此中斷Render

造成：

- 「大局障礙修正」空白
- 「最終注碼」可能停留舊值／顯示0
- 下方計算原因／警告／硬性否決全部消失

## V1.28.7修正

Obstacle Result Render改成null-safe：

- 冇障礙：顯示 `冇第一真實障礙 → 原Size`
- 有障礙＋有距離：顯示 `x.xxR｜障礙狀態 → 修正Size`
- 有障礙但未填R：顯示 `有障礙｜未填距離 → 0注`

唔再對null呼叫`.toFixed()`。

## 邏輯不變

V1.28.6 Obstacle規則、Matrix Route、P/Q、E/E+、Trade Objective、CSV及Storage全部保持不變。
