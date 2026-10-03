# Master Trade System V1.30.28
## Structural Gap｜Secondary Judge Source Switch

### 主判

主判永遠使用：

> Main-TF Official Market State

Main不存在Structural Gap Mode。

Main Working只係形成Main-TF Official Market State嘅內部結構資訊，唔會取代Main成為另一個獨立Judge。

### 次判

正常狀態：

> Structural Gap = Off  
> Secondary Judge Source = Official

Matrix使用：

> Secondary-TF Official Market State

Structural Gap只有以下兩個Trigger：

#### Trigger 1
一腳大升／跌：

> Main同Working幾乎重疊  
> 冇獨立Secondary structure反映current control

#### Trigger 2
原Secondary被B+H破壞：

> Working已確認反方向Trend

當：

> Structural Gap = On

次判Source正式切換：

> Official → Working

Matrix實際輸入嘅Secondary Judge State改用：

> Secondary-TF Working Market State

### Matrix

Matrix本身完全不改。

流程：

> Main Official Market State  
> × Secondary Judge State  
> → 原V1.3 Direction Permission / Route  
> → P  
> → Q  
> → Route Cap  
> → Size

Structural Gap唔會創造新Size表、唔會直接升／降P、Q或Size。

### T0

T0 Subtype亦跟Active Secondary Judge Source：

- Gap Off → Secondary Official State
- Gap On → Secondary Working State

T0-Balance / T0-Post-Break數值及25% Auction Filter規則完全保留V1.30.27。

### Journal / CSV

新增保存：

- Structural Gap
- Structural Gap Trigger
- Secondary Working Market State
- Secondary Judge Source
- Secondary Judge State

CSV由172欄增加至177欄。

舊CSV／舊紀錄冇Structural Gap欄時：

> Structural Gap = Off  
> Secondary Judge Source = Official  
> Secondary Judge State = 原本次判狀態

所以舊資料唔會被retroactive改判。

### 保持不變

- V1.3 Matrix數值不變
- T0-Balance / T0-Post-Break不變
- P / E / Native Q不變
- Obstacle / RR不變
- XAU-B Mon H/L fix保留
- FX-B Warning parity保留
- FX-C行為不改
- V1.4未啟用
