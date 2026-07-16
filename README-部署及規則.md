# Master Trade System V1.14

內置判斷引擎：

`Master Trade Rulebook V3.5 ＋ Live Decision Matrix V3.5`

呢個版本保留原有：

- Practice／Live紀錄
- Entry／Miss／Skip
- TP計劃
- 獲利R
- RF／TP2統計
- Chart Screenshot
- CSV匯出
- 亞洲盤頂／底2B

現行系統已拆成Master Trade Rulebook V3.5同Live Decision Matrix V3.5，兩邊共用同一套P／Q／Risk Matrix邏輯。

---

## 核心流程

大局背景 → 主判斷 × 次判斷 → 交易優先方向 → 位置級別 → Trigger Model → Trigger質素 → 大局障礙修正 → 最終注碼

最終注碼永遠只可以向下限制，唔可以由大局或2B額外加到高過市場狀態權限。

---

## 四個功能時間框架

支援快速配置：

### 外匯／黃金短線

- 大局背景：D
- 主判斷：4H
- 次判斷：1H
- 入場觸發：預設15M，可自行改15M／5M／1M等

### HSI 1分鐘

- 大局背景：4H
- 主判斷：1H
- 次判斷：15M
- 入場觸發：1M

四層都可以自行修改。

---

## 七種市場狀態

- 健康升勢
- 弱升勢
- 轉換中－偏升
- 轉換中－中性
- 轉換中－偏跌
- 弱跌勢
- 健康跌勢

轉換傾向直接屬於該時間框架自身市場狀態，不再用另一個附加Bias欄位。

---

## 主次市場關係

App會自動分類：

- 健康同向
- 同向有弱勢
- 包含轉換
- 方向衝突
- 弱勢衝突

一注只屬於：

主判＋次判健康同向
＋ P1／P2
＋ Q3
＋ 冇大局障礙
＋ 冇硬性否決

---

## P1／P2修正

### P1

包括：

- 週／日線重大支持阻力
- 大局背景主結
- 主判主結
- 主判大型區間邊界
- 會改變主判／次判市場狀態嘅主結突破回測
- 次判主結同大局／主判重大位置直接重疊
- W618／D618同實際HTF結構重疊

### P2

包括：

- 次判主結
- 主判次結
- 次判重要區間邊界
- 普通工作結構突破接受後首次回測
- impulse origin／swap zone
- 結構位置＋Asia／OPR／PDH／PDL

重要原則：

位置級別睇空間重疊，不是故事重疊。

如果行情由大局阻力跌開後，之後只回抽新形成嘅次判主結，該位置仍然係P2；唔會因為整段行情源於大局P1位置而一直當P1。

---

## Trigger精簡Filter

核心只保留：

1. 有效Sweep
2. 有效Reclaim
3. Retest明顯弱過Reclaim
4. 有效交易空間

Q1硬失效包括：

- 冇Sweep
- 冇真正Reclaim
- Reclaim立即被完全否定
- Retest快深強
- 空間不足
- 追價

加分證據：

- RVOL
- 收近燭頂／燭底
- Reclaim更乾淨
- Retest用時較長
- 0.5–0.786
- Impulse origin
- Fib
- Asia／OPR／PDH／PDL
- Follow-through

---

## Q3／Q2

### Q3

- Sweep有效
- Reclaim有效而且乾淨
- Retest明顯較弱
- 有完整合理R:R
- 位置唔係P2邊緣標籤

### Q2

核心仍可交易，但存在瑕疵，例如：

- Reclaim普通
- Retest稍深／普通
- 空間略短但仍達最低R:R
- P2邊緣位置

---

## 亞洲盤2B

高質2B係執行優勢，不是市場狀態優勢。

可以：

- Q2 → Q3
- 有結構基礎時P3 → P2

唔可以：

- 救Q1
- P2 → P1
- 救P4
- 製造本身不存在嘅R:R
- 推翻大局障礙
- 將0.5注市場上限升成1注

---

## 大局障礙

### 無／仍遠

按原矩陣。

### 接近，但仍有最低可接受空間

注碼降一級：

- 1 → 0.5
- 0.5 → 0.25
- 0.25 → 0

TP放障礙前，少留或不留runner。

### 空間不足

0注。

### 已處於障礙區內仍順原方向延伸

- P1＋Q3：最多0.5
- P2＋Q3：最多0.25
- 其他：0

---

## 五項硬性否決

1. P4中間位或追價
2. 所選Trigger Model核心邏輯失效
3. Retest快深強，否定原Reclaim或Breakout推動
4. 第一真實目標前冇最低可接受R:R
5. 違反交易時間或總風險上限

