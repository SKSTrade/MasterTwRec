(() => {
"use strict";

const STORAGE_KEY = "masterTradePracticeJournalV1Records";
const IMAGE_DB_NAME = "masterTradePracticeJournalImages";
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE = "chartImages";

const $ = (id) => document.getElementById(id);
const checked = (id) => $(id).checked;
const direction = () =>
  document.querySelector('input[name="direction"]:checked').value;
const recordMode = () =>
  document.querySelector('input[name="recordMode"]:checked').value;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function recordTradeDate(record) {
  if (record.tradeDate) return record.tradeDate;

  if (record.createdAt) {
    const parsed = new Date(record.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return localDateString(parsed);
    }
  }

  return "";
}

const TIMEFRAMES = [
  "MN", "W", "D", "4H", "2H", "1H",
  "30M", "15M", "5M", "3M", "1M"
];

const STATES = {
  "健康升勢": {
    type: "healthy",
    bias: "up",
    note: "HH／HL清楚；主結未破；推動有延續；回調正常；突破前高後有follow-through。",
    priorityDeployment: "順勢Long優先：等回調到P1／P2支持、HL或有效突破回測，再配合完整Long Trigger；避免高位追價。",
    secondaryDeployment: "Short只作重大阻力／大局障礙附近嘅短程回調或反轉觀察；一般只限高級位置＋完整Trigger，唔當主劇本。"
  },
  "弱升勢": {
    type: "weak",
    bias: "up",
    note: "升勢主結仍未有效跌穿，但回調過深、升段動能被抵消、次結可能失守，新高延續差。",
    priorityDeployment: "Long仍然優先，但只做P1／P2回調位置，唔追延伸段；最好等次級結構重新轉強再部署。",
    secondaryDeployment: "到重大阻力或上方流動性區，可用高質Trigger捕Short回調／反轉；仍要受更高級別方向同前方空間限制。"
  },
  "轉換中－偏升": {
    type: "transition",
    bias: "up",
    note: "原跌勢已被破壞；開始出現HL候選或突破局部LH，但未正式完成新升勢確認。",
    priorityDeployment: "準備Long優先：等潛在HL、P1／P2支持或突破回測出Long Trigger；確認新升勢前最高仍按轉換權限。",
    secondaryDeployment: "Short可跟尚未完全破壞嘅局部跌勢／回調先行，但只做到潛在HL或主判支持前；一到支持區停止新Short。"
  },
  "轉換中－中性": {
    type: "transition",
    bias: null,
    note: "原趨勢已破；多空動能抵消；未有明確方向優勢，可能正在形成橫行。",
    priorityDeployment: "優先等清晰區間形成後做P1／P2邊界，或者等有效突破接受＋首次回測再跟新方向。",
    secondaryDeployment: "若更高一級有明確方向，可做順更高級別嘅短程trade；中間位不做，目標以區間另一邊或重大障礙前為主。"
  },
  "轉換中－偏跌": {
    type: "transition",
    bias: "down",
    note: "原升勢已被破壞；開始出現LH候選或跌穿局部HL，但未正式完成新跌勢確認。",
    priorityDeployment: "準備Short優先：等潛在LH、P1／P2阻力或跌破回測出Short Trigger；確認新跌勢前最高仍按轉換權限。",
    secondaryDeployment: "Long可跟尚未完全破壞嘅局部升勢／反彈先行，但只做到潛在LH或主判阻力前；一到阻力區停止新Long。"
  },
  "弱跌勢": {
    type: "weak",
    bias: "down",
    note: "跌勢主結仍未有效升穿，但回調過深、跌段動能被抵消，延續能力下降。",
    priorityDeployment: "Short仍然優先，但只做P1／P2回調位置，唔追延伸段；最好等次級結構重新轉弱再部署。",
    secondaryDeployment: "到重大支持或下方流動性區，可用高質Trigger捕Long反彈／反轉；仍要受更高級別方向同前方空間限制。"
  },
  "健康跌勢": {
    type: "healthy",
    bias: "down",
    note: "LH／LL清楚；主結未破；跌段有延續；回調正常；跌穿前低後有follow-through。",
    priorityDeployment: "順勢Short優先：等回調到P1／P2阻力、LH或有效跌破回測，再配合完整Short Trigger；避免低位追空。",
    secondaryDeployment: "Long只作重大支持／大局障礙附近嘅短程反彈或反轉觀察；一般只限高級位置＋完整Trigger，唔當主劇本。"
  }
};

const POSITION_INFO = {
  P1: {
    title: "最高級位置",
    note: "週／日線重大支持阻力、大局背景主結、主判主結、主判大型區間邊界、會改變主判市場狀態嘅突破回測、次判主結同大局／主判重大位置直接重疊，以及W618／D618同實際HTF結構重疊。Fib本身唔可以成為P1。"
  },
  P2: {
    title: "A級工作位置",
    note: "次判主結、主判次結、次判重要區間邊界、普通工作結構突破接受後首次回測、impulse origin／swap zone，以及結構位置＋Asia／OPR／PDH／PDL。"
  },
  P3: {
    title: "次級位置",
    note: "次判次結、入場層主結、session liquidity＋普通局部結構、0.618＋普通swap、低級別區間邊界。主要適合健康同向順勢，或0.25注測試。"
  },
  P4: {
    title: "無交易位置",
    note: "橫行中間、純Fib、純Asia／OPR、純2B冇結構、追突破、距離上下重要位置相若，或者入場後即刻撞重大支持／阻力。P4無論Trigger幾靚都係0注。"
  }
};

const SIZE_LABELS = {
  0: "0注｜不做",
  0.25: "0.25注",
  0.5: "0.5注",
  1: "1注"
};

const BONUS_IDS = [
  "bonusRVOL",
  "bonusCloseExtreme",
  "bonusCleanerReclaim",
  "bonusRetestTime",
  "bonusDepth",
  "bonusImpulseOrigin",
  "bonusFib",
  "bonusLiquidityOverlap",
  "bonusFollowThrough"
];

let currentBaseTrigger = null;
let currentAsia2B = null;
let currentDecision = null;
let activeRecordId = null;
let suppressPresetChange = false;

let pendingImageBlob = null;
let pendingImageUrl = null;
let editingImageBlob = null;
let editingImageUrl = null;
let storedImageUrl = null;
let removeStoredImageRequested = false;

function isTransition(stateName) {
  return STATES[stateName]?.type === "transition";
}

function isHealthy(stateName) {
  return STATES[stateName]?.type === "healthy";
}

function isWeak(stateName) {
  return STATES[stateName]?.type === "weak";
}

function stateBias(stateName) {
  return STATES[stateName]?.bias ?? null;
}

function biasDirectionLabel(bias) {
  if (bias === "up") return "Long";
  if (bias === "down") return "Short";
  return "中性";
}

function tradeBias() {
  return direction() === "Long" ? "up" : "down";
}

function timeframeValues() {
  return {
    background: $("backgroundTimeframe").value,
    main: $("mainTimeframe").value,
    secondary: $("secondaryTimeframe").value,
    entry: $("entryTimeframe").value
  };
}

function applyTimeframePreset(value) {
  suppressPresetChange = true;

  if (value === "fx") {
    $("backgroundTimeframe").value = "D";
    $("mainTimeframe").value = "4H";
    $("secondaryTimeframe").value = "1H";
    $("entryTimeframe").value = "5M";
  } else if (value === "hsi1m") {
    $("backgroundTimeframe").value = "4H";
    $("mainTimeframe").value = "1H";
    $("secondaryTimeframe").value = "15M";
    $("entryTimeframe").value = "1M";
  }

  suppressPresetChange = false;
}

function marketRelation(mainState, secondaryState) {
  if (isTransition(mainState) || isTransition(secondaryState)) {
    return "包含轉換";
  }

  const mainBias = stateBias(mainState);
  const secondaryBias = stateBias(secondaryState);

  if (mainBias === secondaryBias) {
    if (isHealthy(mainState) && isHealthy(secondaryState)) {
      return "健康同向";
    }
    return "同向有弱勢";
  }

  if (isWeak(mainState) && isWeak(secondaryState)) {
    return "弱勢衝突";
  }

  return "方向衝突";
}

function marketCapForRelation(relation) {
  return relation === "健康同向" ? 1 : 0.5;
}

function backgroundRelationInfo() {
  const state = $("backgroundState").value;
  const bias = stateBias(state);
  const type = STATES[state].type;

  if (bias === null) {
    return {
      label: "大局中性",
      note: "大局背景暫時冇明確方向傾向；不會提供加注理由。"
    };
  }

  const aligned = bias === tradeBias();
  const descriptor =
    type === "transition" ? "傾向" : "方向";

  return {
    label: aligned
      ? `順大局${descriptor}`
      : `逆大局${descriptor}`,
    note: "V3.2唔會因單純順／逆大局方向直接升級注碼；真正注碼限制由大局障礙位置及交易空間處理。"
  };
}

function preferredDirectionInfo() {
  const mainState = $("mainState").value;
  const secondaryState = $("secondaryState").value;
  const relation = marketRelation(mainState, secondaryState);

  const mainBias = stateBias(mainState);
  const secondaryBias = stateBias(secondaryState);
  const mainTransition = isTransition(mainState);
  const secondaryTransition = isTransition(secondaryState);

  if (relation === "健康同向" || relation === "同向有弱勢") {
    return {
      label: `共同方向 ${biasDirectionLabel(mainBias)}`,
      note: "主判同次判方向一致；只係市場健康程度決定最高注碼係1注定0.5注。"
    };
  }

  if (relation === "方向衝突") {
    return {
      label: `順主判 ${biasDirectionLabel(mainBias)} 優先`,
      note: `次判${biasDirectionLabel(secondaryBias)}只視為局部反彈／回調方向；逆主判交易要用較保守矩陣。`
    };
  }

  if (relation === "弱勢衝突") {
    return {
      label: `主判位置優先 ${biasDirectionLabel(mainBias)}`,
      note: "兩邊都弱，容易演變成大區間／轉換。主判重大位置部署優先，中間位不做。"
    };
  }

  if (mainTransition && secondaryTransition) {
    return {
      label: "區間邊界／等確認",
      note: "兩個核心層都未正式確認新趨勢；只有已形成橫行而且目前係清晰邊界先考慮交易。"
    };
  }

  if (!mainTransition && secondaryTransition) {
    if (secondaryBias === mainBias) {
      return {
        label: `順主判 ${biasDirectionLabel(mainBias)} 優先`,
        note: "次判轉換傾向同主判一致，只代表準備重新對齊；未正式確認前市場最高仍然0.5注。"
      };
    }

    if (secondaryBias === null) {
      return {
        label: `順主判 ${biasDirectionLabel(mainBias)} 優先`,
        note: "次判轉換中性；優先等價格去主判P1／P2位置，再捕主判方向。"
      };
    }

    return {
      label: `順主判 ${biasDirectionLabel(mainBias)} 優先`,
      note: `次判轉換傾向${biasDirectionLabel(secondaryBias)}只當主判趨勢內局部回調；順次判方向只可做短程trade，而且要有足夠空間。`
    };
  }

  if (mainTransition && !secondaryTransition) {
    if (mainBias === secondaryBias && mainBias !== null) {
      return {
        label: `順次判局部 ${biasDirectionLabel(secondaryBias)}`,
        note: "主判轉換傾向同次判方向一致，但主判未確認；可以跟次判行一段，最高仍然0.5注。"
      };
    }

    const mainPotential =
      mainBias === null
        ? "主判潛在結構位"
        : `主判潛在${biasDirectionLabel(mainBias)}結構位`;

    return {
      label: `順次判局部 ${biasDirectionLabel(secondaryBias)}`,
      note: `可以跟次判方向打到${mainPotential}前，但唔係無限期跟；到主判潛在支持／阻力後停止新開同方向trade並準備食糊。`
    };
  }

  return {
    label: "等確認",
    note: "目前未能建立清晰優先方向。"
  };
}

function combinedDeploymentInfo() {
  const mainState = $("mainState").value;
  const secondaryState = $("secondaryState").value;
  const relation = marketRelation(mainState, secondaryState);

  const mainBias = stateBias(mainState);
  const secondaryBias = stateBias(secondaryState);
  const mainTransition = isTransition(mainState);
  const secondaryTransition = isTransition(secondaryState);

  const mainDirection = biasDirectionLabel(mainBias);
  const secondaryDirection = biasDirectionLabel(secondaryBias);
  const mainEntryArea =
    mainBias === "up"
      ? "支持／HL候選"
      : mainBias === "down"
        ? "阻力／LH候選"
        : "主判關鍵邊界";
  const mainOppositeArea =
    mainBias === "up"
      ? "重大阻力"
      : mainBias === "down"
        ? "重大支持"
        : "另一邊界";

  if (relation === "健康同向") {
    return {
      priority: `優先順共同${mainDirection}方向：等價格回調到P1／P2 ${mainEntryArea}、主／次判有效結構回測，再配合Q3部署；避免追延伸段。`,
      secondary: `逆方向只作${mainOppositeArea}附近短程回調／反轉trade；一般只限高級位置＋完整Trigger，唔當主劇本。`
    };
  }

  if (relation === "同向有弱勢") {
    return {
      priority: `優先順共同${mainDirection}方向，但只做P1／P2回調位置，唔追延伸段；Q3為主，市場最高0.5注。`,
      secondary: `逆方向只喺${mainOppositeArea}或大局障礙附近用高質Trigger捕短程反彈／回調；中間位不做。`
    };
  }

  if (relation === "方向衝突") {
    return {
      priority: `優先順主判${mainDirection}：等次判${secondaryDirection}走到主判P1／P2 ${mainEntryArea}後，再等次判重新轉向主判方向先部署；最高0.5注。`,
      secondary: `順次判${secondaryDirection}、逆主判只當局部反彈／回調trade：P1＋Q3最多0.5注，P2＋Q3最多0.25注；P3／P4不做。`
    };
  }

  if (relation === "弱勢衝突") {
    return {
      priority: `優先以主判位置為核心：價格回到主判P1／P2 ${mainEntryArea}，等次判弱${secondaryDirection}被破壞後再順主判${mainDirection}部署；P3通常不做。`,
      secondary: `到主判${mainOppositeArea}可以捕次判方向嘅短程反彈／回調；兩層都弱，中間位一律避免。`
    };
  }

  if (mainTransition && secondaryTransition) {
    if ($("bothTransitionRange").value === "yes") {
      const sameBias =
        mainBias !== null &&
        mainBias === secondaryBias;

      return {
        priority: sameBias
          ? `兩層都轉換但傾向同為${mainDirection}：只喺已形成橫行嘅P1／P2清晰邊界優先部署${mainDirection}，最高仍然0.5注，唔視為正式趨勢對齊。`
          : "兩層都轉換：優先只做已形成橫行嘅P1／P2清晰區間邊界；中間位不做。",
        secondary: "另一邊界可等反向高質Trigger，或者等待有效突破接受＋首次回測後先建立新方向。"
      };
    }

    return {
      priority: "兩層都轉換而未形成可交易橫行：優先等待清晰區間邊界，或者等有效突破接受＋首次回測。",
      secondary: "暫時冇次要部署；中間位不做，避免將偏升／偏跌誤當成已確認趨勢。"
    };
  }

  if (!mainTransition && secondaryTransition) {
    if (secondaryBias === mainBias) {
      return {
        priority: `主判${mainDirection}＋次判轉換傾向同向：優先順主判${mainDirection}做P1／P2＋Q3，最高0.5注；次判未正式確認前不可一注。`,
        secondary: `逆主判方向只限${mainOppositeArea}附近重大P1位置做短程反轉；一般P2／P3唔當次要主劇本。`
      };
    }

    if (secondaryBias === null) {
      return {
        priority: `主判${mainDirection}＋次判轉換中性：優先等價格去主判P1／P2 ${mainEntryArea}捕${mainDirection}；P1＋Q3可0.5，P2通常0.25或等。`,
        secondary: "次判未有方向優勢；次要部署以等待區間邊界／新結構確認為主，而唔係主動逆主判。"
      };
    }

    return {
      priority: `主判${mainDirection}＋次判轉換傾向${secondaryDirection}：仍然優先等主判P1／P2 ${mainEntryArea}捕${mainDirection}，唔將次判傾向當成新趨勢追。`,
      secondary: `順次判${secondaryDirection}只當主判趨勢內局部回調trade；必須有足夠空間，P1＋Q3最多0.5、P2＋Q3通常0.25，去到主判${mainEntryArea}前食糊。`
    };
  }

  if (mainTransition && !secondaryTransition) {
    if (
      mainBias !== null &&
      mainBias === secondaryBias
    ) {
      return {
        priority: `主判轉換傾向${mainDirection}＋次判已確認${secondaryDirection}：優先順次判${secondaryDirection}做P1／P2局部trend trade，最高0.5注，但唔當兩層正式對齊。`,
        secondary: `到主判潛在結構／大局障礙附近停止追${secondaryDirection}，觀察次判趨勢有冇被破壞，再等主判完成正式確認。`
      };
    }

    if (mainBias === null) {
      return {
        priority: `主判轉換中性＋次判${secondaryDirection}：可順次判${secondaryDirection}做局部trade，但只打到主判潛在區間邊界／重大障礙前，最高0.5注。`,
        secondary: "到主判潛在邊界後停止新開同方向倉，等反向Trigger或等主判方向確認。"
      };
    }

    const potentialArea =
      mainBias === "up"
        ? "潛在HL／支持區"
        : "潛在LH／阻力區";

    return {
      priority: `主判轉換傾向${mainDirection}、次判${secondaryDirection}：可以先順次判${secondaryDirection}做局部回調trade，但只打到主判${potentialArea}前；P1／P2＋Q3最高0.5注。`,
      secondary: `到主判${potentialArea}後停止新開${secondaryDirection}，已有倉準備食糊；開始等次判趨勢被破壞，再部署主判傾向${mainDirection}。`
    };
  }

  return {
    priority: "優先等待主判 × 次判關係變得清晰。",
    secondary: "暫時唔設定次要部署。"
  };
}

function countChecked(ids) {
  return ids.filter((id) => checked(id)).length;
}

function evaluateBaseTrigger() {
  const failures = [];
  const imperfections = [];
  const positives = [];
  const bonusCount = countChecked(BONUS_IDS);

  const validSweep = checked("validSweep");
  const validReclaim = checked("validReclaim");
  const reclaimQuality = $("reclaimQuality").value;
  const retestQuality = $("retestQuality").value;
  const tradeSpace = $("tradeSpace").value;
  const p2Edge =
    $("positionLevel").value === "P2" &&
    checked("p2EdgePosition");

  if (!validSweep) {
    failures.push("冇有效Sweep。");
  } else {
    positives.push("有效Sweep成立。");
  }

  if (!validReclaim) {
    failures.push("冇真正有效Reclaim。");
  } else {
    positives.push("有效Reclaim成立。");
  }

  if (reclaimQuality === "negated") {
    failures.push("Reclaim即刻被完全吞噬／否定。");
  } else if (reclaimQuality === "ordinary") {
    imperfections.push("Reclaim質素普通，但仍有效。");
  } else {
    positives.push("Reclaim乾淨／明確。");
  }

  if (retestQuality === "invalid") {
    failures.push("Retest快、深、強，已否定Reclaim。");
  } else if (retestQuality === "imperfect") {
    imperfections.push("Retest有瑕疵，但未達失效。");
  } else {
    positives.push("Retest明顯弱過Reclaim。");
  }

  if (tradeSpace === "insufficient") {
    failures.push("第一個真實目標前空間不足。");
  } else if (tradeSpace === "short") {
    imperfections.push("交易空間略短，但仍達最低可接受R:R。");
  } else {
    positives.push("到第一個真實目標有完整合理R:R。");
  }

  if (p2Edge) {
    imperfections.push("目前係P2邊緣／質素普通位置。");
  }

  if (checked("chasedBreakout")) {
    failures.push("入場屬追價。");
  }

  if (bonusCount > 0) {
    positives.push(`有${bonusCount}項Trigger加分證據。`);
  }

  let quality = "Q1";

  if (failures.length === 0) {
    const completeHighQuality =
      reclaimQuality === "strong" &&
      retestQuality === "weak" &&
      tradeSpace === "full" &&
      !p2Edge;

    quality = completeHighQuality ? "Q3" : "Q2";
  }

  return {
    quality,
    failures,
    imperfections,
    positives,
    bonusCount,
    validSweep,
    validReclaim,
    reclaimQuality,
    retestQuality,
    tradeSpace,
    p2Edge
  };
}

function evaluateAsia2B(baseTrigger) {
  const type = $("asia2BType").value;
  const active = type !== "none";
  const expectedDirection =
    type === "asiaTop"
      ? "Short"
      : type === "asiaBottom"
        ? "Long"
        : null;
  const directionMatches =
    active && direction() === expectedDirection;

  const criteriaCount = [
    checked("asia2BClearLiquidity"),
    checked("asia2BCleanSweep"),
    checked("asia2BReclaimBreak"),
    checked("asia2BWeakRetest"),
    checked("asia2BVolumeSupport")
  ].filter(Boolean).length;

  const highQuality =
    active &&
    directionMatches &&
    criteriaCount === 5;

  const basePosition = $("positionLevel").value;
  const structureOverlap = checked("asia2BStructureOverlap");
  let effectivePosition = basePosition;
  let effectiveQuality = baseTrigger.quality;
  let positionPromoted = false;
  let triggerPromoted = false;

  const reasons = [];
  const warnings = [];

  const label =
    type === "asiaTop"
      ? "洗亞洲盤頂2B"
      : type === "asiaBottom"
        ? "洗亞洲盤底2B"
        : "冇亞洲盤2B";

  if (!active) {
    return {
      type,
      label,
      active,
      directionMatches: false,
      criteriaCount: 0,
      highQuality: false,
      structureOverlap: false,
      basePosition,
      effectivePosition,
      baseQuality: baseTrigger.quality,
      effectiveQuality,
      positionPromoted,
      triggerPromoted,
      reasons,
      warnings
    };
  }

  if (!directionMatches) {
    warnings.push(`${label}同實際交易方向唔一致，所以唔提供升格。`);
  } else if (!highQuality) {
    warnings.push(`${label}只符合${criteriaCount}/5項高質條件，未達自動升格標準。`);
  }

  if (highQuality && baseTrigger.quality === "Q2") {
    const canUpgradeTrigger =
      baseTrigger.validSweep &&
      baseTrigger.validReclaim &&
      baseTrigger.reclaimQuality !== "negated" &&
      baseTrigger.retestQuality !== "invalid" &&
      baseTrigger.tradeSpace === "full" &&
      !checked("chasedBreakout");

    if (canUpgradeTrigger) {
      effectiveQuality = "Q3";
      triggerPromoted = true;
      reasons.push(`高質${label}補強執行質素，Trigger由Q2升至Q3。`);
    } else {
      warnings.push(`高質${label}唔可以製造交易空間、拯救失效Reclaim／Retest或追價，所以Trigger維持Q2。`);
    }
  } else if (highQuality && baseTrigger.quality === "Q1") {
    warnings.push(`即使係高質${label}，都唔可以拯救Q1。`);
  } else if (highQuality && baseTrigger.quality === "Q3") {
    reasons.push(`高質${label}確認執行優勢；原本已經係Q3，所以Trigger維持Q3。`);
  }

  if (
    highQuality &&
    basePosition === "P3" &&
    structureOverlap
  ) {
    effectivePosition = "P2";
    positionPromoted = true;
    reasons.push(`高質${label}加原有結構基礎，位置由P3升至P2。`);
  } else if (
    highQuality &&
    basePosition === "P3" &&
    !structureOverlap
  ) {
    warnings.push(`${label}冇原有結構基礎，P3不可升P2。`);
  } else if (highQuality && basePosition === "P2") {
    warnings.push(`${label}不可將P2升做P1；位置維持P2。`);
  } else if (highQuality && basePosition === "P4") {
    warnings.push(`${label}不可拯救P4中間位；位置維持P4。`);
  }

  reasons.push("2B係執行優勢，不是市場狀態優勢；市場注碼上限完全不變。");

  return {
    type,
    label,
    active,
    directionMatches,
    criteriaCount,
    highQuality,
    structureOverlap,
    basePosition,
    effectivePosition,
    baseQuality: baseTrigger.quality,
    effectiveQuality,
    positionPromoted,
    triggerPromoted,
    reasons,
    warnings
  };
}

function matrixCell(position, quality, p3Testable, mode) {
  if (quality === "Q1" || position === "P4") return 0;

  if (mode === "healthyAligned") {
    if ((position === "P1" || position === "P2") && quality === "Q3") return 1;
    if ((position === "P1" || position === "P2") && quality === "Q2") return 0.5;
    if (position === "P3" && quality === "Q3") return 0.5;
    if (position === "P3" && quality === "Q2") return p3Testable ? 0.25 : 0;
    return 0;
  }

  if (
    mode === "weakOrTransition" ||
    mode === "conflictWithMain"
  ) {
    if ((position === "P1" || position === "P2") && quality === "Q3") return 0.5;
    if ((position === "P1" || position === "P2") && quality === "Q2") return 0.25;
    if (position === "P3" && quality === "Q3") return p3Testable ? 0.25 : 0;
    return 0;
  }

  if (mode === "weakConflictMain") {
    if ((position === "P1" || position === "P2") && quality === "Q3") return 0.5;
    if ((position === "P1" || position === "P2") && quality === "Q2") return 0.25;
    return 0;
  }

  if (
    mode === "conflictWithSecondary" ||
    mode === "localCounter"
  ) {
    if (position === "P1" && quality === "Q3") return 0.5;
    if (position === "P1" && quality === "Q2") return 0.25;
    if (position === "P2" && quality === "Q3") return 0.25;
    return 0;
  }

  if (mode === "strongCounter") {
    if (position === "P1" && quality === "Q3") return 0.5;
    if (position === "P1" && quality === "Q2") return 0.25;
    return 0;
  }

  if (mode === "bothTransitionRange") {
    if (position === "P1" && quality === "Q3") return 0.5;
    if (position === "P1" && quality === "Q2") return 0.25;
    if (position === "P2" && quality === "Q3") return 0.25;
    if (position === "P3" && quality === "Q3") return p3Testable ? 0.25 : 0;
    return 0;
  }

  return 0;
}

function evaluateMatrix(effectivePosition, effectiveQuality) {
  const mainState = $("mainState").value;
  const secondaryState = $("secondaryState").value;
  const relation = marketRelation(mainState, secondaryState);
  const mainBias = stateBias(mainState);
  const secondaryBias = stateBias(secondaryState);
  const currentTradeBias = tradeBias();
  const mainTransition = isTransition(mainState);
  const secondaryTransition = isTransition(secondaryState);
  const p3Testable = checked("p3Testable");

  let mode = "none";
  let route = "未有可交易方向權限";

  if (relation === "健康同向") {
    if (currentTradeBias === mainBias) {
      mode = "healthyAligned";
      route = "健康同向｜順共同趨勢";
    } else {
      mode = "strongCounter";
      route = "健康同向｜逆兩層健康共同趨勢，只限P1反轉";
    }
  } else if (relation === "同向有弱勢") {
    if (currentTradeBias === mainBias) {
      mode = "weakOrTransition";
      route = "同向有弱勢｜順共同方向";
    } else {
      mode = "strongCounter";
      route = "同向有弱勢｜逆共同方向，只限P1";
    }
  } else if (relation === "方向衝突") {
    if (currentTradeBias === mainBias) {
      mode = "conflictWithMain";
      route = "方向衝突｜順主判方向";
    } else if (currentTradeBias === secondaryBias) {
      mode = "conflictWithSecondary";
      route = "方向衝突｜順次判局部方向、逆主判";
    }
  } else if (relation === "弱勢衝突") {
    if (currentTradeBias === mainBias) {
      mode = "weakConflictMain";
      route = "弱勢衝突｜順主判方向，但P3不做";
    } else if (currentTradeBias === secondaryBias) {
      mode = "conflictWithSecondary";
      route = "弱勢衝突｜順次判局部方向、逆主判";
    }
  } else if (relation === "包含轉換") {
    if (mainTransition && secondaryTransition) {
      if ($("bothTransitionRange").value === "yes") {
        mode = "bothTransitionRange";
        route = "兩層都轉換｜已形成橫行清晰邊界";
      } else {
        mode = "none";
        route = "兩層都轉換｜未形成可交易橫行邊界";
      }
    } else if (!mainTransition && secondaryTransition) {
      if (currentTradeBias === mainBias) {
        mode = "weakOrTransition";
        route = "包含轉換｜順已確認主判方向";
      } else if (
        secondaryBias !== null &&
        currentTradeBias === secondaryBias
      ) {
        mode = "localCounter";
        route = "包含轉換｜順次判轉換局部方向、逆主判";
      }
    } else if (mainTransition && !secondaryTransition) {
      if (currentTradeBias === secondaryBias) {
        mode = "weakOrTransition";
        route = "包含轉換｜順次判已確認局部方向";
      } else if (
        mainBias !== null &&
        currentTradeBias === mainBias
      ) {
        mode = "localCounter";
        route = "包含轉換｜順主判轉換傾向、逆次判已確認方向";
      }
    }
  }

  const size = matrixCell(
    effectivePosition,
    effectiveQuality,
    p3Testable,
    mode
  );

  const currentCombination =
    `${effectivePosition}＋${effectiveQuality}`;

  let cellExplanation =
    `${currentCombination}喺「${route}」矩陣下最高許可${SIZE_LABELS[size]}。`;

  if (
    effectivePosition === "P3" &&
    !p3Testable &&
    (
      mode === "healthyAligned" ||
      mode === "weakOrTransition" ||
      mode === "conflictWithMain" ||
      mode === "bothTransitionRange"
    )
  ) {
    cellExplanation += " 呢格屬0.25／0酌情位；未勾選「P3可作小注測試」，所以採用0注。";
  }

  return {
    relation,
    mode,
    route,
    size,
    cellExplanation
  };
}

function downgradeOneLevel(size) {
  if (size >= 1) return 0.5;
  if (size >= 0.5) return 0.25;
  if (size >= 0.25) return 0;
  return 0;
}

function insideObstacleCap(position, quality) {
  if (position === "P1" && quality === "Q3") return 0.5;
  if (position === "P2" && quality === "Q3") return 0.25;
  return 0;
}

function applyObstacle(matrixSize, position, quality) {
  const state = $("obstacleState").value;

  if (state === "far") {
    return {
      state,
      adjustedSize: matrixSize,
      explanation: `大局障礙仍遠／到障礙有完整R:R，維持原矩陣${SIZE_LABELS[matrixSize]}。`,
      management: "按原矩陣管理。"
    };
  }

  if (state === "near") {
    const adjusted = downgradeOneLevel(matrixSize);
    return {
      state,
      adjustedSize: adjusted,
      explanation: `接近大局障礙但仍有交易空間，注碼降一級：${SIZE_LABELS[matrixSize]} → ${SIZE_LABELS[adjusted]}。`,
      management: "TP放障礙前；少留或不留runner；唔預設一定突破。"
    };
  }

  if (state === "insufficient") {
    return {
      state,
      adjustedSize: 0,
      explanation: "到大局障礙空間不足，直接0注。",
      management: "不開新倉。"
    };
  }

  const obstacleCap = insideObstacleCap(position, quality);
  const adjusted = Math.min(matrixSize, obstacleCap);

  return {
    state,
    adjustedSize: adjusted,
    explanation: `已處於大局障礙區內仍順原方向延伸：${position}＋${quality}嘅障礙區上限係${SIZE_LABELS[obstacleCap]}；由${SIZE_LABELS[matrixSize]}修正至${SIZE_LABELS[adjusted]}。`,
    management: "只做高質Q3；P1最多0.5、P2最多0.25、P3／P4不做。"
  };
}

function evaluateHardVeto(effectivePosition, baseTrigger) {
  const vetoes = [];

  if (effectivePosition === "P4") {
    vetoes.push("P4中間位／無交易位置。");
  }

  if (checked("chasedBreakout")) {
    vetoes.push("突破後立即追價。");
  }

  if (!baseTrigger.validSweep || !baseTrigger.validReclaim) {
    vetoes.push("冇有效Sweep或冇真正Reclaim。");
  }

  if (
    baseTrigger.reclaimQuality === "negated" ||
    baseTrigger.retestQuality === "invalid"
  ) {
    vetoes.push("Reclaim被否定，或Retest快、深、強已否定Reclaim。");
  }

  if (baseTrigger.tradeSpace === "insufficient") {
    vetoes.push("第一個真實目標前冇最低可接受R:R。");
  }

  if (
    checked("violatesTradingTime") ||
    checked("riskLimitExceeded")
  ) {
    vetoes.push("違反交易時間或總風險上限。");
  }

  return vetoes;
}

function evaluateDecision(baseTrigger, asia2B) {
  const relation = marketRelation(
    $("mainState").value,
    $("secondaryState").value
  );
  const marketCap = marketCapForRelation(relation);
  const preferred = preferredDirectionInfo();
  const background = backgroundRelationInfo();

  const matrix = evaluateMatrix(
    asia2B.effectivePosition,
    asia2B.effectiveQuality
  );

  const matrixLimitedSize =
    Math.min(marketCap, matrix.size);

  let obstacle = applyObstacle(
    matrixLimitedSize,
    asia2B.effectivePosition,
    asia2B.effectiveQuality
  );

  const mainState = $("mainState").value;
  const secondaryState = $("secondaryState").value;
  const mainTransitionLocalTrade =
    isTransition(mainState) &&
    !isTransition(secondaryState) &&
    stateBias(mainState) !== null &&
    stateBias(mainState) !== stateBias(secondaryState) &&
    tradeBias() === stateBias(secondaryState);

  if (
    mainTransitionLocalTrade &&
    $("obstacleState").value === "inside"
  ) {
    obstacle = {
      state: "inside",
      adjustedSize: 0,
      explanation: "主判處於相反傾向嘅轉換，而目前係順次判做局部回調trade；價格已到主判潛在支持／阻力區，按V3.2停止開新局部方向倉，修正至0注。",
      management: "已有局部方向倉準備食糊；停止新開同方向trade，觀察次判趨勢有冇被破壞，開始等待主判傾向方向setup。"
    };
  }

  const hardVetoes = evaluateHardVeto(
    asia2B.effectivePosition,
    baseTrigger
  );

  const reasons = [
    ...asia2B.reasons,
    `注碼路徑① 主次關係：${relation}，市場最高注碼＝${SIZE_LABELS[marketCap]}。`,
    `注碼路徑② 交易方向權限：${matrix.route}。`,
    `注碼路徑③ 位置＋Trigger：${matrix.cellExplanation}`,
    `注碼路徑④ 市場上限同位置／Trigger取較低值＝${SIZE_LABELS[matrixLimitedSize]}。`,
    `注碼路徑⑤ ${obstacle.explanation}`
  ];

  const warnings = [
    ...asia2B.warnings,
    preferred.note,
    background.note
  ];

  if (
    $("backgroundDirectOverlap").value === "yes" &&
    (
      asia2B.basePosition === "P2" ||
      asia2B.basePosition === "P3"
    )
  ) {
    warnings.push(
      "你標記目前入場價仍直接處於大局重大區。若所用次判／工作結構同該大局區直接空間重疊，按V3.2應重新檢查是否應列P1。位置級別睇空間重疊，不是故事重疊。"
    );
  }

  if (
    $("backgroundDirectOverlap").value === "no" &&
    asia2B.basePosition === "P2"
  ) {
    warnings.push(
      "目前入場價已離開大局重大區：後續新形成次判主結維持P2，即使整段行情源於較早嘅P1大局反應。"
    );
  }

  if (checked("loosenedTriggerBecauseBias")) {
    warnings.push(
      "紀律標籤：曾因主觀方向偏見想放寬Trigger；本次不作硬性取消，但應納入覆盤統計。"
    );
  }

  if (checked("emotionalSizing")) {
    warnings.push(
      "紀律標籤：曾因情緒／信心想加注；本次不作獨立硬性取消，但最終注碼仍只可跟矩陣。"
    );
  }

  const finalSize =
    hardVetoes.length > 0
      ? 0
      : obstacle.adjustedSize;

  if (hardVetoes.length > 0) {
    reasons.push(
      `注碼路徑⑥ 硬性否決成立，最終由${SIZE_LABELS[obstacle.adjustedSize]}取消至0注。`
    );
  } else {
    reasons.push(
      `注碼路徑⑥ 冇硬性否決，最終注碼＝${SIZE_LABELS[finalSize]}。`
    );
  }

  return {
    relation,
    preferredDirection: preferred.label,
    priorityNote: preferred.note,
    backgroundRelation: background.label,
    backgroundRelationNote: background.note,
    marketCap,
    matrixMode: matrix.mode,
    matrixRoute: matrix.route,
    matrixSize: matrixLimitedSize,
    obstacleState: obstacle.state,
    obstacleSize: obstacle.adjustedSize,
    obstacleManagement: obstacle.management,
    finalSize,
    reasons,
    warnings,
    hardVetoes
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderListBlock(title, items, className) {
  if (!items.length) return "";

  return `
    <div class="evaluation-block ${className}">
      <h3>${escapeHtml(title)}</h3>
      <ul>${items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>
    </div>
  `;
}

function renderBaseTrigger(trigger) {
  $("bonusCount").textContent =
    `${trigger.bonusCount}／${BONUS_IDS.length}`;

  const grade = $("baseTriggerGrade");
  grade.textContent =
    trigger.quality === "Q3"
      ? "Q3｜完整高質"
      : trigger.quality === "Q2"
        ? "Q2｜可交易但有瑕疵"
        : "Q1｜失效";
  grade.className =
    `grade ${trigger.quality.toLowerCase()}`;

  $("triggerEvaluation").innerHTML = [
    renderListBlock(
      "失效原因",
      trigger.failures,
      "failures"
    ),
    renderListBlock(
      "Q2瑕疵／降級因素",
      trigger.imperfections,
      "imperfections"
    ),
    renderListBlock(
      "已確認／加分",
      trigger.positives,
      "positives"
    )
  ].join("");
}

function renderAsia2B(result) {
  $("asia2BChecklist").classList.toggle(
    "hidden",
    !result.active
  );

  if (!result.active) {
    $("asia2BQuality").textContent = "未啟用";
    $("asia2BPositionEffect").textContent = "無";
    $("asia2BTriggerEffect").textContent = "無";
    return;
  }

  $("asia2BQuality").textContent =
    result.highQuality
      ? "高質｜5/5"
      : `未達高質｜${result.criteriaCount}/5`;

  $("asia2BPositionEffect").textContent =
    result.positionPromoted
      ? `${result.basePosition} → ${result.effectivePosition}`
      : `維持${result.basePosition}`;

  $("asia2BTriggerEffect").textContent =
    result.triggerPromoted
      ? `${result.baseQuality} → ${result.effectiveQuality}`
      : `維持${result.baseQuality}`;
}

function obstacleDisplayLabel(state) {
  const labels = {
    far: "無／仍遠｜按原矩陣",
    near: "接近｜降一級",
    insufficient: "空間不足｜0注",
    inside: "障礙區內延伸｜套專用上限"
  };
  return labels[state] || state;
}

function renderHardVetoPreview(vetoes) {
  const container = $("hardVetoPreview");

  if (!vetoes.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <ul>
      ${vetoes
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}
    </ul>
  `;
}

function renderDecision(decision) {
  const timeframes = timeframeValues();

  $("marketRelation").textContent =
    decision.relation;
  $("preferredDirection").textContent =
    decision.preferredDirection;
  $("marketCap").textContent =
    SIZE_LABELS[decision.marketCap];
  $("backgroundRelation").textContent =
    decision.backgroundRelation;
  $("priorityNote").textContent =
    decision.priorityNote;
  $("backgroundRelationNote").textContent =
    decision.backgroundRelationNote;

  $("resultBackground").textContent =
    `${timeframes.background}－${$("backgroundState").value}`;
  $("resultMain").textContent =
    `${timeframes.main}－${$("mainState").value}`;
  $("resultSecondary").textContent =
    `${timeframes.secondary}－${$("secondaryState").value}`;
  $("resultEntryTimeframe").textContent =
    timeframes.entry;
  $("resultRelation").textContent =
    decision.relation;
  $("resultPreferredDirection").textContent =
    decision.preferredDirection;
  $("resultBasePosition").textContent =
    currentAsia2B.basePosition;
  $("resultEffectivePosition").textContent =
    currentAsia2B.effectivePosition;
  $("resultBaseTrigger").textContent =
    currentAsia2B.baseQuality;
  $("resultEffectiveTrigger").textContent =
    currentAsia2B.effectiveQuality;
  $("resultAsia2B").textContent =
    currentAsia2B.active
      ? `${currentAsia2B.label}｜${
          currentAsia2B.highQuality
            ? "高質"
            : "未達高質"
        }`
      : "無";
  $("resultMarketCap").textContent =
    SIZE_LABELS[decision.marketCap];
  $("resultMatrixSize").textContent =
    SIZE_LABELS[decision.matrixSize];
  $("resultObstacleSize").textContent =
    `${obstacleDisplayLabel(decision.obstacleState)} → ${SIZE_LABELS[decision.obstacleSize]}`;
  $("finalSize").textContent =
    SIZE_LABELS[decision.finalSize];

  $("decisionExplanations").innerHTML = [
    renderListBlock(
      "計算原因",
      decision.reasons,
      "decision-block reasons"
    ),
    renderListBlock(
      "警告／管理",
      [
        ...decision.warnings,
        decision.obstacleManagement
      ],
      "decision-block warnings"
    ),
    renderListBlock(
      "硬性否決",
      decision.hardVetoes,
      "decision-block denials"
    )
  ].join("");

  renderHardVetoPreview(decision.hardVetoes);
}

function updateObstacleNote() {
  const state = $("obstacleState").value;
  const notes = {
    far: "障礙仍遠，到障礙有完整R:R：按原矩陣，不預設大局一定突破。",
    near: "接近障礙但仍有交易空間：注碼降一級，TP放障礙前，少留或不留runner。",
    insufficient: "到障礙空間不足：直接0注。",
    inside: "已處於大局障礙區內仍順原方向延伸：只容許P1＋Q3最多0.5、P2＋Q3最多0.25，其餘0注。"
  };

  $("obstacleNote").textContent =
    notes[state] || "";
}

function updateBackgroundOverlapNote() {
  const overlap =
    $("backgroundDirectOverlap").value;

  if (overlap === "yes") {
    $("backgroundOverlapNote").textContent =
      "目前入場價本身仍直接處於大局重大支持／阻力區。若次判主結或工作結構同該區直接重疊，位置應按P1評估。";
  } else {
    $("backgroundOverlapNote").textContent =
      "目前入場價已離開大局重大區。之後新形成嘅次判主結通常係P2，只係享有較早P1反應帶來嘅方向背景。";
  }
}

function updateInterface() {
  const timeframes = timeframeValues();
  const backgroundState = $("backgroundState").value;
  const mainState = $("mainState").value;
  const secondaryState = $("secondaryState").value;
  const position = $("positionLevel").value;

  $("backgroundStateLabel").textContent =
    `大局背景（${timeframes.background}）`;
  $("mainStateLabel").textContent =
    `主判斷（${timeframes.main}）`;
  $("secondaryStateLabel").textContent =
    `次判斷（${timeframes.secondary}）`;

  $("backgroundStateNote").textContent =
    STATES[backgroundState].note;
  $("mainStateNote").textContent =
    STATES[mainState].note;
  $("secondaryStateNote").textContent =
    STATES[secondaryState].note;

  const combinedDeployment =
    combinedDeploymentInfo();

  $("combinedPriorityDeployment").textContent =
    combinedDeployment.priority;
  $("combinedSecondaryDeployment").textContent =
    combinedDeployment.secondary;

  const bothTransition =
    isTransition(mainState) &&
    isTransition(secondaryState);

  $("bothTransitionRangeRow").classList.toggle(
    "hidden",
    !bothTransition
  );

  if (!bothTransition) {
    $("bothTransitionRange").value = "no";
  }

  const info = POSITION_INFO[position];
  $("positionTitle").textContent =
    `${position}｜${info.title}`;
  $("positionNote").textContent =
    info.note;

  $("p2EdgeRow").classList.toggle(
    "hidden",
    position !== "P2"
  );
  if (position !== "P2") {
    $("p2EdgePosition").checked = false;
  }

  $("p3TestableRow").classList.toggle(
    "hidden",
    position !== "P3"
  );
  if (position !== "P3") {
    $("p3Testable").checked = false;
  }

  updateObstacleNote();
  updateBackgroundOverlapNote();
}

function recalculate() {
  updateInterface();

  currentBaseTrigger =
    evaluateBaseTrigger();
  currentAsia2B =
    evaluateAsia2B(currentBaseTrigger);
  currentDecision =
    evaluateDecision(
      currentBaseTrigger,
      currentAsia2B
    );

  renderBaseTrigger(currentBaseTrigger);
  renderAsia2B(currentAsia2B);
  renderDecision(currentDecision);
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function optionalNumberFromInput(id) {
  const value = $(id).value.trim();

  if (value === "") return null;

  const number = Number(value);
  return Number.isFinite(number)
    ? number
    : null;
}

function checklistSummary() {
  const timeframes = timeframeValues();

  return [
    `交易日期：${$("tradeDate").value}`,
    `大局背景層：${timeframes.background}－${$("backgroundState").value}`,
    `主判斷層：${timeframes.main}－${$("mainState").value}`,
    `次判斷層：${timeframes.secondary}－${$("secondaryState").value}`,
    `入場觸發層：${timeframes.entry}`,
    `交易方向：${direction()}`,
    `主次關係：${currentDecision.relation}`,
    `交易優先方向：${currentDecision.preferredDirection}`,
    `優先部署：${combinedDeploymentInfo().priority}`,
    `次要部署：${combinedDeploymentInfo().secondary}`,
    `大局位置實際重疊：${$("backgroundDirectOverlap").value === "yes" ? "有" : "冇"}`,
    "",
    `原始位置：${currentAsia2B.basePosition}`,
    `2B後位置：${currentAsia2B.effectivePosition}`,
    `P2邊緣：${yesNo(checked("p2EdgePosition"))}`,
    `P3可小注測試：${yesNo(checked("p3Testable"))}`,
    "",
    `有效Sweep：${yesNo(currentBaseTrigger.validSweep)}`,
    `有效Reclaim：${yesNo(currentBaseTrigger.validReclaim)}`,
    `Reclaim質素：${$("reclaimQuality").selectedOptions[0].textContent}`,
    `Retest質素：${$("retestQuality").selectedOptions[0].textContent}`,
    `交易空間：${$("tradeSpace").selectedOptions[0].textContent}`,
    `Trigger加分證據：${currentBaseTrigger.bonusCount}/${BONUS_IDS.length}`,
    `基礎Trigger：${currentAsia2B.baseQuality}`,
    `2B後Trigger：${currentAsia2B.effectiveQuality}`,
    "",
    `亞洲盤2B：${currentAsia2B.active ? currentAsia2B.label : "無"}`,
    `2B高質：${yesNo(currentAsia2B.highQuality)}`,
    `2B高質條件：${currentAsia2B.criteriaCount}/5`,
    `2B結構基礎：${yesNo(currentAsia2B.structureOverlap)}`,
    "",
    `大局障礙：${obstacleDisplayLabel(currentDecision.obstacleState)}`,
    `市場注碼上限：${SIZE_LABELS[currentDecision.marketCap]}`,
    `位置及Trigger修正：${SIZE_LABELS[currentDecision.matrixSize]}`,
    `大局修正：${SIZE_LABELS[currentDecision.obstacleSize]}`,
    `最終注碼：${SIZE_LABELS[currentDecision.finalSize]}`,
    "",
    `追價：${yesNo(checked("chasedBreakout"))}`,
    `違反交易時間：${yesNo(checked("violatesTradingTime"))}`,
    `總風險超標：${yesNo(checked("riskLimitExceeded"))}`,
    `方向偏見想放寬Trigger：${yesNo(checked("loosenedTriggerBecauseBias"))}`,
    `情緒想加注：${yesNo(checked("emotionalSizing"))}`
  ].join("\n");
}

function loadRecords() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );
}

function openImageDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      IMAGE_DB_NAME,
      IMAGE_DB_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(IMAGE_STORE)) {
        database.createObjectStore(IMAGE_STORE);
      }
    };

    request.onsuccess = () =>
      resolve(request.result);
    request.onerror = () =>
      reject(request.error);
  });
}

async function putImage(recordId, blob) {
  const database =
    await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        IMAGE_STORE,
        "readwrite"
      );

    transaction
      .objectStore(IMAGE_STORE)
      .put(blob, recordId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function getImage(recordId) {
  const database =
    await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        IMAGE_STORE,
        "readonly"
      );

    const request = transaction
      .objectStore(IMAGE_STORE)
      .get(recordId);

    request.onsuccess = () => {
      database.close();
      resolve(request.result || null);
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

async function deleteImage(recordId) {
  const database =
    await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        IMAGE_STORE,
        "readwrite"
      );

    transaction
      .objectStore(IMAGE_STORE)
      .delete(recordId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

function compressImage(file) {
  return new Promise((resolve) => {
    const sourceUrl =
      URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const maxDimension = 1800;
      const scale = Math.min(
        1,
        maxDimension /
          Math.max(image.width, image.height)
      );

      const width = Math.max(
        1,
        Math.round(image.width * scale)
      );
      const height = Math.max(
        1,
        Math.round(image.height * scale)
      );

      const canvas =
        document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");
      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(sourceUrl);
          resolve(blob || file);
        },
        "image/jpeg",
        0.82
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(file);
    };

    image.src = sourceUrl;
  });
}

function clearPendingImage() {
  pendingImageBlob = null;

  if (pendingImageUrl) {
    URL.revokeObjectURL(pendingImageUrl);
    pendingImageUrl = null;
  }

  $("imagePreview").removeAttribute("src");
  $("imagePreviewContainer")
    .classList.add("hidden");
}

function clipboardImageFromPasteEvent(event) {
  const items =
    event.clipboardData?.items || [];

  for (const item of items) {
    if (
      item.kind === "file" &&
      item.type.startsWith("image/")
    ) {
      return item.getAsFile();
    }
  }

  return null;
}

async function readImageFromSystemClipboard() {
  if (
    !navigator.clipboard ||
    typeof navigator.clipboard.read !== "function"
  ) {
    return null;
  }

  const clipboardItems =
    await navigator.clipboard.read();

  for (const item of clipboardItems) {
    const imageType =
      item.types.find(
        (type) =>
          type.startsWith("image/")
      );

    if (imageType) {
      return await item.getType(
        imageType
      );
    }
  }

  return null;
}

async function setPendingImageBlob(blob) {
  if (!blob) {
    showToast(
      "剪貼簿入面搵唔到圖片"
    );
    return;
  }

  pendingImageBlob =
    await compressImage(blob);

  if (pendingImageUrl) {
    URL.revokeObjectURL(
      pendingImageUrl
    );
  }

  pendingImageUrl =
    URL.createObjectURL(
      pendingImageBlob
    );

  $("imagePreview").src =
    pendingImageUrl;
  $("imagePreviewContainer")
    .classList.remove("hidden");

  showToast(
    "圖片已貼上，儲存紀錄時會一併保存"
  );
}

async function handlePendingImagePaste(event) {
  event.preventDefault();

  const blob =
    clipboardImageFromPasteEvent(
      event
    );

  await setPendingImageBlob(blob);
}

async function pastePendingImageFromClipboard() {
  try {
    const blob =
      await readImageFromSystemClipboard();

    await setPendingImageBlob(blob);
  } catch (error) {
    console.error(
      "Clipboard image read failed:",
      error
    );

    showToast(
      "未能直接讀取剪貼簿；請點擊貼上區後用系統「貼上」"
    );

    $("chartPasteZone").focus();
  }
}

async function saveDecision(event) {
  event.preventDefault();

  const symbol =
    $("symbol").value
      .trim()
      .toUpperCase();

  if (!symbol) {
    showToast("請輸入品種");
    $("symbol").focus();
    return;
  }

  const tradeDate = $("tradeDate").value;

  if (!tradeDate) {
    showToast("請選擇交易日期");
    $("tradeDate").focus();
    return;
  }

  const timeframes =
    timeframeValues();
  const recordId =
    crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  const record = {
    id: recordId,
    tradeDate,
    createdAt:
      new Date().toISOString(),
    appVersion:
      "PracticeJournal-V1.6",
    engineVersion:
      "MasterTradeDecisionMatrix-V3.2",

    recordMode:
      recordMode(),
    symbol,

    backgroundTimeframe:
      timeframes.background,
    mainTimeframe:
      timeframes.main,
    secondaryTimeframe:
      timeframes.secondary,
    entryTimeframe:
      timeframes.entry,

    backgroundState:
      $("backgroundState").value,
    mainState:
      $("mainState").value,
    secondaryState:
      $("secondaryState").value,
    bothTransitionRange:
      $("bothTransitionRange").value,

    direction:
      direction(),
    relation:
      currentDecision.relation,
    preferredDirection:
      currentDecision.preferredDirection,
    priorityDeployment:
      combinedDeploymentInfo().priority,
    secondaryDeployment:
      combinedDeploymentInfo().secondary,
    backgroundRelation:
      currentDecision.backgroundRelation,

    backgroundDirectOverlap:
      $("backgroundDirectOverlap").value,

    basePosition:
      currentAsia2B.basePosition,
    position:
      currentAsia2B.effectivePosition,
    p2EdgePosition:
      checked("p2EdgePosition"),
    p3Testable:
      checked("p3Testable"),

    validSweep:
      currentBaseTrigger.validSweep,
    validReclaim:
      currentBaseTrigger.validReclaim,
    reclaimQuality:
      currentBaseTrigger.reclaimQuality,
    retestQuality:
      currentBaseTrigger.retestQuality,
    tradeSpace:
      currentBaseTrigger.tradeSpace,
    bonusCount:
      currentBaseTrigger.bonusCount,

    baseTrigger:
      currentAsia2B.baseQuality,
    trigger:
      currentAsia2B.effectiveQuality,

    asia2BType:
      currentAsia2B.type,
    asia2BLabel:
      currentAsia2B.label,
    asia2BHighQuality:
      currentAsia2B.highQuality,
    asia2BCriteriaCount:
      currentAsia2B.criteriaCount,
    asia2BStructureOverlap:
      currentAsia2B.structureOverlap,
    asia2BPositionPromoted:
      currentAsia2B.positionPromoted,
    asia2BTriggerPromoted:
      currentAsia2B.triggerPromoted,

    obstacleState:
      currentDecision.obstacleState,
    marketCap:
      currentDecision.marketCap,
    matrixSize:
      currentDecision.matrixSize,
    obstacleSize:
      currentDecision.obstacleSize,
    finalSize:
      currentDecision.finalSize,

    chasedBreakout:
      checked("chasedBreakout"),
    violatesTradingTime:
      checked("violatesTradingTime"),
    riskLimitExceeded:
      checked("riskLimitExceeded"),
    loosenedTriggerBecauseBias:
      checked("loosenedTriggerBecauseBias"),
    emotionalSizing:
      checked("emotionalSizing"),

    entryStatus:
      $("entryStatus").value,
    tpPlan:
      $("tpPlan").value,
    profitR:
      optionalNumberFromInput("profitR"),
    reachedRF:
      $("reachedRF").value,
    reachedTP2:
      $("reachedTP2").value,
    hasImage:
      Boolean(pendingImageBlob),

    checklistSummary:
      checklistSummary(),
    note:
      $("note").value.trim()
  };

  const records = loadRecords();
  records.unshift(record);
  saveRecords(records);

  if (pendingImageBlob) {
    try {
      await putImage(
        recordId,
        pendingImageBlob
      );
    } catch (error) {
      console.error(
        "Image save failed:",
        error
      );

      record.hasImage = false;
      saveRecords(records);
      renderHistory();
      showToast(
        "文字紀錄已儲存，但圖片儲存失敗"
      );
      return;
    }
  }

  clearPendingImage();
  $("profitR").value = "";
  $("reachedRF").value = "No";
  $("reachedTP2").value = "No";
  $("note").value = "";

  renderHistory();
  showToast(
    "已儲存V3.2練習／實戰紀錄"
  );
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat(
      "zh-HK",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(new Date(iso));
  } catch {
    return iso;
  }
}

function recordModeLabel(mode) {
  return mode === "Live"
    ? "實戰"
    : "練習";
}

function safeSizeLabel(value) {
  const numeric = Number(value);
  return SIZE_LABELS[numeric] ??
    `${value ?? 0}注`;
}

function renderHistory() {
  const allRecords = loadRecords();

  $("statCount").textContent =
    allRecords.length;
  $("statEntry").textContent =
    allRecords.filter(
      (record) =>
        record.entryStatus === "Entry"
    ).length;
  $("statMiss").textContent =
    allRecords.filter(
      (record) =>
        record.entryStatus === "Miss"
    ).length;
  $("statSkip").textContent =
    allRecords.filter(
      (record) =>
        record.entryStatus === "Skip"
    ).length;
  $("statLive").textContent =
    allRecords.filter(
      (record) =>
        record.recordMode === "Live"
    ).length;

  const recordsWithR =
    allRecords.filter(
      (record) =>
        Number.isFinite(record.profitR)
    );

  if (recordsWithR.length > 0) {
    const averageR =
      recordsWithR.reduce(
        (sum, record) =>
          sum + record.profitR,
        0
      ) / recordsWithR.length;

    $("statAverageR").textContent =
      averageR.toFixed(2);
  } else {
    $("statAverageR").textContent =
      "未有資料";
  }

  if (allRecords.length > 0) {
    const rfRate =
      allRecords.filter(
        (record) =>
          record.reachedRF === "Yes"
      ).length /
      allRecords.length *
      100;

    const tp2Rate =
      allRecords.filter(
        (record) =>
          record.reachedTP2 === "Yes"
      ).length /
      allRecords.length *
      100;

    $("statRFRate").textContent =
      `${rfRate.toFixed(1)}%`;
    $("statTP2Rate").textContent =
      `${tp2Rate.toFixed(1)}%`;
  } else {
    $("statRFRate").textContent =
      "未有資料";
    $("statTP2Rate").textContent =
      "未有資料";
  }

  const modeFilter =
    $("historyModeFilter").value;
  const entryFilter =
    $("historyEntryFilter").value;

  const filtered =
    allRecords.filter((record) => {
      const modeMatches =
        modeFilter === "All" ||
        record.recordMode ===
          modeFilter;

      const entryMatches =
        entryFilter === "All" ||
        record.entryStatus ===
          entryFilter;

      return (
        modeMatches &&
        entryMatches
      );
    });

  const list =
    $("historyList");

  if (filtered.length === 0) {
    list.innerHTML =
      '<article class="card empty-state">未有符合篩選條件嘅紀錄</article>';
    return;
  }

  list.innerHTML =
    filtered.map((record) => {
      const profitText =
        Number.isFinite(record.profitR)
          ? `${record.profitR}R`
          : "未填R";

      const imageTag =
        record.hasImage
          ? '<span class="history-tag">📷 圖片</span>'
          : "";

      const twoBTag =
        record.asia2BType &&
        record.asia2BType !== "none"
          ? `<span class="history-tag">${escapeHtml(
              record.asia2BHighQuality
                ? "高質Asia 2B"
                : "Asia 2B"
            )}</span>`
          : "";

      const engineTag =
        record.engineVersion
          ? '<span class="history-tag">Matrix V3.2</span>'
          : "";

      const mainState =
        record.mainState ||
        "未記錄";
      const secondaryState =
        record.secondaryState ||
        "未記錄";
      const tradeDate =
        recordTradeDate(record) ||
        "未記錄日期";

      return `
        <article
          class="card history-card"
          data-record-id="${escapeHtml(record.id)}"
        >
          <div class="history-top">
            <strong>${escapeHtml(record.symbol)}</strong>
            <strong>${escapeHtml(profitText)}</strong>
          </div>

          <div class="history-tags">
            <span class="history-tag">${escapeHtml(
              recordModeLabel(
                record.recordMode
              )
            )}</span>
            <span class="history-tag">${escapeHtml(
              record.entryStatus || "未分類"
            )}</span>
            <span class="history-tag">${escapeHtml(
              record.trigger || "未記錄"
            )}</span>
            ${twoBTag}
            ${engineTag}
            ${imageTag}
          </div>

          <p class="history-meta">
            ${escapeHtml(
              record.mainTimeframe || ""
            )}
            ${escapeHtml(mainState)}
            ×
            ${escapeHtml(
              record.secondaryTimeframe || ""
            )}
            ${escapeHtml(secondaryState)}
            <br>
            ${escapeHtml(
              record.direction || ""
            )}
            ｜${escapeHtml(
              record.position ||
              record.basePosition ||
              ""
            )}
            ｜最終${escapeHtml(
              safeSizeLabel(
                record.finalSize
              )
            )}
            <br>
            交易日期：${escapeHtml(tradeDate)}
            <br>
            ${escapeHtml(
              record.relation || ""
            )}
            ｜建立：${escapeHtml(
              formatDate(
                record.createdAt
              )
            )}
          </p>
        </article>
      `;
    }).join("");

  list
    .querySelectorAll(
      "[data-record-id]"
    )
    .forEach((card) => {
      card.addEventListener(
        "click",
        () => {
          openRecord(
            card.dataset.recordId
          );
        }
      );
    });
}

function clearRecordImageDisplay() {
  if (storedImageUrl) {
    URL.revokeObjectURL(
      storedImageUrl
    );
    storedImageUrl = null;
  }

  if (editingImageUrl) {
    URL.revokeObjectURL(
      editingImageUrl
    );
    editingImageUrl = null;
  }

  editingImageBlob = null;
  removeStoredImageRequested =
    false;
  $("recordImage")
    .removeAttribute("src");
  $("recordImageContainer")
    .classList.add("hidden");
}

async function displayRecordImage(
  recordId
) {
  clearRecordImageDisplay();

  try {
    const blob =
      await getImage(recordId);

    if (!blob) return;

    storedImageUrl =
      URL.createObjectURL(blob);
    $("recordImage").src =
      storedImageUrl;
    $("recordImageContainer")
      .classList.remove("hidden");
  } catch (error) {
    console.error(
      "Image read failed:",
      error
    );
  }
}

async function openRecord(recordId) {
  const record =
    loadRecords().find(
      (item) =>
        item.id === recordId
    );

  if (!record) return;

  activeRecordId = recordId;

  $("dialogTitle").textContent =
    `${record.symbol}｜${recordModeLabel(
      record.recordMode
    )}`;

  const basePosition =
    record.basePosition ||
    record.position ||
    "未記錄";
  const effectivePosition =
    record.position ||
    basePosition;
  const baseTrigger =
    record.baseTrigger ||
    record.trigger ||
    "未記錄";
  const effectiveTrigger =
    record.trigger ||
    baseTrigger;

  const twoBText =
    record.asia2BType &&
    record.asia2BType !== "none"
      ? `${record.asia2BLabel || "Asia 2B"}｜${
          record.asia2BHighQuality
            ? "高質"
            : "未達高質"
        }`
      : "無";

  $("recordDetails").innerHTML = `
    <strong>交易日期：</strong>
    ${escapeHtml(recordTradeDate(record) || "未記錄")}
    <br>
    <strong>建立時間：</strong>
    ${escapeHtml(formatDate(record.createdAt))}
    <br>
    <strong>引擎：</strong>
    ${escapeHtml(
      record.engineVersion ||
      "舊版Matrix"
    )}
    <br>
    <strong>大局背景：</strong>
    ${escapeHtml(
      record.backgroundTimeframe || ""
    )}－${escapeHtml(
      record.backgroundState || ""
    )}
    <br>
    <strong>主判斷：</strong>
    ${escapeHtml(
      record.mainTimeframe || ""
    )}－${escapeHtml(
      record.mainState || ""
    )}
    <br>
    <strong>次判斷：</strong>
    ${escapeHtml(
      record.secondaryTimeframe || ""
    )}－${escapeHtml(
      record.secondaryState || ""
    )}
    <br>
    <strong>入場觸發層：</strong>
    ${escapeHtml(
      record.entryTimeframe || ""
    )}
    <br>
    <strong>主次關係：</strong>
    ${escapeHtml(
      record.relation || ""
    )}
    <br>
    <strong>交易優先方向：</strong>
    ${escapeHtml(
      record.preferredDirection || ""
    )}
    <br>
    <strong>實際方向：</strong>
    ${escapeHtml(
      record.direction || ""
    )}
    <br>
    <strong>原始位置：</strong>
    ${escapeHtml(basePosition)}
    <br>
    <strong>2B後位置：</strong>
    ${escapeHtml(effectivePosition)}
    <br>
    <strong>基礎Trigger：</strong>
    ${escapeHtml(baseTrigger)}
    <br>
    <strong>2B後Trigger：</strong>
    ${escapeHtml(effectiveTrigger)}
    <br>
    <strong>Asia 2B：</strong>
    ${escapeHtml(twoBText)}
    <br>
    <strong>大局障礙：</strong>
    ${escapeHtml(
      obstacleDisplayLabel(
        record.obstacleState || "far"
      )
    )}
    <br>
    <strong>最終注碼：</strong>
    ${escapeHtml(
      safeSizeLabel(
        record.finalSize
      )
    )}
  `;

  $("editTradeDate").value =
    recordTradeDate(record) ||
    localDateString();
  $("editRecordMode").value =
    record.recordMode ||
    "Practice";
  $("editEntryStatus").value =
    record.entryStatus ||
    "Entry";
  $("editTpPlan").value =
    record.tpPlan ||
    "1:2食哂";
  $("editProfitR").value =
    Number.isFinite(
      record.profitR
    )
      ? record.profitR
      : "";
  $("editReachedRF").value =
    record.reachedRF ||
    "No";
  $("editReachedTP2").value =
    record.reachedTP2 ||
    "No";
  $("editNote").value =
    record.note || "";

  await displayRecordImage(
    recordId
  );

  $("recordDialog")
    .showModal();
}

async function setEditingImageBlob(blob) {
  if (!blob) {
    showToast(
      "剪貼簿入面搵唔到圖片"
    );
    return;
  }

  editingImageBlob =
    await compressImage(blob);
  removeStoredImageRequested =
    false;

  if (editingImageUrl) {
    URL.revokeObjectURL(
      editingImageUrl
    );
  }

  editingImageUrl =
    URL.createObjectURL(
      editingImageBlob
    );

  $("recordImage").src =
    editingImageUrl;
  $("recordImageContainer")
    .classList.remove("hidden");

  showToast(
    "新圖片已貼上，儲存修改後會取代舊圖"
  );
}

async function handleEditingImagePaste(event) {
  event.preventDefault();

  const blob =
    clipboardImageFromPasteEvent(
      event
    );

  await setEditingImageBlob(blob);
}

async function pasteEditingImageFromClipboard() {
  try {
    const blob =
      await readImageFromSystemClipboard();

    await setEditingImageBlob(blob);
  } catch (error) {
    console.error(
      "Clipboard image read failed:",
      error
    );

    showToast(
      "未能直接讀取剪貼簿；請點擊貼上區後用系統「貼上」"
    );

    $("editChartPasteZone").focus();
  }
}

function requestRemoveStoredImage() {
  editingImageBlob = null;
  removeStoredImageRequested =
    true;

  if (editingImageUrl) {
    URL.revokeObjectURL(
      editingImageUrl
    );
    editingImageUrl = null;
  }

  if (storedImageUrl) {
    URL.revokeObjectURL(
      storedImageUrl
    );
    storedImageUrl = null;
  }

  $("recordImage")
    .removeAttribute("src");
  $("recordImageContainer")
    .classList.add("hidden");

  showToast(
    "儲存修改後會移除圖片"
  );
}

async function saveRecordEdit() {
  const records = loadRecords();
  const index =
    records.findIndex(
      (item) =>
        item.id ===
        activeRecordId
    );

  if (index === -1) return;

  records[index].tradeDate =
    $("editTradeDate").value ||
    recordTradeDate(records[index]) ||
    localDateString();
  records[index].recordMode =
    $("editRecordMode").value;
  records[index].entryStatus =
    $("editEntryStatus").value;
  records[index].tpPlan =
    $("editTpPlan").value;
  records[index].profitR =
    optionalNumberFromInput(
      "editProfitR"
    );
  records[index].reachedRF =
    $("editReachedRF").value;
  records[index].reachedTP2 =
    $("editReachedTP2").value;
  records[index].note =
    $("editNote").value.trim();

  try {
    if (editingImageBlob) {
      await putImage(
        activeRecordId,
        editingImageBlob
      );
      records[index].hasImage =
        true;
    } else if (
      removeStoredImageRequested
    ) {
      await deleteImage(
        activeRecordId
      );
      records[index].hasImage =
        false;
    }
  } catch (error) {
    console.error(
      "Image update failed:",
      error
    );
    showToast(
      "圖片修改失敗，文字資料未變"
    );
    return;
  }

  saveRecords(records);
  $("recordDialog").close();
  clearRecordImageDisplay();
  renderHistory();
  showToast("已儲存修改");
}

async function deleteActiveRecord() {
  if (!activeRecordId) return;

  const confirmed = confirm(
    "確定刪除呢筆紀錄？文字同圖片都會刪除。"
  );

  if (!confirmed) return;

  const remaining =
    loadRecords().filter(
      (record) =>
        record.id !==
        activeRecordId
    );

  saveRecords(remaining);

  try {
    await deleteImage(
      activeRecordId
    );
  } catch (error) {
    console.error(
      "Image delete failed:",
      error
    );
  }

  $("recordDialog").close();
  clearRecordImageDisplay();
  renderHistory();
  showToast("已刪除紀錄");
}

async function downloadActiveRecordImage() {
  if (!activeRecordId) return;

  try {
    const blob =
      editingImageBlob ||
      await getImage(
        activeRecordId
      );

    if (!blob) {
      showToast(
        "呢筆紀錄冇圖片"
      );
      return;
    }

    const url =
      URL.createObjectURL(blob);
    const link =
      document.createElement("a");
    const record =
      loadRecords().find(
        (item) =>
          item.id ===
          activeRecordId
      );

    link.href = url;
    link.download =
      `${record?.symbol || "Trade"}-${activeRecordId}.jpg`;

    document.body
      .appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "Image download failed:",
      error
    );
    showToast(
      "下載圖片失敗"
    );
  }
}

function csvEscape(value) {
  const string =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return `"${string.replaceAll('"', '""')}"`;
}

function exportCsv() {
  const records = loadRecords();

  if (records.length === 0) {
    showToast(
      "未有紀錄可以匯出"
    );
    return;
  }

  const headers = [
    "交易日期",
    "建立時間",
    "App版本",
    "Matrix版本",
    "類型",
    "品種",
    "大局背景TF",
    "大局背景狀態",
    "主判TF",
    "主判狀態",
    "次判TF",
    "次判狀態",
    "入場觸發TF",
    "交易方向",
    "主次關係",
    "交易優先方向",
    "優先部署",
    "次要部署",
    "大局方向關係",
    "大局位置實際重疊",
    "原始位置",
    "2B後位置",
    "P2邊緣",
    "P3可小注測試",
    "有效Sweep",
    "有效Reclaim",
    "Reclaim質素",
    "Retest質素",
    "交易空間",
    "Trigger加分數",
    "基礎Trigger",
    "2B後Trigger",
    "Asia2B類型",
    "Asia2B高質",
    "Asia2B條件數",
    "Asia2B結構基礎",
    "大局障礙",
    "市場注碼上限",
    "位置及Trigger修正",
    "大局修正",
    "最終注碼",
    "入市結果",
    "TP計劃",
    "獲利R",
    "去到RF",
    "去到TP2",
    "有圖片",
    "方向偏見標籤",
    "情緒加注標籤",
    "Checklist",
    "備註"
  ];

  const rows =
    records.map((record) => [
      recordTradeDate(record),
      record.createdAt,
      record.appVersion || "",
      record.engineVersion || "",
      record.recordMode || "",
      record.symbol || "",
      record.backgroundTimeframe || "",
      record.backgroundState || "",
      record.mainTimeframe || "",
      record.mainState || "",
      record.secondaryTimeframe || "",
      record.secondaryState || "",
      record.entryTimeframe || "",
      record.direction || "",
      record.relation || "",
      record.preferredDirection || "",
      record.priorityDeployment || "",
      record.secondaryDeployment || "",
      record.backgroundRelation || "",
      record.backgroundDirectOverlap === "yes"
        ? "有"
        : "冇",
      record.basePosition ||
        record.position ||
        "",
      record.position ||
        record.basePosition ||
        "",
      record.p2EdgePosition
        ? "Yes"
        : "No",
      record.p3Testable
        ? "Yes"
        : "No",
      record.validSweep
        ? "Yes"
        : "No",
      record.validReclaim
        ? "Yes"
        : "No",
      record.reclaimQuality || "",
      record.retestQuality || "",
      record.tradeSpace || "",
      record.bonusCount ?? "",
      record.baseTrigger ||
        record.trigger ||
        "",
      record.trigger ||
        record.baseTrigger ||
        "",
      record.asia2BLabel ||
        "無",
      record.asia2BHighQuality
        ? "Yes"
        : "No",
      record.asia2BCriteriaCount ??
        "",
      record.asia2BStructureOverlap
        ? "Yes"
        : "No",
      obstacleDisplayLabel(
        record.obstacleState ||
        "far"
      ),
      record.marketCap ?? "",
      record.matrixSize ?? "",
      record.obstacleSize ??
        record.finalSize ??
        "",
      record.finalSize ?? "",
      record.entryStatus || "",
      record.tpPlan || "",
      Number.isFinite(
        record.profitR
      )
        ? record.profitR
        : "",
      record.reachedRF || "",
      record.reachedTP2 || "",
      record.hasImage
        ? "Yes"
        : "No",
      record.loosenedTriggerBecauseBias
        ? "Yes"
        : "No",
      record.emotionalSizing
        ? "Yes"
        : "No",
      record.checklistSummary || "",
      record.note || ""
    ]);

  const csv =
    [headers, ...rows]
      .map(
        (row) =>
          row
            .map(csvEscape)
            .join(",")
      )
      .join("\n");

  const blob =
    new Blob(
      ["\uFEFF", csv],
      {
        type:
          "text/csv;charset=utf-8"
      }
    );

  const url =
    URL.createObjectURL(blob);
  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    `MasterTrade-V3_2-Journal-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

  document.body
    .appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast(
    "CSV已匯出；圖片需要另外下載"
  );
}

function setupTabs() {
  document
    .querySelectorAll(
      ".tab-button"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(
              ".tab-button"
            )
            .forEach((item) => {
              item.classList.remove(
                "active"
              );
            });

          document
            .querySelectorAll(
              ".tab-panel"
            )
            .forEach((panel) => {
              panel.classList.remove(
                "active"
              );
            });

          button.classList.add(
            "active"
          );
          $(button.dataset.tab)
            .classList.add(
              "active"
            );

          if (
            button.dataset.tab ===
            "history"
          ) {
            renderHistory();
          }

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }
      );
    });
}

let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent =
    message;
  $("toast").classList.add(
    "show"
  );

  toastTimer =
    setTimeout(() => {
      $("toast").classList.remove(
        "show"
      );
    }, 2300);
}

function populateSelects() {
  [
    "backgroundTimeframe",
    "mainTimeframe",
    "secondaryTimeframe",
    "entryTimeframe"
  ].forEach((id) => {
    TIMEFRAMES.forEach((tf) => {
      $(id).add(
        new Option(tf, tf)
      );
    });
  });

  [
    "backgroundState",
    "mainState",
    "secondaryState"
  ].forEach((id) => {
    Object.keys(STATES)
      .forEach((state) => {
        $(id).add(
          new Option(
            state,
            state
          )
        );
      });
  });
}

function setupEvents() {
  $("timeframePreset")
    .addEventListener(
      "change",
      () => {
        applyTimeframePreset(
          $("timeframePreset").value
        );
        recalculate();
      }
    );

  [
    "backgroundTimeframe",
    "mainTimeframe",
    "secondaryTimeframe",
    "entryTimeframe"
  ].forEach((id) => {
    $(id).addEventListener(
      "change",
      () => {
        if (!suppressPresetChange) {
          $("timeframePreset").value =
            "custom";
        }
        recalculate();
      }
    );
  });

  $("decisionForm")
    .addEventListener(
      "input",
      recalculate
    );

  $("decisionForm")
    .addEventListener(
      "change",
      recalculate
    );

  $("decisionForm")
    .addEventListener(
      "submit",
      saveDecision
    );

  $("chartPasteZone")
    .addEventListener(
      "paste",
      handlePendingImagePaste
    );

  $("pasteClipboardImage")
    .addEventListener(
      "click",
      pastePendingImageFromClipboard
    );

  $("removePendingImage")
    .addEventListener(
      "click",
      clearPendingImage
    );

  $("historyModeFilter")
    .addEventListener(
      "change",
      renderHistory
    );

  $("historyEntryFilter")
    .addEventListener(
      "change",
      renderHistory
    );

  $("exportCsv")
    .addEventListener(
      "click",
      exportCsv
    );

  $("saveRecordEdit")
    .addEventListener(
      "click",
      saveRecordEdit
    );

  $("deleteRecord")
    .addEventListener(
      "click",
      deleteActiveRecord
    );

  $("editChartPasteZone")
    .addEventListener(
      "paste",
      handleEditingImagePaste
    );

  $("pasteEditClipboardImage")
    .addEventListener(
      "click",
      pasteEditingImageFromClipboard
    );

  $("removeStoredImage")
    .addEventListener(
      "click",
      requestRemoveStoredImage
    );

  $("downloadRecordImage")
    .addEventListener(
      "click",
      downloadActiveRecordImage
    );

  $("recordDialog")
    .addEventListener(
      "close",
      clearRecordImageDisplay
    );
}

function setupServiceWorker() {
  if (
    "serviceWorker" in navigator
  ) {
    window.addEventListener(
      "load",
      () => {
        navigator
          .serviceWorker
          .register(
            "./service-worker.js"
          )
          .catch((error) => {
            console.error(
              "Service worker registration failed:",
              error
            );
          });
      }
    );
  }
}

function initialize() {
  populateSelects();

  $("tradeDate").value =
    localDateString();

  applyTimeframePreset("fx");

  $("backgroundState").value =
    "轉換中－中性";
  $("mainState").value =
    "健康跌勢";
  $("secondaryState").value =
    "轉換中－偏跌";

  setupTabs();
  setupEvents();
  setupServiceWorker();

  recalculate();
  renderHistory();
}

initialize();
})();
