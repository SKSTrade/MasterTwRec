# Master Trade System V1.26.9｜窄義HTF P1反轉例外 Trigger 等價化

## 修正問題

舊版窄義HTF P1反轉例外硬性要求：

> validSweep＋validReclaim＋微結構轉向

所以 EU-B 即使已經完整完成：

> Asia Sweep＋POR Full Repair＋Breakout＋Acceptance＋首次Retest

仍會因為普通 `validSweep / validReclaim` 欄位係 false 而被錯判0注。

## V1.26.9正式規則

窄義HTF P1反轉例外唔再要求所有Setup都填同一套Sweep／Reclaim欄位，而係按Setup模型檢查「等價右側確認」。

### Type A／Type B Sweep類

需要：

> Sweep＋Reclaim＋微結構轉向

### EU-B

需要：

> Asia Sweep  
> ＋完整POR Full Repair  
> ＋Breakout＋Acceptance  
> ＋首次Retest  
> ＋控制權轉移  
> ＋POR外有效入場

### EU-C

需要：

> 完整POR Full Repair  
> ＋Breakout＋Acceptance  
> ＋首次Retest  
> ＋控制權轉移  
> ＋POR外有效入場

### EU-D

需要：

> Asia Sweep  
> ＋正式開市後Opening Drive確認  
> ＋Breakout／工作結構突破  
> ＋控制權轉移  
> ＋首次Retest

### 其他Breakout Setup

需要：

> Breakout＋Acceptance＋首次Retest＋控制權轉移

## 窄義HTF P1反轉例外共同條件

仍然全部需要：

- 原生位置至少P2；P1當然符合
- Entry-time Q3
- P1第一段新鮮反應／P1順風仍有效
- 對應Setup模型嘅核心確認完整
- 空間合格
- 手動勾選「窄義HTF P1反轉例外完整成立」

全部成立：

> 方向權限由正常0開到最高0.25 Probe

注意：

- Type A P3→P2-effective唔會單獨創造方向權限
- EU-D P3→P2-effective亦唔會單獨創造方向權限
- Q2唔得
- P4唔得
- Hard Veto／障礙規則仍然有效

## 其他功能保留

- Transition主判P1順風方向規則
- 紀錄視窗點擊外圍關閉
- 紀錄庫批量刪除
- EU-B／EU-D專屬分類
- 119欄CSV及舊CSV兼容匯入
- 原有LocalStorage及圖片IndexedDB
