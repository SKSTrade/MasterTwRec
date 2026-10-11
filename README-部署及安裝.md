# Master Trade System V1.30.31
## Master Trade Matrix V1.4｜V1.3 Production Base + V1.4 Overlay

### V1.3 Production Base

V1.3 Direction Permission、Market State、P/Q、E、RR、Hard Veto、P4全部保留。

`V1.3 Production Size`仍然係Base Size同Valid Candidate來源。V1.4唔救Hard 0。

### V1.4 Rule 1｜正式

`P2-E + Q2同時含F+S` → 降一級。

### V1.4 Rule 2｜Shadow

`P2-E + Aligned With Weakness` → 降一級。

只限Healthy / Weak同向、至少一層Weak；唔包括Single Transition。

### V1.4 Rule 3｜正式

`P2-E + Raw P3-PB + Q3 + 明確方向Conflict + 順Main逆Secondary` → 升一級，Max 1.0。

Directional State包括H↑/W↑/T↑及H↓/W↓/T↓；任何一邊T0均排除。

Structural Gap Off用Secondary Main；Gap On用Secondary Working，即Effective Secondary Judge。

### V1.4 Rule 4｜Runner Shadow

`Raw P3-PB + Q3 + 明確方向Conflict + 順Main逆Secondary` → `50%@2R + 50% Runner→4R`。

唔要求P2-E，亦唔需要Initiative @2R gate。

### Interaction

- Multiple upgrades：最多+1 step
- Multiple downgrades：最多-1 step
- Upgrade + Downgrade：互相抵消，回到V1.3 Base
- Hard 0：V1.4永遠唔救返

### Pruned fields

已由操作UI／Record Detail／新CSV Export移除：
- Initiative Trigger Level
- Initiative @2R
- Control Alignment
- Auction Move維持刪除
- ATR / Body-ATR研究欄維持不再記錄

舊CSV仍可Import；Legacy欄位只作向後兼容，唔再係新紀錄欄位。

### Report split

新CSV保留足夠欄位分拆：
- V1.3 Base
- V1.4 Size-only
- V1.4 Runner-only
- V1.4 Full