Model A要求Sweep／Reclaim；Model B要求Breakout／Acceptance。Breakout Model唔需要Sweep。

「方向偏見想放寬Trigger」及「情緒想加注」保留做紀律／統計標籤，唔再單獨列為自動硬性否決。

---

## 資料保存

文字紀錄使用瀏覽器localStorage。

圖片使用IndexedDB，會自動縮圖及JPEG壓縮。

清除Safari網站資料會刪除文字同圖片。

可以單獨匯出CSV，亦可以匯出「CSV＋全部照片 ZIP」作完整備份。


### 主判轉換＋次判局部趨勢特例

例如：

- 主判：轉換中－偏升
- 次判：弱跌勢
- 交易：Short

價格未到主判潛在支持，而且到支持前仍有完整R:R：

- P1／P2＋Q3可按包含轉換矩陣，最高0.5注。

接近主判潛在支持：

- 按大局／主判障礙規則降一級。

已到主判潛在支持區：

- 停止開新Short。
- 已有Short準備食糊。
- 觀察次判跌勢有冇被破壞。
- 開始等待Long setup。
- 新Short＝0注。


---

## V1.4 三層市場狀態部署提示

大局背景、主判斷、次判斷每個已選市場狀態下面，新增：

- 該層優先部署
- 該層次要部署

七種狀態都有獨立提示：

- 健康升勢
- 弱升勢
- 轉換中－偏升
- 轉換中－中性
- 轉換中－偏跌
- 弱跌勢
- 健康跌勢

重要：

呢啲只係「該時間框架自身狀態」嘅部署提示。

最終交易優先方向仍然由：

主判斷 × 次判斷

互動決定，唔會因單一時間框架顯示「Long優先」或「Short優先」而直接覆蓋V3.2主次關係邏輯。


---

## V1.5 交易日期

新增獨立「交易日期」欄位：

- 新增紀錄時預設自動填裝置當日日期
- 可以手動修改
- 與系統自動記錄嘅建立時間分開保存
- 紀錄列表會顯示交易日期
- 紀錄詳情可以修改交易日期
- CSV會分開匯出「交易日期」同「建立時間」

舊紀錄如果未有tradeDate欄位，App會先用原本createdAt推算日期作相容顯示。


---

## V1.6 主判 × 次判部署＋貼上圖片

### 主判斷 × 次判斷部署

移除原本大局、主判、次判每一層各自嘅「優先／次要部署」。

改為在三層市場狀態下方，只顯示一組：

- 主判斷 × 次判斷｜優先部署
- 主判斷 × 次判斷｜次要部署

內容會按以下關係動態改變：

- 健康同向
- 同向有弱勢
- 包含轉換
- 方向衝突
- 弱勢衝突
- 兩層都轉換／橫行邊界

大局背景唔會直接決定呢兩行部署，只負責後續障礙、風險及目標修正。

### Chart Screenshot貼上

圖片輸入由檔案上載改成剪貼簿貼上：

- Mac：點擊貼上區後按Command+V或Ctrl+V
- iPhone／iPad：點擊貼上區，使用系統貼上操作
- 亦提供「從剪貼簿貼上圖片」按鈕；瀏覽器容許直接讀取剪貼簿時可一鍵貼上
- 編輯舊紀錄時亦可以用同一方式貼上新圖片取代舊圖

圖片仍然會自動縮細、壓縮並儲存在IndexedDB。


---

## V1.7 多張Chart Screenshot

每筆交易紀錄而家可以保存多張圖片。

### 新紀錄

- 可以連續貼上多次圖片
- 每次貼上會新增圖片，不會覆蓋之前圖片
- 預覽區會顯示目前圖片總數
- 可以逐張移除
- 亦可以一次移除全部

### 編輯舊紀錄

- 舊版原本只保存一張圖片嘅紀錄會自動兼容
- 打開舊紀錄後，可以繼續貼上新圖片追加
- 可以逐張下載
- 可以逐張移除
- 可以下載全部圖片
- 可以移除全部圖片
- 圖片新增／移除要按「儲存修改」後正式生效

### 儲存方式

IndexedDB同一個record ID底下會保存Blob陣列。

舊版如果該record ID只儲存單一Blob，V1.7會自動轉成單張圖片陣列讀取，所以唔需要手動搬資料。

CSV新增「圖片數量」欄位，但圖片檔本身仍然唔會放入CSV。


---

## V1.8 匯出CSV＋照片 ZIP

紀錄庫新增兩種匯出：

### 匯出CSV

只匯出文字紀錄。

### 匯出CSV＋照片 ZIP

會產生一個ZIP備份包，內容包括：

- trades.csv
- backup-info.txt
- images/交易日期_品種_紀錄ID/image-1.jpg
- images/交易日期_品種_紀錄ID/image-2.jpg
- 其他同一筆紀錄圖片

