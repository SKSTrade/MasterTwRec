# Master Trade System V1.28.2｜Weak-main Route A/B Independent Confirmation

## 今次規則修正

主判弱、次判已向主判反方向發展時：

### Route A｜Structure Break Route

> 主判弱
> ＋主判次結／工作結構有效Break＋Acceptance
> ＋第一次Retest
> ＋P1／P2或P2-effective
> ＋Native Q3

P1：
- Route A可以成立及記錄
- P1本身按Matrix判Size
- Route A只係Confirmation，唔額外加Size

P2／P2-effective：
- Route A可以解鎖逆弱主判最高0.25

### Route B｜Fresh Session Confirmation

> 主判弱
> ＋次判已建立健康反方向Trend
> ＋P1／P2或P2-effective
> ＋Native Q3
> ＋新Session獨立Confirmation
> ＋主判工作結構突破維持
> ＋去主判主結／第一硬障礙至少1.5R
> ＋未到成熟逆向腿尾
> ＋未貼近主判主結

P1：
- Route B可以成立及記錄
- P1本身按Matrix
- Route B唔額外加Size

P2／P2-effective：
- Route B可以解鎖逆弱主判最高0.25

## P1順風改成完全獨立

P1順風、Route A、Route B係三個獨立事實：

- 可以同時存在
- P1順風有效唔會再disable Route A/B selector
- 可以記錄Tailwind同時又有Route A/B
- 多條資格永遠唔疊加Size

P2／P2-effective＋Native Q3：

> P1順風 OR Route A OR Route B
> → 逆弱主判最高0.25

即使三條全部成立：

> 仍然最高0.25

P1＋Native Q3：

> 本身按conflictSecondary Matrix最高0.5
> Route A/B只作Confirmation，唔會0.5再加上去

## Live Decision

Live模式嘅P1順風保留獨立select。

Route A/B selector改成只記：
- None
- Route A
- Route B

唔再將P1順風塞入同一個Route selector，所以可以同時選：
- P1順風有效
- Route A / Route B

## 相容性

- 原有counterP2欄位及CSV欄位保持
- CSV維持149欄
- 舊紀錄／舊CSV可繼續讀取
- V1.28.1 Previous H/L Sweep更新全部保留
- XAU/FX Previous H/L Setup不變
- Matrix V1.3其他route、Q2 subtype、Transition、Objective規則不變
