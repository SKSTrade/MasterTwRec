# Master Trade System V1.30.12
## Master Trade Matrix V1.3 — Frozen
### Q2 Subtype Source Fix

## 修正問題

舊版 `q2SubtypeInfo()` 同時讀：

- reclaimQuality
- breakoutQuality

即使某個Setup根本只用其中一項。

例如 XAU-C London Sweep Asia H/L 屬 `sweep`：
- Reclaim = clean
- Fast Retest = Yes
- 但未使用嘅 breakoutQuality 保持預設 ordinary

舊版會錯誤輸出：
> Q2-R+F

## 新規則

Q2-R只由「當前Setup真正使用嘅quality來源」產生。

### Sweep-family
以下只讀 `reclaimQuality`：
- session2B
- sweep
- p1ReversalSweep

### Breakout-family
以下只讀 `breakoutQuality`：
- breakout
- oprContinuation
- fullRepairAsia
- fullRepairPure
- postOpenConfirmation

### 其他
- p1NoSweep
- trendPullback

唔會因未使用quality input而自動產生Q2-R。

## 例子

XAU-C sweep：
- reclaimQuality = clean
- q2FastRetest = true
- breakoutQuality = ordinary（未使用）

新版：
> Q2-F

而唔再係：
> Q2-R+F

如果同一XAU-C：
- reclaimQuality = ordinary
- q2FastRetest = true

則正確：
> Q2-R+F

## Frozen V1.3

今次只修正Q2 subtype標籤來源。

冇改：
- Native Q本身
- Direction Permission
- Market Route
- Raw / Execution P
- Enhancement E
- P×Q Matrix
- Final Size
- Obstacle / RR
- Valid Candidate
- Objective at Entry
- Management

Q2 subtype仍然係research / diagnostic label，本身唔改Size。