多張Chart Screenshot會全部一齊匯出。

舊版單張圖片紀錄亦會自動包含喺ZIP。

ZIP功能係App內置產生，唔依賴外部CDN或第三方網站。


---

## V1.9 修正

### RF／TP2新增N/A

「去唔去到推RF位」及「去唔去到TP2」新增：

- Yes
- No
- N/A｜掛盤但冇成交／不適用

統計RF Rate及TP2 Rate時，N/A紀錄會排除喺分母之外，避免Miss／掛盤未成交紀錄拉低命中率。

### 外匯／黃金快速配置

預設：

- 大局背景：D
- 主判：4H
- 次判：1H
- 入場觸發：15M

### 交易空間預設

「到第一個真實目標嘅交易空間」預設改為：

- 有完整合理R:R

### 亞洲盤2B

高質門檻由5/5改為：

- 4/5或5/5＝高質

其他2B限制不變：

- 仍然要同交易方向一致
- 只可Q2→Q3
- 有結構基礎先可P3→P2
- 不可救Q1／P4
- 不可P2→P1
- 不可突破市場注碼上限


---

## V1.10 P1／P2定義修正

V1.9曾誤將「會改變主判／次判市場狀態嘅突破回測」加入P2，現已修正。

### P1

包括：

- 會改變主判／次判市場狀態嘅突破回測

### P2

還原原本定義，包括：

- 次判主結
- 主判次結
- 次判重要區間邊界
- 普通工作結構突破接受後首次回測
- impulse origin／swap zone
- 結構位置＋Asia／OPR／PDH／PDL


---

## V1.11｜Master Trade Decision Matrix V3.3

核心流程：

大局背景 → 主判斷 × 次判斷 → 交易優先方向 → 位置級別 → Trigger Model → Trigger質素 → 大局障礙修正 → 最終注碼

### Model A｜Liquidity Reversal

Sweep → Reclaim → Weak Retest

Q3核心：

- 有效Sweep
- 有效Reclaim
- Retest明顯較弱
- 完整合理R:R

Q2：

- 核心邏輯仍成立
- Reclaim普通／Retest有瑕疵／空間較短等

Q1：

- 冇真正Sweep
- 冇真正Reclaim
- Reclaim被否定
- Retest快深強
- R:R不足

### Model B｜Breakout／Retest Continuation

Breakout → Acceptance → Weak Retest

Q3核心：

- Breakout位置有意義
- Acceptance清楚
- Breakout有明顯推動
- Retest淺／慢／弱
- Retest有兩項或以上結構承接
- 完整合理R:R

Q2：

- 核心仍成立但Acceptance／動能／Retest／結構重疊／空間其中一項有瑕疵

Q1：

- False Breakout
- 冇Acceptance
- Breakout冇有效推動
- Retest吞噬Breakout
- 冇有效結構承接
- R:R不足

### 重要硬性修正

舊版「冇Sweep＝0注」正式取消。

而家只要所選Setup完整符合：

- Model A：Sweep → Reclaim → Weak Retest

或

- Model B：Breakout → Acceptance → Weak Retest

其中一套，就可以正常進入Q3／Q2評級。

### P2邊緣

位置質素同Trigger質素正式分開：

- P2邊緣＋Q3：注碼降一級
- P2邊緣＋Q2：偏向Skip；本App採用保守0注

### P1背景

可以獨立記錄：

- P1背景：有／冇

例如價格先喺P1重大位置反應，之後跌／升開一段，再喺新形成次判工作結構做P2，可以記做：

- P2＋P1背景順風

P1背景只係背景標籤，唔會將P2升P1，亦唔會提高注碼。

### Asia 2B

V3.3入面：

- 有原有結構基礎時，高質2B可以P3→P2
- 2B不再改變Trigger Model本身Q級
- 不可P2→P1
- 不可救P4
- 不可突破市場注碼上限

### 紀錄與CSV

新增保存：

- Trigger Model
- Breakout位置是否有意義
- Acceptance質素
- Breakout動能
- Breakout Retest質素
- Retest結構承接

舊V3.2紀錄仍可繼續顯示。


---

## V1.12｜OPR／亞洲盤2B、勝率、返回頂部

### OPR／亞洲盤頂／底2B

標題由：

- 亞洲盤頂／底2B｜執行優勢

改為：

- OPR／亞洲盤頂／底2B｜執行優勢

高質條件由5項增至6項，新增：

- 沒有頂底雙邊掃

即唔係先掃一邊、再掃另一邊嘅雙向洗盤。

高質門檻改為：

- 5/6或6/6＝高質
- 0–4/6＝未達高質

