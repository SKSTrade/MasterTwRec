# Master Trade System V1.30.27
## T0 Neutral Direction Permission Fix

### 修正內容

今版修正一個中央 Market Route bug：

> `T0-Balance × Directional Transition`
>
> 舊版錯誤：將Directional Transition bias當成唯一方向票，逆bias直接0注。
>
> 新版：兩層都仍然係Transition，Directional Transition bias只作context，唔係Hard Direction Veto。

因此：

- `T0-Balance × T↑ / T↓` → Strict Neutral / Range route
- 兩邊方向都可以按Neutral Matrix計
- 只有Active T0-Balance Auction先套25% / true-boundary filter
- P1 Q3 = 0.5
- P1 Q2 = 0.25
- P2 / P2-E Q3 = 0.25
- P2 / P2-E Q2 = 0
- P3 Q3 = 0.25 / 0，只限meaningful location
- P3 Q2 = 0
- Balance middle = 0

### T0-Post-Break × Directional Transition

同樣修正：

- Directional Transition bias只作context
- 唔再因逆bias自動打0
- 沿用Neutral Matrix / Cap
- T0-Post-Break唔套25% hard restriction
- 但唔會升格成Healthy / Weak Trend待遇

### 保持不變

- Confirmed Healthy / Weak Trend × T0：方向權限規則不放寬
- T0-Post-Break × T0-Post-Break：同方向Q3低Cap，最高0.25
- T0-Balance × T0-Post-Break：低Cap Q3 route，最高0.25
- Matrix數值本身冇改
- P / E / Native Q冇改
- Obstacle / RR冇改
- FX-B Previous H/L Warning parity保留
- FX-C Native P2行為唔改
- V1.4未啟用

### 跨市場檢查

中央route engine係所有市場共用。已用代表性合法Setup檢查：

- HSI-A
- UK100 EU-B
- GER40 EU-B
- FX-B
- XAU-B
- Trend Pullback

同一個 `T0-Balance × Directional Transition + P1 Q3 + favorable boundary`
全部正確保留0.5，不再被方向bias錯誤打0。

HSI-C仍有自己獨立嘅「主判＋次判雙同向」前提；如果唔符合而0注，屬Setup規則，唔係今次bug。
