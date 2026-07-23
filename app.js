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

const countChecked = (ids) =>
  ids.filter(
    (id) => checked(id)
  ).length;

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
    note: "升勢主結仍未有效實收跌穿；即使Wick穿／Sweep收返、次結失守或深回調，都最多屬弱升。只有主結有效實收穿先進Transition。",
    priorityDeployment: "Long仍然優先，但只做P1／P2回調位置，唔追延伸段；最好等次級結構重新轉強再部署。",
    secondaryDeployment: "到重大阻力或上方流動性區，可用高質Trigger捕Short回調／反轉；仍要受更高級別方向同前方空間限制。"
  },
  "轉換中－偏升": {
    type: "transition",
    bias: "up",
    note: "原跌勢主結已被有效實收升穿，先正式進入Transition；開始出現HL候選或向上證據，但未正式完成新升勢確認。",
    priorityDeployment: "準備Long優先：等潛在HL、P1／P2支持或突破回測出Long Trigger；確認新升勢前最高仍按轉換權限。",
    secondaryDeployment: "Short可跟尚未完全破壞嘅局部跌勢／回調先行，但只做到潛在HL或主判支持前；一到支持區停止新Short。"
  },
  "轉換中－中性": {
    type: "transition",
    bias: null,
    note: "原趨勢主結已被有效實收穿，舊主導權失效；多空暫時冇清晰優勢，可能形成橫行／Range。",
    priorityDeployment: "優先等清晰區間形成後做P1／P2邊界，或者等有效突破接受＋首次回測再跟新方向。",
    secondaryDeployment: "若更高一級有明確方向，可做順更高級別嘅短程trade；中間位不做，目標以區間另一邊或重大障礙前為主。"
  },
  "轉換中－偏跌": {
    type: "transition",
    bias: "down",
    note: "原升勢主結已被有效實收跌穿，先正式進入Transition；開始出現LH候選或向下證據，但未正式完成新跌勢確認。",
    priorityDeployment: "準備Short優先：等潛在LH、P1／P2阻力或跌破回測出Short Trigger；確認新跌勢前最高仍按轉換權限。",
    secondaryDeployment: "Long可跟尚未完全破壞嘅局部升勢／反彈先行，但只做到潛在LH或主判阻力前；一到阻力區停止新Long。"
  },
  "弱跌勢": {
    type: "weak",
    bias: "down",
    note: "跌勢主結仍未有效實收升穿；即使Wick穿／Sweep收返、次結失守或深回調，都最多屬弱跌。只有主結有效實收穿先進Transition。",
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
    note: "W／D重大支持阻力、大局／主判主結、主判大型Range真正邊界、會改變主判Market State嘅關鍵結構，或者次判主結同HTF重大真實結構直接重疊。"
  },
  P2: {
    title: "重要工作位置",
    note: "次判主結、主判次結、重要Range邊界、工作結構突破＋首次Retest、重要Swap／Impulse Origin，或者實際結構＋Mon H/L／Asia／OPR／PDH／PDL重疊。"
  },
  P3: {
    title: "普通局部位置",
    note: "次判次結、Entry TF主結、普通局部Support／Resistance、低TF Range邊界、普通結構＋Session Liquidity。Type A高質OPR／Asia 2B可令原始P3獲P2-effective待遇。"
  },
  P4: {
    title: "無價值位置",
    note: "Range中間、純Fib、純Asia／OPR、純Session Level冇結構、追價、冇明顯Edge，或者第一真實障礙太近令R:R不足。P4＝0。"
  }
};

const SIZE_LABELS = {
  0: "0注｜不做",
  0.25: "0.25注",
  0.5: "0.5注",
  1: "1注"
};

const BONUS_IDS = [];

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
  const mainTransition =
    isTransition(mainState);
  const secondaryTransition =
    isTransition(secondaryState);
  const mainBias =
    stateBias(mainState);
  const secondaryBias =
    stateBias(secondaryState);

  if (
    mainTransition &&
    secondaryTransition
  ) {
    return "雙轉換／橫行";
  }

  if (
    mainTransition ||
    secondaryTransition
  ) {
    return "包含轉換";
  }

  if (
    mainBias !== null &&
    mainBias === secondaryBias
  ) {
    return (
      isHealthy(mainState) &&
      isHealthy(secondaryState)
    )
      ? "雙健康同向"
      : "同向有弱勢";
  }

  if (
    mainBias !== null &&
    secondaryBias !== null &&
    mainBias !== secondaryBias
  ) {
    return "方向衝突";
  }

  return "方向未確認";
}

function computeMarketRoute(
  mainState,
  secondaryState,
  tradeDirection
) {
  const relation =
    marketRelation(
      mainState,
      secondaryState
    );

  const mainBias =
    stateBias(mainState);
  const secondaryBias =
    stateBias(secondaryState);
  const currentTradeBias =
    tradeDirection === "Long"
      ? "up"
      : "down";

  const result = (
    code,
    label,
    cap,
    reason
  ) => ({
    code,
    label,
    cap,
    relation,
    reason
  });

  if (
    relation ===
    "雙轉換／橫行"
  ) {
    return result(
      "bothTransition",
      "雙轉換／橫行｜只做邊界",
      0.5,
      "主判＋次判都處於Transition／Range，兩邊都可以有邊界劇本，但中間位一律不做；P1主要邊界最高0.5。"
    );
  }

  if (
    relation === "包含轉換"
  ) {
    const mainTransition =
      isTransition(mainState);
    const confirmedBias =
      mainTransition
        ? secondaryBias
        : mainBias;
    const confirmedLayer =
      mainTransition
        ? "次判"
        : "主判";
    const transitionLayer =
      mainTransition
        ? "主判"
        : "次判";

    if (
      currentTradeBias ===
      confirmedBias
    ) {
      return result(
        "transitionConfirmed",
        `包含轉換｜順${confirmedLayer}已確認方向`,
        0.5,
        `${transitionLayer}仍處Transition；今次交易順${confirmedLayer}${biasDirectionLabel(confirmedBias)}已確認方向，可按限制交易Matrix部署，最高0.5注。`
      );
    }

    return result(
      "transitionReverse",
      `包含轉換｜${transitionLayer}反向部署`,
      0.25,
      `今次交易逆${confirmedLayer}${biasDirectionLabel(confirmedBias)}當前方向；正常以Transition層真正P1＋Q3為主。若主判仍係趨勢、次判已不再同主判同向，而且P1順風仍有效，P2＋Q3亦可最高0.25。`
    );
  }

  if (
    relation ===
      "雙健康同向" ||
    relation ===
      "同向有弱勢"
  ) {
    const commonBias =
      mainBias;

    if (
      currentTradeBias !==
      commonBias
    ) {
      return result(
        "alignedReverse",
        "雙同向｜反共同方向禁止",
        0,
        `主判＋次判共同${biasDirectionLabel(commonBias)}；V3.4雙同向只做共同方向，即使到W／D／4H P1大位亦唔直接反向。`
      );
    }

    if (
      relation ===
      "雙健康同向"
    ) {
      return result(
        "healthyAligned",
        `雙健康同向｜順共同${biasDirectionLabel(commonBias)}`,
        1,
        "主判＋次判健康同向並順共同方向；P1／P2＋Q3最高1注。"
      );
    }

    return result(
      "weakAligned",
      `同向有弱勢｜順共同${biasDirectionLabel(commonBias)}`,
      0.5,
      "主判＋次判方向一致，但至少一層屬弱勢；仍只做共同方向，最高0.5注。"
    );
  }

  if (
    relation === "方向衝突"
  ) {
    if (
      currentTradeBias ===
      mainBias
    ) {
      return result(
        "conflictMain",
        `方向衝突｜順主判${biasDirectionLabel(mainBias)}、逆次判`,
        0.5,
        `今次交易順主判${biasDirectionLabel(mainBias)}，視為等次判回調完成後重新順主判；P1／高質P2優先，最高0.5注。`
      );
    }

    return result(
      "conflictSecondary",
      `方向衝突｜順次判${biasDirectionLabel(secondaryBias)}、逆主判`,
      0.25,
      `今次交易順次判、逆主判，只當較大級別趨勢內局部反彈／回調；以高質P1＋Q3為主，最高0.25注。`
    );
  }

  return result(
    "noRoute",
    "方向未確認｜不做",
    0,
    "主判／次判未形成可分類市場關係，暫時不做。"
  );
}

