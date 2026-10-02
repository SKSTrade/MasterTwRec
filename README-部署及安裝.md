# Master Trade System V1.30.26

## 今次更新

只修正：

> FX-B Main / Live eligibility 統一改成 Warning

如果 FX-B Previous H/L source / session 資料未完整：

- Main Calculator：Warning
- Live Quick Decision：Warning
- 唔會 Hard Veto
- 唔會單靠呢個原因將 Final Size 打到 0

### 明確唔改

`FX-C 完整 Breakout Raw P3 → Native P2` **今版唔修正**，保持 V1.30.25 原有行為。

### 其他規則保持

- XAU-B Mon H/L eligibility fix 保留
- T0-Balance / T0-Post-Break 保留
- P / E / Native Q / RR / Obstacle 規則保留
- Valid Candidate Auto 保留
- MFE > 3.9 → TP2 Yes 保留
- Skip → Profit R 0 保留
- V1.4 未啟用
