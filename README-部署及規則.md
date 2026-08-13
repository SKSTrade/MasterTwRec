# Master Trade System V1.28.1｜Previous H/L Sweep Setup

## 今次更新

### XAU-B

由原本：

> XAU-B｜Asia Sweep PDH／PDL

改成：

> XAU-B｜Sweep PDH／PDL 或 PWH／PWL

入場前會獨立記錄兩項：

1. 被Sweep嘅Liquidity Pool
   - PDH／PDL
   - PWH／PWL

2. Sweep發生Session
   - Asia
   - Europe／London

四個組合全部可以正式記錄：

- Asia Sweep PDH／PDL
- Europe Sweep PDH／PDL
- Asia Sweep PWH／PWL
- Europe Sweep PWH／PWL

XAU仍沿用Matrix V1.3：

- PWH／PWL高質Sweep＝E+
- PDH／PDL高質Sweep＝E+
- Raw P3可按既有條件取得P2-effective
- Native Q永久保留
- Q2唔會因E+改名Q3
- E+唔會創造方向權限

內部Setup代碼 `xau_asia_pdh_pdl` 暫時保留，避免破壞舊紀錄相容性；只更新其正式名稱與判定範圍。

## FX新增正式Setup

新增：

> FX-B｜Sweep PDH／PDL 或 PWH／PWL

同樣記錄：

- PDH／PDL 或 PWH／PWL
- Asia 或 Europe／London Sweep

但V1.28.1暫時：

> FX Previous H/L Sweep本身冇自動E、冇P3→P2-effective權力。

所以FX仍然按Raw P＋Native Q＋Market State Matrix處理，等後續sample再決定有冇instrument-specific E。

原本FX普通Liquidity Sweep改名：

> FX-Other｜普通Liquidity Sweep

邏輯不變。

## Journal／CSV

新增4個欄位：

- Previous H/L來源代碼
- Previous H/L來源
- Previous H/L Sweep Session代碼
- Previous H/L Sweep Session

舊CSV仍可匯入；舊紀錄未有呢4欄時保持空白。

## 保留

- Master Trade Matrix V1.3 Frozen size rules
- Transition Type
- Control Alignment
- Q2 subtype
- Trade Objective
- XAU E/E+原有規則
- 批量刪除
- 紀錄視窗點擊外圍關閉
- 原有LocalStorage及圖片IndexedDB
