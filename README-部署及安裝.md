# Master Trade V3.4 PWA

呢個版本唔需要 Apple Developer 簽署，冇 7 日到期限制。

## 已包含

- 入場觸發層自動配置
- 五種市場狀態
- 主判斷 × 次判斷市場關係
- P1–P4
- Sweep／Reclaim／Momentum／Retest Checklist
- 自動 Q3／Q2／Q1
- V3 注碼矩陣
- 大局背景條件式 0.5 注封頂
- 硬性否決
- 本機紀錄、平均注碼、平均 R、勝率
- CSV 匯出
- 離線使用
- 可加入 iPhone 主畫面

## 重要資料說明

交易紀錄儲存在 Safari 網站資料（localStorage）。

以下操作可能刪除紀錄：

- 清除 Safari 網站資料
- 使用無痕瀏覽
- 刪除該網站資料
- 系統清理工具清理 Safari 資料

請定期匯出 CSV 備份。

## 免費部署到 GitHub Pages

### 1. 建立 Repository

在 GitHub 建立一個公開 Repository，例如：

`master-trade-pwa`

### 2. 上載檔案

解壓縮後，將 `MasterTradePWA` 資料夾入面嘅內容上載到 Repository 根目錄：

- index.html
- styles.css
- app.js
- manifest.webmanifest
- service-worker.js
- icons 資料夾

唔好直接上載 ZIP。

### 3. 開啟 GitHub Pages

Repository：

`Settings → Pages`

設定：

- Source：Deploy from a branch
- Branch：main
- Folder：/(root)

儲存後等一至數分鐘，GitHub會提供網站網址。

## 加入 iPhone 主畫面

1. 用 iPhone Safari 打開 GitHub Pages 網址。
2. 撳 Safari 分享按鈕。
3. 選「加入主畫面」。
4. 名稱可改做 `Trade Matrix`。
5. 撳「加入」。

之後主畫面會有 App 圖示，以獨立視窗運行，亦冇 7 日簽署限制。

## Mac 本機測試

唔好直接雙擊 `index.html` 測試 Service Worker。

Terminal 進入資料夾後執行：

```bash
python3 -m http.server 8080
```

再打開：

```text
http://localhost:8080
```

## 更新 PWA

每次修改並重新部署，建議將 `service-worker.js` 入面：

```text
CACHE_NAME
```

由例如：

```text
master-trade-v34-pwa-1
```

改成：

```text
master-trade-v34-pwa-2
```

確保裝置取得新版本。
