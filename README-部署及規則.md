# Master Trade System V1.26.8｜Transition主判P1順風方向規則

## Transition主判最新P1順風規則

當主判係Transition，P1順風唔係任何方向都可以用。

### 可以用

1. 主判係「轉換中－中性」
   - Long／Short都可以享有P1順風資格。

2. 主判有方向偏向，而且交易方向順主判偏向
   - 轉換偏升＋Long：可以
   - 轉換偏跌＋Short：可以

### 唔可以用

- 轉換偏升＋Short
- 轉換偏跌＋Long

即係：

> 逆主判Transition偏向嘅交易，唔可以借P1順風取得P2權限。

## 注碼條件

Transition主判要透過P1順風做P2／P2-effective，仍然必須：

- P1順風仍有效
- 有效位置P2或合格P2-effective
- Entry-time Q3
- 符合上述Transition方向規則
- 其他障礙／R:R／Hard Veto照常

全部成立：

> 最高0.25注

P1順風唔會：

- 將P2升P1
- 將Q2升Q3
- 救P4
- 推翻障礙或Hard Veto

## 原有Transition P1 Probe保留

真正Transition層P1＋Q3嘅0.25 Probe維持不變。

今次新增／修正嘅係：

> 原始P3經Setup取得P2-effective，或者原生P2，在合格Transition P1順風情況下亦可0.25。

## 健康／弱主判規則保持

- 健康主判：有效P1順風＋P2／P2-E＋Q3可最高0.25
- 弱主判：有效P1順風、路徑A、路徑B其中一條成立即可，最高0.25
- 多條資格唔疊加

## 其他功能保留

- 紀錄詳情點擊外圍關閉
- 紀錄庫批量刪除
- EU-B／EU-D專屬分類
- EU-D P3→P2-effective
- 119欄CSV及舊CSV兼容匯入
- 原有LocalStorage及圖片IndexedDB