function marketRouteInfo() {
  return computeMarketRoute(
    $("mainState").value,
    $("secondaryState").value,
    direction()
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
        "大局背景暫時冇明確方向；只負責重大位置、空間同風險限制，唔會令低質交易升級。"
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
      "大局只提供順風／逆風、重大支持阻力同目標空間；方向規則仍由主判 × 次判市場關係決定。"
  };
}

function preferredDirectionInfo() {
  const route =
    marketRouteInfo();

  const mainBias =
    stateBias(
      $("mainState").value
    );
  const secondaryBias =
    stateBias(
      $("secondaryState").value
    );

  if (
    route.code ===
      "healthyAligned" ||
    route.code ===
      "weakAligned" ||
    route.code ===
      "alignedReverse"
  ) {
    return {
      label:
        `只做共同${biasDirectionLabel(mainBias)}`,
      note:
        route.reason
    };
  }

  if (
    route.code ===
      "conflictMain" ||
    route.code ===
      "conflictSecondary"
  ) {
    return {
      label:
        `順主判${biasDirectionLabel(mainBias)}優先`,
      note:
        `次判${biasDirectionLabel(secondaryBias)}方向可有局部劇本，但逆主判時位置要求更高、注碼更低。`
    };
  }

  if (
    route.code ===
      "transitionConfirmed" ||
    route.code ===
      "transitionReverse"
  ) {
    const mainTransition =
      isTransition(
        $("mainState").value
      );
    const confirmedBias =
      mainTransition
        ? secondaryBias
        : mainBias;

    return {
      label:
        `順已確認${biasDirectionLabel(confirmedBias)}優先`,
      note:
        "包含Transition時先順已確認嗰層方向；反向正常以Transition層真正P1＋Q3為主，但若主判仍係趨勢、次判已不再同主判同向＋有效P1順風，P2＋Q3亦可0.25。"
    };
  }

  return {
    label:
      "區間邊界雙向劇本",
    note:
      "雙轉換／橫行只做清晰P1／P2邊界，中間位不做；突破唔追，等接受＋首次回測。"
  };
}

function combinedDeploymentInfo() {
  const route =
    marketRouteInfo();

  if (
    route.code ===
    "healthyAligned"
  ) {
    return {
      priority:
        `雙健康同向：只順共同方向部署P1／P2＋Q3，完整條件最高1注；P3只作小注。`,
      secondary:
        "反共同方向禁止。到大局阻力／支持只可以停止追、降級或Skip，唔直接反向。"
    };
  }

  if (
    route.code ===
    "weakAligned"
  ) {
    return {
      priority:
        "同向有弱勢：仍只做共同方向，優先P1／P2＋Q3，最高0.5注，避免追延伸。",
      secondary:
        "反共同方向禁止；等其中一層Market State轉弱／轉換後先重新評估反向劇本。"
    };
  }

  if (
    route.code ===
    "alignedReverse"
  ) {
    return {
      priority:
        "目前交易方向逆主判＋次判共同方向：不部署。",
      secondary:
        "即使大局P1＋Q3都唔直接反向；先等主判或次判Market State改變。"
    };
  }

  if (
    route.code ===
    "conflictMain"
  ) {
    return {
      priority:
        "方向衝突順主判：等次判回調到主判P1／高質P2後重新順主判，最高0.5注。",
      secondary:
        "P3＋Q3只屬0.25／0小注測試；位置唔夠就等。"
    };
  }

  if (
    route.code ===
    "conflictSecondary"
  ) {
    return {
      priority:
        "方向衝突順次判、逆主判：只當局部反彈／回調，主要要求高質P1＋Q3，最高0.25注。",
      secondary:
        "P2通常不做；P1＋Q2亦預設0，只有你明確標記特殊可接受情況先考慮0.25。"
    };
  }

  if (
    route.code ===
    "transitionConfirmed"
  ) {
    return {
      priority:
        "包含轉換：優先順已確認嗰層方向，P1／P2＋Q3最高0.5注。",
      secondary:
        "逆已確認方向唔喺普通位置做；等Transition層真正P1大位＋Q3先試反向0.25。"
    };
  }

  if (
    route.code ===
    "transitionReverse"
  ) {
    return {
      priority:
        "包含轉換反向：正常以Transition層真正P1＋Q3為主，最高0.25注。",
      secondary:
        "如果主判仍係趨勢、次判已不再同主判同向，而且P1順風仍有效，P2＋Q3亦可0.25；P1順風唔會將P2升P1。"
    };
  }

  return {
    priority:
      "雙轉換／橫行：只做清晰邊界。P1＋Q3一般0.25，主要邊界可0.5；P2清晰邊界＋Q3為0.25。",
    secondary:
      "中間位一律不做；突破唔追，等Acceptance＋首次回測。"
  };
}


function triggerModelLabel() {
  return "Q Trigger｜按Setup Type評確認質素";
}

function setupTypeLabel(code) {
  const labels = {
    A: "Type A｜高質 OPR／Asia 2B",
    B: "Type B｜普通 Sweep & Reclaim",
    C: "Type C｜No Sweep"
  };

  return labels[code] || code;
}

function evaluateBaseTrigger() {
  const selectedSetupType =
    $("setupType").value;

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

  const noSweepRejection =
    checked("noSweepRejection");
  const noSweepMicroBreak =
    checked("noSweepMicroBreak");

  if (
    selectedSetupType === "C"
  ) {
    if (!noSweepRejection) {
      coreFailures.push(
        "No Sweep Setup缺少P1位置明顯Rejection。"
      );
    } else {
      positives.push(
        "P1位置有明顯Rejection。"
      );
    }

    if (!noSweepMicroBreak) {
      coreFailures.push(
        "No Sweep Setup缺少右側Micro Structure Break／轉向確認。"
      );
    } else {
      positives.push(
        "右側Micro Structure Break／轉向確認成立。"
      );
    }
  } else {
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
        "Sweep／Reclaim失敗或被完全否定。"
      );
    } else if (
      reclaimQuality === "ordinary"
    ) {
      imperfections.push(
        "Sweep／Reclaim仍有效，但質素處於邊緣。"
      );
    } else {
      positives.push(
        "Sweep／Reclaim乾淨明確。"
      );
    }
  }

  if (
    retestQuality === "invalid"
  ) {
    coreFailures.push(
      "Retest快、深、強，已否定Setup。"
    );
  } else if (
    retestQuality === "imperfect"
  ) {
    imperfections.push(
      "Retest有瑕疵，但Setup核心仍成立。"
    );
  } else {
    positives.push(
      "Retest明顯弱／受控。"
    );
  }

  if (
    tradeSpace === "insufficient"
  ) {
    failures.push(
      "第一個真實Target前R:R不足。"
    );
  } else if (
    tradeSpace === "short"
  ) {
    imperfections.push(
      "交易空間只達最低可接受R:R。"
    );
  } else {
    positives.push(
      "第一個真實Target前有完整合理R:R。"
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
    if (
      selectedSetupType === "C"
    ) {
      quality =
        retestQuality === "weak" &&
        tradeSpace === "full" &&
        noSweepRejection &&
        noSweepMicroBreak
          ? "Q3"
          : "Q2";
    } else {
      quality =
        reclaimQuality === "strong" &&
        retestQuality === "weak" &&
        tradeSpace === "full"
          ? "Q3"
          : "Q2";
    }
  }

  const typeAUpgradeable =
    selectedSetupType !== "C" &&
    quality === "Q2" &&
    validSweep &&
    validReclaim &&
    reclaimQuality === "ordinary" &&
    retestQuality === "weak" &&
    tradeSpace === "full" &&
    failures.length === 0;

  return {
    model:
      selectedSetupType === "C"
        ? "C"
        : "A",
    modelLabel:
      triggerModelLabel(),
    selectedSetupType,
    quality,
    preBonusQuality:
      quality,
    bonusUpgraded: false,
    failures,
    coreFailures,
    imperfections,
    positives,
    bonusCount: 0,
    bonusDirectRepair: false,
    bonusNoDoubleCount: true,
    tradeSpace,
    validSweep,
    validReclaim,
    reclaimQuality,
    retestQuality,
    noSweepRejection,
    noSweepMicroBreak,
    typeAUpgradeable,
    modelCoreValid:
      coreFailures.length === 0
  };
}