其他限制不變：

- 要同交易方向一致
- 有原有結構基礎先可P3→P2
- 不可P2→P1
- 不可救P4
- 不可突破市場注碼上限

### 勝率

紀錄庫與統計新增「勝率」。

計算方式：

- 只計Entry
- 只計已填有效獲利R嘅Entry
- 獲利R > 0.99＝Win
- 獲利R <= 0.99＝非Win

顯示格式：

- 勝率百分比
- Win數／可計算Entry數

例如：

50.0%｜5/10

### 返回網頁頂部

向下捲動超過約420px後，右下角會顯示「↑」按鍵。

按一下會平滑返回頁面頂部。


---

## V1.13｜勝率計算修正

紀錄庫「勝率」改為：

- 只計 Entry
- 必須已填有效獲利R
- R = 0 完全排除，不計入分母
- R > 0 = Win
- R < 0 = Loss

例如：

- +0.5R → Win
- +0.01R → Win
- 0R → 不計
- -0.2R → Loss
- 未填R → 不計

勝率顯示：

勝率百分比｜Win數／可計算Entry數


---

# V1.14｜Master Trade V3.5雙層架構

App正式拆成四個分頁：

1. Live Decision
2. Rulebook
3. 紀錄庫
4. 規則

## Live Decision Matrix V3.5

用途：

盤中只回答「而家做唔做？做幾大？」

只保留5步：

1. 主判 × 次判市場關係
2. Entry位置P
3. Trigger Model＋最終Q
4. 大局障礙
5. 查Matrix落注

Live Decision可直接選：

- 健康同向
- 同向有弱勢／包含Transition
- 方向衝突｜順主判
- 方向衝突｜順次判、逆主判

位置：

- P1
- P2
- P3
- P4

特殊位置規則：

P3結構位＋高質Asia／OPR頂底2B＋原有結構基礎，可以P3升P2。

純Liquidity／冇結構基礎嘅2B唔可以創造P2。

Trigger：

- Model A｜Sweep → Reclaim → Retest
- Model B｜Breakout → Acceptance → Retest

Q2快速升Q3只限：

- Q2本身代表1項未致命瑕疵
- 至少2項獨立加分證據
- 至少1項直接補強原本瑕疵
- 已確認冇Double Count

Q1永遠唔可以靠加分升級。

## Master Trade Rulebook V3.5

原本完整Decision／Journal表正式放入Rulebook分頁。

用途：

- Backtest
- 覆盤
- 爭議Setup
- 完整交易紀錄
- 系統規則修改

完整流程：

大局背景 → 主判斷 × 次判斷 → 交易優先方向 → 位置P → Trigger Model → Trigger質素Q → 大局障礙 → 注碼

核心分工：

- Market State決定方向及風險上限
- P評實際Entry位置
- Q評Trigger質素
- 大局只可以限制／降級
- Matrix決定最終注碼

## Asia／OPR 2B

V3.5正式歸入P位置評級，唔再作獨立Decision Step。

高質2B沿用6項評分：

5／6或以上具位置升級資格。

P3＋高質2B＋原有結構基礎：

P3 → P2

但：

- 純Asia／OPR Sweep唔可以由P4創造P2
- 2B唔會直接改變Q
- 同一個Sweep如果已經係Model A核心證據，唔可以再當Trigger Bonus重複計分

## Trigger加分證據

V3.5保留8項獨立加分證據。

加分只用於Q2修正，唔係獨立Decision Step。

Q2 → Q3要求：

- 原本只有1項未致命瑕疵
- 至少2項獨立加分
- 至少1項直接補強原本瑕疵
- 確認冇Double Count

Q1唔可以靠任何加分救返。

## Risk Matrix

健康同向：

- P1 Q3：1
- P2 Q3：1
- P1/P2 Q2：0.5
- P3 Q3：0.5

同向有弱勢／Transition：

- P1 Q3：0.5
- P2 Q3：0.5
- P1/P2 Q2：0.25
- P3 Q3：0.25／0

方向衝突順主判：

- P1 Q3：0.5
- P2 Q3：0.5
- P1/P2 Q2：0.25
- P3 Q3：0.25／0

方向衝突逆主判：

- P1 Q3：0.5
- P2 Q3：0.25
- P1 Q2：0.25
- P2 Q2：0／特殊情況
- P3／P4：0

## 資料相容

原本localStorage key及IndexedDB圖片資料庫名稱保持不變。

所以同一個GitHub Pages origin更新時，舊紀錄及圖片設計上會繼續沿用。

新紀錄：

- appVersion = PracticeJournal-V1.14
- engineVersion = MasterTradeDecisionMatrix-V3.5
