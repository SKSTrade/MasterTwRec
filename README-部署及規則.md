# Master Trade System V1.19

現行判斷引擎：

`Master Trade Decision Matrix V3.3｜精簡方向規則版`

核心流程：

> 大局背景 → 主判／次判市場關係 → P位置 → Q Trigger → 大局障礙修正 → 最終注碼

V3.3取消獨立Direction Permission Gate。

方向規則直接整合入：

> 主判 × 次判市場關係

---

## 主判 × 次判四種市場關係

### 1｜雙同向

雙健康同向：

- 只做共同方向
- P1／P2＋Q3最高1注

同向但其中一層弱：

- 仍然只做共同方向
- P1／P2＋Q3最高0.5注

反共同方向：

- 0注
- 即使去到W／D／4H P1大位＋Q3都唔直接反向
- 先等主判或次判Market State轉弱／轉換

### 2｜方向衝突

順主判、逆次判：

- P1／高質P2優先
- P1／P2＋Q3最高0.5
- P3＋Q3屬0.25／0，由「P3可小注測試」明確標記

順次判、逆主判：

- 只當局部反彈／回調trade
- 高質P1＋Q3最高0.25
- P2通常0
- P1＋Q2預設0；只有明確標記特殊可接受情況先考慮0.25

### 3｜包含轉換

順已確認嗰一層方向：

- P1／P2＋Q3最高0.5
- 按限制交易Matrix處理

反已確認方向：

- 只做Transition層真正P1＋Q3
- 最高0.25
- App要求明確勾選「呢個P1係Transition層真正大位」
- P2以下或者Q2不做

### 4｜雙轉換／橫行

- 只做邊界
- P1＋Q3一般0.25
- 清晰主要P1邊界＋Q3可到0.5
- 清晰P2邊界＋Q3為0.25
- P3／P4／中間位不做
- 突破不追，等Acceptance＋首次Retest

---

## P位置

### P1｜大局級位置

包括：

- W／D重大支持阻力
- 大局背景／主判真正主結
- 主判大型Range邊界
- 會改變主判Market State嘅重大結構位
- 多個HTF結構高度重疊

P1係高級位置，但：

> 雙同向市場仍然唔會因為P1而自動開反向交易權。

### P2｜A級工作位置

包括：

- 次判主結
- 主判次結
- 工作結構Break後首次Retest
- 重要Swap／Impulse Origin
- 實際結構＋Mon H/L／Asia H/L／OPR／PDH／PDL

Mon H/L或Liquidity單獨唔係P2。

### P3｜次級位置

包括：

- 次判次結
- 入場TF主結
- 普通局部結構＋Session Liquidity
- Fib＋普通Swap
- 低TF區間邊界

### P4｜無交易位置

包括：

- 橫行中間
- 純Fib
- 純Asia／OPR
- 純2B冇結構
- Chase
- 前方立即撞重大支持阻力

P4＝0注。

---

## Q Trigger

核心：

> Sweep → Reclaim → Weak Retest

Q3四個核心：

1. 有效Sweep
2. 有效Reclaim
3. Retest明顯弱過Reclaim
4. 有合理交易空間

Q2：

核心成立，但有瑕疵，例如Retest較快／稍深、Momentum普通、Volume普通或Follow-through不足。

Q1：

Trigger核心失效或空間不足，0注。

### Price Action優先過Volume

判斷次序：

> 價格推進效率 → 深度 → K線力度 → 時間 → Volume

Volume只係輔助，唔可以override Price Action。

---

## Asia／OPR 2B

2B係：

> Trigger優勢，唔係市場方向優勢。

高質2B沿用6項評分：

> 5／6或以上＝高質

可以：

- Q2 → Q3
- 有結構基礎嘅P3 → P2
- 強化P2可信度

唔可以：

- 創造反向交易權
- P2 → P1
- 救P4
- 推翻主判×次判市場關係
- 推翻大局障礙

---

## 大局障礙

### 障礙仍遠

完整R:R：

> 按原Matrix。

### 接近障礙但仍有空間

降一級：

> 1 → 0.5 → 0.25 → 0

### 已處於大局障礙區內仍順原方向延伸

- P1＋Q3最多0.5
- P2＋Q3最多0.25
- P3／P4為0

### 空間不足

> 0注／Skip

---

## 五項Hard Veto

1. P4／中間位／追價
2. 冇有效Sweep或Reclaim
3. Retest明顯快＋深＋強，已否定Reclaim
4. 第一真實Target前空間不足
5. 違反交易時間／總風險上限

---

## Limit Entry管理

紀錄分開：

- Entry-time Q
- Post-entry Q
- Post-entry處理

處理：

- 深但仍弱、結構未失效 → Hold
- 深＋強但Thesis未Invalid → Q3可降Q2，返入場／BE區考慮減半
- Thesis正式Invalid → 即時Exit，唔等BE
- Retest途中形成明顯反方向Micro Structure → 可放棄第一次Limit，等返P1／P2再打一個右側

---

## App功能

四個分頁：

1. Live Decision
2. Rulebook
3. 紀錄庫
4. 規則

保留：

- Practice／Live紀錄
- Entry／Miss／Skip
- 多張Chart Screenshot
- Clipboard貼圖
- Entry-time Q／Post-entry Q
- RF／TP2 N/A
- 勝率、平均R、RF率、TP2率
- CSV匯出／匯入
- CSV＋照片ZIP完整備份／還原
- UUID紀錄ID去重
- Rulebook側邊快捷導覽
- 返回頂部按鍵

---

## 匯入／匯出

### CSV

V1.19 CSV包含：

- 主次市場關係
- 交易路線
- P／Q
- 市場關係上限
- 路線特殊標記
- Entry-time／Post-entry Q
- 結果及R

舊版CSV仍保留相容匯入。

### 完整ZIP

包含：

- records.json
- trades.csv
- images/
- backup-info.txt

同一紀錄ID重複匯入會自動跳過。

---

## 資料保存

文字紀錄：

`localStorage key = masterTradePracticeJournalV1Records`

圖片：

`IndexedDB = masterTradePracticeJournalImages`

同一GitHub Pages origin更新版本時，儲存key保持不變，設計上舊紀錄及圖片會繼續沿用。

清除Safari／瀏覽器網站資料仍然可能刪除本機紀錄，所以重要資料應定期匯出完整ZIP。

---

# V1.19更新重點

- Matrix升級至V3.3精簡方向規則版
- 移除獨立Direction Permission Gate
- 移除「大局P1反轉例外」概念
- 雙同向反向固定0
- 衝突市場分順主判／順次判逆主判
- 包含轉換加入正常P1反向試單路線
- 雙轉換加入邊界Matrix
- Live Decision改為直接選「市場關係＋交易路線」
- Rulebook自動由主判／次判Market State＋實際交易方向分類路線
- 保留高質Asia／OPR 2B嘅P／Q強化功能，但唔會推翻市場關係