function evaluateAsia2B(baseTrigger) {
  const selectedSetupType =
    $("setupType").value;

  const basePosition =
    $("positionLevel").value;

  let effectivePosition =
    basePosition;
  let effectiveQuality =
    baseTrigger.quality;

  let positionPromoted = false;
  let triggerPromoted = false;

  const reasons = [];
  const warnings = [];

  const type =
    $("asia2BType").value;

  const expectedDirection =
    type === "asiaTop"
      ? "Short"
      : "Long";

  const directionMatches =
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
    selectedSetupType === "A" &&
    directionMatches &&
    criteriaCount >= 5;

  let effectiveSetupType =
    selectedSetupType;

  if (
    selectedSetupType === "A" &&
    !highQuality
  ) {
    effectiveSetupType = "B";
    warnings.push(
      `Type A候選只符合${criteriaCount}/6項或者方向唔一致；未達高質，今次自動按Type B普通Sweep-Reclaim處理。`
    );
  }

  if (
    effectiveSetupType === "A"
  ) {
    if (
      basePosition === "P3"
    ) {
      effectivePosition = "P2";
      positionPromoted = true;
      reasons.push(
        "Type A高質OPR／Asia 2B：原始P3獲P2-effective待遇；原始P級仍記P3。"
      );
    } else if (
      basePosition === "P2"
    ) {
      reasons.push(
        "Type A強化P2執行Edge，但P2唔會升P1。"
      );
    } else if (
      basePosition === "P4"
    ) {
      warnings.push(
        "Type A唔可以拯救P4。"
      );
    }

    if (
      baseTrigger.typeAUpgradeable
    ) {
      effectiveQuality = "Q3";
      triggerPromoted = true;
      reasons.push(
        "Type A：基礎Q2唯一問題係Sweep／Reclaim質素邊緣，符合Q2 → Q3修正。"
      );
    } else if (
      baseTrigger.quality === "Q2"
    ) {
      warnings.push(
        "Type A唔會拯救Retest過快／過深／過強、空間不足或Setup被否定；今次Q維持Q2。"
      );
    }
  }

  if (
    effectiveSetupType === "B"
  ) {
    reasons.push(
      "Type B普通Sweep-Reclaim：冇任何P／Q特殊升級。"
    );
  }

  if (
    effectiveSetupType === "C"
  ) {
    reasons.push(
      "Type C No Sweep：只考慮P1＋高質右側確認；P2／P3普通Setup直接0。"
    );
  }

  const asiaLabel =
    selectedSetupType === "A"
      ? type === "asiaTop"
        ? "洗OPR／亞洲盤頂2B"
        : "洗OPR／亞洲盤底2B"
      : "無";

  return {
    type:
      selectedSetupType === "A"
        ? type
        : "none",
    label:
      asiaLabel,
    selectedSetupType,
    effectiveSetupType,
    effectiveSetupTypeLabel:
      setupTypeLabel(
        effectiveSetupType
      ),
    active:
      selectedSetupType === "A",
    directionMatches,
    criteriaCount:
      selectedSetupType === "A"
        ? criteriaCount
        : 0,
    highQuality,
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

function matrixCell(
  routeCode,
  position,
  quality,
  options = {}
) {
  if (
    quality === "Q1" ||
    position === "P4"
  ) {
    return 0;
  }

  if (
    routeCode ===
    "healthyAligned"
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
    routeCode ===
      "weakAligned" ||
    routeCode ===
      "transitionConfirmed"
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

  if (
    routeCode ===
    "alignedReverse"
  ) {
    return 0;
  }

  if (
    routeCode ===
    "conflictMain"
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
      return options
        .p3ConflictTestable
        ? 0.25
        : 0;
    }

    return 0;
  }

  if (
    routeCode ===
    "conflictSecondary"
  ) {
    if (
      position === "P1" &&
      quality === "Q3"
    ) {
      return 0.25;
    }

    if (
      position === "P2" &&
      quality === "Q3" &&
      options.counterP2Eligible
    ) {
      return 0.25;
    }

    return 0;
  }

  if (
    routeCode ===
    "transitionReverse"
  ) {
    if (
      position === "P1" &&
      quality === "Q3" &&
      options.transitionLayerP1
    ) {
      return 0.25;
    }

    if (
      position === "P2" &&
      quality === "Q3" &&
      options.counterP2Eligible
    ) {
      return 0.25;
    }

    return 0;
  }

  if (
    routeCode ===
    "bothTransition"
  ) {
    if (
      position === "P1" &&
      quality === "Q3"
    ) {
      return options
        .bothTransitionMajorP1
        ? 0.5
        : 0.25;
    }

    if (
      position === "P2" &&
      quality === "Q3"
    ) {
      return 0.25;
    }

    return 0;
  }

  return 0;
}

function counterP2EligibilityInfo(
  positionOverride = null
) {
  const mainState =
    $("mainState").value;
  const secondaryState =
    $("secondaryState").value;

  const mainBias =
    stateBias(mainState);
  const secondaryBias =
    stateBias(secondaryState);

  const position =
    positionOverride ||
    $("positionLevel").value;

  const currentTradeBias =
    tradeBias();

  const mainIsConfirmedTrend =
    !isTransition(mainState) &&
    mainBias !== null;

  const tradeIsAgainstMain =
    mainBias !== null &&
    currentTradeBias !== mainBias;

  const secondaryNoLongerAligned =
    secondaryBias !== mainBias;

  const validP1Tailwind =
    $("p1BackgroundTailwind").value ===
    "valid";

  if (
    position !== "P2" ||
    !mainIsConfirmedTrend ||
    !tradeIsAgainstMain
  ) {
    return {
      eligible: false,
      reason:
        "逆主判P2特殊資格目前不適用。"
    };
  }

  if (
    secondaryNoLongerAligned &&
    validP1Tailwind
  ) {
    return {
      eligible: true,
      reason:
        "次判已不再同主判同向＋P1順風仍有效＋P2＋Q3：逆主判P2最高0.25。"
    };
  }

  if (!secondaryNoLongerAligned) {
    return {
      eligible: false,
      reason:
        "次判仍然同主判同向；雙同向／同方向背景唔會因P1順風而開逆主判P2權限。"
    };
  }

  return {
    eligible: false,
    reason:
      "次判已不再同主判同向，但P1順風唔係「仍有效」；逆主判P2正常0注。"
  };
}

function currentMatrixOptions(
  effectivePosition = null
) {
  return {
    transitionLayerP1:
      checked(
        "transitionLayerP1"
      ),
    p3ConflictTestable:
      checked(
        "p3ConflictTestable"
      ),
    counterP2Eligible:
      counterP2EligibilityInfo(
        effectivePosition
      ).eligible,
    bothTransitionMajorP1:
      checked(
        "bothTransitionMajorP1"
      )
  };
}

function evaluateMatrix(
  effectivePosition,
  effectiveQuality,
  effectiveSetupType = "B"
) {
  const route =
    marketRouteInfo();

  let size =
    matrixCell(
      route.code,
      effectivePosition,
      effectiveQuality,
      currentMatrixOptions(
        effectivePosition
      )
    );

  if (
    effectiveSetupType === "C" &&
    !(
      effectivePosition === "P1" &&
      effectiveQuality === "Q3"
    )
  ) {
    size = 0;
  }

  const combination =
    `${effectivePosition}＋${effectiveQuality}`;

  let cellExplanation =
    `${route.label}；${combination}按對應市場關係Matrix最高許可${SIZE_LABELS[size]}。`;

  if (
    route.code ===
    "alignedReverse"
  ) {
    cellExplanation =
      `${combination}唔會改變方向規則：雙同向只做共同方向，反向一律0注。`;
  } else if (
    route.code ===
      "conflictSecondary" &&
    effectivePosition === "P2"
  ) {
    cellExplanation =
      counterP2EligibilityInfo(
        effectivePosition
      ).eligible
        ? `逆主判P2符合特殊資格；${combination}最高0.25注。`
        : `${route.label}嘅P2正常0注；目前未符合兩種逆主判P2特殊資格。`;
  } else if (
    route.code ===
      "conflictSecondary" &&
    effectivePosition !== "P1"
  ) {
    cellExplanation =
      `${route.label}以P1＋Q3為正常劇本；${combination}不符合，所以0注。`;
  } else if (
    route.code ===
      "transitionReverse" &&
    effectivePosition === "P2"
  ) {
    cellExplanation =
      counterP2EligibilityInfo(
        effectivePosition
      ).eligible
        ? `包含轉換嘅逆主判P2符合「次判已不再同主判同向＋有效P1順風」；${combination}最高0.25注。`
        : `包含轉換反向嘅P2正常0注；目前未符合「次判已不再同主判同向＋有效P1順風」特殊資格。`;
  } else if (
    route.code ===
      "transitionReverse" &&
    !(
      effectivePosition === "P1" &&
      effectiveQuality === "Q3" &&
      checked(
        "transitionLayerP1"
      )
    )
  ) {
    cellExplanation =
      `包含轉換反向：正常只做Transition層真正P1＋Q3；P2只有符合「次判已不再同主判同向＋有效P1順風」先可0.25。`;
  } else if (
    route.code ===
      "bothTransition" &&
    (
      effectivePosition === "P3" ||
      effectivePosition === "P4"
    )
  ) {
    cellExplanation =
      `雙轉換／橫行只做P1／清晰P2邊界；${combination}視為中間／低級位置，0注。`;
  }

  if (
    effectiveSetupType === "C" &&
    !(
      effectivePosition === "P1" &&
      effectiveQuality === "Q3"
    )
  ) {
    cellExplanation =
      `Type C No Sweep只考慮P1＋Q3高質右側確認；目前${combination}＝0注。`;
  }

  return {
    relation:
      route.relation,
    routeCode:
      route.code,
    routeLabel:
      route.label,
    routeReason:
      route.reason,
    marketCap:
      route.cap,
    mode:
      route.code,
    route:
      route.label,
    size:
      Math.min(
        size,
        route.cap
      ),
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

function applyRangePosition(size) {
  if (
    $("secondaryState").value !==
    "轉換中－中性"
  ) {
    return {
      state: "notApplicable",
      adjustedSize: size,
      explanation:
        "次判唔係轉換中性，Range 25%修正不適用。"
    };
  }

  const state =
    $("secondaryRangePosition")
      .value;

  if (
    state === "favorable"
  ) {
    return {
      state,
      adjustedSize: size,
      explanation:
        "次判轉換中性：Entry位於相應25%（Long底25%／Short頂25%），維持原注碼。"
    };
  }

  if (
    state === "middle"
  ) {
    return {
      state,
      adjustedSize: 0,
      explanation:
        "次判轉換中性：Entry位於真正Range正中／冇邊界Edge，直接0注。"
    };
  }

  const adjusted =
    downgradeOneLevel(size);

  return {
    state,
    adjustedSize: adjusted,
    explanation:
      `次判轉換中性：Entry唔喺相應頂／底25%，注碼降一級：${SIZE_LABELS[size]} → ${SIZE_LABELS[adjusted]}。`
  };
}

function applyObstacle(matrixSize, position, quality) {
  const state = $("obstacleState").value;

  if (state === "far") {
    return {
      state,
      adjustedSize: matrixSize,
      explanation: `Target Obstacle：到障礙前已有完整最低R:R，Entry注碼維持${SIZE_LABELS[matrixSize]}。`,
      management: "障礙只影響TP位置、runner同是否預期突破；唔自動降低Entry注碼。"
    };
  }

  if (state === "near") {
    const adjusted = downgradeOneLevel(matrixSize);
    return {
      state,
      adjustedSize: adjusted,
      explanation: `Entry Obstacle明顯壓縮空間但仍可交易，注碼降一級：${SIZE_LABELS[matrixSize]} → ${SIZE_LABELS[adjusted]}。`,
      management: "TP放障礙前；少留或不留runner。"
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
  baseTrigger,
  setupResult
) {
  const vetoes = [];

  if (
    effectivePosition === "P4" ||
    checked("chasedBreakout")
  ) {
    vetoes.push(
      "P4／Range正中／追價。"
    );
  }

  if (
    !baseTrigger.modelCoreValid
  ) {
    vetoes.push(
      setupResult.effectiveSetupType === "C"
        ? "No Sweep Setup核心確認失敗：缺少P1 Rejection／右側Micro Structure Break，或者Setup被否定。"
        : "Setup核心確認失敗：缺少有效Sweep／Reclaim，或者Reclaim被否定。"
    );
  }

  if (
    baseTrigger.retestQuality ===
    "invalid"
  ) {
    vetoes.push(
      "Retest快＋深＋強，已否定Setup。"
    );
  }

  if (
    baseTrigger.tradeSpace ===
    "insufficient"
  ) {
    vetoes.push(
      "第一個真實Target前R:R不足。"
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
      "違反交易時間或總風險上限。"
    );
  }

  return vetoes;
}

function evaluateDecision(
  baseTrigger,
  setupResult
) {
  const matrix =
    evaluateMatrix(
      setupResult.effectivePosition,
      setupResult.effectiveQuality,
      setupResult.effectiveSetupType
    );

  const preferred =
    preferredDirectionInfo();

  const background =
    backgroundRelationInfo();

  const range =
    applyRangePosition(
      matrix.size
    );

  const obstacle =
    applyObstacle(
      range.adjustedSize,
      setupResult.effectivePosition,
      setupResult.effectiveQuality
    );

  const hardVetoes =
    evaluateHardVeto(
      setupResult.effectivePosition,
      baseTrigger,
      setupResult
    );

  const reasons = [
    ...setupResult.reasons,
    `① 主判 × 次判市場關係：${matrix.relation}。`,
    `② 交易路線：${matrix.routeLabel}。${matrix.routeReason}`,
    `③ Setup Type：${setupResult.effectiveSetupTypeLabel}。`,
    `④ P位置：原始${setupResult.basePosition}；執行待遇${setupResult.effectivePosition}。`,
    `⑤ Q質素：基礎${baseTrigger.quality}；Setup Type修正後${setupResult.effectiveQuality}。`,
    `⑥ Matrix：${matrix.cellExplanation}`,
    `⑦ Range修正：${range.explanation}`,
    `⑧ 大局障礙：${obstacle.explanation}`
  ];

  const warnings = [
    ...setupResult.warnings,
    preferred.note,
    background.note
  ];

  if (
    matrix.routeCode ===
    "alignedReverse"
  ) {
    warnings.push(
      "雙同向反向禁止：即使去到W／D／4H P1大位都唔直接反向；先等Market State改變。"
    );
  }

  if (
    matrix.routeCode ===
    "conflictSecondary"
  ) {
    const counterInfo =
      counterP2EligibilityInfo();

    warnings.push(
      `順次判、逆主判：P1＋Q3正常最高0.25；P2只有「次判已不再同主判同向＋有效P1順風」先可0.25。${counterInfo.reason}`
    );
  }

  if (
    matrix.routeCode ===
    "transitionReverse"
  ) {
    warnings.push(
      "包含轉換反向正常以Transition層真正P1＋Q3為主；若主判仍係趨勢、次判已不再同主判同向＋有效P1順風，P2＋Q3亦可最高0.25。"
    );
  }

  if (
    matrix.routeCode ===
    "bothTransition"
  ) {
    warnings.push(
      "雙轉換／橫行只做邊界，中間位不做。"
    );
  }

  if (
    $("backgroundDirectOverlap")
      .value === "yes" &&
    (
      setupResult.basePosition === "P2" ||
      setupResult.basePosition === "P3"
    )
  ) {
    warnings.push(
      "Entry zone同HTF真實價格結構有實際空間交集；請重新檢查原始P級是否應列P1。"
    );
  }

  if (
    $("p1BackgroundTailwind")
      .value === "valid"
  ) {
    warnings.push(
      "P1順風仍有效：只限P1直接引發第一段反轉＋第一次回調Setup；唔會改Entry P級。"
    );
  } else if (
    $("p1BackgroundTailwind")
      .value === "expired"
  ) {
    warnings.push(
      "舊P1順風已失效：唔可以再借用之前P1作逆主判P2資格。"
    );
  }

  if (
    checked(
      "loosenedTriggerBecauseBias"
    )
  ) {
    warnings.push(
      "紀律標籤：曾因方向偏見想放寬Setup／Q要求；唔允許。"
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
      `⑨ Hard Veto成立，最終由${SIZE_LABELS[obstacle.adjustedSize]}取消至0注。`
    );
  } else {
    reasons.push(
      `⑨ 最終注碼＝市場關係、Setup Type、P × Q、Range修正、大局障礙所有限制中最低值＝${SIZE_LABELS[finalSize]}。`
    );
  }

  return {
    relation:
      matrix.relation,
    marketRoute:
      matrix.routeLabel,
    marketRouteCode:
      matrix.routeCode,
    preferredDirection:
      preferred.label,
    priorityNote:
      preferred.note,
    backgroundRelation:
      background.label,
    backgroundRelationNote:
      background.note,
    setupType:
      setupResult.effectiveSetupType,
    setupTypeLabel:
      setupResult.effectiveSetupTypeLabel,
    marketCap:
      matrix.marketCap,
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
    rangeState:
      range.state,
    rangeSize:
      range.adjustedSize,
    obstacleState:
      obstacle.state,
    obstacleSize:
      obstacle.adjustedSize,
    obstacleManagement:
      obstacle.management,
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
  $("preBonusTriggerGrade").textContent =
    trigger.quality;

  const grade =
    $("baseTriggerGrade");

  grade.textContent =
    trigger.quality === "Q3"
      ? "Q3｜完整高質"
      : trigger.quality === "Q2"
        ? "Q2｜核心成立但有瑕疵"
        : "Q1｜Setup失效";

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
      "已確認",
      trigger.positives,
      "positives"
    )
  ].join("");
}

function renderAsia2B(result) {
  $("typeAPanel")
    .classList.toggle(
      "hidden",
      $("setupType").value !== "A"
    );

  $("typeBPanel")
    .classList.toggle(
      "hidden",
      $("setupType").value !== "B"
    );

  $("typeCPanel")
    .classList.toggle(
      "hidden",
      $("setupType").value !== "C"
    );

  $("sweepReclaimTriggerFields")
    .classList.toggle(
      "hidden",
      $("setupType").value === "C"
    );

  $("effectiveSetupType")
    .textContent =
      result.effectiveSetupTypeLabel;

  $("asia2BQuality")
    .textContent =
      result.selectedSetupType === "A"
        ? result.highQuality
          ? `高質｜${result.criteriaCount}/6`
          : `未達A｜${result.criteriaCount}/6｜按Type B`
        : "N/A";

  $("asia2BPositionEffect")
    .textContent =
      result.positionPromoted
        ? `${result.basePosition} → ${result.effectivePosition}-effective`
        : `維持${result.basePosition}`;

  $("asia2BTriggerEffect")
    .textContent =
      result.triggerPromoted
        ? `${result.baseQuality} → ${result.effectiveQuality}`
        : `維持${result.baseQuality}`;

  const grade =
    $("baseTriggerGrade");

  grade.textContent =
    result.effectiveQuality === "Q3"
      ? result.triggerPromoted
        ? "Q3｜Type A由邊緣Q2修正"
        : "Q3｜完整高質"
      : result.effectiveQuality === "Q2"
        ? "Q2｜核心成立但有瑕疵"
        : "Q1｜Setup失效";

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
  $("marketRoute").textContent =
    decision.marketRoute;
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
    $("p1BackgroundTailwind").value === "valid"
      ? "有｜仍有效"
      : $("p1BackgroundTailwind").value === "expired"
        ? "曾有｜已失效"
        : "冇";
  $("resultMarketRoute").textContent =
    decision.marketRoute;
  $("resultSetupType").textContent =
    currentAsia2B.effectiveSetupTypeLabel;
  $("resultEffectiveTrigger").textContent =
    currentAsia2B.effectiveQuality;
  $("resultAsia2B").textContent =
    currentAsia2B.selectedSetupType === "A"
      ? `${currentAsia2B.highQuality ? "Type A高質" : "未達Type A"}｜${currentAsia2B.criteriaCount}/6`
      : "N/A";
  $("resultMarketCap").textContent =
    SIZE_LABELS[decision.marketCap];
  $("resultMatrixSize").textContent =
    SIZE_LABELS[decision.rawMatrixSize];
  $("resultRangeSize").textContent =
    SIZE_LABELS[decision.rangeSize];
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
    far: "Target Obstacle：到障礙之前已有完整最低R:R，例如2R；唔影響Entry注碼，只影響TP、Runner同突破預期。",
    near: "Entry Obstacle：第一真實障礙明顯壓縮空間，但仍達最低可接受R:R；注碼降一級。",
    insufficient: "Entry Obstacle：第一真實目標前R:R不足，直接0注。",
    inside: "已處於大局障礙區內仍順原方向延伸：P1＋Q3最多0.5、P2＋Q3最多0.25、P3／P4為0。"
  };

  $("obstacleNote").textContent =
    notes[state] || "";
}

function updateBackgroundOverlapNote() {
  const overlap =
    $("backgroundDirectOverlap").value;

  if (overlap === "yes") {
    $("backgroundOverlapNote").textContent =
      "大局實際重疊＝Entry zone本身同HTF真實價格結構有空間交集。Hide晒Fib、Asia、OPR、Mon H/L後，裸K仍會獨立畫出呢個區先算；可直接影響P級。";
  } else {
    $("backgroundOverlapNote").textContent =
      "冇HTF實際結構重疊：Fib、OPR、Asia H/L、Mon H/L、PDH／PDL單獨只係Confluence，唔會自行創造P1。";
  }
}

function updateP1TailwindNote() {
  const value =
    $("p1BackgroundTailwind").value;

  if (value === "valid") {
    $("p1TailwindNote").textContent =
      "P1順風仍有效：只計P1直接引發第一段反轉＋第一次回調Setup。佢唔改P級；只要主判仍係趨勢、次判已不再同主判同向，逆主判P2＋Q3可最高0.25。";
    return;
  }

  if (value === "expired") {
    $("p1TailwindNote").textContent =
      "P1順風已失效：完成第一個LH／HL結構循環、轉橫行、關鍵結構被反向Reclaim等之後，唔可以繼續借用舊P1。";
    return;
  }

  $("p1TailwindNote").textContent =
    "P1順風＝呢段Move由邊個大位引發；同「Entry zone本身有HTF實際結構重疊」係兩件事。";
}

function updateInterface() {
  const timeframes = timeframeValues();
  const backgroundState = $("backgroundState").value;
  const mainState = $("mainState").value;
  const secondaryState = $("secondaryState").value;
  const position = $("positionLevel").value;
  const selectedSetupType =
    $("setupType").value;

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

  $("typeAPanel").classList.toggle(
    "hidden",
    selectedSetupType !== "A"
  );
  $("typeBPanel").classList.toggle(
    "hidden",
    selectedSetupType !== "B"
  );
  $("typeCPanel").classList.toggle(
    "hidden",
    selectedSetupType !== "C"
  );
  $("sweepReclaimTriggerFields")
    .classList.toggle(
      "hidden",
      selectedSetupType === "C"
    );

  const rangeActive =
    secondaryState ===
    "轉換中－中性";

  $("secondaryRangePanel")
    .classList.toggle(
      "hidden",
      !rangeActive
    );

  if (!rangeActive) {
    $("secondaryRangePosition")
      .value = "favorable";
    $("secondaryRangeNote")
      .textContent =
        "次判唔係轉換中性，Range 25%修正不適用。";
  } else {
    const side =
      direction() === "Long"
        ? "底部25%"
        : "頂部25%";
    $("secondaryRangeNote")
      .textContent =
        `次判轉換中性：${direction()}優先${side}；唔喺相應25%降一級，真正Range正中＝0。P級本身不變。`;
  }

  const route =
    marketRouteInfo();

  const showTransitionP1 =
    route.code ===
      "transitionReverse" &&
    position === "P1";

  $("transitionLayerP1Row")
    .classList.toggle(
      "hidden",
      !showTransitionP1
    );

  if (!showTransitionP1) {
    $("transitionLayerP1")
      .checked = false;
  }

  const showP3Conflict =
    route.code ===
      "conflictMain" &&
    position === "P3";

  $("p3ConflictTestableRow")
    .classList.toggle(
      "hidden",
      !showP3Conflict
    );

  if (!showP3Conflict) {
    $("p3ConflictTestable")
      .checked = false;
  }

  const counterP2Info =
    counterP2EligibilityInfo(
      position
    );

  const mainBias =
    stateBias(mainState);

  const showCounterP2 =
    position === "P2" &&
    !isTransition(mainState) &&
    mainBias !== null &&
    tradeBias() !== mainBias;

  $("counterP2EligibilityNote")
    .classList.toggle(
      "hidden",
      !showCounterP2
    );

  if (showCounterP2) {
    $("counterP2EligibilityNote")
      .textContent =
        counterP2Info.reason;
  }

  const showBothTransitionP1 =
    route.code ===
      "bothTransition" &&
    position === "P1";

  $("bothTransitionMajorP1Row")
    .classList.toggle(
      "hidden",
      !showBothTransitionP1
    );

  if (!showBothTransitionP1) {
    $("bothTransitionMajorP1")
      .checked = false;
  }

  updateObstacleNote();
  updateBackgroundOverlapNote();
  updateP1TailwindNote();
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
    `Setup Type選擇：${setupTypeLabel($("setupType").value)}`,
    `有效Setup Type：${currentAsia2B.effectiveSetupTypeLabel}`,
    `有效Sweep：${$("setupType").value === "C" ? "N/A" : yesNo(currentBaseTrigger.validSweep)}`,
    `有效Reclaim：${$("setupType").value === "C" ? "N/A" : yesNo(currentBaseTrigger.validReclaim)}`,
    `Sweep／Reclaim質素：${$("setupType").value === "C" ? "N/A" : $("reclaimQuality").selectedOptions[0].textContent}`,
    `No Sweep P1 Rejection：${$("setupType").value === "C" ? yesNo(currentBaseTrigger.noSweepRejection) : "N/A"}`,
    `No Sweep Micro Break：${$("setupType").value === "C" ? yesNo(currentBaseTrigger.noSweepMicroBreak) : "N/A"}`,
    `Retest質素：${$("retestQuality").selectedOptions[0].textContent}`,
    `交易空間：${$("tradeSpace").selectedOptions[0].textContent}`,
    `基礎Q：${currentBaseTrigger.quality}`,
    `Setup Type修正後Q：${currentAsia2B.effectiveQuality}`
  ];
}

function checklistSummary() {
  const timeframes =
    timeframeValues();

  const tailwind =
    $("p1BackgroundTailwind").value;

  return [
    `交易日期：${$("tradeDate").value}`,
    `大局背景層：${timeframes.background}－${$("backgroundState").value}`,
    `主判斷層：${timeframes.main}－${$("mainState").value}`,
    `次判斷層：${timeframes.secondary}－${$("secondaryState").value}`,
    `入場觸發層：${timeframes.entry}`,
    `交易方向：${direction()}`,
    `主次關係：${currentDecision.relation}`,
    `交易路線：${currentDecision.marketRoute}`,
    `交易優先方向：${currentDecision.preferredDirection}`,
    `優先部署：${combinedDeploymentInfo().priority}`,
    `次要部署：${combinedDeploymentInfo().secondary}`,
    "",
    `Setup Type：${currentAsia2B.effectiveSetupTypeLabel}`,
    `Type A高質：${currentAsia2B.selectedSetupType === "A" ? yesNo(currentAsia2B.highQuality) : "N/A"}`,
    `Type A條件：${currentAsia2B.selectedSetupType === "A" ? `${currentAsia2B.criteriaCount}/6` : "N/A"}`,
    `沒有頂底雙邊掃：${currentAsia2B.selectedSetupType === "A" ? yesNo(checked("asia2BNoDoubleSweep")) : "N/A"}`,
    "",
    `大局實際結構重疊：${$("backgroundDirectOverlap").value === "yes" ? "有" : "冇"}`,
    `P1順風：${tailwind === "valid" ? "有｜仍有效" : tailwind === "expired" ? "曾有｜已失效" : "冇"}`,
    `包含轉換反向P1屬Transition層大位：${yesNo(checked("transitionLayerP1"))}`,
    `衝突順主判P3可小注：${yesNo(checked("p3ConflictTestable"))}`,
    `逆主判P2特殊資格：${counterP2EligibilityInfo(currentAsia2B.effectivePosition).eligible ? "有" : "冇"}｜${counterP2EligibilityInfo(currentAsia2B.effectivePosition).reason}`,
    `雙轉換P1主要邊界：${yesNo(checked("bothTransitionMajorP1"))}`,
    "",
    `原始位置：${currentAsia2B.basePosition}`,
    `Setup Type後有效位置：${currentAsia2B.effectivePosition}`,
    "",
    ...triggerChecklistLines(),
    "",
    `次判Range修正：${currentDecision.rangeState}`,
    `Range修正後：${SIZE_LABELS[currentDecision.rangeSize]}`,
    `大局障礙：${obstacleDisplayLabel(currentDecision.obstacleState)}`,
    `市場關係上限：${SIZE_LABELS[currentDecision.marketCap]}`,
    `Setup Type＋P × Q：${SIZE_LABELS[currentDecision.rawMatrixSize]}`,
    `大局修正：${SIZE_LABELS[currentDecision.obstacleSize]}`,
    `最終注碼：${SIZE_LABELS[currentDecision.finalSize]}`,
    "",
    `追價：${yesNo(checked("chasedBreakout"))}`,
    `違反交易時間：${yesNo(checked("violatesTradingTime"))}`,
    `總風險超標：${yesNo(checked("riskLimitExceeded"))}`,
    `方向偏見想放寬Setup／Q：${yesNo(checked("loosenedTriggerBecauseBias"))}`,
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
      "PracticeJournal-V1.21",
    engineVersion:
      "MasterTradeDecisionMatrix-V3.4-SetupType",

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
    marketRoute:
      currentDecision.marketRoute,
    marketRouteCode:
      currentDecision.marketRouteCode,
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

    basePosition:
      currentAsia2B.basePosition,
    position:
      currentAsia2B.effectivePosition,
    p2EdgePosition:
      false,
    transitionLayerP1:
      checked("transitionLayerP1"),
    p3Testable:
      checked("p3ConflictTestable"),
    counterP2Eligible:
      counterP2EligibilityInfo(
        currentAsia2B.effectivePosition
      ).eligible,
    bothTransitionMajorP1:
      checked("bothTransitionMajorP1"),

    setupTypeSelected:
      currentAsia2B.selectedSetupType,
    setupType:
      currentAsia2B.effectiveSetupType,
    setupTypeLabel:
      currentAsia2B.effectiveSetupTypeLabel,
    noSweepRejection:
      currentBaseTrigger.noSweepRejection,
    noSweepMicroBreak:
      currentBaseTrigger.noSweepMicroBreak,

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

    secondaryRangePosition:
      $("secondaryState").value === "轉換中－中性"
        ? $("secondaryRangePosition").value
        : "notApplicable",
    rangeSize:
      currentDecision.rangeSize,

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
    "已儲存V3.4 Setup Type紀錄"
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
                "V3.4-SetupType"
              )
                ? "Matrix V3.4"
                : record.engineVersion.includes(
                    "V3.3-SimplifiedDirectionRules"
                  )
                  ? "Matrix V3.3"
                  : record.engineVersion.includes(
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
          "V3.4-SetupType"
        )
          ? `<span class="history-tag">${escapeHtml(
              record.setupTypeLabel ||
              setupTypeLabel(
                record.setupType || "B"
              )
            )}</span>`
          : record.engineVersion?.includes(
              "V3.3-SimplifiedDirectionRules"
            )
            ? '<span class="history-tag">精簡方向規則</span>'
            : record.engineVersion?.includes(
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
    <strong>交易路線：</strong>
    ${escapeHtml(
      record.marketRoute ||
      record.directionPermission ||
      "舊版未記錄"
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
    <strong>Setup Type：</strong>
    ${escapeHtml(
      record.setupTypeLabel ||
      setupTypeLabel(
        record.setupType || "B"
      )
    )}
    <br>
    <strong>大局實際結構重疊：</strong>
    ${record.backgroundDirectOverlap === "yes" ? "有" : "冇"}
    <br>
    <strong>P1順風：</strong>
    ${record.p1BackgroundTailwind === "valid"
      ? "有｜仍有效"
      : record.p1BackgroundTailwind === "expired"
        ? "曾有｜已失效"
        : record.p1BackgroundTailwind === "yes"
          ? "有｜舊版"
          : "冇"}
    <br>
    <strong>路線細節：</strong>
    ${escapeHtml(
      [
        record.transitionLayerP1
          ? "包含轉換反向P1＝Transition層大位"
          : "",
        record.p3Testable
          ? "衝突順主判P3可小注"
          : "",
        record.counterP2Eligible
          ? "逆主判P2特殊資格"
          : "",
        record.bothTransitionMajorP1
          ? "雙轉換P1主要邊界"
          : ""
      ].filter(Boolean).join("／") || "無"
    )}
    <br>
    <strong>原始位置：</strong>
    ${escapeHtml(basePosition)}
    <br>
    <strong>有效位置待遇：</strong>
    ${escapeHtml(effectivePosition)}
    <br>
    <strong>Q質素：</strong>
    ${escapeHtml(effectiveTrigger)}
    <br>
    <strong>Range位置：</strong>
    ${escapeHtml(record.secondaryRangePosition || "N/A")}
    <br>
    <strong>Type A／2B：</strong>
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
    "交易路線",
    "交易優先方向",
    "優先部署",
    "次要部署",
    "大局方向關係",
    "大局實際結構重疊",
    "P1順風",
    "原始位置",
    "有效位置",
    "包含轉換反向P1屬Transition層大位",
    "衝突順主判P3可小注",
    "逆主判P2特殊資格",
    "雙轉換P1主要邊界",
    "Setup Type選擇",
    "有效Setup Type",
    "No Sweep P1 Rejection",
    "No Sweep Micro Break",
    "有效Sweep",
    "有效Reclaim",
    "Sweep／Reclaim質素",
    "Retest質素",
    "交易空間",
    "基礎Q",
    "最終Q",
    "Type A方向",
    "Type A高質",
    "Type A條件數",
    "沒有頂底雙邊掃",
    "Type A位置升級",
    "Type A Q升級",
    "次判Range位置",
    "Range修正後",
    "大局障礙",
    "市場關係上限",
    "Setup Type＋P × Q",
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
      record.createdAt || "",
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
      record.marketRoute ||
        record.directionPermission ||
        "",
      record.preferredDirection || "",
      record.priorityDeployment || "",
      record.secondaryDeployment || "",
      record.backgroundRelation || "",
      record.backgroundDirectOverlap === "yes"
        ? "有"
        : "冇",
      record.p1BackgroundTailwind === "valid"
        ? "有｜仍有效"
        : record.p1BackgroundTailwind === "expired"
          ? "曾有｜已失效"
          : record.p1BackgroundTailwind === "yes"
            ? "有｜舊版"
            : "冇",
      record.basePosition ||
        record.position ||
        "",
      record.position ||
        record.basePosition ||
        "",
      record.transitionLayerP1
        ? "Yes"
        : "No",
      record.p3Testable
        ? "Yes"
        : "No",
      record.counterP2Eligible
        ? "Yes"
        : "No",
      record.bothTransitionMajorP1
        ? "Yes"
        : "No",
      record.setupTypeSelected ||
        record.setupType ||
        "",
      record.setupType ||
        "",
      record.noSweepRejection
        ? "Yes"
        : "No",
      record.noSweepMicroBreak
        ? "Yes"
        : "No",
      record.setupType === "C"
        ? ""
        : record.validSweep
          ? "Yes"
          : "No",
      record.setupType === "C"
        ? ""
        : record.validReclaim
          ? "Yes"
          : "No",
      record.setupType === "C"
        ? ""
        : record.reclaimQuality || "",
      record.retestQuality || "",
      record.tradeSpace || "",
      record.baseTrigger ||
        record.trigger ||
        "",
      record.trigger ||
        record.baseTrigger ||
        "",
      record.asia2BLabel ||
        "",
      record.asia2BHighQuality
        ? "Yes"
        : "No",
      record.asia2BCriteriaCount ??
        "",
      record.asia2BNoDoubleSweep
        ? "Yes"
        : "No",
      record.asia2BPositionPromoted
        ? "Yes"
        : "No",
      record.asia2BTriggerPromoted
        ? "Yes"
        : "No",
      record.secondaryRangePosition ||
        "notApplicable",
      record.rangeSize ??
        record.matrixSize ??
        "",
      obstacleDisplayLabel(
        record.obstacleState ||
        "far"
      ),
      record.marketCap ?? "",
      record.rawMatrixSize ??
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
      Number.isFinite(
        record.imageCount
      )
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
    `MasterTrade-V3_4-Journal-${new Date()
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
      `MasterTrade-V3_4-Backup-${new Date()
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
      "MasterTradeDecisionMatrix-V3.4-SetupType",
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
    marketRoute:
      firstCsvValue(
        row,
        "交易路線",
        "Direction Permission"
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
          "大局實際結構重疊",
          "大局位置實際重疊"
        )
      )
        ? "yes"
        : "no",
    p1BackgroundTailwind:
      (() => {
        const value = firstCsvValue(
          row,
          "P1順風",
          "P1背景"
        );
        if (
          String(value).includes("失效")
        ) return "expired";
        if (
          csvBoolean(value) ||
          String(value).includes("仍有效")
        ) return "valid";
        return "no";
      })(),
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
        "有效位置",
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
    transitionLayerP1:
      csvBoolean(
        firstCsvValue(
          row,
          "包含轉換反向P1屬Transition層大位"
        )
      ),
    p3Testable:
      csvBoolean(
        firstCsvValue(
          row,
          "衝突順主判P3可小注",
          "P3可小注測試"
        )
      ),
    counterP2Eligible:
      csvBoolean(
        firstCsvValue(
          row,
          "逆主判P2特殊資格"
        )
      ),
    counterP2WeakBreakRetest:
      csvBoolean(
        firstCsvValue(
          row,
          "主判弱勢次結突破首次Retest"
        )
      ),
    counterP1Q2Special:
      csvBoolean(
        firstCsvValue(
          row,
          "逆主判P1Q2特殊可接受"
        )
      ),
    bothTransitionMajorP1:
      csvBoolean(
        firstCsvValue(
          row,
          "雙轉換P1主要邊界"
        )
      ),
    setupTypeSelected:
      firstCsvValue(
        row,
        "Setup Type選擇"
      ) || "",
    setupType:
      firstCsvValue(
        row,
        "有效Setup Type"
      ) || "",
    noSweepRejection:
      csvBoolean(
        firstCsvValue(
          row,
          "No Sweep P1 Rejection"
        )
      ),
    noSweepMicroBreak:
      csvBoolean(
        firstCsvValue(
          row,
          "No Sweep Micro Break"
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
        "Sweep／Reclaim質素",
        "Reclaim質素"
      ),
    retestQuality:
      firstCsvValue(
        row,
        "Retest質素",
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
        "基礎Q",
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
        "最終Q",
        "Trigger質素",
        "2B後Trigger"
      ),
    asia2BLabel:
      firstCsvValue(
        row,
        "Type A方向",
        "Asia2B類型"
      ) ||
      "無",
    asia2BHighQuality:
      csvBoolean(
        firstCsvValue(
          row,
          "Type A高質",
          "Asia2B高質"
        )
      ),
    asia2BCriteriaCount:
      csvNumber(
        firstCsvValue(
          row,
          "Type A條件數",
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
    secondaryRangePosition:
      firstCsvValue(
        row,
        "次判Range位置"
      ) ||
      "notApplicable",
    rangeSize:
      csvNumber(
        firstCsvValue(
          row,
          "Range修正後"
        )
      ) ?? 0,
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
          "市場關係上限",
          "市場注碼上限"
        )
      ) ?? 0,
    rawMatrixSize:
      csvNumber(
        firstCsvValue(
          row,
          "Setup Type＋P × Q",
          "P × Q Matrix",
          "Trigger矩陣許可"
        )
      ) ?? 0,
    matrixSize:
      csvNumber(
        firstCsvValue(
          row,
          "Setup Type＋P × Q",
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



function liveRouteLabel(value) {
  const labels = {
    healthyAligned:
      "雙健康同向｜順共同方向",
    weakAligned:
      "同向有弱勢｜順共同方向",
    alignedReverse:
      "雙同向｜反共同方向禁止",
    conflictMain:
      "方向衝突｜順主判、逆次判",
    conflictSecondary:
      "方向衝突｜順次判、逆主判",
    transitionConfirmed:
      "包含轉換｜順已確認方向",
    transitionReverse:
      "包含轉換｜反向部署",
    bothTransition:
      "雙轉換／橫行｜只做邊界"
  };

  return labels[value] || value;
}

function liveRouteCap(value) {
  const caps = {
    healthyAligned: 1,
    weakAligned: 0.5,
    alignedReverse: 0,
    conflictMain: 0.5,
    conflictSecondary: 0.25,
    transitionConfirmed: 0.5,
    transitionReverse: 0.25,
    bothTransition: 0.5
  };

  return caps[value] ?? 0;
}

function recalculateLiveDecision() {
  const routeCode =
    $("liveMarketRoute").value;

  const marketCap =
    liveRouteCap(routeCode);

  const selectedSetupType =
    $("liveSetupType").value;

  const typeAQualified =
    selectedSetupType === "A" &&
    checked("liveTypeAQualified");

  const effectiveSetupType =
    selectedSetupType === "A" &&
    !typeAQualified
      ? "B"
      : selectedSetupType;

  $("liveTypeAPanel")
    .classList.toggle(
      "hidden",
      selectedSetupType !== "A"
    );

  $("liveTypeCPanel")
    .classList.toggle(
      "hidden",
      selectedSetupType !== "C"
    );

  $("liveEffectiveSetupType")
    .textContent =
      setupTypeLabel(
        effectiveSetupType
      );

  const basePosition =
    $("livePosition").value;

  let effectivePosition =
    basePosition;

  if (
    effectiveSetupType === "A" &&
    basePosition === "P3"
  ) {
    effectivePosition = "P2";
  }

  let effectiveQuality =
    $("liveTriggerQuality").value;

  if (
    effectiveSetupType === "A" &&
    effectiveQuality === "Q2" &&
    checked("liveTypeAQ2EdgeOnly")
  ) {
    effectiveQuality = "Q3";
  }

  const showTransitionP1 =
    routeCode ===
      "transitionReverse" &&
    effectivePosition === "P1";

  $("liveTransitionLayerP1Row")
    .classList.toggle(
      "hidden",
      !showTransitionP1
    );

  if (!showTransitionP1) {
    $("liveTransitionLayerP1")
      .checked = false;
  }

  const showP3Conflict =
    routeCode ===
      "conflictMain" &&
    effectivePosition === "P3";

  $("liveP3ConflictTestableRow")
    .classList.toggle(
      "hidden",
      !showP3Conflict
    );

  if (!showP3Conflict) {
    $("liveP3ConflictTestable")
      .checked = false;
  }

  const showCounterP2 =
    (
      routeCode ===
        "conflictSecondary" ||
      routeCode ===
        "transitionReverse"
    ) &&
    effectivePosition === "P2";

  $("liveCounterP2BasisRow")
    .classList.toggle(
      "hidden",
      !showCounterP2
    );

  if (!showCounterP2) {
    $("liveCounterP2Basis")
      .value = "none";
  }

  const showBothTransitionP1 =
    routeCode ===
      "bothTransition" &&
    effectivePosition === "P1";

  $("liveBothTransitionMajorP1Row")
    .classList.toggle(
      "hidden",
      !showBothTransitionP1
    );

  if (!showBothTransitionP1) {
    $("liveBothTransitionMajorP1")
      .checked = false;
  }

  const counterP2Eligible =
    showCounterP2 &&
    $("liveP1Tailwind").value ===
      "valid" &&
    $("liveCounterP2Basis").value ===
      "secondaryNotAligned";

  let matrixSize =
    Math.min(
      marketCap,
      matrixCell(
        routeCode,
        effectivePosition,
        effectiveQuality,
        {
          transitionLayerP1:
            checked(
              "liveTransitionLayerP1"
            ),
          p3ConflictTestable:
            checked(
              "liveP3ConflictTestable"
            ),
          counterP2Eligible,
          bothTransitionMajorP1:
            checked(
              "liveBothTransitionMajorP1"
            )
        }
      )
    );

  if (
    effectiveSetupType === "C" &&
    !(
      effectivePosition === "P1" &&
      effectiveQuality === "Q3"
    )
  ) {
    matrixSize = 0;
  }

  const rangeState =
    $("liveRangePosition").value;

  let rangeSize =
    matrixSize;

  if (
    rangeState === "outside"
  ) {
    rangeSize =
      downgradeOneLevel(
        matrixSize
      );
  } else if (
    rangeState === "middle"
  ) {
    rangeSize = 0;
  }

  const obstacle =
    $("liveObstacle").value;

  let obstacleSize =
    rangeSize;

  if (obstacle === "near") {
    obstacleSize =
      downgradeOneLevel(
        rangeSize
      );
  } else if (
    obstacle === "inside"
  ) {
    obstacleSize =
      Math.min(
        rangeSize,
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
      "P4／Range正中＝0注。"
    );
  }

  if (
    effectiveQuality === "Q1"
  ) {
    vetoes.push(
      "Q1＝Setup核心失效。"
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
      "違反交易時間或總風險限制。"
    );
  }

  const finalSize =
    vetoes.length > 0
      ? 0
      : obstacleSize;

  $("liveMarketCap").textContent =
    SIZE_LABELS[marketCap];
  $("liveEffectivePosition").textContent =
    effectivePosition;
  $("liveEffectiveQ").textContent =
    effectiveQuality;
  $("liveResultCap").textContent =
    SIZE_LABELS[marketCap];
  $("liveMatrixSize").textContent =
    SIZE_LABELS[matrixSize];
  $("liveRangeSize").textContent =
    SIZE_LABELS[rangeSize];
  $("liveObstacleSize").textContent =
    SIZE_LABELS[obstacleSize];
  $("liveFinalSize").textContent =
    SIZE_LABELS[finalSize];

  const relationNotes = {
    healthyAligned:
      "雙健康同向只做共同方向；P1／P2＋Q3最高1注，反向禁止。",
    weakAligned:
      "同向但有弱勢仍只做共同方向；最高0.5注。",
    alignedReverse:
      "雙同向反共同方向禁止；P1大位都唔直接反向。",
    conflictMain:
      "方向衝突順主判優先；P1／高質P2＋Q3最高0.5。",
    conflictSecondary:
      "順次判、逆主判：P1＋Q3正常0.25；P2＋Q3只有次判已不再同主判同向＋有效P1順風先可0.25。",
    transitionConfirmed:
      "包含轉換可順已確認方向；P1／P2＋Q3最高0.5。",
    transitionReverse:
      "包含轉換反向正常以Transition層真正P1＋Q3為主；若主判仍係趨勢、次判已不再同主判同向＋有效P1順風，P2＋Q3亦可0.25。",
    bothTransition:
      "雙轉換／橫行只做邊界；中間位不做。"
  };

  $("liveRelationNote").textContent =
    relationNotes[routeCode] || "";

  const notes = [
    `市場關係／交易路線：${liveRouteLabel(routeCode)}。`,
    `Setup Type：${setupTypeLabel(effectiveSetupType)}。`,
    selectedSetupType === "A" &&
      !typeAQualified
      ? "Type A未確認高質資格，今次自動按Type B處理。"
      : "",
    basePosition !==
      effectivePosition
      ? "Type A：原始P3獲P2-effective待遇。"
      : `位置：${effectivePosition}。`,
    effectiveSetupType === "A" &&
      $("liveTriggerQuality").value === "Q2" &&
      checked("liveTypeAQ2EdgeOnly")
      ? "Type A：Q2唯一問題係Sweep／Reclaim邊緣，修正至Q3。"
      : `Q：${effectiveQuality}。`,
    effectiveSetupType === "C"
      ? "Type C：只限P1＋Q3高質右側確認。"
      : "",
    showCounterP2
      ? counterP2Eligible
        ? "逆主判P2特殊資格已確認：次判已不再同主判同向＋P1順風仍有效，P2＋Q3最高0.25。"
        : "逆主判P2正常0；要同時確認次判已不再同主判同向，而且P1順風仍有效。"
      : "",
    rangeState === "outside"
      ? "次判轉換中性：唔喺相應頂／底25%，降一級。"
      : rangeState === "middle"
        ? "次判Range正中：0注。"
        : rangeState === "favorable"
          ? "次判轉換中性：位於相應25%，不降級。"
          : "",
    obstacle === "near"
      ? "Entry Obstacle壓縮空間：降一級。"
      : obstacle === "inside"
        ? "已處大局障礙區內：套P1/P2專用上限。"
        : obstacle === "insufficient"
          ? "第一真實Target前R:R不足：0注。"
          : "Target Obstacle前已有完整最低R:R：唔影響Entry注碼。"
  ].filter(Boolean);

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
