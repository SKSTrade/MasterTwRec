# Master Trade System V1.30.13
## Master Trade Matrix V1.3 — Explicit Amendment
### XAU-A｜HTF Location Sweep：P3 Allowed

## 改動

XAU-A以前有一條Setup-specific hard constraint：

> 只接受原生P1／P2；Raw P3即使Generic Matrix有Size，仍會被XAU-A壓到0。

由V1.30.13起取消呢條P1/P2-only限制。

XAU-A正式接受：

- P1
- P2
- P3

P4仍然0注。

## P3點計

Raw P3唔會因為XAU-A自動升級。

如果冇E：

> Raw P3 → Execution P3 → 按P3 × Native Q × Market Route Matrix計Size

例如：

> 雙健康同向 + XAU-A + Raw P3 + Native Q2  
> Generic Matrix = 0.25  
> XAU-A唔再額外Veto  
> Final Matrix Size = 0.25（再受Range／Obstacle／Hard Veto修正）

如果有合資格E／E+：

> Raw P3 → E/E+ → Execution P2-effective

再按原有P2-E規則計，包括P2-E + Q2全局最高0.25等限制。

## 點解改

P3可以係有清晰交易語義嘅位置，例如：

- 次判次結
- working structure
- Trigger層重要結構

當主判／次判雙同向，而XAU-A真正Sweep咗呢類結構位置，再Reclaim並有可接受Retest，
唔應該因為位置標籤只係P3就被Setup-specific hard veto。

## 保留規則

今次冇改：

- Raw P定義
- P3-PB / MID / EXT Shadow
- Native Q / Q2 subtype
- E / E+升級條件
- P2-E + Q2全局上限
- Market Route
- Range修正
- Obstacle / RR
- Hard Veto
- Objective at Entry
- Management

P3可做唔等於P3自動升P2。

## 版本註記

呢項係對Frozen V1.3嘅明確、版本化 amendment。
V1.30.12及之前仍保留舊規則；V1.30.13開始按新XAU-A P3規則。
