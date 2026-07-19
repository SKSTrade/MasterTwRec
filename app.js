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
    title: "大局級位置",
    note: "W／D重大支持阻力、大局背景／主判真正主結、大型Range邊界、會改變主判Market State嘅主結Break後首次Retest，以及多個HTF結構高度重疊。P1先有資格喺無方向權限時考慮大局P1反轉例外，但仍必須Q3右側確認。"
  },
  P2: {
    title: "A級工作位置",
    note: "次判主結、主判次結、工作結構Break後首次Retest、重要Swap／Impulse Origin，以及實際結構＋Mon H/L、Asia H/L、OPR、PDH／PDL重疊。單獨Mon H/L或Liquidity本身唔係P2。"
  },
  P3: {
    title: "普通局部位置",
    note: "次判次結、入場TF主結、普通局部結構＋Session Liquidity、普通Fib＋Swap。只適合方向權限清楚時按Matrix小注。"
  },
  P4: {
    title: "禁止位置",
    note: "Range中間、Chase、純Fib、純Asia／OPR、純2B冇結構，或者前方立即撞重大障礙令R:R不足。P4＝0注。"
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
  "bonusLiquidityOverlap",
  "bonusFollowThrough"
];

let currentBaseTrigger = null;
let currentAsia2B = null;
let currentDecision = null;
let activeRecordId = null;
let suppressPresetChange = false;

let pendingImageBlobs = [];
let pendingImageUrls = [];
let editingImageBlobs = [];
let editingImageUrls = [];

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
    $("entryTimeframe").value = "15M";
  } else if (value === "hsi1m") {
    $("backgroundTimeframe").value = "4H";
    $("mainTimeframe").value = "1H";
    $("secondaryTimeframe").value = "15M";
    $("entryTimeframe").value = "1M";
  }

  suppressPresetChange = false;
}

function marketRelation(mainState, secondaryState) {
  if (
    isTransition(mainState) ||
    isTransition(secondaryState)
  ) {
    return "包含轉換";
  }

  const mainBias =
    stateBias(mainState);
  const secondaryBias =
    stateBias(secondaryState);

  if (
    mainBias === secondaryBias
  ) {
    if (
      isHealthy(mainState) &&
      isHealthy(secondaryState)
    ) {
      return "健康同向";
    }

    return "同向有弱勢";
  }

  if (
    isWeak(mainState) &&
    isWeak(secondaryState)
  ) {
    return "弱勢衝突";
  }

  return "方向衝突";
}

function directionPermissionInfo() {
  const mainState =
    $("mainState").value;
  const secondaryState =
    $("secondaryState").value;

  const mainBias =
    stateBias(mainState);
  const secondaryBias =
    stateBias(secondaryState);
  const currentTradeBias =
    tradeBias();

  const relation =
    marketRelation(
      mainState,
      secondaryState
    );

  const none = (reason) => ({
    code: "none",
    label:
      "無方向權限｜正常0注",
    cap: 0,
    relation,
    reason
  });

  const limited = (reason) => ({
    code: "limited",
    label:
      "限制方向權限｜Max 0.5注",
    cap: 0.5,
    relation,
    reason
  });

  if (
    mainBias === null
  ) {
    return none(
      "主判目前轉換中性，未提供可執行方向。P/Q唔可以自行創造方向權限。"
    );
  }

  if (
    mainBias === secondaryBias &&
    mainBias !== null
  ) {
    if (
      currentTradeBias !== mainBias
    ) {
      return none(
        "交易方向逆主判＋次判共同方向；普通P1/P2＋Q3仍然冇權限。"
      );
    }

    if (
      isHealthy(mainState) &&
      isHealthy(secondaryState)
    ) {
      return {
        code: "normal",
        label:
          "正常方向權限｜Max 1注",
        cap: 1,
        relation,
        reason:
          "主判＋次判健康同向，而且交易方向順共同趨勢。"
      };
    }

    return limited(
      "主判＋次判方向一致，但至少一層屬弱勢／Transition；方向有權做，但最高0.5注。"
    );
  }

  if (
    secondaryBias === null
  ) {
    if (
      currentTradeBias === mainBias
    ) {
      return limited(
        "次判轉換中性，交易仍順主判方向；只屬限制權限。"
      );
    }

    return none(
      "次判冇方向確認，而交易又唔順主判；目前冇方向權限。"
    );
  }

  if (
    mainBias !== secondaryBias
  ) {
    if (
      currentTradeBias === mainBias &&
      !isTransition(mainState)
    ) {
      return limited(
        "主次方向衝突，但交易方向順主判已確認方向；最高0.5注。"
      );
    }

    if (
      currentTradeBias === mainBias &&
      isTransition(mainState) &&
      secondaryBias === mainBias
    ) {
      return limited(
        "主判Transition傾向同次判方向一致；只屬限制權限。"
      );
    }

    return none(
      "交易方向未得到主判方向權限支持。順次判逆主判，或逆兩層方向，正常Gate＝0。"
    );
  }

  return none(
    "目前主次Market State未提供清晰交易方向權限。"
  );
}

function backgroundRelationInfo() {
  const state =
    $("backgroundState").value;
  const bias =
    stateBias(state);
  const type =
    STATES[state].type;

  if (bias === null) {
    return {
      label: "大局中性",
      note:
        "大局背景暫時冇明確方向；唔會自行創造Direction Permission。"
    };
  }

  const aligned =
    bias === tradeBias();
  const descriptor =
    type === "transition"
      ? "傾向"
      : "方向";

  return {
    label: aligned
      ? `順大局${descriptor}`
      : `逆大局${descriptor}`,
    note:
      "大局方向只提供背景／Narrative，唔屬於Q Trigger加分。方向權限仍由主判＋次判互動決定。"
  };
}

function preferredDirectionInfo() {
  const permission =
    directionPermissionInfo();

  if (
    permission.code === "normal"
  ) {
    return {
      label:
        `${direction()}｜正常權限`,
      note:
        permission.reason
    };
  }

  if (
    permission.code === "limited"
  ) {
    return {
      label:
        `${direction()}｜限制權限`,
      note:
        permission.reason
    };
  }

  return {
    label:
      `${direction()}｜無正常權限`,
    note:
      `${permission.reason} 唯一例外係真正大局P1＋Q3右側反轉確認，可開0.25注試單。`
  };
}

function combinedDeploymentInfo() {
  const permission =
    directionPermissionInfo();

  if (
    permission.code === "normal"
  ) {
    return {
      priority:
        `優先部署${direction()}：Direction Permission正常，等P1／P2＋Q3；P3按Matrix小注，避免Chase。`,
      secondary:
        "P/Q只負責位置同Trigger質素；前方大局障礙仍可降級或取消。"
    };
  }

  if (
    permission.code === "limited"
  ) {
    return {
      priority:
        `可部署${direction()}但屬限制權限，市場最高0.5注；再由P × Q決定實際注碼。`,
      secondary:
        "P1／P2＋Q3最多0.5；P3只限Q3 0.25；Q2按Matrix降級。"
    };
  }

  return {
    priority:
      `${direction()}目前無Direction Permission：正常Matrix一律0注。`,
    secondary:
      "只可等真正大局P1＋Q3右側反轉確認，先啟用0.25注大局P1反轉例外。"
  };
}


function triggerModelLabel() {
  return "Q Trigger｜Sweep → Reclaim → Weak Retest";
}

function evaluateBaseTrigger() {
  const failures = [];
  const coreFailures = [];
  const imperfections = [];
  const positives = [];

  const validSweep =
    checked("validSweep");
  const validReclaim =
    checked("validReclaim");
  const reclaimQuality =
    $("reclaimQuality").value;
  const retestQuality =
    $("retestQuality").value;
  const tradeSpace =
    $("tradeSpace").value;
  const bonusCount =
    countChecked(BONUS_IDS);

  if (!validSweep) {
    coreFailures.push(
      "冇有效Sweep。"
    );
  } else {
    positives.push(
      "有效Sweep成立。"
    );
  }

  if (!validReclaim) {
    coreFailures.push(
      "冇真正有效Reclaim。"
    );
  } else {
    positives.push(
      "有效Reclaim成立。"
    );
  }

  if (
    reclaimQuality === "negated"
  ) {
    coreFailures.push(
      "Reclaim完全被吞噬／否定。"
    );
  } else if (
    reclaimQuality === "ordinary"
  ) {
    imperfections.push(
      "Reclaim力度普通，但核心論點仍然存在。"
    );
  } else {
    positives.push(
      "Reclaim乾淨／明確。"
    );
  }

  if (
    retestQuality === "invalid"
  ) {
    coreFailures.push(
      "Retest快、深、強，已否定Reclaim。"
    );
  } else if (
    retestQuality ===
      "imperfect"
  ) {
    imperfections.push(
      "Retest有瑕疵，但未正式否定Reclaim。"
    );
  } else {
    positives.push(
      "Retest明顯弱過Reclaim。"
    );
  }

  if (
    tradeSpace ===
    "insufficient"
  ) {
    failures.push(
      "第一個真實Target前冇合理R:R。"
    );
  } else if (
    tradeSpace === "short"
  ) {
    imperfections.push(
      "交易空間只達最低可接受R:R，未算完整。"
    );
  } else {
    positives.push(
      "到第一個真實Target有完整合理R:R。"
    );
  }

  if (
    checked("chasedBreakout")
  ) {
    failures.push(
      "實際入場屬Chase。"
    );
  }

  failures.push(
    ...coreFailures
  );

  let quality = "Q1";

  if (
    failures.length === 0
  ) {
    quality =
      reclaimQuality === "strong" &&
      retestQuality === "weak" &&
      tradeSpace === "full"
        ? "Q3"
        : "Q2";
  }

  if (bonusCount > 0) {
    positives.push(
      `有${bonusCount}項Trigger加分證據；只作輔助，唔會override Price Action。`
    );
  }

  return {
    model: "A",
    modelLabel:
      triggerModelLabel(),
    quality,
    preBonusQuality:
      quality,
    bonusUpgraded: false,
    failures,
    coreFailures,
    imperfections,
    positives,
    bonusCount,
    bonusDirectRepair: false,
    bonusNoDoubleCount: false,
    tradeSpace,
    validSweep,
    validReclaim,
    reclaimQuality,
    retestQuality,
    breakoutMeaningful: false,
    breakoutAcceptance: null,
    breakoutMomentum: null,
    breakoutRetestQuality: null,
    breakoutRetestSupport: null,
    modelCoreValid:
      coreFailures.length === 0
  };
}

