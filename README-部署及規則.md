# Master Trade System V1.27.1｜XAU Liquidity Enhancement

## XAU Liquidity權重

- PDH／PDL High-quality Sweep＝E+
- Asia H／L／OPR H／L High-quality Sweep＝E
- Mon H／L仍可記E，但今版唔提供P／Q effective升級權力
- E／E+永遠唔會將P2升P1，亦唔會創造方向權限

## Location Enhancement

高質XAU Sweep如果Raw位置係P3：

> Raw P3＋E／E+ → P2-effective

記錄仍然保留Raw P3，唔會改名做原生P2。

例：

- P3＋Asia H/L高質Sweep → P3-E｜執行P2-effective
- P3＋PDH/PDL高質Sweep → P3-E+｜執行P2-effective
- P2＋PDH/PDL Sweep → P2-E+，仍然係原生P2
- P1＋PDH/PDL Sweep → P1-E+，仍然係P1

## Trigger Enhancement

只限基礎Q2唯一瑕疵係：

> Sweep／Reclaim質素邊緣

而且仍然全部符合：

- Sweep有效
- Reclaim有效
- Reclaim未被吞／否定
- 有控制權轉移／微結構確認
- Retest明顯弱
- 冇Hard Failure
- 空間合格

先可以：

> Q2 → Q3-effective

## E／E+絕對救唔到

- Retest fast
- Retest deep
- Retest strong／高效率
- Reclaim被重新吞返／失效
- 第一障礙空間不足
- 已形成強反方向microstructure
- Q1核心失效
- P4
- 方向權限為0

## Market State cap

P／Q effective升級只改執行待遇，最後注碼仍然：

> Market State／方向上限 × Effective P × Effective Q × 障礙限制

取最低。

例如：

> 4H弱升＋1H健康跌＋Short  
> Raw P3＋PDH E+  
> Q2只因Reclaim一般  
> → Effective P2＋Q3-effective

仍然要符合逆弱主判P2權限，最終唔會因E+自動變0.5／1注。

## 其他功能保留

- XAU-A／B／C三個正式打法
- Transition主判P1順風方向規則
- 窄義HTF P1 Trigger等價化
- 紀錄庫批量刪除
- 紀錄視窗點擊外圍關閉
- 原有LocalStorage及圖片IndexedDB
