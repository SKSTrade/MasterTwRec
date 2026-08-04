# Master Trade System V1.26.5｜逆弱主判P2第二條權限

## 原有路徑A保留

> 弱主判  
> → 主判近端次結／工作結構有效逆向突破＋Acceptance  
> → 第一次Retest  
> → P2／合格P2-effective＋Q3  
> → 逆主判方向最高0.25注

呢條仍然係最乾淨版本。

## 新增路徑B

> 弱主判  
> → 健康反方向次判  
> → 全新、獨立高質Session催化  
> → P2／合格P2-effective＋Q3  
> → 最高0.25注

路徑B全部條件：

1. 主判只可以係弱勢，健康主判唔適用。
2. 主判近端次結／工作結構已被逆向有效突破，有Acceptance，而且價格仍未Reclaim返去。
3. 次判已經係健康反方向趨勢，唔只係轉換偏向。
4. 今次係全新、獨立Session催化，唔係繼續借用已過期嘅路徑A故事。
5. Setup必須係：
   - EU-B Full Repair；
   - 高質EU-D Asia Sweep＋Post-open Confirmation；
   - 高質指定Session Setup；
   - 或手動確認嘅其他同級開市後Sweep／Reclaim Setup。
6. 實際位置至少P2或合格P2-effective。
7. Entry-time必須Q3；Q2固定0注。
8. 去主判主結／第一硬障礙至少1.5R，最好接近2R。
9. 未處於次判成熟逆向腿尾段。
10. 未貼近主判主結／第一硬障礙。

全部成立：

> 最高0.25注，永遠唔升到0.5。

## 點解唔全面放寬

唔會改成：

> 弱主判＋健康次判＋任何P2 Q3＝0.25

原因係次判可以喺主判回調中段反覆轉向，咁樣會重新造成過度交易。

真正新增嘅權限係：

> 健康逆向次判已成立，再由一個全新Session流動性事件重新啟動趨勢。

## App實作

Rulebook：

- 逆弱主判P2權限可以揀路徑A或路徑B。
- 路徑B會逐項檢查次判健康、工作結構突破維持、新Session催化、Setup身份、Q3、至少1.5R、未到成熟腿尾及未貼近主判主結。
- EU-B／EU-D／高質指定Session Setup會由App識別。
- 其他同級Setup必須手動確認。
- 原始P3經EU-D／Type A取得P2-effective亦可使用路徑B。
- 市場Matrix仍然固定最高0.25。

Live Decision：

- 新增「路徑B｜弱主判＋健康次判＋新Session確認」。
- 必須完整勾選全部條件先會取得0.25。

## 其他功能保留

- EU-B／EU-D專屬分類顯示
- EU-D P3→P2-effective規則
- 紀錄庫批量選取及刪除
- 左下角Default
- 本機紀錄及圖片


## CSV

V1.26.5 CSV共119欄，新增路徑B資格、Setup識別、障礙距離及成熟度欄位；舊CSV仍保留兼容匯入。