function evaluateAsia2B(baseTrigger) {
  const type =
    $("asia2BType").value;

  const active =
    type !== "none";

  const expectedDirection =
    type === "asiaTop"
      ? "Short"
      : type === "asiaBottom"
        ? "Long"
        : null;

  const directionMatches =
    active &&
    direction() ===
      expectedDirection;

  const criteriaCount = [
    checked("asia2BClearLiquidity"),
    checked("asia2BCleanSweep"),
    checked("asia2BReclaimBreak"),
    checked("asia2BWeakRetest"),
    checked("asia2BVolumeSupport"),
    checked("asia2BNoDoubleSweep")
  ].filter(Boolean).length;

  const highQuality =
    active &&
    directionMatches &&
    criteriaCount >= 5;

  const basePosition =
    $("positionLevel").value;

  const structureOverlap =
    checked(
      "asia2BStructureOverlap"
    );

  let effectivePosition =
    basePosition;

  let effectiveQuality =
    baseTrigger.quality;

  let positionPromoted = false;
  let triggerPromoted = false;

  const reasons = [];
  const warnings = [];

  const label =
    type === "asiaTop"
      ? "洗OPR／亞洲盤頂2B"
      : type === "asiaBottom"
        ? "洗OPR／亞洲盤底2B"
        : "冇OPR／亞洲盤2B";

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
      baseQuality:
        baseTrigger.quality,
      effectiveQuality,
      positionPromoted,
      triggerPromoted,
      reasons,
      warnings
    };
  }

  if (!directionMatches) {
    warnings.push(
      `${label}同實際交易方向唔一致，所以唔提供P／Q升級。`
    );
  } else if (!highQuality) {
    warnings.push(
      `${label}只符合${criteriaCount}/6項高質條件；最少5/6先有升級資格。`
    );
  }

  if (highQuality) {
    if (
      basePosition === "P3" &&
      structureOverlap
    ) {
      effectivePosition =
        "P2";
      positionPromoted = true;

      reasons.push(
        `高質${label}＋原有結構基礎：P3 → P2。`
      );
    } else if (
      basePosition === "P3" &&
      !structureOverlap
    ) {
      warnings.push(
        `${label}冇原有結構基礎，唔可以由P3創造P2。`
      );
    } else if (
      basePosition === "P2"
    ) {
      reasons.push(
        `高質${label}強化P2可信度，但唔會P2 → P1。`
      );
    } else if (
      basePosition === "P4"
    ) {
      warnings.push(
        `${label}唔可以拯救P4。`
      );
    }

    if (
      baseTrigger.quality === "Q2"
    ) {
      effectiveQuality = "Q3";
      triggerPromoted = true;

      reasons.push(
        `高質${label}：Q2 → Q3。`
      );
    }
  }

  reasons.push(
    "Asia／OPR 2B只係執行優勢：唔可以創造Direction Permission、突破方向權限上限或推翻大局障礙。"
  );

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
    baseQuality:
      baseTrigger.quality,
    effectiveQuality,
    positionPromoted,
    triggerPromoted,
    reasons,
    warnings
  };
}

function matrixCell(
  permissionCode,
  position,
  quality
) {
  if (
    quality === "Q1" ||
    position === "P4"
  ) {
    return 0;
  }

  if (
    permissionCode === "normal"
  ) {
    if (
      (
        position === "P1" ||
        position === "P2"
      ) &&
      quality === "Q3"
    ) {
      return 1;
    }

    if (
      (
        position === "P1" ||
        position === "P2"
      ) &&
      quality === "Q2"
    ) {
      return 0.5;
    }

    if (
      position === "P3" &&
      quality === "Q3"
    ) {
      return 0.5;
    }

    if (
      position === "P3" &&
      quality === "Q2"
    ) {
      return 0.25;
    }

    return 0;
  }

  if (
    permissionCode === "limited"
  ) {
    if (
      (
        position === "P1" ||
        position === "P2"
      ) &&
      quality === "Q3"
    ) {
      return 0.5;
    }

    if (
      (
        position === "P1" ||
        position === "P2"
      ) &&
      quality === "Q2"
    ) {
      return 0.25;
    }

    if (
      position === "P3" &&
      quality === "Q3"
    ) {
      return 0.25;
    }

    return 0;
  }

  return 0;
}

function evaluateMatrix(
  effectivePosition,
  effectiveQuality
) {
  const permission =
    directionPermissionInfo();

  let size =
    matrixCell(
      permission.code,
      effectivePosition,
      effectiveQuality
    );

  let exceptionApplied = false;

  const p1ExceptionEligible =
    permission.code === "none" &&
    effectivePosition === "P1" &&
    effectiveQuality === "Q3" &&
    checked(
      "bigPictureP1ReversalException"
    );

  if (
    p1ExceptionEligible
  ) {
    size = 0.25;
    exceptionApplied = true;
  }

  const combination =
    `${effectivePosition}＋${effectiveQuality}`;

  let cellExplanation;

  if (exceptionApplied) {
    cellExplanation =
      `${combination}原本因無Direction Permission＝0；已確認真正大局P1＋Q3右側反轉，啟用唯一例外＝0.25注。`;
  } else if (
    permission.code === "none"
  ) {
    cellExplanation =
      `${combination}雖然P／Q可能合格，但Direction Permission Gate＝0，所以正常Matrix仍然0注。`;
  } else {
    cellExplanation =
      `${permission.label}；${combination}按P × Q Matrix最高許可${SIZE_LABELS[size]}。`;
  }

  return {
    relation:
      permission.relation,
    permissionCode:
      permission.code,
    permissionLabel:
      exceptionApplied
        ? "無方向權限｜已啟用大局P1反轉例外"
        : permission.label,
    permissionReason:
      permission.reason,
    permissionCap:
      exceptionApplied
        ? 0.25
        : permission.cap,
    exceptionApplied,
    mode:
      permission.code,
    route:
      permission.label,
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

function evaluateHardVeto(
  effectivePosition,
  baseTrigger
) {
  const vetoes = [];

  if (
    effectivePosition === "P4"
  ) {
    vetoes.push(
      "P4禁止位置。"
    );
  }

  if (
    checked("chasedBreakout")
  ) {
    vetoes.push(
      "實際入場屬Chase。"
    );
  }

  if (
    !baseTrigger.modelCoreValid
  ) {
    vetoes.push(
      "Q Trigger核心失效：缺少有效Sweep／Reclaim，或者Retest已否定Reclaim。"
    );
  }

  if (
    baseTrigger.quality === "Q1"
  ) {
    vetoes.push(
      "Q1＝Trigger核心失效／交易空間不足。"
    );
  }

  if (
    baseTrigger.tradeSpace ===
    "insufficient"
  ) {
    vetoes.push(
      "第一個真實Target前冇合理R:R。"
    );
  }

  if (
    checked(
      "violatesTradingTime"
    ) ||
    checked(
      "riskLimitExceeded"
    )
  ) {
    vetoes.push(
      "違反交易時間或總風險限制。"
    );
  }

  return vetoes;
}

function evaluateDecision(
  baseTrigger,
  asia2B
) {
  const matrix =
    evaluateMatrix(
      asia2B.effectivePosition,
      asia2B.effectiveQuality
    );

  const preferred =
    preferredDirectionInfo();

  const background =
    backgroundRelationInfo();

  let obstacle =
    applyObstacle(
      matrix.size,
      asia2B.effectivePosition,
      asia2B.effectiveQuality
    );

  const hardVetoes =
    evaluateHardVeto(
      asia2B.effectivePosition,
      baseTrigger
    );

  const reasons = [
    ...asia2B.reasons,
    `① Market State：${matrix.relation}。`,
    `② Direction Permission：${matrix.permissionLabel}。${matrix.permissionReason}`,
    `③ P位置：${asia2B.effectivePosition}。`,
    `④ Q Trigger：基礎${baseTrigger.quality}；2B後最終${asia2B.effectiveQuality}。`,
    `⑤ P × Q：${matrix.cellExplanation}`,
    `⑥ 大局障礙：${obstacle.explanation}`
  ];

  const warnings = [
    ...asia2B.warnings,
    preferred.note,
    background.note
  ];

  if (
    matrix.permissionCode === "none" &&
    !matrix.exceptionApplied
  ) {
    warnings.push(
      "Direction Permission係Gate：目前無權限，P1／P2＋Q3都唔可以自行創造交易資格。"
    );
  }

  if (
    matrix.exceptionApplied
  ) {
    warnings.push(
      "已啟用大局P1反轉例外：只開0.25注試單權限。P1位置只提供反轉資格，Q3右側先提供入場確認。"
    );
  }

  if (
    $("backgroundDirectOverlap")
      .value === "yes" &&
    (
      asia2B.basePosition ===
        "P2" ||
      asia2B.basePosition ===
        "P3"
    )
  ) {
    warnings.push(
      "目前Entry仍直接處於大局重大結構區；請重新檢查實際位置是否應列P1。"
    );
  }

  if (
    $("p1BackgroundTailwind")
      .value === "yes" &&
    asia2B.basePosition === "P2"
  ) {
    warnings.push(
      "呢筆係P2＋P1背景順風；P1 Context唔會將實際P2升P1。"
    );
  }

  if (
    checked(
      "loosenedTriggerBecauseBias"
    )
  ) {
    warnings.push(
      "紀律標籤：曾因主觀方向偏見想放寬Trigger；Direction Permission同Q要求都唔可以因此放寬。"
    );
  }

  if (
    checked(
      "emotionalSizing"
    )
  ) {
    warnings.push(
      "紀律標籤：曾因情緒／信心想加注；最終注碼仍取所有限制中最低值。"
    );
  }

  const finalSize =
    hardVetoes.length > 0
      ? 0
      : obstacle.adjustedSize;

  if (
    hardVetoes.length > 0
  ) {
    reasons.push(
      `⑦ Hard Veto成立，最終由${SIZE_LABELS[obstacle.adjustedSize]}取消至0注。`
    );
  } else {
    reasons.push(
      `⑦ 最終注碼＝Direction Permission、P × Q、大局障礙所有限制中最低值＝${SIZE_LABELS[finalSize]}。`
    );
  }

  return {
    relation:
      matrix.relation,
    directionPermission:
      matrix.permissionLabel,
    permissionCode:
      matrix.permissionCode,
    preferredDirection:
      preferred.label,
    priorityNote:
      preferred.note,
    backgroundRelation:
      background.label,
    backgroundRelationNote:
      background.note,
    marketCap:
      matrix.permissionCap,
    matrixMode:
      matrix.mode,
    matrixRoute:
      matrix.route,
    rawMatrixSize:
      matrix.size,
    matrixSize:
      matrix.size,
    positionQualitySize:
      matrix.size,
    obstacleState:
      obstacle.state,
    obstacleSize:
      obstacle.adjustedSize,
    obstacleManagement:
      obstacle.management,
    finalSize,
    p1ReversalException:
      matrix.exceptionApplied,
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

  $("preBonusTriggerGrade").textContent =
    trigger.quality;

  const grade =
    $("baseTriggerGrade");

  grade.textContent =
    trigger.quality === "Q3"
      ? "Q3｜完整"
      : trigger.quality === "Q2"
        ? "Q2｜可交易但有瑕疵"
        : "Q1｜Trigger失效";

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
  $("asia2BChecklist")
    .classList.toggle(
      "hidden",
      !result.active
    );

  const grade =
    $("baseTriggerGrade");

  if (!result.active) {
    $("asia2BQuality").textContent =
      "未啟用";
    $("asia2BPositionEffect").textContent =
      "無";
    $("asia2BTriggerEffect").textContent =
      "無";

    grade.textContent =
      currentBaseTrigger.quality === "Q3"
        ? "Q3｜完整"
        : currentBaseTrigger.quality === "Q2"
          ? "Q2｜可交易但有瑕疵"
          : "Q1｜Trigger失效";

    grade.className =
      `grade ${currentBaseTrigger.quality.toLowerCase()}`;
    return;
  }

  $("asia2BQuality").textContent =
    result.highQuality
      ? `高質｜${result.criteriaCount}/6`
      : `未達高質｜${result.criteriaCount}/6`;

  $("asia2BPositionEffect").textContent =
    result.positionPromoted
      ? `${result.basePosition} → ${result.effectivePosition}`
      : `維持${result.basePosition}`;

  $("asia2BTriggerEffect").textContent =
    result.triggerPromoted
      ? `${result.baseQuality} → ${result.effectiveQuality}`
      : `維持${result.baseQuality}`;

  grade.textContent =
    result.effectiveQuality === "Q3"
      ? result.triggerPromoted
        ? "Q3｜高質2B由Q2升級"
        : "Q3｜完整"
      : result.effectiveQuality === "Q2"
        ? "Q2｜可交易但有瑕疵"
        : "Q1｜Trigger失效";

  grade.className =
    `grade ${result.effectiveQuality.toLowerCase()}`;
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
  $("directionPermission").textContent =
    decision.directionPermission;
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
  $("resultP1Background").textContent =
    $("p1BackgroundTailwind").value === "yes"
      ? "有｜P1背景順風"
      : "冇";
  $("resultDirectionPermission").textContent =
    decision.directionPermission;
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
    SIZE_LABELS[decision.rawMatrixSize];
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
const info = POSITION_INFO[position];
  $("positionTitle").textContent =
    `${position}｜${info.title}`;
  $("positionNote").textContent =
    info.note;

  const permission =
    directionPermissionInfo();

  const showP1Exception =
    position === "P1" &&
    permission.code === "none";

  $("bigPictureP1ExceptionRow")
    .classList.toggle(
      "hidden",
      !showP1Exception
    );

  if (!showP1Exception) {
    $("bigPictureP1ReversalException")
      .checked = false;
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

function triggerChecklistLines() {
  return [
    `有效Sweep：${yesNo(currentBaseTrigger.validSweep)}`,
    `有效Reclaim：${yesNo(currentBaseTrigger.validReclaim)}`,
    `Reclaim質素：${$("reclaimQuality").selectedOptions[0].textContent}`,
    `Retest質素：${$("retestQuality").selectedOptions[0].textContent}`,
    `交易空間：${$("tradeSpace").selectedOptions[0].textContent}`,
    `Trigger加分證據：${currentBaseTrigger.bonusCount}/${BONUS_IDS.length}`,
    `基礎Q：${currentBaseTrigger.quality}`,
    `2B後最終Q：${currentAsia2B.effectiveQuality}`
  ];
}

function checklistSummary() {
  const timeframes =
    timeframeValues();

  return [
    `交易日期：${$("tradeDate").value}`,
    `大局背景層：${timeframes.background}－${$("backgroundState").value}`,
    `主判斷層：${timeframes.main}－${$("mainState").value}`,
    `次判斷層：${timeframes.secondary}－${$("secondaryState").value}`,
    `入場觸發層：${timeframes.entry}`,
    `交易方向：${direction()}`,
    `主次關係：${currentDecision.relation}`,
    `Direction Permission：${currentDecision.directionPermission}`,
    `交易優先方向：${currentDecision.preferredDirection}`,
    `優先部署：${combinedDeploymentInfo().priority}`,
    `次要部署：${combinedDeploymentInfo().secondary}`,
    `大局位置實際重疊：${$("backgroundDirectOverlap").value === "yes" ? "有" : "冇"}`,
    `P1背景順風：${$("p1BackgroundTailwind").value === "yes" ? "有" : "冇"}`,
    `大局P1反轉例外資格：${yesNo(checked("bigPictureP1ReversalException"))}`,
    "",
    `原始位置：${currentAsia2B.basePosition}`,
    `2B後位置：${currentAsia2B.effectivePosition}`,
    "",
    ...triggerChecklistLines(),
    "",
    `OPR／亞洲盤2B：${currentAsia2B.active ? currentAsia2B.label : "無"}`,
    `2B高質：${yesNo(currentAsia2B.highQuality)}`,
    `OPR／亞洲盤2B高質條件：${currentAsia2B.criteriaCount}/6`,
    `沒有頂底雙邊掃：${yesNo(checked("asia2BNoDoubleSweep"))}`,
    `2B結構基礎：${yesNo(currentAsia2B.structureOverlap)}`,
    "",
    `大局障礙：${obstacleDisplayLabel(currentDecision.obstacleState)}`,
    `方向權限上限：${SIZE_LABELS[currentDecision.marketCap]}`,
    `P × Q Matrix：${SIZE_LABELS[currentDecision.rawMatrixSize]}`,
    `大局修正：${SIZE_LABELS[currentDecision.obstacleSize]}`,
    `最終注碼：${SIZE_LABELS[currentDecision.finalSize]}`,
    "",
    `追價：${yesNo(checked("chasedBreakout"))}`,
    `違反交易時間：${yesNo(checked("violatesTradingTime"))}`,
    `總風險超標：${yesNo(checked("riskLimitExceeded"))}`,
    `方向偏見想放寬Trigger：${yesNo(checked("loosenedTriggerBecauseBias"))}`,
    `情緒想加注：${yesNo(checked("emotionalSizing"))}`,
    "",
    `Entry-time Q：${$("entryTimeQ").value === "Auto" ? currentAsia2B.effectiveQuality : $("entryTimeQ").value}`,
    `Post-entry Q：${$("postEntryQ").value}`,
    `Post-entry處理：${$("postEntryAction").value}`
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

function normalizeStoredImages(value) {
  if (!value) return [];

  if (value instanceof Blob) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter(
      (item) => item instanceof Blob
    );
  }

  return [];
}

async function putImages(recordId, blobs) {
  const database =
    await openImageDatabase();

  const safeBlobs =
    Array.isArray(blobs)
      ? blobs.filter(
          (item) => item instanceof Blob
        )
      : [];

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        IMAGE_STORE,
        "readwrite"
      );

    transaction
      .objectStore(IMAGE_STORE)
      .put(safeBlobs, recordId);

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

async function getImages(recordId) {
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
      resolve(
        normalizeStoredImages(
          request.result
        )
      );
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

async function deleteImages(recordId) {
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

function revokeObjectUrls(urls) {
  urls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore already-revoked URLs.
    }
  });
}

function renderPendingImageGallery() {
  revokeObjectUrls(
    pendingImageUrls
  );

  pendingImageUrls =
    pendingImageBlobs.map(
      (blob) =>
        URL.createObjectURL(blob)
    );

  $("pendingImageCount").textContent =
    `已貼上 ${pendingImageBlobs.length} 張圖片`;

  $("imagePreviewContainer")
    .classList.toggle(
      "hidden",
      pendingImageBlobs.length === 0
    );

  $("imagePreviewGallery").innerHTML =
    pendingImageUrls
      .map(
        (url, index) => `
          <div class="multi-image-item">
            <img
              src="${url}"
              alt="Chart screenshot ${index + 1}"
            >
            <div class="multi-image-item-actions">
              <span>圖片 ${index + 1}</span>
              <button
                type="button"
                class="danger-button mini-button"
                data-remove-pending-image="${index}"
              >移除</button>
            </div>
          </div>
        `
      )
      .join("");
}

function clearPendingImage() {
  revokeObjectUrls(
    pendingImageUrls
  );
  pendingImageUrls = [];
  pendingImageBlobs = [];

  $("imagePreviewGallery").innerHTML =
    "";
  $("pendingImageCount").textContent =
    "已貼上 0 張圖片";
  $("imagePreviewContainer")
    .classList.add("hidden");
}

function removePendingImageAt(index) {
  if (
    index < 0 ||
    index >= pendingImageBlobs.length
  ) {
    return;
  }

  pendingImageBlobs.splice(
    index,
    1
  );

  renderPendingImageGallery();
}

function clipboardImagesFromPasteEvent(event) {
  const items =
    event.clipboardData?.items || [];
  const images = [];

  for (const item of items) {
    if (
      item.kind === "file" &&
      item.type.startsWith("image/")
    ) {
      const file =
        item.getAsFile();

      if (file) {
        images.push(file);
      }
    }
  }

  return images;
}

async function readImagesFromSystemClipboard() {
  if (
    !navigator.clipboard ||
    typeof navigator.clipboard.read !==
      "function"
  ) {
    return [];
  }

  const clipboardItems =
    await navigator.clipboard.read();
  const images = [];

  for (const item of clipboardItems) {
    for (const type of item.types) {
      if (
        type.startsWith("image/")
      ) {
        images.push(
          await item.getType(type)
        );
      }
    }
  }

  return images;
}

async function addPendingImageBlobs(blobs) {
  const validBlobs =
    (Array.isArray(blobs)
      ? blobs
      : [blobs]
    ).filter(
      (blob) =>
        blob instanceof Blob
    );

  if (validBlobs.length === 0) {
    showToast(
      "剪貼簿入面搵唔到圖片"
    );
    return;
  }

  const compressed =
    await Promise.all(
      validBlobs.map(
        (blob) =>
          compressImage(blob)
      )
    );

  pendingImageBlobs.push(
    ...compressed
  );

  renderPendingImageGallery();

  showToast(
    `已新增 ${compressed.length} 張圖片；目前共 ${pendingImageBlobs.length} 張`
  );
}

async function handlePendingImagePaste(event) {
  event.preventDefault();

  const blobs =
    clipboardImagesFromPasteEvent(
      event
    );

  await addPendingImageBlobs(
    blobs
  );
}

async function pastePendingImageFromClipboard() {
  try {
    const blobs =
      await readImagesFromSystemClipboard();

    await addPendingImageBlobs(
      blobs
    );
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
      "PracticeJournal-V1.17",
    engineVersion:
      "MasterTradeDecisionMatrix-V3.2-DirectionPermission",

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
      "no",

    direction:
      direction(),
    relation:
      currentDecision.relation,
    directionPermission:
      currentDecision.directionPermission,
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
    p1BackgroundTailwind:
      $("p1BackgroundTailwind").value,
    bigPictureP1ReversalException:
      checked("bigPictureP1ReversalException"),
    p1ReversalExceptionApplied:
      currentDecision.p1ReversalException,

    basePosition:
      currentAsia2B.basePosition,
    position:
      currentAsia2B.effectivePosition,
    p2EdgePosition:
      false,
    p3Testable:
      false,

    triggerModel:
      currentBaseTrigger.model,
    triggerModelLabel:
      currentBaseTrigger.modelLabel,

    validSweep:
      currentBaseTrigger.validSweep,
    validReclaim:
      currentBaseTrigger.validReclaim,
    reclaimQuality:
      currentBaseTrigger.reclaimQuality,
    retestQuality:
      currentBaseTrigger.retestQuality,

    breakoutMeaningful:
      currentBaseTrigger.breakoutMeaningful,
    breakoutAcceptance:
      currentBaseTrigger.breakoutAcceptance,
    breakoutMomentum:
      currentBaseTrigger.breakoutMomentum,
    breakoutRetestQuality:
      currentBaseTrigger.breakoutRetestQuality,
    breakoutRetestSupport:
      currentBaseTrigger.breakoutRetestSupport,

    tradeSpace:
      currentBaseTrigger.tradeSpace,
    bonusCount:
      currentBaseTrigger.bonusCount,
    bonusDirectRepair:
      currentBaseTrigger.bonusDirectRepair,
    bonusNoDoubleCount:
      currentBaseTrigger.bonusNoDoubleCount,
    triggerBonusUpgraded:
      currentBaseTrigger.bonusUpgraded,

    baseTrigger:
      currentBaseTrigger.preBonusQuality,
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
    asia2BNoDoubleSweep:
      checked("asia2BNoDoubleSweep"),
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
    rawMatrixSize:
      currentDecision.rawMatrixSize,
    matrixSize:
      currentDecision.matrixSize,
    positionQualitySize:
      currentDecision.positionQualitySize,
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
    entryTimeQ:
      $("entryTimeQ").value === "Auto"
        ? currentAsia2B.effectiveQuality
        : $("entryTimeQ").value,
    postEntryQ:
      $("postEntryQ").value,
    postEntryAction:
      $("postEntryAction").value,
    tpPlan:
      $("tpPlan").value,
    profitR:
      optionalNumberFromInput("profitR"),
    reachedRF:
      $("reachedRF").value,
    reachedTP2:
      $("reachedTP2").value,
    hasImage:
      pendingImageBlobs.length > 0,
    imageCount:
      pendingImageBlobs.length,

    checklistSummary:
      checklistSummary(),
    note:
      $("note").value.trim()
  };

  const records = loadRecords();
  records.unshift(record);
  saveRecords(records);

  if (pendingImageBlobs.length > 0) {
    try {
      await putImages(
        recordId,
        pendingImageBlobs
      );
    } catch (error) {
      console.error(
        "Image save failed:",
        error
      );

      record.hasImage = false;
      record.imageCount = 0;
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
  $("entryTimeQ").value = "Auto";
  $("postEntryQ").value = "N/A";
  $("postEntryAction").value = "N/A";
  $("reachedRF").value = "No";
  $("reachedTP2").value = "No";
  $("note").value = "";

  renderHistory();
  showToast(
    "已儲存Direction Permission V3.2練習／實戰紀錄"
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

  const winRateTrades =
    allRecords.filter(
      (record) =>
        record.entryStatus === "Entry" &&
        Number.isFinite(record.profitR) &&
        record.profitR !== 0
    );

  if (winRateTrades.length > 0) {
    const wins =
      winRateTrades.filter(
        (record) =>
          record.profitR > 0
      ).length;

    const winRate =
      wins /
      winRateTrades.length *
      100;

    $("statWinRate").textContent =
      `${winRate.toFixed(1)}%｜${wins}/${winRateTrades.length}`;
  } else {
    $("statWinRate").textContent =
      "未有資料";
  }

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

  const rfApplicable =
    allRecords.filter(
      (record) =>
        record.reachedRF !== "N/A"
    );

  const tp2Applicable =
    allRecords.filter(
      (record) =>
        record.reachedTP2 !== "N/A"
    );

  if (rfApplicable.length > 0) {
    const rfRate =
      rfApplicable.filter(
        (record) =>
          record.reachedRF === "Yes"
      ).length /
      rfApplicable.length *
      100;

    $("statRFRate").textContent =
      `${rfRate.toFixed(1)}%`;
  } else {
    $("statRFRate").textContent =
      "未有資料";
  }

  if (tp2Applicable.length > 0) {
    const tp2Rate =
      tp2Applicable.filter(
        (record) =>
          record.reachedTP2 === "Yes"
      ).length /
      tp2Applicable.length *
      100;

    $("statTP2Rate").textContent =
      `${tp2Rate.toFixed(1)}%`;
  } else {
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

      const imageCount =
        Number.isFinite(record.imageCount)
          ? record.imageCount
          : record.hasImage
            ? 1
            : 0;

      const imageTag =
        imageCount > 0
          ? `<span class="history-tag">📷 ${imageCount}張圖片</span>`
          : "";

      const twoBTag =
        record.asia2BType &&
        record.asia2BType !== "none"
          ? `<span class="history-tag">${escapeHtml(
              record.asia2BHighQuality
                ? "高質OPR／Asia 2B"
                : "OPR／Asia 2B"
            )}</span>`
          : "";

      const engineTag =
        record.engineVersion
          ? `<span class="history-tag">${escapeHtml(
              record.engineVersion.includes(
                "V3.2-DirectionPermission"
              )
                ? "Matrix V3.2"
                : record.engineVersion.replace(
                    "MasterTradeDecisionMatrix-",
                    "Matrix "
                  )
            )}</span>`
          : "";

      const triggerModelTag =
        record.engineVersion?.includes(
          "DirectionPermission"
        )
          ? '<span class="history-tag">Direction Permission</span>'
          : record.triggerModelLabel
            ? `<span class="history-tag">${escapeHtml(
                record.triggerModel === "B"
                  ? "Model B"
                  : "Model A"
              )}</span>`
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
            ${triggerModelTag}
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
  revokeObjectUrls(
    editingImageUrls
  );

  editingImageUrls = [];
  editingImageBlobs = [];

  $("recordImageGallery").innerHTML =
    "";
  $("recordImageCount").textContent =
    "0 張圖片";
  $("recordImageContainer")
    .classList.add("hidden");
}

function renderRecordImageGallery() {
  revokeObjectUrls(
    editingImageUrls
  );

  editingImageUrls =
    editingImageBlobs.map(
      (blob) =>
        URL.createObjectURL(blob)
    );

  $("recordImageCount").textContent =
    `${editingImageBlobs.length} 張圖片`;

  $("recordImageContainer")
    .classList.toggle(
      "hidden",
      editingImageBlobs.length === 0
    );

  $("recordImageGallery").innerHTML =
    editingImageUrls
      .map(
        (url, index) => `
          <div class="multi-image-item">
            <img
              src="${url}"
              alt="Stored chart screenshot ${index + 1}"
            >
            <div class="multi-image-item-actions">
              <span>圖片 ${index + 1}</span>
              <div class="multi-image-inline-actions">
                <button
                  type="button"
                  class="secondary-button mini-button"
                  data-download-record-image="${index}"
                >下載</button>
                <button
                  type="button"
                  class="danger-button mini-button"
                  data-remove-record-image="${index}"
                >移除</button>
              </div>
            </div>
          </div>
        `
      )
      .join("");
}

async function displayRecordImage(
  recordId
) {
  clearRecordImageDisplay();

  try {
    editingImageBlobs =
      await getImages(recordId);

    renderRecordImageGallery();
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
      ? `${record.asia2BLabel || "OPR／Asia 2B"}｜${
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
    <strong>Direction Permission：</strong>
    ${escapeHtml(
      record.directionPermission || "舊版未記錄"
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
    <strong>P1背景：</strong>
    ${record.p1BackgroundTailwind === "yes" ? "有" : "冇"}
    <br>
    <strong>大局P1反轉例外：</strong>
    ${record.p1ReversalExceptionApplied ? "已啟用" : "冇"}
    <br>
    <strong>原始位置：</strong>
    ${escapeHtml(basePosition)}
    <br>
    <strong>最終P位置：</strong>
    ${escapeHtml(effectivePosition)}
    <br>
    <strong>Q Trigger：</strong>
    Sweep → Reclaim → Weak Retest
    <br>
    <strong>Trigger質素：</strong>
    ${escapeHtml(effectiveTrigger)}
    <br>
    <strong>OPR／亞洲盤2B：</strong>
    ${escapeHtml(twoBText)}
    <br>
    <strong>Entry-time Q：</strong>
    ${escapeHtml(record.entryTimeQ || "未記錄")}
    <br>
    <strong>Post-entry Q：</strong>
    ${escapeHtml(record.postEntryQ || "N/A")}
    <br>
    <strong>Post-entry處理：</strong>
    ${escapeHtml(record.postEntryAction || "N/A")}
    <br>
    <strong>圖片數量：</strong>
    ${escapeHtml(
      Number.isFinite(record.imageCount)
        ? record.imageCount
        : record.hasImage
          ? 1
          : 0
    )}
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
  $("editEntryTimeQ").value =
    record.entryTimeQ ||
    "N/A";
  $("editPostEntryQ").value =
    record.postEntryQ ||
    "N/A";
  $("editPostEntryAction").value =
    record.postEntryAction ||
    "N/A";
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

async function addEditingImageBlobs(blobs) {
  const validBlobs =
    (Array.isArray(blobs)
      ? blobs
      : [blobs]
    ).filter(
      (blob) =>
        blob instanceof Blob
    );

  if (validBlobs.length === 0) {
    showToast(
      "剪貼簿入面搵唔到圖片"
    );
    return;
  }

  const compressed =
    await Promise.all(
      validBlobs.map(
        (blob) =>
          compressImage(blob)
      )
    );

  editingImageBlobs.push(
    ...compressed
  );

  renderRecordImageGallery();

  showToast(
    `已新增 ${compressed.length} 張圖片；儲存修改後會保存，目前共 ${editingImageBlobs.length} 張`
  );
}

async function handleEditingImagePaste(event) {
  event.preventDefault();

  const blobs =
    clipboardImagesFromPasteEvent(
      event
    );

  await addEditingImageBlobs(
    blobs
  );
}

async function pasteEditingImageFromClipboard() {
  try {
    const blobs =
      await readImagesFromSystemClipboard();

    await addEditingImageBlobs(
      blobs
    );
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

function removeEditingImageAt(index) {
  if (
    index < 0 ||
    index >= editingImageBlobs.length
  ) {
    return;
  }

  editingImageBlobs.splice(
    index,
    1
  );

  renderRecordImageGallery();

  showToast(
    "圖片已由編輯清單移除；儲存修改後正式生效"
  );
}

function requestRemoveStoredImage() {
  editingImageBlobs = [];
  renderRecordImageGallery();

  showToast(
    "已移除全部圖片；儲存修改後正式生效"
  );
}

function triggerImageDownload(
  blob,
  filename
) {
  const url =
    URL.createObjectURL(blob);
  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body
    .appendChild(link);
  link.click();
  link.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    1000
  );
}

function downloadEditingImageAt(index) {
  const blob =
    editingImageBlobs[index];

  if (!blob) {
    showToast(
      "搵唔到呢張圖片"
    );
    return;
  }

  const record =
    loadRecords().find(
      (item) =>
        item.id ===
        activeRecordId
    );

  triggerImageDownload(
    blob,
    `${record?.symbol || "Trade"}-${activeRecordId}-image-${index + 1}.jpg`
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
  records[index].entryTimeQ =
    $("editEntryTimeQ").value;
  records[index].postEntryQ =
    $("editPostEntryQ").value;
  records[index].postEntryAction =
    $("editPostEntryAction").value;
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
    if (
      editingImageBlobs.length > 0
    ) {
      await putImages(
        activeRecordId,
        editingImageBlobs
      );
    } else {
      await deleteImages(
        activeRecordId
      );
    }

    records[index].hasImage =
      editingImageBlobs.length > 0;
    records[index].imageCount =
      editingImageBlobs.length;
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
    "確定刪除呢筆紀錄？文字同全部圖片都會刪除。"
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
    await deleteImages(
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

  if (
    editingImageBlobs.length === 0
  ) {
    showToast(
      "呢筆紀錄冇圖片"
    );
    return;
  }

  const record =
    loadRecords().find(
      (item) =>
        item.id ===
        activeRecordId
    );

  editingImageBlobs.forEach(
    (blob, index) => {
      setTimeout(
        () => {
          triggerImageDownload(
            blob,
            `${record?.symbol || "Trade"}-${activeRecordId}-image-${index + 1}.jpg`
          );
        },
        index * 180
      );
    }
  );

  showToast(
    `開始下載 ${editingImageBlobs.length} 張圖片`
  );
}

function csvEscape(value) {
  const string =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return `"${string.replaceAll('"', '""')}"`;
}

function buildCsv(records) {
  const headers = [
    "紀錄ID",
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
    "Direction Permission",
    "交易優先方向",
    "優先部署",
    "次要部署",
    "大局方向關係",
    "大局位置實際重疊",
    "P1背景",
    "大局P1反轉例外",
    "原始位置",
    "最終P位置",
    "P2邊緣",
    "P3可小注測試",
    "Trigger Model",
    "有效Sweep",
    "有效Reclaim",
    "Reclaim質素",
    "Model A Retest質素",
    "Breakout位置有意義",
    "Acceptance",
    "Breakout動能",
    "Breakout Retest質素",
    "Breakout Retest結構承接",
    "交易空間",
    "Trigger加分數",
    "加分前Trigger",
    "至少1項加分直接補強瑕疵",
    "確認冇Double Count",
    "Q2升Q3",
    "Trigger質素",
    "Asia2B類型",
    "Asia2B高質",
    "OPR／Asia2B條件數",
    "沒有頂底雙邊掃",
    "Asia2B結構基礎",
    "大局障礙",
    "市場注碼上限",
    "P × Q Matrix",
    "Legacy位置修正",
    "大局修正",
    "最終注碼",
    "入市結果",
    "Entry-time Q",
    "Post-entry Q",
    "Post-entry處理",
    "TP計劃",
    "獲利R",
    "去到RF",
    "去到TP2",
    "有圖片",
    "圖片數量",
    "方向偏見標籤",
    "情緒加注標籤",
    "Checklist",
    "備註"
  ];

  const rows =
    records.map((record) => [
      record.id || "",
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
      record.directionPermission || "",
      record.preferredDirection || "",
      record.priorityDeployment || "",
      record.secondaryDeployment || "",
      record.backgroundRelation || "",
      record.backgroundDirectOverlap === "yes"
        ? "有"
        : "冇",
      record.p1BackgroundTailwind === "yes"
        ? "有"
        : "冇",
      record.p1ReversalExceptionApplied
        ? "Yes"
        : "No",
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
      record.triggerModelLabel ||
        (
          record.engineVersion === "MasterTradeDecisionMatrix-V3.5"
            ? ""
            : "舊版｜Liquidity Reversal"
        ),
      record.triggerModel === "B"
        ? ""
        : record.validSweep
          ? "Yes"
          : "No",
      record.triggerModel === "B"
        ? ""
        : record.validReclaim
          ? "Yes"
          : "No",
      record.triggerModel === "B"
        ? ""
        : record.reclaimQuality || "",
      record.triggerModel === "B"
        ? ""
        : record.retestQuality || "",
      record.triggerModel === "B"
        ? record.breakoutMeaningful
          ? "Yes"
          : "No"
        : "",
      record.triggerModel === "B"
        ? record.breakoutAcceptance || ""
        : "",
      record.triggerModel === "B"
        ? record.breakoutMomentum || ""
        : "",
      record.triggerModel === "B"
        ? record.breakoutRetestQuality || ""
        : "",
      record.triggerModel === "B"
        ? record.breakoutRetestSupport || ""
        : "",
      record.tradeSpace || "",
      record.bonusCount ?? "",
      record.baseTrigger ||
        record.trigger ||
        "",
      record.bonusDirectRepair
        ? "Yes"
        : "No",
      record.bonusNoDoubleCount
        ? "Yes"
        : "No",
      record.triggerBonusUpgraded
        ? "Yes"
        : "No",
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
      record.asia2BNoDoubleSweep
        ? "Yes"
        : "No",
      record.asia2BStructureOverlap
        ? "Yes"
        : "No",
      obstacleDisplayLabel(
        record.obstacleState ||
        "far"
      ),
      record.marketCap ?? "",
      record.rawMatrixSize ??
        record.matrixSize ??
        "",
      record.positionQualitySize ??
        record.matrixSize ??
        "",
      record.obstacleSize ??
        record.finalSize ??
        "",
      record.finalSize ?? "",
      record.entryStatus || "",
      record.entryTimeQ || "",
      record.postEntryQ || "",
      record.postEntryAction || "",
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
      Number.isFinite(record.imageCount)
        ? record.imageCount
        : record.hasImage
          ? 1
          : 0,
      record.loosenedTriggerBecauseBias
        ? "Yes"
        : "No",
      record.emotionalSizing
        ? "Yes"
        : "No",
      record.checklistSummary || "",
      record.note || ""
    ]);


  return [headers, ...rows]
    .map(
      (row) =>
        row
          .map(csvEscape)
          .join(",")
    )
    .join("\n");
}

function downloadBlob(blob, filename) {
  const url =
    URL.createObjectURL(blob);
  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body
    .appendChild(link);
  link.click();
  link.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    1000
  );
}

function exportCsv() {
  const records = loadRecords();

  if (records.length === 0) {
    showToast(
      "未有紀錄可以匯出"
    );
    return;
  }

  const csv =
    buildCsv(records);

  const blob =
    new Blob(
      ["\uFEFF", csv],
      {
        type:
          "text/csv;charset=utf-8"
      }
    );

  downloadBlob(
    blob,
    `MasterTrade-V3_2-Journal-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
  );

  showToast(
    "CSV已匯出"
  );
}

const ZIP_CRC_TABLE = (() => {
  const table =
    new Uint32Array(256);

  for (
    let number = 0;
    number < 256;
    number += 1
  ) {
    let value = number;

    for (
      let bit = 0;
      bit < 8;
      bit += 1
    ) {
      value =
        value & 1
          ? 0xEDB88320 ^
            (value >>> 1)
          : value >>> 1;
    }

    table[number] =
      value >>> 0;
  }

  return table;
})();

function crc32(bytes) {
  let crc = 0xFFFFFFFF;

  for (const byte of bytes) {
    crc =
      ZIP_CRC_TABLE[
        (crc ^ byte) & 0xFF
      ] ^
      (crc >>> 8);
  }

  return (
    crc ^ 0xFFFFFFFF
  ) >>> 0;
}

function concatUint8Arrays(parts) {
  const totalLength =
    parts.reduce(
      (sum, part) =>
        sum + part.length,
      0
    );

  const result =
    new Uint8Array(
      totalLength
    );

  let offset = 0;

  for (const part of parts) {
    result.set(
      part,
      offset
    );
    offset += part.length;
  }

  return result;
}

function dosDateTime(date = new Date()) {
  const year =
    Math.max(
      1980,
      date.getFullYear()
    );

  const dosDate =
    ((year - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(
      date.getSeconds() / 2
    );

  return {
    dosDate,
    dosTime
  };
}

async function toUint8Array(value) {
  if (
    value instanceof Uint8Array
  ) {
    return value;
  }

  if (
    value instanceof ArrayBuffer
  ) {
    return new Uint8Array(
      value
    );
  }

  if (value instanceof Blob) {
    return new Uint8Array(
      await value.arrayBuffer()
    );
  }

  return new TextEncoder()
    .encode(
      String(value ?? "")
    );
}

async function buildStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  let centralSize = 0;

  for (const entry of entries) {
    const nameBytes =
      new TextEncoder()
        .encode(entry.name);

    const data =
      await toUint8Array(
        entry.data
      );

    const crc =
      crc32(data);

    const {
      dosDate,
      dosTime
    } = dosDateTime(
      entry.date ||
      new Date()
    );

    const localHeader =
      new Uint8Array(
        30 + nameBytes.length
      );

    const localView =
      new DataView(
        localHeader.buffer
      );

    localView.setUint32(
      0,
      0x04034B50,
      true
    );
    localView.setUint16(
      4,
      20,
      true
    );
    localView.setUint16(
      6,
      0x0800,
      true
    );
    localView.setUint16(
      8,
      0,
      true
    );
    localView.setUint16(
      10,
      dosTime,
      true
    );
    localView.setUint16(
      12,
      dosDate,
      true
    );
    localView.setUint32(
      14,
      crc,
      true
    );
    localView.setUint32(
      18,
      data.length,
      true
    );
    localView.setUint32(
      22,
      data.length,
      true
    );
    localView.setUint16(
      26,
      nameBytes.length,
      true
    );
    localView.setUint16(
      28,
      0,
      true
    );
    localHeader.set(
      nameBytes,
      30
    );

    localParts.push(
      localHeader,
      data
    );

    const centralHeader =
      new Uint8Array(
        46 + nameBytes.length
      );

    const centralView =
      new DataView(
        centralHeader.buffer
      );

    centralView.setUint32(
      0,
      0x02014B50,
      true
    );
    centralView.setUint16(
      4,
      20,
      true
    );
    centralView.setUint16(
      6,
      20,
      true
    );
    centralView.setUint16(
      8,
      0x0800,
      true
    );
    centralView.setUint16(
      10,
      0,
      true
    );
    centralView.setUint16(
      12,
      dosTime,
      true
    );
    centralView.setUint16(
      14,
      dosDate,
      true
    );
    centralView.setUint32(
      16,
      crc,
      true
    );
    centralView.setUint32(
      20,
      data.length,
      true
    );
    centralView.setUint32(
      24,
      data.length,
      true
    );
    centralView.setUint16(
      28,
      nameBytes.length,
      true
    );
    centralView.setUint16(
      30,
      0,
      true
    );
    centralView.setUint16(
      32,
      0,
      true
    );
    centralView.setUint16(
      34,
      0,
      true
    );
    centralView.setUint16(
      36,
      0,
      true
    );
    centralView.setUint32(
      38,
      0,
      true
    );
    centralView.setUint32(
      42,
      localOffset,
      true
    );
    centralHeader.set(
      nameBytes,
      46
    );

    centralParts.push(
      centralHeader
    );

    localOffset +=
      localHeader.length +
      data.length;

    centralSize +=
      centralHeader.length;
  }

  const endRecord =
    new Uint8Array(22);
  const endView =
    new DataView(
      endRecord.buffer
    );

  endView.setUint32(
    0,
    0x06054B50,
    true
  );
  endView.setUint16(
    4,
    0,
    true
  );
  endView.setUint16(
    6,
    0,
    true
  );
  endView.setUint16(
    8,
    entries.length,
    true
  );
  endView.setUint16(
    10,
    entries.length,
    true
  );
  endView.setUint32(
    12,
    centralSize,
    true
  );
  endView.setUint32(
    16,
    localOffset,
    true
  );
  endView.setUint16(
    20,
    0,
    true
  );

  return new Blob(
    [
      concatUint8Arrays(
        localParts
      ),
      concatUint8Arrays(
        centralParts
      ),
      endRecord
    ],
    {
      type:
        "application/zip"
    }
  );
}

function safeZipSegment(value) {
  const cleaned =
    String(value ?? "")
      .trim()
      .replace(
        /[\\/:*?"<>|\x00-\x1F]/g,
        "_"
      )
      .replace(
        /\s+/g,
        "_"
      );

  return (
    cleaned ||
    "unknown"
  ).slice(
    0,
    80
  );
}

function imageExtension(blob) {
  if (
    blob.type ===
    "image/png"
  ) {
    return "png";
  }

  if (
    blob.type ===
    "image/webp"
  ) {
    return "webp";
  }

  return "jpg";
}

async function exportBackupZip() {
  const records = loadRecords();

  if (records.length === 0) {
    showToast(
      "未有紀錄可以匯出"
    );
    return;
  }

  $("exportBackupZip").disabled =
    true;
  $("exportBackupZip").textContent =
    "整理緊…";

  try {
    showToast(
      "正在整理CSV同照片…"
    );

    const csv =
      buildCsv(records);

    const entries = [
      {
        name:
          "trades.csv",
        data:
          `\uFEFF${csv}`
      },
      {
        name:
          "records.json",
        data:
          JSON.stringify(
            records,
            null,
            2
          )
      }
    ];

    let totalImages = 0;

    for (
      const record of records
    ) {
      const images =
        await getImages(
          record.id
        );

      if (
        images.length === 0
      ) {
        continue;
      }

      const folder =
        [
          safeZipSegment(
            recordTradeDate(record)
          ),
          safeZipSegment(
            record.symbol
          ),
          safeZipSegment(
            record.id
          )
        ].join("_");

      images.forEach(
        (blob, index) => {
          totalImages += 1;

          entries.push({
            name:
              `images/${folder}/image-${index + 1}.${imageExtension(blob)}`,
            data:
              blob
          });
        }
      );
    }

    const backupInfo = [
      "Master Trade Practice & Live Journal Backup",
      "",
      `Exported: ${new Date().toISOString()}`,
      `Records: ${records.length}`,
      `Images: ${totalImages}`,
      "",
      "records.json contains the exact journal records for full restore.",
      "trades.csv contains a spreadsheet-friendly copy of the journal records.",
      "images/ contains chart screenshots grouped by trade date, symbol and record ID."
    ].join("\n");

    entries.push({
      name:
        "backup-info.txt",
      data:
        backupInfo
    });

    const zipBlob =
      await buildStoredZip(
        entries
      );

    downloadBlob(
      zipBlob,
      `MasterTrade-V3_2-Backup-${new Date()
        .toISOString()
        .slice(0, 10)}.zip`
    );

    showToast(
      `已匯出ZIP：${records.length}筆紀錄＋${totalImages}張圖片`
    );
  } catch (error) {
    console.error(
      "Backup ZIP export failed:",
      error
    );

    showToast(
      "ZIP匯出失敗，請再試一次"
    );
  } finally {
    $("exportBackupZip").disabled =
      false;
    $("exportBackupZip").textContent =
      "匯出CSV＋照片 ZIP";
  }
}


function generateImportedRecordId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `import-${Date.now()}-${Math.random()}`;
}

function stableImportedRecordId(
  record
) {
  const source = [
    record.tradeDate || "",
    record.createdAt || "",
    record.recordMode || "",
    record.symbol || "",
    record.direction || "",
    record.basePosition || "",
    record.position || "",
    record.entryStatus || "",
    Number.isFinite(
      record.profitR
    )
      ? record.profitR
      : "",
    record.checklistSummary || "",
    record.note || ""
  ].join("|");

  if (
    source.replaceAll(
      "|",
      ""
    ) === ""
  ) {
    return generateImportedRecordId();
  }

  let hash =
    2166136261;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    hash ^=
      source.charCodeAt(
        index
      );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return `legacy-${(
    hash >>> 0
  ).toString(16)}`;
}

function parseCsvText(text) {
  const source =
    String(text || "")
      .replace(/^\uFEFF/, "");

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (
    let index = 0;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (inQuotes) {
      if (char === '"') {
        if (
          source[index + 1] === '"'
        ) {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (
      char === "\n"
    ) {
      row.push(
        field.replace(/\r$/, "")
      );
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (
    field.length > 0 ||
    row.length > 0
  ) {
    row.push(
      field.replace(/\r$/, "")
    );
    rows.push(row);
  }

  return rows.filter(
    (item) =>
      item.some(
        (value) =>
          String(value).trim() !== ""
      )
  );
}

function csvRowsToObjects(text) {
  const rows =
    parseCsvText(text);

  if (rows.length < 2) {
    return [];
  }

  const headers =
    rows[0].map(
      (header) =>
        String(header).trim()
    );

  return rows
    .slice(1)
    .map((row) => {
      const item = {};

      headers.forEach(
        (header, index) => {
          item[header] =
            row[index] ?? "";
        }
      );

      return item;
    });
}

function firstCsvValue(
  row,
  ...keys
) {
  for (const key of keys) {
    const value =
      row[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

function csvBoolean(value) {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  return [
    "yes",
    "true",
    "1",
    "有"
  ].includes(normalized);
}

function csvNumber(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function obstacleStateFromCsv(value) {
  const text =
    String(value || "");

  if (
    text.includes("不足") ||
    text === "insufficient"
  ) {
    return "insufficient";
  }

  if (
    text.includes("接近") ||
    text === "near"
  ) {
    return "near";
  }

  if (
    text.includes("障礙區內") ||
    text === "inside"
  ) {
    return "inside";
  }

  return "far";
}

function triggerModelFromCsv(value) {
  const text =
    String(value || "");

  return (
    text.includes("Model B") ||
    text.includes("Breakout")
  )
    ? "B"
    : "A";
}

function recordFromCsvRow(row) {
  const triggerModelLabel =
    firstCsvValue(
      row,
      "Trigger Model"
    );

  const triggerModel =
    triggerModelFromCsv(
      triggerModelLabel
    );

  const profitR =
    csvNumber(
      firstCsvValue(
        row,
        "獲利R"
      )
    );

  return {
    id:
      String(
        firstCsvValue(
          row,
          "紀錄ID"
        ) || ""
      ).trim(),
    tradeDate:
      firstCsvValue(
        row,
        "交易日期"
      ),
    createdAt:
      firstCsvValue(
        row,
        "建立時間"
      ) ||
      new Date().toISOString(),
    appVersion:
      firstCsvValue(
        row,
        "App版本"
      ) ||
      "Imported-CSV",
    engineVersion:
      firstCsvValue(
        row,
        "Matrix版本"
      ) ||
      "MasterTradeDecisionMatrix-V3.2-DirectionPermission",
    recordMode:
      firstCsvValue(
        row,
        "類型"
      ) ||
      "Practice",
    symbol:
      firstCsvValue(
        row,
        "品種"
      ),
    backgroundTimeframe:
      firstCsvValue(
        row,
        "大局背景TF"
      ),
    backgroundState:
      firstCsvValue(
        row,
        "大局背景狀態"
      ),
    mainTimeframe:
      firstCsvValue(
        row,
        "主判TF"
      ),
    mainState:
      firstCsvValue(
        row,
        "主判狀態"
      ),
    secondaryTimeframe:
      firstCsvValue(
        row,
        "次判TF"
      ),
    secondaryState:
      firstCsvValue(
        row,
        "次判狀態"
      ),
    entryTimeframe:
      firstCsvValue(
        row,
        "入場觸發TF"
      ),
    direction:
      firstCsvValue(
        row,
        "交易方向"
      ),
    relation:
      firstCsvValue(
        row,
        "主次關係"
      ),
    directionPermission:
      firstCsvValue(
        row,
        "Direction Permission"
      ),
    preferredDirection:
      firstCsvValue(
        row,
        "交易優先方向"
      ),
    priorityDeployment:
      firstCsvValue(
        row,
        "優先部署"
      ),
    secondaryDeployment:
      firstCsvValue(
        row,
        "次要部署"
      ),
    backgroundRelation:
      firstCsvValue(
        row,
        "大局方向關係"
      ),
    backgroundDirectOverlap:
      csvBoolean(
        firstCsvValue(
          row,
          "大局位置實際重疊"
        )
      )
        ? "yes"
        : "no",
    p1BackgroundTailwind:
      csvBoolean(
        firstCsvValue(
          row,
          "P1背景"
        )
      )
        ? "yes"
        : "no",
    p1ReversalExceptionApplied:
      csvBoolean(
        firstCsvValue(
          row,
          "大局P1反轉例外"
        )
      ),
    basePosition:
      firstCsvValue(
        row,
        "原始位置"
      ),
    position:
      firstCsvValue(
        row,
        "最終P位置",
        "2B後位置"
      ),
    p2EdgePosition:
      csvBoolean(
        firstCsvValue(
          row,
          "P2邊緣"
        )
      ),
    p3Testable:
      csvBoolean(
        firstCsvValue(
          row,
          "P3可小注測試"
        )
      ),
    triggerModel,
    triggerModelLabel:
      triggerModelLabel ||
      (
        triggerModel === "B"
          ? "Model B｜Breakout／Retest Continuation"
          : "Model A｜Liquidity Reversal"
      ),
    validSweep:
      csvBoolean(
        firstCsvValue(
          row,
          "有效Sweep"
        )
      ),
    validReclaim:
      csvBoolean(
        firstCsvValue(
          row,
          "有效Reclaim"
        )
      ),
    reclaimQuality:
      firstCsvValue(
        row,
        "Reclaim質素"
      ),
    retestQuality:
      firstCsvValue(
        row,
        "Model A Retest質素"
      ),
    breakoutMeaningful:
      csvBoolean(
        firstCsvValue(
          row,
          "Breakout位置有意義"
        )
      ),
    breakoutAcceptance:
      firstCsvValue(
        row,
        "Acceptance"
      ),
    breakoutMomentum:
      firstCsvValue(
        row,
        "Breakout動能"
      ),
    breakoutRetestQuality:
      firstCsvValue(
        row,
        "Breakout Retest質素"
      ),
    breakoutRetestSupport:
      firstCsvValue(
        row,
        "Breakout Retest結構承接"
      ),
    tradeSpace:
      firstCsvValue(
        row,
        "交易空間"
      ),
    bonusCount:
      csvNumber(
        firstCsvValue(
          row,
          "Trigger加分數"
        )
      ) ?? 0,
    baseTrigger:
      firstCsvValue(
        row,
        "加分前Trigger",
        "基礎Trigger"
      ),
    bonusDirectRepair:
      csvBoolean(
        firstCsvValue(
          row,
          "至少1項加分直接補強瑕疵"
        )
      ),
    bonusNoDoubleCount:
      csvBoolean(
        firstCsvValue(
          row,
          "確認冇Double Count"
        )
      ),
    triggerBonusUpgraded:
      csvBoolean(
        firstCsvValue(
          row,
          "Q2升Q3"
        )
      ),
    trigger:
      firstCsvValue(
        row,
        "Trigger質素",
        "2B後Trigger"
      ),
    asia2BLabel:
      firstCsvValue(
        row,
        "Asia2B類型"
      ) ||
      "無",
    asia2BHighQuality:
      csvBoolean(
        firstCsvValue(
          row,
          "Asia2B高質"
        )
      ),
    asia2BCriteriaCount:
      csvNumber(
        firstCsvValue(
          row,
          "OPR／Asia2B條件數",
          "Asia2B條件數"
        )
      ) ?? 0,
    asia2BNoDoubleSweep:
      csvBoolean(
        firstCsvValue(
          row,
          "沒有頂底雙邊掃"
        )
      ),
    asia2BStructureOverlap:
      csvBoolean(
        firstCsvValue(
          row,
          "Asia2B結構基礎"
        )
      ),
    obstacleState:
      obstacleStateFromCsv(
        firstCsvValue(
          row,
          "大局障礙"
        )
      ),
    marketCap:
      csvNumber(
        firstCsvValue(
          row,
          "市場注碼上限"
        )
      ) ?? 0,
    rawMatrixSize:
      csvNumber(
        firstCsvValue(
          row,
          "P × Q Matrix",
          "Trigger矩陣許可"
        )
      ) ?? 0,
    matrixSize:
      csvNumber(
        firstCsvValue(
          row,
          "P × Q Matrix",
          "Trigger矩陣許可"
        )
      ) ?? 0,
    positionQualitySize:
      csvNumber(
        firstCsvValue(
          row,
          "Legacy位置修正",
          "位置質素修正"
        )
      ) ?? 0,
    obstacleSize:
      csvNumber(
        firstCsvValue(
          row,
          "大局修正"
        )
      ) ?? 0,
    finalSize:
      csvNumber(
        firstCsvValue(
          row,
          "最終注碼"
        )
      ) ?? 0,
    entryStatus:
      firstCsvValue(
        row,
        "入市結果"
      ) ||
      "Skip",
    entryTimeQ:
      firstCsvValue(
        row,
        "Entry-time Q"
      ) ||
      "",
    postEntryQ:
      firstCsvValue(
        row,
        "Post-entry Q"
      ) ||
      "N/A",
    postEntryAction:
      firstCsvValue(
        row,
        "Post-entry處理"
      ) ||
      "N/A",
    tpPlan:
      firstCsvValue(
        row,
        "TP計劃"
      ),
    profitR,
    reachedRF:
      firstCsvValue(
        row,
        "去到RF"
      ) ||
      "N/A",
    reachedTP2:
      firstCsvValue(
        row,
        "去到TP2"
      ) ||
      "N/A",
    hasImage: false,
    imageCount: 0,
    loosenedTriggerBecauseBias:
      csvBoolean(
        firstCsvValue(
          row,
          "方向偏見標籤"
        )
      ),
    emotionalSizing:
      csvBoolean(
        firstCsvValue(
          row,
          "情緒加注標籤"
        )
      ),
    checklistSummary:
      firstCsvValue(
        row,
        "Checklist"
      ),
    note:
      firstCsvValue(
        row,
        "備註"
      )
  };
}

function mimeTypeForImageName(name) {
  const lower =
    String(name || "")
      .toLowerCase();

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

async function readStoredZipEntries(file) {
  const bytes =
    new Uint8Array(
      await file.arrayBuffer()
    );

  const view =
    new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength
    );

  const entries =
    new Map();

  let offset = 0;

  while (
    offset + 4 <=
    bytes.length
  ) {
    const signature =
      view.getUint32(
        offset,
        true
      );

    if (
      signature ===
        0x02014B50 ||
      signature ===
        0x06054B50
    ) {
      break;
    }

    if (
      signature !==
      0x04034B50
    ) {
      throw new Error(
        "Invalid ZIP structure"
      );
    }

    if (
      offset + 30 >
      bytes.length
    ) {
      throw new Error(
        "Incomplete ZIP header"
      );
    }

    const flags =
      view.getUint16(
        offset + 6,
        true
      );
    const method =
      view.getUint16(
        offset + 8,
        true
      );
    const compressedSize =
      view.getUint32(
        offset + 18,
        true
      );
    const nameLength =
      view.getUint16(
        offset + 26,
        true
      );
    const extraLength =
      view.getUint16(
        offset + 28,
        true
      );

    if (
      flags & 0x0008
    ) {
      throw new Error(
        "ZIP data descriptor is not supported"
      );
    }

    if (method !== 0) {
      throw new Error(
        "只支援由Master Trade App匯出嘅備份ZIP"
      );
    }

    const nameStart =
      offset + 30;
    const dataStart =
      nameStart +
      nameLength +
      extraLength;
    const dataEnd =
      dataStart +
      compressedSize;

    if (
      dataEnd >
      bytes.length
    ) {
      throw new Error(
        "Incomplete ZIP data"
      );
    }

    const name =
      new TextDecoder(
        flags & 0x0800
          ? "utf-8"
          : "utf-8"
      ).decode(
        bytes.slice(
          nameStart,
          nameStart +
            nameLength
        )
      );

    entries.set(
      name,
      bytes.slice(
        dataStart,
        dataEnd
      )
    );

    offset =
      dataEnd;
  }

  return entries;
}

function decodeZipText(
  entries,
  name
) {
  const data =
    entries.get(name);

  if (!data) {
    return null;
  }

  return new TextDecoder(
    "utf-8"
  ).decode(data)
    .replace(/^\uFEFF/, "");
}

function assignLegacyZipRecordIds(
  records,
  entryNames
) {
  const folders =
    [
      ...new Set(
        entryNames
          .filter(
            (name) =>
              name.startsWith(
                "images/"
              )
          )
          .map(
            (name) =>
              name.split("/")[1]
          )
          .filter(Boolean)
      )
    ];

  const used =
    new Set();

  records.forEach((record) => {
    if (record.id) return;

    const prefix =
      `${safeZipSegment(
        recordTradeDate(record)
      )}_${safeZipSegment(
        record.symbol
      )}_`;

    const folder =
      folders.find(
        (item) =>
          !used.has(item) &&
          item.startsWith(
            prefix
          )
      );

    if (!folder) {
      return;
    }

    used.add(folder);
    record.id =
      folder.slice(
        prefix.length
      );
  });
}

function buildZipImagesByRecord(
  records,
  entries
) {
  const result =
    new Map();

  for (
    const [
      name,
      data
    ] of entries
  ) {
    if (
      !name.startsWith(
        "images/"
      )
    ) {
      continue;
    }

    const parts =
      name.split("/");

    if (
      parts.length < 3
    ) {
      continue;
    }

    const folder =
      parts[1];

    const record =
      records.find(
        (item) =>
          item.id &&
          folder.endsWith(
            `_${safeZipSegment(
              item.id
            )}`
          )
      );

    if (!record) {
      continue;
    }

    if (
      !result.has(record.id)
    ) {
      result.set(
        record.id,
        []
      );
    }

    result
      .get(record.id)
      .push(
        new Blob(
          [data],
          {
            type:
              mimeTypeForImageName(
                name
              )
          }
        )
      );
  }

  return result;
}

async function mergeImportedRecords(
  importedRecords,
  imagesByRecord =
    new Map()
) {
  const existing =
    loadRecords();

  const existingIds =
    new Set(
      existing
        .map(
          (record) =>
            record.id
        )
        .filter(Boolean)
    );

  const accepted = [];
  let skipped = 0;
  let imageCount = 0;

  for (
    const sourceRecord of
      importedRecords
  ) {
    const record = {
      ...sourceRecord
    };

    if (!record.id) {
      record.id =
        stableImportedRecordId(
          record
        );
    }

    if (
      existingIds.has(
        record.id
      )
    ) {
      skipped += 1;
      continue;
    }

    existingIds.add(
      record.id
    );

    const images =
      imagesByRecord.get(
        record.id
      ) || [];

    if (
      images.length > 0
    ) {
      await putImages(
        record.id,
        images
      );

      record.hasImage = true;
      record.imageCount =
        images.length;
      imageCount +=
        images.length;
    } else {
      record.hasImage = false;
      record.imageCount = 0;
    }

    accepted.push(record);
  }

  if (
    accepted.length > 0
  ) {
    saveRecords([
      ...existing,
      ...accepted
    ]);
  }

  renderHistory();

  return {
    imported:
      accepted.length,
    skipped,
    images:
      imageCount
  };
}

async function importCsvFile(file) {
  const text =
    await file.text();

  const objects =
    csvRowsToObjects(text);

  const records =
    objects.map(
      recordFromCsvRow
    );

  if (
    records.length === 0
  ) {
    throw new Error(
      "CSV入面搵唔到可匯入紀錄"
    );
  }

  const result =
    await mergeImportedRecords(
      records
    );

  return result;
}

async function importBackupZipFile(
  file
) {
  const entries =
    await readStoredZipEntries(
      file
    );

  let records = [];

  const recordsJson =
    decodeZipText(
      entries,
      "records.json"
    );

  if (recordsJson) {
    const parsed =
      JSON.parse(
        recordsJson
      );

    if (
      !Array.isArray(parsed)
    ) {
      throw new Error(
        "records.json格式錯誤"
      );
    }

    records =
      parsed.map(
        (record) => ({
          ...record
        })
      );
  } else {
    const csv =
      decodeZipText(
        entries,
        "trades.csv"
      );

    if (!csv) {
      throw new Error(
        "ZIP入面搵唔到records.json或trades.csv"
      );
    }

    records =
      csvRowsToObjects(csv)
        .map(
          recordFromCsvRow
        );

    assignLegacyZipRecordIds(
      records,
      [...entries.keys()]
    );
  }

  if (
    records.length === 0
  ) {
    throw new Error(
      "備份ZIP入面冇紀錄"
    );
  }

  const imagesByRecord =
    buildZipImagesByRecord(
      records,
      entries
    );

  return mergeImportedRecords(
    records,
    imagesByRecord
  );
}

async function handleCsvImportFile(
  event
) {
  const file =
    event.target.files?.[0];

  event.target.value = "";

  if (!file) return;

  $("importCsvButton").disabled =
    true;
  $("importCsvButton").textContent =
    "匯入緊…";

  try {
    const result =
      await importCsvFile(file);

    showToast(
      `CSV匯入完成：新增${result.imported}筆，跳過${result.skipped}筆重複紀錄`
    );
  } catch (error) {
    console.error(
      "CSV import failed:",
      error
    );

    showToast(
      `CSV匯入失敗：${error.message || "格式不支援"}`
    );
  } finally {
    $("importCsvButton").disabled =
      false;
    $("importCsvButton").textContent =
      "匯入CSV";
  }
}

async function handleBackupZipImportFile(
  event
) {
  const file =
    event.target.files?.[0];

  event.target.value = "";

  if (!file) return;

  $("importBackupZipButton").disabled =
    true;
  $("importBackupZipButton").textContent =
    "匯入緊…";

  try {
    const result =
      await importBackupZipFile(
        file
      );

    showToast(
      `ZIP還原完成：新增${result.imported}筆＋${result.images}張圖片，跳過${result.skipped}筆重複紀錄`
    );
  } catch (error) {
    console.error(
      "Backup ZIP import failed:",
      error
    );

    showToast(
      `ZIP匯入失敗：${error.message || "格式不支援"}`
    );
  } finally {
    $("importBackupZipButton").disabled =
      false;
    $("importBackupZipButton").textContent =
      "匯入備份ZIP";
  }
}

function setQuickNavOpen(open) {
  $("rulebookQuickNav")
    .classList.toggle(
      "open",
      open
    );

  $("quickNavToggle")
    .setAttribute(
      "aria-expanded",
      open
        ? "true"
        : "false"
    );
}

function scrollToRulebookSection(
  targetId
) {
  const target =
    document.getElementById(
      targetId
    );

  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  setQuickNavOpen(false);
}



function livePermissionLabel(value) {
  const labels = {
    normal:
      "正常方向權限｜Max 1注",
    limited:
      "限制方向權限｜Max 0.5注",
    none:
      "無方向權限｜正常0注"
  };

  return labels[value] || value;
}

function livePermissionCap(value) {
  if (value === "normal") {
    return 1;
  }

  if (value === "limited") {
    return 0.5;
  }

  return 0;
}

function liveMatrixCell(
  permission,
  position,
  quality
) {
  return matrixCell(
    permission,
    position,
    quality
  );
}

function recalculateLiveDecision() {
  const permission =
    $("livePermission").value;

  const permissionCap =
    livePermissionCap(
      permission
    );

  const basePosition =
    $("livePosition").value;

  const highQuality2B =
    checked(
      "liveHighQuality2B"
    );

  const structureBase =
    checked(
      "live2BStructureBase"
    );

  let effectivePosition =
    basePosition;

  if (
    basePosition === "P3" &&
    highQuality2B &&
    structureBase
  ) {
    effectivePosition =
      "P2";
  }

  let effectiveQuality =
    $("liveTriggerQuality").value;

  if (
    highQuality2B &&
    effectiveQuality === "Q2"
  ) {
    effectiveQuality =
      "Q3";
  }

  $("liveP1ExceptionPanel")
    .classList.toggle(
      "hidden",
      permission !== "none"
    );

  if (
    permission !== "none"
  ) {
    $("liveBigPictureP1Exception")
      .checked = false;
  }

  const exceptionApplied =
    permission === "none" &&
    effectivePosition === "P1" &&
    effectiveQuality === "Q3" &&
    checked(
      "liveBigPictureP1Exception"
    );

  const effectivePermissionCap =
    exceptionApplied
      ? 0.25
      : permissionCap;

  const matrixSize =
    exceptionApplied
      ? 0.25
      : Math.min(
          effectivePermissionCap,
          liveMatrixCell(
            permission,
            effectivePosition,
            effectiveQuality
          )
        );

  const obstacle =
    $("liveObstacle").value;

  let obstacleSize =
    matrixSize;

  if (obstacle === "near") {
    obstacleSize =
      downgradeOneLevel(
        matrixSize
      );
  } else if (
    obstacle === "inside"
  ) {
    obstacleSize =
      Math.min(
        matrixSize,
        insideObstacleCap(
          effectivePosition,
          effectiveQuality
        )
      );
  } else if (
    obstacle === "insufficient"
  ) {
    obstacleSize = 0;
  }

  const vetoes = [];

  if (
    effectivePosition === "P4"
  ) {
    vetoes.push(
      "P4＝0注。"
    );
  }

  if (
    effectiveQuality === "Q1"
  ) {
    vetoes.push(
      "Q1＝Trigger失效。"
    );
  }

  if (
    obstacle === "insufficient"
  ) {
    vetoes.push(
      "第一真實Target前R:R不足。"
    );
  }

  if (
    checked("liveChase")
  ) {
    vetoes.push(
      "實際入場屬Chase。"
    );
  }

  if (
    checked(
      "liveTimeRiskViolation"
    )
  ) {
    vetoes.push(
      "違反交易時間或單日／總風險限制。"
    );
  }

  const finalSize =
    vetoes.length > 0
      ? 0
      : obstacleSize;

  $("liveMarketCap").textContent =
    SIZE_LABELS[
      effectivePermissionCap
    ];

  $("liveRelationNote").textContent =
    permission === "none"
      ? "Direction Permission Gate＝0。正常P1／P2＋Q3都係0；只有真正大局P1＋Q3右側反轉確認，先可啟用0.25注例外。"
      : permission === "limited"
        ? "限制方向權限：市場最高0.5注，再由P × Q決定實際注碼。"
        : "正常方向權限：最高1注，但真正1注仍要求P1／P2＋Q3，而且冇大局障礙。";

  $("liveEffectivePosition").textContent =
    effectivePosition;
  $("liveEffectiveQ").textContent =
    effectiveQuality;
  $("liveResultCap").textContent =
    SIZE_LABELS[
      effectivePermissionCap
    ];
  $("liveMatrixSize").textContent =
    SIZE_LABELS[matrixSize];
  $("liveObstacleSize").textContent =
    SIZE_LABELS[obstacleSize];
  $("liveFinalSize").textContent =
    SIZE_LABELS[finalSize];

  const notes = [
    `Direction Permission：${livePermissionLabel(permission)}。`,
    basePosition !==
      effectivePosition
      ? `位置：P3＋高質Asia／OPR 2B＋原有結構 → P2。`
      : `位置：${effectivePosition}。`,
    highQuality2B &&
      $("liveTriggerQuality").value === "Q2"
      ? "Trigger：高質Asia／OPR 2B將Q2升至Q3；2B唔會創造方向權限。"
      : `Trigger：${effectiveQuality}。`,
    exceptionApplied
      ? "大局P1反轉例外已啟用：原本0權限，因真正大局P1＋Q3右側確認，開0.25注試單權限。"
      : permission === "none"
        ? "無方向權限而且未符合大局P1反轉例外：正常0注。"
        : "Direction Permission Gate已通過。",
    obstacle === "near"
      ? "大局障礙接近但仍有空間：注碼降一級。"
      : obstacle === "inside"
        ? "已處於大局障礙區內仍順原方向延伸：P1 Q3最多0.5、P2 Q3最多0.25，其餘0。"
        : obstacle === "insufficient"
          ? "大局障礙前空間不足：0注。"
          : "大局障礙仍遠：按原Matrix。"
  ];

  if (
    basePosition === "P3" &&
    highQuality2B &&
    !structureBase
  ) {
    notes.push(
      "高質2B冇原有結構基礎，所以唔可以P3 → P2。"
    );
  }

  if (
    vetoes.length > 0
  ) {
    notes.push(
      `Hard Veto：${vetoes.join("；")}`
    );
  }

  $("liveDecisionExplanation")
    .innerHTML =
      `<ul>${notes
        .map(
          (note) =>
            `<li>${escapeHtml(note)}</li>`
        )
        .join("")}</ul>`;
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

          if (
            button.dataset.tab !==
            "rulebook"
          ) {
            setQuickNavOpen(false);
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
  $("liveDecisionForm")
    .addEventListener(
      "input",
      recalculateLiveDecision
    );

  $("liveDecisionForm")
    .addEventListener(
      "change",
      recalculateLiveDecision
    );

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

  $("imagePreviewGallery")
    .addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            "[data-remove-pending-image]"
          );

        if (!button) return;

        removePendingImageAt(
          Number(
            button.dataset
              .removePendingImage
          )
        );
      }
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

  $("exportBackupZip")
    .addEventListener(
      "click",
      exportBackupZip
    );

  $("importCsvButton")
    .addEventListener(
      "click",
      () =>
        $("importCsvFile")
          .click()
    );

  $("importBackupZipButton")
    .addEventListener(
      "click",
      () =>
        $("importBackupZipFile")
          .click()
    );

  $("importCsvFile")
    .addEventListener(
      "change",
      handleCsvImportFile
    );

  $("importBackupZipFile")
    .addEventListener(
      "change",
      handleBackupZipImportFile
    );

  $("quickNavToggle")
    .addEventListener(
      "click",
      () => {
        const isOpen =
          $("rulebookQuickNav")
            .classList
            .contains("open");

        setQuickNavOpen(
          !isOpen
        );
      }
    );

  $("quickNavClose")
    .addEventListener(
      "click",
      () =>
        setQuickNavOpen(false)
    );

  $("rulebookQuickNav")
    .addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            "[data-scroll-target]"
          );

        if (!button) return;

        scrollToRulebookSection(
          button.dataset
            .scrollTarget
        );
      }
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

  $("recordImageGallery")
    .addEventListener(
      "click",
      (event) => {
        const removeButton =
          event.target.closest(
            "[data-remove-record-image]"
          );

        if (removeButton) {
          removeEditingImageAt(
            Number(
              removeButton.dataset
                .removeRecordImage
            )
          );
          return;
        }

        const downloadButton =
          event.target.closest(
            "[data-download-record-image]"
          );

        if (downloadButton) {
          downloadEditingImageAt(
            Number(
              downloadButton.dataset
                .downloadRecordImage
            )
          );
        }
      }
    );

  $("recordDialog")
    .addEventListener(
      "close",
      clearRecordImageDisplay
    );

  $("backToTop")
    .addEventListener(
      "click",
      () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );

  window.addEventListener(
    "scroll",
    () => {
      $("backToTop").classList.toggle(
        "show",
        window.scrollY > 420
      );
    },
    {
      passive: true
    }
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

  recalculateLiveDecision();
  recalculate();
  renderHistory();
}

initialize();
})();
