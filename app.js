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


const MARKET_CONFIG = {
  HSI: {
    label: "HSI",
    preset: "hsi",
    defaultSymbol: "HSI",
    setupCodes: [
      "hsi_opr_2b",
      "hsi_structure_sweep",
      "hsi_breakout_retest",
      "trend_pullback",
      "custom"
    ],
    timeRule: "HSI：10:30後唔開新Setup；已入場倉位只按管理規則處理。"
  },
  UK100: {
    label: "UK100",
    preset: "eu",
    defaultSymbol: "UK100",
    setupCodes: [
      "eu_por_2b",
      "eu_asia_full_repair",
      "eu_pure_full_repair",
      "eu_asia_post_open",
      "trend_pullback",
      "custom"
    ],
    timeRule: "EU UTC+8：夏令POR 14:00–15:00、15:00開市；冬令POR 15:00–16:00、16:00開市。開市前Asia 2B唔入場。"
  },
  GER40: {
    label: "GER40",
    preset: "eu",
    defaultSymbol: "GER40",
    setupCodes: [
      "eu_por_2b",
      "eu_asia_full_repair",
      "eu_pure_full_repair",
      "eu_asia_post_open",
      "trend_pullback",
      "custom"
    ],
    timeRule: "EU UTC+8：夏令POR 14:00–15:00、15:00開市；冬令POR 15:00–16:00、16:00開市。開市前Asia 2B唔入場。"
  },
  FX: {
    label: "外匯",
    preset: "fx",
    defaultSymbol: "EURUSD",
    setupCodes: [
      "fx_session_2b",
      "fx_liquidity_sweep",
      "fx_breakout_retest",
      "fx_p1_reversal",
      "trend_pullback",
      "custom"
    ],
    timeRule: "外匯：按交易Session及你現有時間規則執行；入場後仍須重新評估Entry-time Q。"
  },
  XAU: {
    label: "黃金",
    preset: "xau",
    defaultSymbol: "XAUUSD",
    setupCodes: [
      "xau_session_2b",
      "xau_htf_session_sweep",
      "xau_breakout_retest",
      "trend_pullback",
      "custom"
    ],
    timeRule: "黃金：高速大陽／大陰Retest唔可以因低Volume放行；SL放結構失效點。"
  }
};

const SETUP_DEFINITIONS = {
  hsi_opr_2b: {
    marketGroup: "HSI",
    label: "HSI-A｜OPR H／L 2B",
    type: "A",
    variant: "session2B",
    designatedTypeA: true,
    liquidityLabel: "OPR H／L",
    note: "Sweep OPR邊界 → Reclaim → 破1M微結構 → 第一次弱Retest。純OPR原始P3；高質可獲P2-effective待遇。"
  },
  hsi_structure_sweep: {
    marketGroup: "HSI",
    label: "HSI-B｜普通結構Sweep",
    type: "B",
    variant: "sweep",
    note: "Asia H／L、Mon H／L、PDH／PDL或15M局部Swing；冇OPR特殊升級。"
  },
  hsi_breakout_retest: {
    marketGroup: "HSI",
    label: "HSI-C｜Breakout＋Acceptance＋First Retest",
    type: "C",
    variant: "breakout",
    nativeP2: true,
    note: "15M／1H重要結構有效突破、Acceptance及第一次弱Retest；原生P2，改變1H狀態可屬P1事件。"
  },
  eu_por_2b: {
    marketGroup: "EU",
    label: "EU-A｜開市後POR H／L 2B",
    type: "A",
    variant: "session2B",
    designatedTypeA: true,
    liquidityLabel: "開市後POR H／L",
    note: "只限正式現貨開市後首次Sweep POR邊界。純POR原始P3；高質可獲P2-effective待遇。"
  },
  eu_asia_full_repair: {
    marketGroup: "EU",
    label: "EU-B｜Asia Sweep＋POR Full Repair",
    type: "C",
    variant: "fullRepairAsia",
    nativeP2: true,
    note: "POR期間Sweep Asia邊界後，正式開市完整修復POR、突破外側邊界、Acceptance及第一次弱Retest。原生P2。"
  },
  eu_pure_full_repair: {
    marketGroup: "EU",
    label: "EU-C｜Pure POR Full Repair",
    type: "C",
    variant: "fullRepairPure",
    nativeP2: true,
    note: "冇Asia Sweep；正式開市後完整修復POR、突破外側邊界、Acceptance及第一次弱Retest。原生P2。"
  },
  eu_asia_post_open: {
    marketGroup: "EU",
    label: "EU-D｜Asia Sweep＋Post-open Confirmation",
    type: "C",
    variant: "postOpenConfirmation",
    note: "Asia Sweep＋正式開市後Opening Drive確認＋第一次弱Retest形成完整EU-D。普通P3可獲P2-effective；若實際突破15M／1H真實結構，按原生P2甚至P1。唔重複升P或升Q。"
  },
  fx_session_2b: {
    marketGroup: "FX",
    label: "FX-A｜Asia／OPR 2B",
    type: "A",
    variant: "session2B",
    designatedTypeA: true,
    liquidityLabel: "Asia／指定OPR H／L",
    note: "Sweep指定Session邊界 → Reclaim → 破15M／5M微結構 → 第一次弱Retest。純邊界原始P3；高質可P2-effective。"
  },
  fx_liquidity_sweep: {
    marketGroup: "FX",
    label: "FX-B｜普通Liquidity Sweep",
    type: "B",
    variant: "sweep",
    note: "PDH／PDL、Mon H／L、Europe H／L、局部Swing或前一日Range邊界；冇自動P／Q升級。"
  },
  fx_breakout_retest: {
    marketGroup: "FX",
    label: "FX-C｜Breakout＋Acceptance＋First Retest",
    type: "C",
    variant: "breakout",
    nativeP2: true,
    note: "1H主結、4H工作結構、大Range邊界或舊支持阻力互換；有效Breakout＋Acceptance＋首次Retest＝原生P2。"
  },
  fx_p1_reversal: {
    marketGroup: "FX",
    label: "FX-D｜P1反轉Setup",
    type: "B",
    variant: "p1ReversalSweep",
    note: "只限Daily／4H主要P1、主判已弱、次判Sweep＋Reclaim＋右側反轉，而且第一段反應仍新鮮。"
  },
  xau_session_2b: {
    marketGroup: "XAU",
    label: "XAU-A｜Asia／OPR 2B",
    type: "A",
    variant: "session2B",
    designatedTypeA: true,
    liquidityLabel: "Asia／OPR H／L",
    note: "黃金Session 2B；P／Q特殊待遇同外匯Type A一致，但Retest標準更嚴格。"
  },
  xau_htf_session_sweep: {
    marketGroup: "XAU",
    label: "XAU-B｜HTF結構＋Session Sweep",
    type: "B",
    variant: "sweep",
    note: "Session Sweep只係Trigger；真正P由Daily／4H／1H真實結構、Range邊界及重疊決定。"
  },
  xau_breakout_retest: {
    marketGroup: "XAU",
    label: "XAU-C｜Breakout＋Acceptance＋First Retest",
    type: "C",
    variant: "breakout",
    nativeP2: true,
    note: "4H／1H大Range、歷史高低位或Market State轉換後第一次Retest；原生P2，改變4H狀態可屬P1。"
  },
  trend_pullback: {
    marketGroup: "ALL",
    label: "Type C｜強趨勢Pullback至真正結構",
    type: "C",
    variant: "trendPullback",
    note: "冇Sweep；只限強趨勢Context、真正P1／P2結構、第一次受控Retest及右側控制權確認。"
  },
  custom: {
    marketGroup: "ALL",
    label: "自訂｜按實際Setup分類",
    type: "B",
    variant: "sweep",
    manualType: true,
    note: "自訂Setup預設按Type B。Type A只有指定市場Session 2B先有效；UK100／GER40嘅Asia 2B during POR已刪除。"
  }
};

const POSITION_INFO = {
  P1: {
    title: "大局級位置",
    note: "Weekly／Daily主要支持阻力、大局層或主判層主結、主判大型Range頂底、會改變主判Market State嘅突破＋回測、次判主結與HTF主要結構重疊，或者W／D 0.618與真實HTF結構重疊。"
  },
  P2: {
    title: "重要工作位置",
    note: "次判主結、主判次結、次判重要Range邊界、Breakout＋Acceptance＋第一次Retest、工作結構Swap、Impulse Origin，或者主要結構與Session Liquidity重疊。"
  },
  P3: {
    title: "普通局部位置",
    note: "次判次結、Trigger層主結、Session H／L＋普通局部結構、0.618＋普通Swap、低時間框架Range邊界，或指定POR／OPR／Asia H／L工作線。高質Type A可令原始P3獲P2-effective待遇。"
  },
  P4: {
    title: "無價值位置",
    note: "大Range中間、純Fib、純Session線但冇Setup優勢、追價、前方障礙極近、上下距離接近冇Edge，或者冇真實結構支持。P4＝0。"
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

function marketCode(live = false) {
  const id =
    live
      ? "liveMarketCode"
      : "marketCode";

  return $(id)?.value || "FX";
}

function setupTemplateCode(live = false) {
  const id =
    live
      ? "liveSetupTemplate"
      : "setupTemplate";

  return $(id)?.value || "custom";
}

function setupDefinition(live = false) {
  return (
    SETUP_DEFINITIONS[
      setupTemplateCode(live)
    ] ||
    SETUP_DEFINITIONS.custom
  );
}

function setupVariant(live = false) {
  const definition =
    setupDefinition(live);

  if (
    definition.manualType
  ) {
    const selectedType =
      $(
        live
          ? "liveSetupType"
          : "setupType"
      ).value;

    if (selectedType === "C") {
      return "p1NoSweep";
    }

    if (selectedType === "A") {
      return "session2B";
    }

    return "sweep";
  }

  return definition.variant;
}

function isDesignatedTypeASetup(
  live = false
) {
  const definition =
    setupDefinition(live);

  if (!definition.designatedTypeA) {
    return false;
  }

  const market =
    marketCode(live);

  if (
    market === "UK100" ||
    market === "GER40"
  ) {
    return (
      setupTemplateCode(live) ===
      "eu_por_2b"
    );
  }

  return true;
}

function populateSetupTemplateSelect(
  market,
  selectId,
  preferredCode = ""
) {
  const select = $(selectId);

  if (!select) return;

  const config =
    MARKET_CONFIG[market] ||
    MARKET_CONFIG.FX;

  const allowed =
    config.setupCodes;

  select.innerHTML = "";

  allowed.forEach((code) => {
    const definition =
      SETUP_DEFINITIONS[code];

    select.add(
      new Option(
        definition.label,
        code
      )
    );
  });

  const next =
    allowed.includes(preferredCode)
      ? preferredCode
      : allowed[0];

  select.value = next;
}

function applySetupTemplate(
  live = false
) {
  const definition =
    setupDefinition(live);

  const typeId =
    live
      ? "liveSetupType"
      : "setupType";

  const typeSelect =
    $(typeId);

  if (!definition.manualType) {
    typeSelect.value =
      definition.type;
  }

  typeSelect.disabled =
    !definition.manualType;

  const noteId =
    live
      ? "liveSetupTemplateNote"
      : "setupTemplateNote";

  if ($(noteId)) {
    $(noteId).textContent =
      definition.note;
  }

  const typeLabelId =
    live
      ? "liveSetupClassification"
      : "setupClassification";

  if ($(typeLabelId)) {
    $(typeLabelId).textContent =
      setupTypeLabel(
        typeSelect.value
      );
  }
}

function applyMarketPreset(
  market,
  live = false
) {
  const config =
    MARKET_CONFIG[market] ||
    MARKET_CONFIG.FX;

  const selectId =
    live
      ? "liveSetupTemplate"
      : "setupTemplate";

  const previous =
    $(selectId)?.value || "";

  populateSetupTemplateSelect(
    market,
    selectId,
    previous
  );

  applySetupTemplate(live);

  if (!live) {
    $("timeframePreset").value =
      config.preset;
    applyTimeframePreset(
      config.preset
    );

    const knownDefaults = [
      "HSI",
      "UK100",
      "GER40",
      "EURUSD",
      "XAUUSD"
    ];

    const currentSymbol =
      $("symbol").value
        .trim()
        .toUpperCase();

    if (
      !currentSymbol ||
      knownDefaults.includes(
        currentSymbol
      )
    ) {
      $("symbol").value =
        config.defaultSymbol;
    }

    $("marketTimeRuleNote")
      .textContent =
        config.timeRule;
  }
}

function setupTypeFromTemplate(
  live = false
) {
  const definition =
    setupDefinition(live);

  const selectedType =
    $(
      live
        ? "liveSetupType"
        : "setupType"
    ).value;

  return definition.manualType
    ? selectedType
    : definition.type;
}

function applyTimeframePreset(value) {
  suppressPresetChange = true;

  if (
    value === "fx" ||
    value === "xau"
  ) {
    $("backgroundTimeframe").value =
      "D";
    $("mainTimeframe").value =
      "4H";
    $("secondaryTimeframe").value =
      "1H";
    $("entryTimeframe").value =
      "15M";
  } else if (
    value === "hsi"
  ) {
    $("backgroundTimeframe").value =
      "4H";
    $("mainTimeframe").value =
      "1H";
    $("secondaryTimeframe").value =
      "15M";
    $("entryTimeframe").value =
      "1M";
  } else if (
    value === "eu"
  ) {
    $("backgroundTimeframe").value =
      "4H";
    $("mainTimeframe").value =
      "1H";
    $("secondaryTimeframe").value =
      "15M";
    $("entryTimeframe").value =
      "5M";
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

  const mainTransition =
    isTransition(mainState);
  const secondaryTransition =
    isTransition(secondaryState);

  if (
    mainTransition &&
    secondaryTransition
  ) {
    return result(
      "bothTransition",
      "雙轉換／橫行｜只做Range邊界",
      0.5,
      "主判＋次判都處Transition／Range；P1邊界最高0.5、P2邊界最高0.25，Range中間固定0。"
    );
  }

  if (
    mainTransition ||
    secondaryTransition
  ) {
    if (
      !mainTransition &&
      secondaryTransition
    ) {
      if (
        secondaryBias === mainBias
      ) {
        if (
          currentTradeBias ===
          mainBias
        ) {
          return result(
            "weakAligned",
            "同向含轉換｜順共同偏向",
            0.5,
            "主判趨勢與次判Transition偏向一致；只做共同方向，最高0.5注。"
          );
        }

        return result(
          "alignedReverse",
          "同向含轉換｜反共同偏向",
          0,
          "主判趨勢與次判Transition偏向一致；反共同方向正常0，只有窄義HTF P1反轉例外可0.25 Probe。"
        );
      }

      if (
        currentTradeBias ===
        mainBias
      ) {
        return result(
          "transitionConfirmed",
          "包含轉換｜順主判已確認方向",
          0.5,
          "次判仍處Transition；順主判已確認方向，最高0.5注。"
        );
      }

      return result(
        "conflictSecondary",
        "次判已脫離主判同向｜逆主判",
        0.5,
        "主判仍係Trend，但今次交易逆主判；P1＋Q3最高0.5，P2＋Q3只喺指定逆主判資格成立時最高0.25。"
      );
    }

    if (
      mainTransition &&
      !secondaryTransition
    ) {
      if (
        mainBias === secondaryBias
      ) {
        if (
          currentTradeBias ===
          secondaryBias
        ) {
          return result(
            "weakAligned",
            "同向含轉換｜順共同偏向",
            0.5,
            "主判Transition偏向與次判趨勢一致；只做共同方向，最高0.5注。"
          );
        }

        return result(
          "alignedReverse",
          "同向含轉換｜反共同偏向",
          0,
          "主判Transition偏向與次判趨勢一致；反共同方向正常0，只有窄義HTF P1反轉例外可0.25 Probe。"
        );
      }

      if (
        currentTradeBias ===
        secondaryBias
      ) {
        return result(
          "transitionConfirmed",
          "包含轉換｜順次判已確認方向",
          0.5,
          "主判仍處Transition；順次判已確認方向，最高0.5注。"
        );
      }

      return result(
        "transitionReverse",
        "主判Transition｜逆次判已確認方向",
        0.25,
        "主判未有新Trend確認而今次逆次判已確認方向；只限Transition層真正P1＋Q3反向Probe，最高0.25。"
      );
    }
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
        "雙同向｜反共同方向",
        0,
        `主判＋次判共同${biasDirectionLabel(commonBias)}；正常方向權限為0，只有窄義HTF P1反轉例外可0.25 Probe。`
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
      "主判＋次判方向一致，但至少一層弱勢；最高0.5注。"
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
        "等次判喺P1／P2完成右側反轉後重新順主判；最高0.5注。"
      );
    }

    return result(
      "conflictSecondary",
      `方向衝突｜順次判${biasDirectionLabel(secondaryBias)}、逆主判`,
      0.5,
      "順次判、逆主判：P1＋Q3最高0.5；P1＋Q2最高0.25；P2＋Q3只限指定資格，最高0.25。"
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
      "weakAligned"
  ) {
    return {
      label:
        `只做共同${biasDirectionLabel(
          mainBias ??
          secondaryBias
        )}`,
      note:
        route.reason
    };
  }

  if (
    route.code ===
      "alignedReverse"
  ) {
    return {
      label:
        "共同方向優先｜反向只限窄義P1 Probe",
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
        route.reason
    };
  }

  if (
    route.code ===
      "transitionConfirmed"
  ) {
    return {
      label:
        "順已確認方向優先",
      note:
        route.reason
    };
  }

  if (
    route.code ===
      "transitionReverse"
  ) {
    return {
      label:
        "已確認方向優先｜反向只限Transition P1 Probe",
      note:
        route.reason
    };
  }

  return {
    label:
      "Range邊界雙向劇本",
    note:
      route.reason
  };
}

function combinedDeploymentInfo() {
  const route =
    marketRouteInfo();

  const map = {
    healthyAligned: {
      priority:
        "雙健康同向：只順共同方向，P1／P2＋Q3最高1注。",
      secondary:
        "P3只作低一級部署；反向正常0。"
    },
    weakAligned: {
      priority:
        "同向但含弱勢／轉換：只順共同方向，P1／P2＋Q3最高0.5。",
      secondary:
        "避免延伸段追價；等真正P1／P2同右側確認。"
    },
    alignedReverse: {
      priority:
        "反共同方向正常0注。",
      secondary:
        "只有Daily／Weekly P1＋原生至少P2＋Q3＋Sweep／Reclaim／微結構轉向＋第一段新鮮反應，先可0.25 Probe。"
    },
    conflictMain: {
      priority:
        "方向衝突順主判：P1／P2＋Q3最高0.5。",
      secondary:
        "P3＋Q3只限明確小注測試位，否則0。"
    },
    conflictSecondary: {
      priority:
        "順次判、逆主判：P1＋Q3最高0.5；P1＋Q2最高0.25。",
      secondary:
        "P2＋Q3一般最高0.25，但主判健康要有效P1順風；主判弱勢要主判次結突破＋首次Retest。"
    },
    transitionConfirmed: {
      priority:
        "包含轉換：順已確認方向，P1／P2＋Q3最高0.5。",
      secondary:
        "偏向唔等於新Trend已確認；仍受P、Q同障礙限制。"
    },
    transitionReverse: {
      priority:
        "主判Transition而逆次判已確認方向：只做真正Transition P1＋Q3。",
      secondary:
        "最高0.25 Probe；普通P2/P3不做。"
    },
    bothTransition: {
      priority:
        "雙轉換／Range：只做邊界；P1 Q3最高0.5、P2 Q3最高0.25。",
      secondary:
        "P3邊界Q3只限明確可測試先0.25；Range中間固定0。"
    }
  };

  return (
    map[route.code] || {
      priority:
        "方向權限未成立：不部署。",
      secondary:
        "等待Market State及方向關係清晰。"
    }
  );
}

function triggerModelLabel() {
  return "Q Trigger｜按Setup Type評確認質素";
}

function setupTypeLabel(code) {
  const labels = {
    A: "Type A｜高質Session 2B",
    B: "Type B｜普通Sweep＋Reclaim",
    C: "Type C｜Breakout／No Sweep"
  };

  return labels[code] || code;
}

function positionTreatmentLabel(
  treatment,
  basePosition = "",
  effectivePosition = ""
) {
  if (treatment === "nativeP2") {
    return `${basePosition || "P3"} → 原生P2`;
  }

  if (treatment === "p2Effective") {
    return `${basePosition || "P3"} → P2-effective`;
  }

  return `原生${effectivePosition || basePosition || "未記錄"}`;
}

function evaluateBaseTrigger() {
  const selectedSetupType =
    setupTypeFromTemplate(false);

  const variant =
    setupVariant(false);

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
  const microStructureShift =
    checked("microStructureShift");

  const validBreakout =
    checked("validBreakout");
  const validAcceptance =
    checked("validAcceptance");
  const firstRetest =
    variant === "trendPullback"
      ? checked("trendFirstRetest")
      : checked("firstRetest");
  const breakoutQuality =
    $("breakoutQuality").value;

  const fullRepairComplete =
    checked("fullRepairComplete");
  const fullRepairAsiaSweep =
    checked("fullRepairAsiaSweep");
  const fullRepairEntryOutside =
    checked("fullRepairEntryOutside");
  const fullRepairAcceptedBackInside =
    checked(
      "fullRepairAcceptedBackInside"
    );

  const postOpenAsiaSweep =
    checked("postOpenAsiaSweep");
  const postOpenAfterOpen =
    checked("postOpenAfterOpen");
  const postOpenDriveConfirmed =
    checked("postOpenDriveConfirmed");
  const postOpenPreOpenEntry =
    checked("postOpenPreOpenEntry");

  const openingDriveStatus =
    $("openingDriveStatus").value;

  const noSweepRejection =
    checked("noSweepRejection");
  const strongTrendContext =
    checked("strongTrendContext");
  const trueStructureRetest =
    checked("trueStructureRetest");

  const retestQuality =
    $("retestQuality").value;
  const tradeSpace =
    $("tradeSpace").value;

  const addCoreFailure = (text) => {
    coreFailures.push(text);
  };

  const addImperfection = (text) => {
    imperfections.push(text);
  };

  const addPositive = (text) => {
    positives.push(text);
  };

  const evaluateSweepCore = () => {
    if (!validSweep) {
      addCoreFailure(
        "冇有效Sweep。"
      );
    } else {
      addPositive(
        "有效Sweep成立。"
      );
    }

    if (!validReclaim) {
      addCoreFailure(
        "冇有效Reclaim。"
      );
    } else {
      addPositive(
        "有效Reclaim成立。"
      );
    }

    if (
      reclaimQuality === "negated"
    ) {
      addCoreFailure(
        "Reclaim被吞噬／否定。"
      );
    } else if (
      reclaimQuality === "ordinary"
    ) {
      addImperfection(
        "Sweep／Reclaim有效，但質素處於邊緣。"
      );
    } else {
      addPositive(
        "Sweep／Reclaim乾淨明確。"
      );
    }

    if (!microStructureShift) {
      addImperfection(
        "未見清晰微結構突破／控制權轉移。"
      );
    } else {
      addPositive(
        "微結構突破／控制權轉移成立。"
      );
    }
  };

  const evaluateBreakoutCore = ({
    acceptanceRequired = true
  } = {}) => {
    if (!validBreakout) {
      addCoreFailure(
        "冇有效Breakout／結構突破。"
      );
    } else {
      addPositive(
        "有效Breakout／結構突破成立。"
      );
    }

    if (acceptanceRequired) {
      if (!validAcceptance) {
        addCoreFailure(
          "Breakout後冇有效Acceptance。"
        );
      } else {
        addPositive(
          "Breakout後Acceptance成立。"
        );
      }
    } else if (validAcceptance) {
      addPositive(
        "開市後推進有額外Acceptance支持。"
      );
    }

    if (!firstRetest) {
      addCoreFailure(
        "唔係同一Opening Drive第一次實質Retest。"
      );
    } else {
      addPositive(
        "同一Opening Drive第一次實質Retest成立。"
      );
    }

    if (
      breakoutQuality === "negated"
    ) {
      addCoreFailure(
        "Opening Drive被吞噬／重新Acceptance返原Range。"
      );
    } else if (
      breakoutQuality === "ordinary"
    ) {
      addImperfection(
        "Opening Drive／Acceptance只屬合格，Follow-through普通。"
      );
    } else {
      addPositive(
        "Opening Drive／Acceptance乾淨明確。"
      );
    }

    if (!microStructureShift) {
      if (acceptanceRequired) {
        addImperfection(
          "控制權轉移／微結構確認未完整。"
        );
      } else {
        addCoreFailure(
          "EU-D未破微結構／工作結構。"
        );
      }
    } else {
      addPositive(
        "控制權轉移／微結構確認成立。"
      );
    }
  };

  const evaluateOpeningDriveValidity = () => {
    if (
      openingDriveStatus === "expired"
    ) {
      addCoreFailure(
        "Opening Drive已過期。"
      );
    } else if (
      openingDriveStatus === "delayed"
    ) {
      addPositive(
        "延遲Setup仍屬原Opening Story；Entry-time Q必須按成交落法重新評估。"
      );
    } else {
      addPositive(
        "同一Opening Drive仍新鮮。"
      );
    }
  };

  if (
    variant === "session2B" ||
    variant === "sweep" ||
    variant === "p1ReversalSweep"
  ) {
    evaluateSweepCore();
  } else if (
    variant === "breakout"
  ) {
    evaluateBreakoutCore();
  } else if (
    variant === "fullRepairAsia" ||
    variant === "fullRepairPure"
  ) {
    if (!fullRepairComplete) {
      addCoreFailure(
        "完整POR Full Repair未完成。"
      );
    } else {
      addPositive(
        "完整POR Full Repair成立。"
      );
    }

    if (
      variant ===
        "fullRepairAsia" &&
      !fullRepairAsiaSweep
    ) {
      addCoreFailure(
        "EU-B缺少POR期間Asia H／L Sweep。"
      );
    } else if (
      variant ===
      "fullRepairAsia"
    ) {
      addPositive(
        "POR期間Asia Sweep成立。"
      );
    }

    evaluateBreakoutCore();

    if (!fullRepairEntryOutside) {
      addCoreFailure(
        "Full Repair入場未企穩POR外側；成交前未重新Reclaim POR邊界。"
      );
    } else {
      addPositive(
        "入場位位於POR外側。"
      );
    }

    if (
      fullRepairAcceptedBackInside
    ) {
      addCoreFailure(
        "價格已喺POR內重新形成Acceptance，Full Repair失效。"
      );
    }

    evaluateOpeningDriveValidity();
  } else if (
    variant === "postOpenConfirmation"
  ) {
    if (!postOpenAsiaSweep) {
      addCoreFailure(
        "EU-D缺少POR期間Asia H／L Sweep背景。"
      );
    } else {
      addPositive(
        "POR期間Asia Sweep背景成立。"
      );
    }

    if (!postOpenAfterOpen) {
      addCoreFailure(
        "EU-D必須等正式開市後確認。"
      );
    } else {
      addPositive(
        "正式現貨開市後確認成立。"
      );
    }

    if (!postOpenDriveConfirmed) {
      addCoreFailure(
        "Opening Drive未確認。"
      );
    } else {
      addPositive(
        "開市後Opening Drive方向清楚。"
      );
    }

    if (postOpenPreOpenEntry) {
      addCoreFailure(
        "開市前Asia 2B不做。"
      );
    }

    evaluateBreakoutCore({
      acceptanceRequired: false
    });
    evaluateOpeningDriveValidity();
  } else if (
    variant === "p1NoSweep"
  ) {
    if (!noSweepRejection) {
      addCoreFailure(
        "No-Sweep Setup缺少真正P1 Rejection。"
      );
    } else {
      addPositive(
        "真正P1 Rejection成立。"
      );
    }

    if (!microStructureShift) {
      addCoreFailure(
        "No-Sweep Setup缺少右側微結構轉向確認。"
      );
    } else {
      addPositive(
        "右側微結構轉向確認成立。"
      );
    }
  } else if (
    variant === "trendPullback"
  ) {
    if (!strongTrendContext) {
      addCoreFailure(
        "未確認強趨勢Context。"
      );
    } else {
      addPositive(
        "強趨勢Context成立。"
      );
    }

    if (!trueStructureRetest) {
      addCoreFailure(
        "Pullback未回到真正結構。"
      );
    } else {
      addPositive(
        "Pullback回到真正結構。"
      );
    }

    if (!firstRetest) {
      addCoreFailure(
        "唔係第一次Retest。"
      );
    } else {
      addPositive(
        "第一次Retest成立。"
      );
    }

    if (!microStructureShift) {
      addImperfection(
        "右側控制權確認未完整。"
      );
    } else {
      addPositive(
        "右側控制權確認成立。"
      );
    }
  }

  if (
    retestQuality === "invalid"
  ) {
    addCoreFailure(
      "Retest快、深、強，已否定Setup。"
    );
  } else if (
    retestQuality === "imperfect"
  ) {
    addImperfection(
      "Retest稍快／稍深／稍強，但故事未失效。"
    );
  } else {
    addPositive(
      "Retest明顯弱過Reclaim／Opening Drive。"
    );
  }

  if (
    tradeSpace === "insufficient"
  ) {
    failures.push(
      "第一真實障礙不足1R。"
    );
  } else if (
    tradeSpace === "managed"
  ) {
    addPositive(
      "第一障礙介乎1R至2R；由Obstacle階段判斷RF-managed／部分食糊資格，唔自動降低Q。"
    );
  } else {
    addPositive(
      "第一真實障礙至少2R。"
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
      imperfections.length === 0
        ? "Q3"
        : "Q2";
  }

  const typeAUpgradeable =
    selectedSetupType === "A" &&
    isDesignatedTypeASetup(false) &&
    quality === "Q2" &&
    validSweep &&
    validReclaim &&
    microStructureShift &&
    reclaimQuality === "ordinary" &&
    retestQuality === "weak" &&
    tradeSpace !== "insufficient" &&
    failures.length === 0 &&
    imperfections.length === 1;

  let typeAUpgradeReason =
    "目前唔屬於Type A Q2→Q3修正情況。";

  if (quality === "Q2") {
    if (
      selectedSetupType !== "A" ||
      !isDesignatedTypeASetup(false)
    ) {
      typeAUpgradeReason =
        "只有指定市場嘅高質Session 2B先有Type A Q修正。";
    } else if (
      !validSweep ||
      !validReclaim ||
      failures.length > 0
    ) {
      typeAUpgradeReason =
        "Setup核心確認未完整，Type A唔可以救返。";
    } else if (
      !microStructureShift
    ) {
      typeAUpgradeReason =
        "缺少微結構突破／控制權轉移；唔係單純Reclaim邊緣。";
    } else if (
      retestQuality !== "weak"
    ) {
      typeAUpgradeReason =
        "Q2包含Retest瑕疵；Type A只可以修正Sweep／Reclaim質素邊緣。";
    } else if (
      tradeSpace === "insufficient"
    ) {
      typeAUpgradeReason =
        "第一障礙不足1R；Type A唔可以救。";
    } else if (
      reclaimQuality !== "ordinary"
    ) {
      typeAUpgradeReason =
        "Q2原因唔係單純Sweep／Reclaim質素邊緣。";
    } else if (
      imperfections.length !== 1
    ) {
      typeAUpgradeReason =
        "Q2有多過一項瑕疵，唔符合單一Reclaim邊緣修正。";
    } else {
      typeAUpgradeReason =
        "基礎Q2唯一問題係Sweep／Reclaim質素邊緣，符合Type A Q3待遇。";
    }
  }

  return {
    model:
      variant,
    modelLabel:
      triggerModelLabel(),
    selectedSetupType,
    setupTemplate:
      setupTemplateCode(false),
    setupTemplateLabel:
      setupDefinition(false).label,
    variant,
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
    microStructureShift,
    validBreakout,
    validAcceptance,
    firstRetest,
    breakoutQuality,
    fullRepairComplete,
    fullRepairAsiaSweep,
    fullRepairEntryOutside,
    fullRepairAcceptedBackInside,
    postOpenAsiaSweep,
    postOpenAfterOpen,
    postOpenDriveConfirmed,
    postOpenPreOpenEntry,
    openingDriveStatus,
    noSweepRejection,
    noSweepMicroBreak:
      microStructureShift,
    strongTrendContext,
    trueStructureRetest,
    retestQuality,
    typeAUpgradeable,
    typeAUpgradeReason,
    modelCoreValid:
      coreFailures.length === 0
  };
}

function evaluateAsia2B(baseTrigger) {
  const selectedSetupType =
    setupTypeFromTemplate(false);

  const definition =
    setupDefinition(false);

  const variant =
    setupVariant(false);

  const basePosition =
    $("positionLevel").value;

  let effectivePosition =
    basePosition;
  let effectiveQuality =
    baseTrigger.quality;

  let positionPromoted = false;
  let nativeP2Applied = false;
  let positionTreatment =
    "native";
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

  const designatedTypeA =
    isDesignatedTypeASetup(false);

  const highQuality =
    selectedSetupType === "A" &&
    designatedTypeA &&
    directionMatches &&
    criteriaCount >= 5;

  let effectiveSetupType =
    selectedSetupType;

  if (
    selectedSetupType === "A" &&
    !highQuality
  ) {
    effectiveSetupType = "B";

    if (!designatedTypeA) {
      warnings.push(
        "Type A只限HSI OPR 2B、FX／XAU Asia／OPR 2B、UK100／GER40正式開市後POR 2B。Asia 2B during POR已刪除，今次按Type B處理。"
      );
    } else {
      warnings.push(
        `Type A候選只符合${criteriaCount}/6項或者方向唔一致；未達高質，今次按Type B處理。`
      );
    }
  }

  if (
    effectiveSetupType === "A"
  ) {
    if (
      basePosition === "P3"
    ) {
      effectivePosition = "P2";
      positionPromoted = true;
      positionTreatment =
        "p2Effective";
      reasons.push(
        "高質Type A Session 2B：原始P3獲P2-effective待遇；原始P級仍記P3。"
      );
    } else if (
      basePosition === "P2"
    ) {
      reasons.push(
        "Type A強化執行Edge，但實際P2唔會升P1。"
      );
    } else if (
      basePosition === "P4"
    ) {
      warnings.push(
        "Type A唔可以救P4。"
      );
    }

    if (
      baseTrigger.typeAUpgradeable
    ) {
      effectiveQuality = "Q3";
      triggerPromoted = true;
      reasons.push(
        "Type A：基礎Q2唯一瑕疵係Sweep／Reclaim質素邊緣，獲Q3待遇。"
      );
    } else if (
      baseTrigger.quality === "Q2"
    ) {
      warnings.push(
        `今次Q維持Q2：${baseTrigger.typeAUpgradeReason}`
      );
    }
  }

  if (
    effectiveSetupType === "B"
  ) {
    reasons.push(
      "Type B普通Sweep＋Reclaim：冇自動P／Q升級。"
    );
  }

  if (
    effectiveSetupType === "C"
  ) {
    const setupCoreValid =
      baseTrigger.modelCoreValid &&
      baseTrigger.quality !== "Q1";

    if (
      variant === "fullRepairAsia" ||
      variant === "fullRepairPure"
    ) {
      if (
        setupCoreValid &&
        basePosition === "P3"
      ) {
        effectivePosition = "P2";
        nativeP2Applied = true;
        positionTreatment =
          "nativeP2";
        reasons.push(
          "EU-B／EU-C完整Full Repair已創造Breakout＋Acceptance＋首次Retest結構：即使原先揀P3，最終按原生P2處理。"
        );
      } else if (
        basePosition === "P1" ||
        basePosition === "P2"
      ) {
        reasons.push(
          `EU-B／EU-C按實際結構維持${basePosition}；Full Repair唔會將P2再升P1。`
        );
      } else if (
        basePosition === "P4"
      ) {
        warnings.push(
          "EU-B／EU-C唔可以救P4；完整Full Repair亦要有可交易位置。"
        );
      }

      reasons.push(
        "Asia Sweep只增加EU-B故事完整性，唔會額外升P或升Q。"
      );
    } else if (
      variant ===
        "postOpenConfirmation"
    ) {
      if (
        setupCoreValid &&
        basePosition === "P3"
      ) {
        effectivePosition = "P2";
        positionPromoted = true;
        positionTreatment =
          "p2Effective";
        reasons.push(
          "完整EU-D＝Asia Sweep＋正式開市後Opening Drive確認＋第一次弱Retest：普通P3獲P2-effective待遇。"
        );
      } else if (
        basePosition === "P2" ||
        basePosition === "P1"
      ) {
        reasons.push(
          `EU-D實際入場已有真實Breakout／Swap結構：維持原生${basePosition}，唔會再加一級。`
        );
      } else if (
        basePosition === "P4"
      ) {
        warnings.push(
          "EU-D唔可以救P4。"
        );
      }

      reasons.push(
        "EU-D只可揀一種P來源：原生P1／P2，或者原始P3取得P2-effective；Asia Sweep、Opening Drive同0.618唔可以逐項重複計分。"
      );
      reasons.push(
        "EU-D嘅P2-effective只處理位置待遇；唔會因Asia Sweep額外升Q，亦唔會創造方向權限。"
      );
    } else if (
      variant === "breakout"
    ) {
      reasons.push(
        "Breakout＋Acceptance＋第一次Retest可構成原生P2；實際改變主判狀態時可按P1。"
      );
    } else {
      reasons.push(
        "No-Sweep Setup：只限真正P1、有效Breakout首次Retest或強趨勢回到真實結構。"
      );
    }
  }

  const sessionLabel =
    definition.liquidityLabel ||
    "指定Session H／L";

  const setupLabel =
    selectedSetupType === "A"
      ? type === "asiaTop"
        ? `Sweep ${sessionLabel}頂｜偏Short`
        : `Sweep ${sessionLabel}底｜偏Long`
      : definition.label;

  return {
    type:
      selectedSetupType === "A"
        ? type
        : "none",
    label:
      setupLabel,
    selectedSetupType,
    effectiveSetupType,
    effectiveSetupTypeLabel:
      setupTypeLabel(
        effectiveSetupType
      ),
    setupTemplate:
      setupTemplateCode(false),
    setupTemplateLabel:
      definition.label,
    setupVariant:
      variant,
    active:
      selectedSetupType === "A",
    designatedTypeA,
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
    nativeP2Applied,
    positionTreatment,
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
    ) return 1;

    if (
      (
        position === "P1" ||
        position === "P2"
      ) &&
      quality === "Q2"
    ) return 0.5;

    if (
      position === "P3" &&
      quality === "Q3"
    ) return 0.5;

    if (
      position === "P3" &&
      quality === "Q2"
    ) return 0.25;

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
    ) return 0.5;

    if (
      (
        position === "P1" ||
        position === "P2"
      ) &&
      quality === "Q2"
    ) return 0.25;

    if (
      position === "P3" &&
      quality === "Q3"
    ) {
      return options
        .p3AlignedTestable === false
          ? 0
          : 0.25;
    }

    return 0;
  }

  if (
    routeCode ===
    "alignedReverse"
  ) {
    if (
      options.htfP1ReversalEligible &&
      (
        options.basePosition === "P1" ||
        options.basePosition === "P2"
      ) &&
      quality === "Q3"
    ) {
      return 0.25;
    }

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
    ) return 0.5;

    if (
      (
        position === "P1" ||
        position === "P2"
      ) &&
      quality === "Q2"
    ) return 0.25;

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
    ) return 0.5;

    if (
      position === "P1" &&
      quality === "Q2"
    ) return 0.25;

    if (
      position === "P2" &&
      quality === "Q3" &&
      options.counterP2Eligible
    ) return 0.25;

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
    ) return 0.25;

    return 0;
  }

  if (
    routeCode ===
    "bothTransition"
  ) {
    if (
      position === "P1" &&
      quality === "Q3"
    ) return 0.5;

    if (
      position === "P1" &&
      quality === "Q2"
    ) return 0.25;

    if (
      position === "P2" &&
      quality === "Q3"
    ) return 0.25;

    if (
      position === "P3" &&
      quality === "Q3"
    ) {
      return options
        .bothTransitionP3Testable
          ? 0.25
          : 0;
    }

    return 0;
  }

  return 0;
}

function counterP2EligibilityInfo(
  positionOverride = null
) {
  const route =
    marketRouteInfo();

  const mainState =
    $("mainState").value;

  const position =
    positionOverride ||
    $("positionLevel").value;

  if (
    route.code !==
      "conflictSecondary" ||
    position !== "P2"
  ) {
    return {
      eligible: false,
      basis: "none",
      reason:
        "逆主判P2特殊資格目前不適用。"
    };
  }

  if (
    isHealthy(mainState)
  ) {
    if (
      $("p1BackgroundTailwind")
        .value === "valid"
    ) {
      return {
        eligible: true,
        basis:
          "healthyTailwind",
        reason:
          "主判健康＋有效P1順風＋P2＋Q3：逆主判P2最高0.25。"
      };
    }

    return {
      eligible: false,
      basis: "none",
      reason:
        "主判健康：逆向P2必須有仍有效P1順風。"
    };
  }

  if (
    isWeak(mainState)
  ) {
    if (
      checked(
        "counterP2WeakBreakRetest"
      )
    ) {
      return {
        eligible: true,
        basis:
          "weakBreakRetest",
        reason:
          "主判弱勢＋主判次結有效突破＋首次Retest＋P2＋Q3：最高0.25。"
      };
    }

    return {
      eligible: false,
      basis: "none",
      reason:
        "主判弱勢：逆向P2要先有主判次結有效突破＋第一次Retest。"
    };
  }

  return {
    eligible: false,
    basis: "none",
    reason:
      "主判唔係健康／弱勢Trend，逆主判P2資格不適用。"
  };
}

function htfP1ReversalExceptionInfo(
  baseTrigger,
  basePosition,
  effectiveQuality
) {
  const route =
    marketRouteInfo();

  if (
    route.code !==
    "alignedReverse"
  ) {
    return {
      eligible: false,
      reason:
        "窄義HTF P1反轉例外目前不適用。"
    };
  }

  if (
    !checked(
      "htfP1ReversalException"
    )
  ) {
    return {
      eligible: false,
      reason:
        "方向權限為0；未確認窄義HTF P1反轉例外。"
    };
  }

  const nativePositionOk =
    basePosition === "P1" ||
    basePosition === "P2";

  const triggerOk =
    effectiveQuality === "Q3" &&
    baseTrigger.validSweep &&
    baseTrigger.validReclaim &&
    baseTrigger.microStructureShift &&
    baseTrigger.tradeSpace !==
      "insufficient";

  const fresh =
    $("p1BackgroundTailwind")
      .value === "valid";

  if (
    nativePositionOk &&
    triggerOk &&
    fresh
  ) {
    return {
      eligible: true,
      reason:
        "窄義HTF P1反轉例外成立：原生至少P2＋Q3＋Sweep／Reclaim／微結構轉向＋第一段新鮮反應，最高0.25 Probe。"
    };
  }

  return {
    eligible: false,
    reason:
      "例外未完整：必須原生至少P2、Q3、Sweep＋Reclaim＋微結構轉向、P1第一段反應仍有效，而且空間足夠。Type A P3→P2-effective唔會創造方向權限。"
  };
}

function currentMatrixOptions(
  effectivePosition = null,
  baseTrigger = null,
  effectiveQuality = "Q1",
  basePosition = null
) {
  const originalPosition =
    basePosition ||
    $("positionLevel").value;

  const trigger =
    baseTrigger ||
    currentBaseTrigger || {
      validSweep: false,
      validReclaim: false,
      microStructureShift: false,
      tradeSpace: "insufficient"
    };

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
      ),
    bothTransitionP3Testable:
      checked(
        "bothTransitionP3Testable"
      ),
    htfP1ReversalEligible:
      htfP1ReversalExceptionInfo(
        trigger,
        originalPosition,
        effectiveQuality
      ).eligible,
    basePosition:
      originalPosition
  };
}

function applySetupMatrixConstraint(
  size,
  setupResult
) {
  const variant =
    setupResult.setupVariant;

  const basePosition =
    setupResult.basePosition;

  const effectivePosition =
    setupResult.effectivePosition;

  const quality =
    setupResult.effectiveQuality;

  if (
    setupResult.effectiveSetupType !==
      "C" &&
    variant !==
      "p1ReversalSweep"
  ) {
    return {
      size,
      reason:
        "Setup類型冇額外位置限制。"
    };
  }

  if (
    variant === "breakout" ||
    variant === "fullRepairAsia" ||
    variant === "fullRepairPure"
  ) {
    if (
      effectivePosition === "P1" ||
      effectivePosition === "P2"
    ) {
      return {
        size,
        reason:
          setupResult.nativeP2Applied
            ? "EU-B／EU-C完整Full Repair按原生P2處理。"
            : "Breakout／Full Repair原生P1／P2位置有效。"
      };
    }

    return {
      size: 0,
      reason:
        "Breakout／Full Repair未形成可交易原生P2／P1，或者實際位置係P4。"
    };
  }

  if (
    variant ===
      "postOpenConfirmation"
  ) {
    const allowed =
      effectivePosition === "P1" ||
      effectivePosition === "P2";

    return {
      size:
        allowed
          ? size
          : 0,
      reason:
        allowed
          ? setupResult.positionPromoted
            ? "完整EU-D：原始P3獲P2-effective待遇。"
            : `EU-D按實際結構維持原生${effectivePosition}。`
          : "EU-D必須係原生P1／P2，或者由完整Setup將P3取得P2-effective；P4不做。"
    };
  }

  if (
    variant ===
    "p1NoSweep"
  ) {
    return {
      size:
        basePosition === "P1"
          ? size
          : 0,
      reason:
        basePosition === "P1"
          ? "No-Sweep P1反轉位置有效。"
          : "普通P2／P3 No-Sweep一般不做；只限真正P1。"
    };
  }

  if (
    variant ===
    "trendPullback"
  ) {
    const allowed =
      basePosition === "P1" ||
      (
        basePosition === "P2" &&
        quality === "Q3"
      );

    return {
      size:
        allowed
          ? size
          : 0,
      reason:
        allowed
          ? "強趨勢Pullback回到真正P1／P2結構，位置有效。"
          : "強趨勢No-Sweep Pullback只限真實P1，或原生P2＋Q3。"
    };
  }

  if (
    variant ===
    "p1ReversalSweep"
  ) {
    return {
      size:
        basePosition === "P1"
          ? size
          : 0,
      reason:
        basePosition === "P1"
          ? "P1反轉Setup位置有效。"
          : "FX-D P1反轉Setup只限Daily／4H真正P1位置。"
    };
  }

  return {
    size,
    reason:
      "Setup位置限制維持原Matrix。"
  };
}

function evaluateMatrix(
  effectivePosition,
  effectiveQuality,
  effectiveSetupType = "B",
  setupResult = null,
  baseTrigger = null
) {
  const route =
    marketRouteInfo();

  const resolvedSetup =
    setupResult || {
      effectiveSetupType,
      setupVariant:
        setupVariant(false),
      basePosition:
        $("positionLevel").value,
      effectivePosition,
      effectiveQuality
    };

  const options =
    currentMatrixOptions(
      effectivePosition,
      baseTrigger,
      effectiveQuality,
      resolvedSetup.basePosition
    );

  let marketCap =
    route.cap;

  if (
    route.code ===
      "alignedReverse" &&
    options
      .htfP1ReversalEligible
  ) {
    marketCap = 0.25;
  }

  const rawCell =
    matrixCell(
      route.code,
      effectivePosition,
      effectiveQuality,
      options
    );

  const constrained =
    applySetupMatrixConstraint(
      rawCell,
      resolvedSetup
    );

  const size =
    Math.min(
      constrained.size,
      marketCap
    );

  const combination =
    `${effectivePosition}＋${effectiveQuality}`;

  let cellExplanation =
    `${route.label}；${combination}按市場關係Matrix為${SIZE_LABELS[rawCell]}。${constrained.reason}`;

  if (
    route.code ===
    "alignedReverse"
  ) {
    cellExplanation =
      options
        .htfP1ReversalEligible
        ? `正常方向權限為0，但窄義HTF P1反轉例外完整成立；${combination}最高0.25 Probe。`
        : `反共同方向正常0注。${htfP1ReversalExceptionInfo(
            baseTrigger ||
            currentBaseTrigger,
            resolvedSetup.basePosition,
            effectiveQuality
          ).reason}`;
  } else if (
    route.code ===
      "conflictSecondary" &&
    effectivePosition === "P2"
  ) {
    cellExplanation =
      counterP2EligibilityInfo(
        effectivePosition
      ).eligible
        ? `逆主判P2特殊資格成立；${combination}最高0.25。`
        : `逆主判P2正常0。${counterP2EligibilityInfo(
            effectivePosition
          ).reason}`;
  } else if (
    route.code ===
      "conflictSecondary" &&
    effectivePosition === "P1"
  ) {
    cellExplanation =
      `${route.label}：P1 Q3最高0.5；P1 Q2最高0.25。`;
  } else if (
    route.code ===
      "transitionReverse"
  ) {
    cellExplanation =
      `主判Transition而逆次判已確認方向，只限Transition層真正P1＋Q3，最高0.25。`;
  } else if (
    route.code ===
      "bothTransition"
  ) {
    cellExplanation =
      `雙轉換／Range：P1 Q3＝0.5、P1 Q2＝0.25、P2 Q3＝0.25；P3 Q3只限明確邊界測試。`;
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
    marketCap,
    mode:
      route.code,
    route:
      route.label,
    rawCellSize:
      rawCell,
    size,
    setupConstraintReason:
      constrained.reason,
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

function firstObstacleRValue() {
  const value =
    Number(
      $("firstObstacleR").value
    );

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function obstacleBandFromR(
  firstObstacleR,
  insideMajorObstacle = false
) {
  if (insideMajorObstacle) {
    return "inside";
  }

  if (firstObstacleR < 1) {
    return "veto";
  }

  if (firstObstacleR < 1.5) {
    return "partial";
  }

  if (firstObstacleR < 2) {
    return "rfManaged";
  }

  return "standard";
}

function obstacleBandLabel(state) {
  const labels = {
    standard:
      "≥2R｜標準模式",
    rfManaged:
      "1.5R–2R｜RF-managed",
    partial:
      "1R–1.5R｜頂級Setup部分食糊",
    veto:
      "<1R｜Hard Veto",
    inside:
      "重大障礙區內｜Continuation上限"
  };

  return labels[state] || state;
}

function obstacleManagementLabel(state) {
  const labels = {
    standard:
      "固定2R TP",
    rfManaged:
      "到障礙推RF，再博2R",
    partial:
      "30%–50%障礙前食糊，餘倉推RF",
    veto:
      "不開新倉",
    inside:
      "套重大障礙區Continuation上限"
  };

  return labels[state] || state;
}

function applyObstacle(
  matrixSize,
  position,
  quality
) {
  const firstObstacleR =
    firstObstacleRValue();

  const inside =
    checked(
      "insideMajorObstacle"
    );

  const state =
    obstacleBandFromR(
      firstObstacleR,
      inside
    );

  const kind =
    $("obstacleKind").value;

  const hardTreatment =
    $("hardObstacleTreatment")
      .value;

  const routeCode =
    marketRouteInfo().code;

  const result = (
    adjustedSize,
    explanation,
    management,
    {
      eligible = true,
      hardVeto = false,
      reason = ""
    } = {}
  ) => ({
    state,
    firstObstacleR,
    kind,
    hardTreatment,
    adjustedSize,
    explanation,
    management,
    managementMode:
      state,
    eligible,
    hardVeto,
    reason
  });

  if (state === "inside") {
    const obstacleCap =
      insideObstacleCap(
        position,
        quality
      );

    const adjusted =
      Math.min(
        matrixSize,
        obstacleCap
      );

    return result(
      adjusted,
      `已身處重大障礙區內做Continuation：${position}＋${quality}上限${SIZE_LABELS[obstacleCap]}；由${SIZE_LABELS[matrixSize]}修正至${SIZE_LABELS[adjusted]}。`,
      "只做高質Continuation；P1 Q3最多0.5、P2 Q3最多0.25、P3／P4不做。"
    );
  }

  if (state === "veto") {
    return result(
      0,
      `第一真實障礙只有${firstObstacleR.toFixed(2)}R，低於1R。`,
      "Hard Veto：不開新倉。",
      {
        eligible: false,
        hardVeto: true,
        reason:
          "第一真實障礙不足1R。"
      }
    );
  }

  if (state === "standard") {
    return result(
      matrixSize,
      `第一真實障礙為${firstObstacleR.toFixed(2)}R，至少2R；維持${SIZE_LABELS[matrixSize]}。`,
      "標準模式：固定2R TP，唔因障礙降注。"
    );
  }

  if (state === "rfManaged") {
    const pqEligible =
      (
        (
          position === "P1" ||
          position === "P2"
        ) &&
        quality === "Q3"
      ) ||
      (
        position === "P1" &&
        quality === "Q2"
      );

    const spaceBeyond =
      checked(
        "obstacleSpaceBeyond"
      );

    const rfPlan =
      checked(
        "obstacleRFPlan"
      );

    const partialPlan =
      checked(
        "obstaclePartialPlan"
      );

    if (!pqEligible) {
      return result(
        0,
        `${firstObstacleR.toFixed(2)}R屬RF-managed區，但位置／Q未達P1／P2 Q3或P1 Q2。`,
        "資格不足，唔開新倉。",
        {
          eligible: false,
          hardVeto: true,
          reason:
            "1.5R–2R管理模式嘅P／Q資格不足。"
        }
      );
    }

    if (kind === "soft") {
      if (
        !spaceBeyond ||
        !rfPlan
      ) {
        return result(
          0,
          `${firstObstacleR.toFixed(2)}R屬軟障礙RF-managed區，但未確認障礙後2R空間及推RF計劃。`,
          "管理條件未完整，唔開新倉。",
          {
            eligible: false,
            hardVeto: true,
            reason:
              "RF-managed模式未預先確認2R空間／推RF計劃。"
          }
        );
      }

      return result(
        matrixSize,
        `${firstObstacleR.toFixed(2)}R軟障礙符合RF-managed條件；注碼維持${SIZE_LABELS[matrixSize]}。`,
        "到障礙推RF，再繼續博2R；必須獨立標記回測。"
      );
    }

    if (hardTreatment === "skip") {
      return result(
        0,
        `${firstObstacleR.toFixed(2)}R為硬障礙，而且突破障礙係交易必要條件。`,
        "直接Skip。",
        {
          eligible: false,
          hardVeto: true,
          reason:
            "硬障礙必須突破先成立。"
        }
      );
    }

    if (
      hardTreatment === "partial"
    ) {
      if (!partialPlan) {
        return result(
          0,
          "硬障礙選擇部分食糊，但未確認部分食糊計劃。",
          "管理條件未完整，唔開新倉。",
          {
            eligible: false,
            hardVeto: true,
            reason:
              "硬障礙部分食糊計劃未完整。"
          }
        );
      }

      return result(
        matrixSize,
        `${firstObstacleR.toFixed(2)}R為硬障礙；按部分食糊方案，注碼維持${SIZE_LABELS[matrixSize]}。`,
        "障礙前部分食糊，餘倉推RF；唔假設必然突破硬障礙。"
      );
    }

    if (
      !spaceBeyond ||
      !rfPlan
    ) {
      return result(
        0,
        "硬障礙選擇降注，但未確認障礙後2R空間及推RF計劃。",
        "管理條件未完整，唔開新倉。",
        {
          eligible: false,
          hardVeto: true,
          reason:
            "硬障礙降注＋RF管理條件未完整。"
        }
      );
    }

    const adjusted =
      downgradeOneLevel(
        matrixSize
      );

    return result(
      adjusted,
      `${firstObstacleR.toFixed(2)}R為硬障礙；注碼降一級：${SIZE_LABELS[matrixSize]} → ${SIZE_LABELS[adjusted]}。`,
      "降注後到障礙推RF，再評估是否延伸至2R。"
    );
  }

  const topContext =
    routeCode ===
      "healthyAligned" ||
    checked(
      "obstacleClearTransition"
    );

  const eligible =
    position === "P1" &&
    quality === "Q3" &&
    kind === "soft" &&
    topContext &&
    checked(
      "obstaclePartialPlan"
    );

  if (!eligible) {
    return result(
      0,
      `${firstObstacleR.toFixed(2)}R只容許P1＋Q3、健康同向／明確結構轉換、軟障礙及已寫明部分食糊方案。`,
      "頂級Setup資格未完整，唔開新倉。",
      {
        eligible: false,
        hardVeto: true,
        reason:
          "1R–1.5R模式未符合頂級Setup全部條件。"
      }
    );
  }

  return result(
    matrixSize,
    `${firstObstacleR.toFixed(2)}R屬1R–1.5R軟障礙頂級Setup；注碼維持${SIZE_LABELS[matrixSize]}，但必須部分食糊。`,
    "30%–50%喺障礙食糊，餘倉推RF，再博2R。"
  );
}

function evaluateHardVeto(
  effectivePosition,
  baseTrigger,
  setupResult,
  obstacle
) {
  const vetoes = [];

  if (
    effectivePosition === "P4" ||
    checked("chasedBreakout")
  ) {
    vetoes.push(
      "P4／Range中間／追價。"
    );
  }

  if (
    !baseTrigger.modelCoreValid
  ) {
    vetoes.push(
      "Setup核心確認失敗：冇有效Sweep／Reclaim，或者冇有效Breakout＋Acceptance Setup。"
    );
  }

  if (
    baseTrigger.retestQuality ===
    "invalid"
  ) {
    vetoes.push(
      "Retest快＋深＋強，已否定原本Reclaim／Opening Drive。"
    );
  }

  if (
    obstacle?.hardVeto
  ) {
    vetoes.push(
      obstacle.reason ||
      "第一真實障礙管理條件未符合。"
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

  if (
    setupResult.setupVariant ===
      "p1ReversalSweep" &&
    setupResult.basePosition !==
      "P1"
  ) {
    vetoes.push(
      "P1反轉Setup唔係真正P1位置。"
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
      setupResult.effectiveSetupType,
      setupResult,
      baseTrigger
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
      setupResult,
      obstacle
    );

  const reasons = [
    ...setupResult.reasons,
    `① 方向權限／市場關係：${matrix.routeLabel}。${matrix.routeReason}`,
    `② 市場關係注碼上限：${SIZE_LABELS[matrix.marketCap]}。`,
    `③ 位置P：原始${setupResult.basePosition}；執行待遇${setupResult.effectivePosition}。`,
    `④ Setup：${setupResult.setupTemplateLabel}；${setupResult.effectiveSetupTypeLabel}。`,
    `⑤ Trigger Q：基礎${baseTrigger.quality}；Setup修正後${setupResult.effectiveQuality}。`,
    `⑥ P × Q／方向Matrix：${matrix.cellExplanation}`,
    `⑦ Range 25%：${range.explanation}`,
    `⑧ 第一真實障礙／R:R：${obstacle.explanation}`
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
      htfP1ReversalExceptionInfo(
        baseTrigger,
        setupResult.basePosition,
        setupResult.effectiveQuality
      ).reason
    );
  }

  if (
    matrix.routeCode ===
    "conflictSecondary"
  ) {
    warnings.push(
      `順次判、逆主判：P1 Q3最高0.5、P1 Q2最高0.25；P2 Q3要額外資格。${counterP2EligibilityInfo(
        setupResult.effectivePosition
      ).reason}`
    );
  }

  if (
    matrix.routeCode ===
    "bothTransition"
  ) {
    warnings.push(
      "雙轉換／Range只做邊界；Range中間固定0。"
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
      "Entry zone同HTF真實價格結構有直接交集；重新檢查原始P級是否應列P1。"
    );
  }

  if (
    $("p1BackgroundTailwind")
      .value === "valid"
  ) {
    warnings.push(
      "P1順風只適用於價格觸及P1後第一段真實反應；唔會將實際P2升P1。"
    );
  } else if (
    $("p1BackgroundTailwind")
      .value === "expired"
  ) {
    warnings.push(
      "舊P1順風已失效：唔可以再借用作逆主判P2或窄義反轉資格。"
    );
  }

  if (
    marketCode(false) === "HSI"
  ) {
    warnings.push(
      "HSI硬時間規則：10:30後唔開新Setup。"
    );
  }

  if (
    marketCode(false) === "UK100" ||
    marketCode(false) === "GER40"
  ) {
    warnings.push(
      "UK100／GER40：Asia 2B during POR已刪除；POR期間Sweep Asia後只可等正式開市後形成EU-B Full Repair或EU-D Post-open Confirmation。"
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
      "紀律標籤：曾因情緒／信心想加注；最終注碼仍取所有限制最低值。"
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
      `⑨ 最終注碼＝方向／市場關係上限、P×Q許可、Range修正、大局障礙限制中最低值＝${SIZE_LABELS[finalSize]}。`
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
    setupTemplate:
      setupResult.setupTemplate,
    setupTemplateLabel:
      setupResult.setupTemplateLabel,
    setupVariant:
      setupResult.setupVariant,
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
    firstObstacleR:
      obstacle.firstObstacleR,
    obstacleKind:
      obstacle.kind,
    hardObstacleTreatment:
      obstacle.hardTreatment,
    obstacleSize:
      obstacle.adjustedSize,
    obstacleManagement:
      obstacle.management,
    obstacleManagementMode:
      obstacle.managementMode,
    obstacleEligible:
      obstacle.eligible,
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
  const selectedType =
    setupTypeFromTemplate(false);

  $("typeAPanel")
    .classList.toggle(
      "hidden",
      selectedType !== "A"
    );

  $("typeBPanel")
    .classList.toggle(
      "hidden",
      selectedType !== "B"
    );

  $("typeCPanel")
    .classList.toggle(
      "hidden",
      selectedType !== "C"
    );

  $("effectiveSetupType")
    .textContent =
      result.effectiveSetupTypeLabel;

  $("setupClassification")
    .textContent =
      setupTypeLabel(
        selectedType
      );

  $("asia2BQuality")
    .textContent =
      result.selectedSetupType === "A"
        ? result.highQuality
          ? `高質｜${result.criteriaCount}/6`
          : `未達A｜${result.criteriaCount}/6｜按Type B`
        : "N/A";

  $("asia2BPositionEffect")
    .textContent =
      positionTreatmentLabel(
        result.positionTreatment,
        result.basePosition,
        result.effectivePosition
      );

  $("asia2BTriggerEffect")
    .textContent =
      result.triggerPromoted
        ? `${result.baseQuality} → ${result.effectiveQuality}｜只修正Sweep／Reclaim邊緣`
        : result.effectiveSetupType === "A" &&
          result.baseQuality === "Q2"
          ? `維持Q2｜${currentBaseTrigger.typeAUpgradeReason}`
          : `維持${result.baseQuality}`;

  const grade =
    $("baseTriggerGrade");

  grade.textContent =
    result.effectiveQuality === "Q3"
      ? result.triggerPromoted
        ? "Q3｜Type A單一邊緣修正"
        : "Q3｜完整高質"
      : result.effectiveQuality === "Q2"
        ? "Q2｜故事成立但有瑕疵"
        : "Q1｜Setup失效";

  grade.className =
    `grade ${result.effectiveQuality.toLowerCase()}`;
}

function obstacleDisplayLabel(state) {
  const labels = {
    standard: "≥2R｜標準2R模式",
    rfManaged: "1.5R–2R｜RF-managed",
    partial: "1R–1.5R｜部分食糊模式",
    veto: "<1R｜Hard Veto",
    inside: "重大障礙區內｜Continuation上限",
    far: "舊版｜完整R:R",
    near: "舊版｜接近障礙",
    insufficient: "舊版｜空間不足"
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
  const timeframes =
    timeframeValues();

  $("marketRelation").textContent =
    decision.relation;
  $("marketRoute").textContent =
    decision.marketRoute;
  $("preferredDirection").textContent =
    decision.preferredDirection;
  $("marketCap").textContent =
    SIZE_LABELS[
      decision.marketCap
    ];
  $("backgroundRelation").textContent =
    decision.backgroundRelation;
  $("priorityNote").textContent =
    decision.priorityNote;
  $("backgroundRelationNote")
    .textContent =
      decision.backgroundRelationNote;

  $("resultMarket").textContent =
    MARKET_CONFIG[
      marketCode(false)
    ].label;
  $("resultSetupTemplate").textContent =
    currentAsia2B
      .setupTemplateLabel;

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
  $("resultPreferredDirection")
    .textContent =
      decision.preferredDirection;
  $("resultBasePosition").textContent =
    currentAsia2B.basePosition;
  $("resultEffectivePosition")
    .textContent =
      currentAsia2B
        .effectivePosition;
  $("resultP1Background").textContent =
    $("p1BackgroundTailwind").value ===
      "valid"
      ? "有｜仍有效"
      : $("p1BackgroundTailwind").value ===
          "expired"
        ? "曾有｜已失效"
        : "冇";
  $("resultMarketRoute").textContent =
    decision.marketRoute;
  $("resultSetupType").textContent =
    currentAsia2B
      .effectiveSetupTypeLabel;
  $("resultEffectiveTrigger")
    .textContent =
      currentAsia2B
        .effectiveQuality;
  $("resultAsia2B").textContent =
    currentAsia2B.selectedSetupType ===
      "A"
      ? `${currentAsia2B.highQuality ? "Type A高質" : "未達Type A"}｜${currentAsia2B.criteriaCount}/6`
      : "N/A";
  $("resultMarketCap").textContent =
    SIZE_LABELS[
      decision.marketCap
    ];
  $("resultMatrixSize").textContent =
    SIZE_LABELS[
      decision.rawMatrixSize
    ];
  $("resultRangeSize").textContent =
    SIZE_LABELS[
      decision.rangeSize
    ];
  $("resultObstacleSize").textContent =
    `${decision.firstObstacleR.toFixed(2)}R｜${obstacleDisplayLabel(
      decision.obstacleState
    )} → ${SIZE_LABELS[
      decision.obstacleSize
    ]}`;
  $("finalSize").textContent =
    SIZE_LABELS[
      decision.finalSize
    ];

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

  renderHardVetoPreview(
    decision.hardVetoes
  );
}

function syncObstacleModelInputs() {
  const firstObstacleR =
    firstObstacleRValue();

  const state =
    obstacleBandFromR(
      firstObstacleR,
      checked(
        "insideMajorObstacle"
      )
    );

  $("obstacleState").value =
    state;

  $("tradeSpace").value =
    state === "veto"
      ? "insufficient"
      : state === "standard"
        ? "full"
        : "managed";

  const rfVisible =
    state === "rfManaged";

  const partialVisible =
    state === "partial" ||
    (
      state === "rfManaged" &&
      $("obstacleKind").value ===
        "hard" &&
      $("hardObstacleTreatment")
        .value === "partial"
    );

  const hardVisible =
    state !== "standard" &&
    state !== "veto" &&
    state !== "inside" &&
    $("obstacleKind").value ===
      "hard";

  $("rfManagedPanel")
    .classList.toggle(
      "hidden",
      !rfVisible
    );

  $("partialObstaclePanel")
    .classList.toggle(
      "hidden",
      !partialVisible
    );

  $("hardObstacleTreatmentPanel")
    .classList.toggle(
      "hidden",
      !hardVisible
    );

  $("obstacleBandLabel")
    .textContent =
      obstacleBandLabel(state);

  $("obstacleManagementLabel")
    .textContent =
      obstacleManagementLabel(state);

  updateObstacleNote();
}

function updateObstacleNote() {
  const firstObstacleR =
    firstObstacleRValue();

  const state =
    obstacleBandFromR(
      firstObstacleR,
      checked(
        "insideMajorObstacle"
      )
    );

  const kind =
    $("obstacleKind").value ===
      "hard"
      ? "硬障礙"
      : "軟障礙";

  const notes = {
    standard:
      `${firstObstacleR.toFixed(2)}R：至少2R，標準模式，正常按Matrix，固定2R TP。`,
    rfManaged:
      `${firstObstacleR.toFixed(2)}R：1.5R–2R，${kind}。軟障礙要P1／P2 Q3或P1 Q2、障礙後有2R空間、事前寫明到障礙推RF；硬障礙另選降注／部分食糊／Skip。`,
    partial:
      `${firstObstacleR.toFixed(2)}R：1R–1.5R，只限P1＋Q3、健康同向或明確結構轉換、軟障礙，並30%–50%部分食糊。`,
    veto:
      `${firstObstacleR.toFixed(2)}R：低於1R，Hard Veto，0注。`,
    inside:
      "已處於重大障礙區內做Continuation：P1 Q3最多0.5、P2 Q3最多0.25、P3／P4為0。"
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
      "P1順風仍有效：只限價格觸及P1後第一段真實反應。主判健康時可提供逆主判P2資格；亦係窄義HTF P1 Probe嘅新鮮度條件。永遠唔會將P2升P1。";
    return;
  }

  if (value === "expired") {
    $("p1TailwindNote").textContent =
      "P1順風已失效：完成一段有效回調、次判確認新Trend、冇形成LH／HL而橫行、或者P1被反覆測試消耗後，唔可以再借用。";
    return;
  }

  $("p1TailwindNote").textContent =
    "P1順風＝價格觸及P1後第一段新鮮反應；Entry zone實際重疊係另一件事。";
}

function updateInterface() {
  const timeframes =
    timeframeValues();

  const backgroundState =
    $("backgroundState").value;
  const mainState =
    $("mainState").value;
  const secondaryState =
    $("secondaryState").value;
  const position =
    $("positionLevel").value;
  const selectedSetupType =
    setupTypeFromTemplate(false);
  const variant =
    setupVariant(false);
  const definition =
    setupDefinition(false);

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

  const info =
    POSITION_INFO[position];

  $("positionTitle").textContent =
    `${position}｜${info.title}`;
  $("positionNote").textContent =
    info.note;

  $("setupClassification")
    .textContent =
      setupTypeLabel(
        selectedSetupType
      );

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

  const sweepFieldsVisible =
    variant === "session2B" ||
    variant === "sweep" ||
    variant === "p1ReversalSweep";

  $("sweepReclaimTriggerFields")
    .classList.toggle(
      "hidden",
      !sweepFieldsVisible
    );

  const breakoutVisible =
    variant === "breakout" ||
    variant === "fullRepairAsia" ||
    variant === "fullRepairPure" ||
    variant ===
      "postOpenConfirmation";

  $("breakoutSetupPanel")
    .classList.toggle(
      "hidden",
      !breakoutVisible
    );

  const fullRepairVisible =
    variant === "fullRepairAsia" ||
    variant === "fullRepairPure";

  $("fullRepairPanel")
    .classList.toggle(
      "hidden",
      !fullRepairVisible
    );

  $("fullRepairAsiaSweepRow")
    .classList.toggle(
      "hidden",
      variant !==
        "fullRepairAsia"
    );

  const postOpenVisible =
    variant ===
      "postOpenConfirmation";

  $("postOpenConfirmationPanel")
    .classList.toggle(
      "hidden",
      !postOpenVisible
    );

  const openingDriveVisible =
    fullRepairVisible ||
    postOpenVisible;

  $("openingDriveValidityPanel")
    .classList.toggle(
      "hidden",
      !openingDriveVisible
    );

  const euOpeningVisible =
    marketCode(false) === "UK100" ||
    marketCode(false) === "GER40";

  $("euOpeningBacktestPanel")
    .classList.toggle(
      "hidden",
      !euOpeningVisible
    );

  $("euDRequiredFields")
    .classList.toggle(
      "hidden",
      !postOpenVisible
    );

  $("p1NoSweepPanel")
    .classList.toggle(
      "hidden",
      variant !==
        "p1NoSweep"
    );

  $("trendPullbackPanel")
    .classList.toggle(
      "hidden",
      variant !==
        "trendPullback"
    );

  if (
    $("typeCVariantNote")
  ) {
    $("typeCVariantNote")
      .textContent =
        definition.note;
  }

  if (
    $("typeALiquidityNote")
  ) {
    $("typeALiquidityNote")
      .textContent =
        definition.liquidityLabel
          ? `指定流動性：${definition.liquidityLabel}`
          : "Type A只限指定市場Session 2B。";
  }

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
        "次判唔係中性Transition／Range，25%修正不適用。";
  } else {
    const side =
      direction() === "Long"
        ? "底部25%"
        : "頂部25%";

    $("secondaryRangeNote")
      .textContent =
        `次判中性Transition／Range：${direction()}只優先${side}；未進入相關25%降一級，Range中間固定0。`;
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

  const showCounterP2 =
    route.code ===
      "conflictSecondary" &&
    position === "P2";

  $("counterP2EligibilityNote")
    .classList.toggle(
      "hidden",
      !showCounterP2
    );

  $("counterP2WeakBreakRetestRow")
    .classList.toggle(
      "hidden",
      !(
        showCounterP2 &&
        isWeak(mainState)
      )
    );

  if (
    !(
      showCounterP2 &&
      isWeak(mainState)
    )
  ) {
    $("counterP2WeakBreakRetest")
      .checked = false;
  }

  if (showCounterP2) {
    $("counterP2EligibilityNote")
      .textContent =
        counterP2EligibilityInfo(
          position
        ).reason;
  }

  const showHTFException =
    route.code ===
      "alignedReverse";

  $("htfP1ReversalExceptionRow")
    .classList.toggle(
      "hidden",
      !showHTFException
    );

  if (!showHTFException) {
    $("htfP1ReversalException")
      .checked = false;
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

  const showBothTransitionP3 =
    route.code ===
      "bothTransition" &&
    position === "P3";

  $("bothTransitionP3TestableRow")
    .classList.toggle(
      "hidden",
      !showBothTransitionP3
    );

  if (!showBothTransitionP3) {
    $("bothTransitionP3Testable")
      .checked = false;
  }

  $("tradingTimeRuleLabel")
    .textContent =
      marketCode(false) === "HSI"
        ? "HSI 10:30後仍開新Setup／其他市場違反時間規則"
        : "違反交易時間限制";

  syncObstacleModelInputs();
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
  const variant =
    currentBaseTrigger.variant;

  return [
    `Setup：${currentBaseTrigger.setupTemplateLabel}`,
    `Setup Type選擇：${setupTypeLabel(currentBaseTrigger.selectedSetupType)}`,
    `有效Setup Type：${currentAsia2B.effectiveSetupTypeLabel}`,
    `Setup子類型：${variant}`,
    `有效Sweep：${yesNo(currentBaseTrigger.validSweep)}`,
    `有效Reclaim：${yesNo(currentBaseTrigger.validReclaim)}`,
    `有效Breakout：${yesNo(currentBaseTrigger.validBreakout)}`,
    `有效Acceptance：${yesNo(currentBaseTrigger.validAcceptance)}`,
    `第一次Retest：${yesNo(currentBaseTrigger.firstRetest)}`,
    `微結構／控制權轉移：${yesNo(currentBaseTrigger.microStructureShift)}`,
    `Retest質素：${$("retestQuality").selectedOptions[0].textContent}`,
    `基礎Q：${currentBaseTrigger.quality}`,
    `Setup修正後Q：${currentAsia2B.effectiveQuality}`
  ];
}

function checklistSummary() {
  const timeframes =
    timeframeValues();

  const tailwind =
    $("p1BackgroundTailwind").value;

  const counterInfo =
    counterP2EligibilityInfo(
      currentAsia2B.effectivePosition
    );

  return [
    `交易日期：${$("tradeDate").value}`,
    `市場：${MARKET_CONFIG[marketCode(false)].label}`,
    `品種：${$("symbol").value}`,
    `核心Setup：${currentAsia2B.setupTemplateLabel}`,
    `大局背景層：${timeframes.background}－${$("backgroundState").value}`,
    `主判斷層：${timeframes.main}－${$("mainState").value}`,
    `次判斷層：${timeframes.secondary}－${$("secondaryState").value}`,
    `入場觸發層：${timeframes.entry}`,
    `交易方向：${direction()}`,
    `市場關係：${currentDecision.relation}`,
    `交易路線：${currentDecision.marketRoute}`,
    `市場關係上限：${SIZE_LABELS[currentDecision.marketCap]}`,
    "",
    `Setup Type：${currentAsia2B.effectiveSetupTypeLabel}`,
    `Type A高質：${currentAsia2B.selectedSetupType === "A" ? yesNo(currentAsia2B.highQuality) : "N/A"}`,
    `Type A條件：${currentAsia2B.selectedSetupType === "A" ? `${currentAsia2B.criteriaCount}/6` : "N/A"}`,
    "",
    `大局實際結構重疊：${$("backgroundDirectOverlap").value === "yes" ? "有" : "冇"}`,
    `P1順風：${tailwind === "valid" ? "有｜仍有效" : tailwind === "expired" ? "曾有｜已失效" : "冇"}`,
    `逆主判P2資格：${counterInfo.eligible ? "有" : "冇"}｜${counterInfo.reason}`,
    `窄義HTF P1反轉例外：${yesNo(checked("htfP1ReversalException"))}`,
    `主判Transition反向P1：${yesNo(checked("transitionLayerP1"))}`,
    `衝突順主判P3可測試：${yesNo(checked("p3ConflictTestable"))}`,
    `雙轉換P3可測試：${yesNo(checked("bothTransitionP3Testable"))}`,
    "",
    `原始位置：${currentAsia2B.basePosition}`,
    `Setup後有效位置：${currentAsia2B.effectivePosition}`,
    `P待遇來源：${positionTreatmentLabel(
      currentAsia2B.positionTreatment,
      currentAsia2B.basePosition,
      currentAsia2B.effectivePosition
    )}`,
    "",
    ...triggerChecklistLines(),
    "",
    `次判Range修正：${currentDecision.rangeState}`,
    `Range修正後：${SIZE_LABELS[currentDecision.rangeSize]}`,
    `障礙：${obstacleDisplayLabel(currentDecision.obstacleState)}`,
    `P×Q／方向Matrix：${SIZE_LABELS[currentDecision.rawMatrixSize]}`,
    `障礙修正：${SIZE_LABELS[currentDecision.obstacleSize]}`,
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
      "PracticeJournal-V1.26.2",
    engineVersion:
      "MasterTradeMatrix-AllMarkets-V1.1.2-EUDP2Effective",

    recordMode:
      recordMode(),
    marketCode:
      marketCode(false),
    marketLabel:
      MARKET_CONFIG[
        marketCode(false)
      ].label,
    symbol,
    setupTemplate:
      currentAsia2B.setupTemplate,
    setupTemplateLabel:
      currentAsia2B.setupTemplateLabel,
    setupVariant:
      currentAsia2B.setupVariant,

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
    counterP2Basis:
      counterP2EligibilityInfo(
        currentAsia2B.effectivePosition
      ).basis,
    counterP2WeakBreakRetest:
      checked(
        "counterP2WeakBreakRetest"
      ),
    htfP1ReversalException:
      checked(
        "htfP1ReversalException"
      ),
    bothTransitionMajorP1:
      checked("bothTransitionMajorP1"),
    bothTransitionP3Testable:
      checked(
        "bothTransitionP3Testable"
      ),

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
    microStructureShift:
      currentBaseTrigger.microStructureShift,
    validBreakout:
      currentBaseTrigger.validBreakout,
    validAcceptance:
      currentBaseTrigger.validAcceptance,
    firstRetest:
      currentBaseTrigger.firstRetest,
    breakoutQuality:
      currentBaseTrigger.breakoutQuality,
    fullRepairComplete:
      currentBaseTrigger.fullRepairComplete,
    fullRepairAsiaSweep:
      currentBaseTrigger.fullRepairAsiaSweep,
    fullRepairEntryOutside:
      currentBaseTrigger.fullRepairEntryOutside,
    fullRepairAcceptedBackInside:
      currentBaseTrigger.fullRepairAcceptedBackInside,
    postOpenAsiaSweep:
      currentBaseTrigger.postOpenAsiaSweep,
    postOpenAfterOpen:
      currentBaseTrigger.postOpenAfterOpen,
    postOpenDriveConfirmed:
      currentBaseTrigger.postOpenDriveConfirmed,
    postOpenPreOpenEntry:
      currentBaseTrigger.postOpenPreOpenEntry,
    openingDriveStatus:
      currentBaseTrigger.openingDriveStatus,
    strongTrendContext:
      currentBaseTrigger.strongTrendContext,
    trueStructureRetest:
      currentBaseTrigger.trueStructureRetest,

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
    nativeP2Applied:
      currentAsia2B.nativeP2Applied,
    positionTreatment:
      currentAsia2B.positionTreatment,
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
    firstObstacleR:
      currentDecision.firstObstacleR,
    obstacleKind:
      currentDecision.obstacleKind,
    obstacleManagementMode:
      currentDecision.obstacleManagementMode,
    obstacleManagement:
      currentDecision.obstacleManagement,
    hardObstacleTreatment:
      currentDecision.hardObstacleTreatment,
    obstacleSpaceBeyond:
      checked("obstacleSpaceBeyond"),
    obstacleRFPlan:
      checked("obstacleRFPlan"),
    obstaclePartialPlan:
      checked("obstaclePartialPlan"),
    obstacleClearTransition:
      checked("obstacleClearTransition"),
    insideMajorObstacle:
      checked("insideMajorObstacle"),
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

    openingStoryId:
      $("openingStoryId").value.trim(),
    euAsiaSweepDirection:
      $("euAsiaSweepDirection").value,
    euAsiaSweepTime:
      $("euAsiaSweepTime").value,
    euPorSweepStage:
      $("euPorSweepStage").value,
    euOpeningDriveDirection:
      $("euOpeningDriveDirection").value,
    euBrokeMicroStructure:
      checked("euBrokeMicroStructure"),
    euBrokeMainStructure:
      checked("euBrokeMainStructure"),
    euOpeningRetestMinutes:
      optionalNumberFromInput(
        "euOpeningRetestMinutes"
      ),
    euNewStructureCycle:
      checked("euNewStructureCycle"),
    euRetestDepth:
      $("euRetestDepth").value,
    euRetestEfficiency:
      $("euRetestEfficiency").value,
    obstacleOutcome:
      $("obstacleOutcome").value,

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
    "已儲存全市場Matrix紀錄"
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
                "AllMarkets"
              )
                ? "All-Market Matrix"
                : record.engineVersion.includes(
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
          "AllMarkets"
        )
          ? `<span class="history-tag">${escapeHtml(
              record.setupTemplateLabel ||
              record.setupTypeLabel ||
              setupTypeLabel(
                record.setupType || "B"
              )
            )}</span>`
          : record.engineVersion?.includes(
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
              record.marketLabel ||
              record.marketCode ||
              "舊版"
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
    <strong>市場：</strong>
    ${escapeHtml(
      record.marketLabel ||
      record.marketCode ||
      "舊版未記錄"
    )}
    <br>
    <strong>核心Setup：</strong>
    ${escapeHtml(
      record.setupTemplateLabel ||
      record.setupTemplate ||
      "舊版未記錄"
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
          ? `逆主判P2特殊資格${record.counterP2Basis ? `（${record.counterP2Basis}）` : ""}`
          : "",
        record.htfP1ReversalException
          ? "窄義HTF P1反轉例外"
          : "",
        record.bothTransitionMajorP1
          ? "雙轉換P1主要邊界"
          : "",
        record.bothTransitionP3Testable
          ? "雙轉換P3可小注"
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
    <strong>P待遇來源：</strong>
    ${escapeHtml(
      positionTreatmentLabel(
        record.positionTreatment ||
          (
            record.nativeP2Applied
              ? "nativeP2"
              : record.asia2BPositionPromoted
                ? "p2Effective"
                : "native"
          ),
        basePosition,
        effectivePosition
      )
    )}
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
    <strong>第一障礙：</strong>
    ${escapeHtml(
      Number.isFinite(record.firstObstacleR)
        ? `${record.firstObstacleR}R`
        : "舊版未記錄"
    )}｜${escapeHtml(
      obstacleDisplayLabel(
        record.obstacleState || "standard"
      )
    )}｜${escapeHtml(
      record.obstacleKind || "N/A"
    )}
    <br>
    <strong>障礙管理：</strong>
    ${escapeHtml(
      record.obstacleManagement ||
      record.obstacleManagementMode ||
      "舊版未記錄"
    )}
    <br>
    <strong>Opening Story ID：</strong>
    ${escapeHtml(
      record.openingStoryId || "N/A"
    )}
    <br>
    <strong>障礙管理結果：</strong>
    ${escapeHtml(
      record.obstacleOutcome || "N/A"
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
    "2R全平";
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
    "市場分類",
    "市場名稱",
    "品種",
    "核心Setup",
    "Setup代碼",
    "Setup子類型",
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
    "大局方向關係",
    "大局實際結構重疊",
    "P1順風",
    "原始位置",
    "有效位置",
    "窄義HTF P1反轉例外",
    "主判Transition反向P1",
    "衝突順主判P3可小注",
    "逆主判P2特殊資格",
    "逆主判P2資格基礎",
    "主判弱勢次結突破首次Retest",
    "雙轉換P1主要邊界",
    "雙轉換P3可小注",
    "Setup Type選擇",
    "有效Setup Type",
    "No Sweep P1 Rejection",
    "微結構／控制權轉移",
    "有效Sweep",
    "有效Reclaim",
    "Sweep／Reclaim質素",
    "有效Breakout",
    "有效Acceptance",
    "第一次Retest",
    "Breakout／Acceptance質素",
    "Full Repair完整",
    "Full Repair Asia Sweep",
    "Full Repair入場POR外",
    "POR內重新Acceptance",
    "EU-D Asia Sweep",
    "EU-D正式開市後確認",
    "EU-D Opening Drive確認",
    "EU-D開市前直接入場",
    "Opening Drive有效期",
    "強趨勢Context",
    "真正結構Retest",
    "Retest質素",
    "交易空間",
    "第一障礙R",
    "障礙類型",
    "障礙管理模式",
    "硬障礙處理",
    "障礙後有2R空間",
    "到障礙推RF計劃",
    "部分食糊計劃",
    "明確結構轉換Context",
    "Opening Story ID",
    "Asia Sweep方向",
    "Asia Sweep時間",
    "POR Sweep階段",
    "Opening Drive方向",
    "EU記錄破微結構",
    "EU記錄破15M／1H主結",
    "Opening Drive至Retest分鐘",
    "已完成新結構循環",
    "EU Retest深度",
    "EU Retest推進效率",
    "障礙管理結果",
    "基礎Q",
    "最終Q",
    "Type A方向",
    "Type A高質",
    "Type A條件數",
    "P2-effective待遇",
    "原生P2套用",
    "P待遇來源",
    "Type A Q升級",
    "次判Range位置",
    "Range修正後",
    "大局障礙",
    "市場關係上限",
    "P×Q／方向Matrix",
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
      record.marketCode || "",
      record.marketLabel || "",
      record.symbol || "",
      record.setupTemplateLabel ||
        record.setupTemplate ||
        "",
      record.setupTemplate || "",
      record.setupVariant || "",
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
      record.backgroundRelation || "",
      record.backgroundDirectOverlap ===
        "yes"
        ? "有"
        : "冇",
      record.p1BackgroundTailwind ===
        "valid"
        ? "有｜仍有效"
        : record.p1BackgroundTailwind ===
            "expired"
          ? "曾有｜已失效"
          : "冇",
      record.basePosition ||
        record.position ||
        "",
      record.position ||
        record.basePosition ||
        "",
      record.htfP1ReversalException
        ? "Yes"
        : "No",
      record.transitionLayerP1
        ? "Yes"
        : "No",
      record.p3Testable
        ? "Yes"
        : "No",
      record.counterP2Eligible
        ? "Yes"
        : "No",
      record.counterP2Basis || "",
      record.counterP2WeakBreakRetest
        ? "Yes"
        : "No",
      record.bothTransitionMajorP1
        ? "Yes"
        : "No",
      record.bothTransitionP3Testable
        ? "Yes"
        : "No",
      record.setupTypeSelected ||
        record.setupType ||
        "",
      record.setupType || "",
      record.noSweepRejection
        ? "Yes"
        : "No",
      record.microStructureShift ||
      record.noSweepMicroBreak
        ? "Yes"
        : "No",
      record.validSweep
        ? "Yes"
        : "No",
      record.validReclaim
        ? "Yes"
        : "No",
      record.reclaimQuality || "",
      record.validBreakout
        ? "Yes"
        : "No",
      record.validAcceptance
        ? "Yes"
        : "No",
      record.firstRetest
        ? "Yes"
        : "No",
      record.breakoutQuality || "",
      record.fullRepairComplete
        ? "Yes"
        : "No",
      record.fullRepairAsiaSweep
        ? "Yes"
        : "No",
      record.fullRepairEntryOutside
        ? "Yes"
        : "No",
      record.fullRepairAcceptedBackInside
        ? "Yes"
        : "No",
      record.postOpenAsiaSweep
        ? "Yes"
        : "No",
      record.postOpenAfterOpen
        ? "Yes"
        : "No",
      record.postOpenDriveConfirmed
        ? "Yes"
        : "No",
      record.postOpenPreOpenEntry
        ? "Yes"
        : "No",
      record.openingDriveStatus || "",
      record.strongTrendContext
        ? "Yes"
        : "No",
      record.trueStructureRetest
        ? "Yes"
        : "No",
      record.retestQuality || "",
      record.tradeSpace || "",
      Number.isFinite(
        record.firstObstacleR
      )
        ? record.firstObstacleR
        : "",
      record.obstacleKind || "",
      record.obstacleManagementMode || "",
      record.hardObstacleTreatment || "",
      record.obstacleSpaceBeyond
        ? "Yes"
        : "No",
      record.obstacleRFPlan
        ? "Yes"
        : "No",
      record.obstaclePartialPlan
        ? "Yes"
        : "No",
      record.obstacleClearTransition
        ? "Yes"
        : "No",
      record.openingStoryId || "",
      record.euAsiaSweepDirection || "",
      record.euAsiaSweepTime || "",
      record.euPorSweepStage || "",
      record.euOpeningDriveDirection || "",
      record.euBrokeMicroStructure
        ? "Yes"
        : "No",
      record.euBrokeMainStructure
        ? "Yes"
        : "No",
      Number.isFinite(
        record.euOpeningRetestMinutes
      )
        ? record.euOpeningRetestMinutes
        : "",
      record.euNewStructureCycle
        ? "Yes"
        : "No",
      record.euRetestDepth || "",
      record.euRetestEfficiency || "",
      record.obstacleOutcome || "N/A",
      record.baseTrigger ||
        record.trigger ||
        "",
      record.trigger ||
        record.baseTrigger ||
        "",
      record.asia2BLabel || "",
      record.asia2BHighQuality
        ? "Yes"
        : "No",
      record.asia2BCriteriaCount ??
        "",
      record.asia2BPositionPromoted
        ? "Yes"
        : "No",
      record.nativeP2Applied
        ? "Yes"
        : "No",
      record.positionTreatment ||
        (
          record.nativeP2Applied
            ? "nativeP2"
            : record.asia2BPositionPromoted
              ? "p2Effective"
              : "native"
        ),
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
        "standard"
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
      Number.isFinite(record.profitR)
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
    `MasterTrade-AllMarkets-Journal-${new Date()
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
      `MasterTrade-AllMarkets-Backup-${new Date()
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
    text.includes("<1R") ||
    text.includes("Hard Veto") ||
    text.includes("不足") ||
    text === "veto" ||
    text === "insufficient"
  ) {
    return "veto";
  }

  if (
    text.includes("1R–1.5R") ||
    text.includes("部分食糊") ||
    text === "partial"
  ) {
    return "partial";
  }

  if (
    text.includes("1.5R–2R") ||
    text.includes("RF-managed") ||
    text.includes("接近") ||
    text === "rfManaged" ||
    text === "near"
  ) {
    return "rfManaged";
  }

  if (
    text.includes("障礙區內") ||
    text.includes("重大障礙區") ||
    text === "inside"
  ) {
    return "inside";
  }

  return "standard";
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
      "MasterTradeMatrix-AllMarkets-V1.1-EUOpening",
    recordMode:
      firstCsvValue(
        row,
        "類型"
      ) ||
      "Practice",
    marketCode:
      firstCsvValue(
        row,
        "市場分類"
      ) || "FX",
    marketLabel:
      firstCsvValue(
        row,
        "市場名稱"
      ),
    symbol:
      firstCsvValue(
        row,
        "品種"
      ),
    setupTemplateLabel:
      firstCsvValue(
        row,
        "核心Setup"
      ),
    setupTemplate:
      firstCsvValue(
        row,
        "Setup代碼"
      ),
    setupVariant:
      firstCsvValue(
        row,
        "Setup子類型"
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
    htfP1ReversalException:
      csvBoolean(
        firstCsvValue(
          row,
          "窄義HTF P1反轉例外",
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
    counterP2Basis:
      firstCsvValue(
        row,
        "逆主判P2資格基礎"
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
    bothTransitionP3Testable:
      csvBoolean(
        firstCsvValue(
          row,
          "雙轉換P3可小注"
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
          "No Sweep Micro Break",
          "微結構／控制權轉移"
        )
      ),
    microStructureShift:
      csvBoolean(
        firstCsvValue(
          row,
          "微結構／控制權轉移",
          "No Sweep Micro Break"
        )
      ),
    validBreakout:
      csvBoolean(
        firstCsvValue(
          row,
          "有效Breakout"
        )
      ),
    validAcceptance:
      csvBoolean(
        firstCsvValue(
          row,
          "有效Acceptance"
        )
      ),
    firstRetest:
      csvBoolean(
        firstCsvValue(
          row,
          "第一次Retest"
        )
      ),
    breakoutQuality:
      firstCsvValue(
        row,
        "Breakout／Acceptance質素"
      ),
    fullRepairComplete:
      csvBoolean(
        firstCsvValue(
          row,
          "Full Repair完整"
        )
      ),
    fullRepairAsiaSweep:
      csvBoolean(
        firstCsvValue(
          row,
          "Full Repair Asia Sweep"
        )
      ),
    fullRepairEntryOutside:
      csvBoolean(
        firstCsvValue(
          row,
          "Full Repair入場POR外"
        )
      ),
    fullRepairAcceptedBackInside:
      csvBoolean(
        firstCsvValue(
          row,
          "POR內重新Acceptance"
        )
      ),
    postOpenAsiaSweep:
      csvBoolean(
        firstCsvValue(
          row,
          "EU-D Asia Sweep"
        )
      ),
    postOpenAfterOpen:
      csvBoolean(
        firstCsvValue(
          row,
          "EU-D正式開市後確認"
        )
      ),
    postOpenDriveConfirmed:
      csvBoolean(
        firstCsvValue(
          row,
          "EU-D Opening Drive確認"
        )
      ),
    postOpenPreOpenEntry:
      csvBoolean(
        firstCsvValue(
          row,
          "EU-D開市前直接入場"
        )
      ),
    openingDriveStatus:
      firstCsvValue(
        row,
        "Opening Drive有效期"
      ) || "fresh",
    strongTrendContext:
      csvBoolean(
        firstCsvValue(
          row,
          "強趨勢Context"
        )
      ),
    trueStructureRetest:
      csvBoolean(
        firstCsvValue(
          row,
          "真正結構Retest"
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
    firstObstacleR:
      csvNumber(
        firstCsvValue(
          row,
          "第一障礙R"
        )
      ),
    obstacleKind:
      firstCsvValue(
        row,
        "障礙類型"
      ) || "soft",
    obstacleManagementMode:
      firstCsvValue(
        row,
        "障礙管理模式"
      ),
    hardObstacleTreatment:
      firstCsvValue(
        row,
        "硬障礙處理"
      ),
    obstacleSpaceBeyond:
      csvBoolean(
        firstCsvValue(
          row,
          "障礙後有2R空間"
        )
      ),
    obstacleRFPlan:
      csvBoolean(
        firstCsvValue(
          row,
          "到障礙推RF計劃"
        )
      ),
    obstaclePartialPlan:
      csvBoolean(
        firstCsvValue(
          row,
          "部分食糊計劃"
        )
      ),
    obstacleClearTransition:
      csvBoolean(
        firstCsvValue(
          row,
          "明確結構轉換Context"
        )
      ),
    openingStoryId:
      firstCsvValue(
        row,
        "Opening Story ID"
      ),
    euAsiaSweepDirection:
      firstCsvValue(
        row,
        "Asia Sweep方向"
      ),
    euAsiaSweepTime:
      firstCsvValue(
        row,
        "Asia Sweep時間"
      ),
    euPorSweepStage:
      firstCsvValue(
        row,
        "POR Sweep階段"
      ),
    euOpeningDriveDirection:
      firstCsvValue(
        row,
        "Opening Drive方向"
      ),
    euBrokeMicroStructure:
      csvBoolean(
        firstCsvValue(
          row,
          "EU記錄破微結構"
        )
      ),
    euBrokeMainStructure:
      csvBoolean(
        firstCsvValue(
          row,
          "EU記錄破15M／1H主結"
        )
      ),
    euOpeningRetestMinutes:
      csvNumber(
        firstCsvValue(
          row,
          "Opening Drive至Retest分鐘"
        )
      ),
    euNewStructureCycle:
      csvBoolean(
        firstCsvValue(
          row,
          "已完成新結構循環"
        )
      ),
    euRetestDepth:
      firstCsvValue(
        row,
        "EU Retest深度"
      ),
    euRetestEfficiency:
      firstCsvValue(
        row,
        "EU Retest推進效率"
      ),
    obstacleOutcome:
      firstCsvValue(
        row,
        "障礙管理結果"
      ) || "N/A",
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
    asia2BPositionPromoted:
      csvBoolean(
        firstCsvValue(
          row,
          "P2-effective待遇",
          "Type A位置升級"
        )
      ),
    nativeP2Applied:
      csvBoolean(
        firstCsvValue(
          row,
          "原生P2套用"
        )
      ),
    positionTreatment:
      firstCsvValue(
        row,
        "P待遇來源"
      ) || (
        csvBoolean(
          firstCsvValue(
            row,
            "原生P2套用"
          )
        )
          ? "nativeP2"
          : csvBoolean(
              firstCsvValue(
                row,
                "P2-effective待遇",
                "Type A位置升級"
              )
            )
            ? "p2Effective"
            : "native"
      ),
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
    obstacleManagement:
      firstCsvValue(
        row,
        "障礙管理"
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
      "同向含弱勢／轉換｜順共同方向",
    alignedReverse:
      "反共同方向｜正常0／窄義P1例外",
    conflictMain:
      "方向衝突｜順主判、逆次判",
    conflictSecondary:
      "順次判、逆主判",
    transitionConfirmed:
      "包含轉換｜順已確認方向",
    transitionReverse:
      "主判Transition｜逆次判已確認方向",
    bothTransition:
      "雙轉換／Range｜只做邊界"
  };

  return labels[value] || value;
}

function liveRouteCap(value) {
  const caps = {
    healthyAligned: 1,
    weakAligned: 0.5,
    alignedReverse: 0,
    conflictMain: 0.5,
    conflictSecondary: 0.5,
    transitionConfirmed: 0.5,
    transitionReverse: 0.25,
    bothTransition: 0.5
  };

  return caps[value] ?? 0;
}

function recalculateLiveDecision() {
  const routeCode =
    $("liveMarketRoute").value;

  const definition =
    setupDefinition(true);

  const variant =
    setupVariant(true);

  const selectedSetupType =
    setupTypeFromTemplate(true);

  const typeAQualified =
    selectedSetupType === "A" &&
    isDesignatedTypeASetup(true) &&
    checked(
      "liveTypeAQualified"
    );

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

  $("liveSetupClassification")
    .textContent =
      setupTypeLabel(
        selectedSetupType
      );

  $("liveEffectiveSetupType")
    .textContent =
      setupTypeLabel(
        effectiveSetupType
      );

  if (
    $("liveTypeCNote")
  ) {
    $("liveTypeCNote")
      .textContent =
        definition.note;
  }

  const euOpeningVariant =
    variant ===
      "fullRepairAsia" ||
    variant ===
      "fullRepairPure" ||
    variant ===
      "postOpenConfirmation";

  $("liveEUOpeningPanel")
    .classList.toggle(
      "hidden",
      !euOpeningVariant
    );

  const euD =
    variant ===
      "postOpenConfirmation";

  $("liveEuDConfirmationRows")
    .classList.toggle(
      "hidden",
      !euD
    );

  if (!euD) {
    $("liveEuDConfirmed")
      .checked = false;
    $("liveEuDPreOpenEntry")
      .checked = false;
  }

  const basePosition =
    $("livePosition").value;

  let effectiveQuality =
    $("liveTriggerQuality").value;

  if (
    effectiveSetupType === "A" &&
    effectiveQuality === "Q2" &&
    checked(
      "liveTypeAQ2EdgeOnly"
    )
  ) {
    effectiveQuality = "Q3";
  }

  let effectivePosition =
    basePosition;

  let livePositionTreatment =
    "native";

  if (
    effectiveSetupType === "A" &&
    basePosition === "P3"
  ) {
    effectivePosition = "P2";
    livePositionTreatment =
      "p2Effective";
  }

  const liveOpeningFresh =
    !euOpeningVariant ||
    $("liveOpeningDriveStatus")
      .value !== "expired";

  const liveSetupCoreUsable =
    effectiveQuality !== "Q1" &&
    liveOpeningFresh;

  if (
    (
      variant === "fullRepairAsia" ||
      variant === "fullRepairPure"
    ) &&
    basePosition === "P3" &&
    liveSetupCoreUsable
  ) {
    effectivePosition = "P2";
    livePositionTreatment =
      "nativeP2";
  }

  const liveEuDQualified =
    euD &&
    liveSetupCoreUsable &&
    checked(
      "liveEuDConfirmed"
    ) &&
    !checked(
      "liveEuDPreOpenEntry"
    );

  if (
    liveEuDQualified &&
    basePosition === "P3"
  ) {
    effectivePosition = "P2";
    livePositionTreatment =
      "p2Effective";
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
    routeCode ===
      "conflictSecondary" &&
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

  const counterP2Eligible =
    showCounterP2 &&
    $("liveCounterP2Basis").value !==
      "none";

  const showHTFException =
    routeCode ===
      "alignedReverse";

  $("liveHTFP1ReversalExceptionRow")
    .classList.toggle(
      "hidden",
      !showHTFException
    );

  if (!showHTFException) {
    $("liveHTFP1ReversalException")
      .checked = false;
  }

  const htfExceptionEligible =
    showHTFException &&
    checked(
      "liveHTFP1ReversalException"
    ) &&
    (
      basePosition === "P1" ||
      basePosition === "P2"
    ) &&
    effectiveQuality === "Q3";

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

  const showBothTransitionP3 =
    routeCode ===
      "bothTransition" &&
    effectivePosition === "P3";

  $("liveBothTransitionP3TestableRow")
    .classList.toggle(
      "hidden",
      !showBothTransitionP3
    );

  if (!showBothTransitionP3) {
    $("liveBothTransitionP3Testable")
      .checked = false;
  }

  let marketCap =
    liveRouteCap(routeCode);

  if (
    routeCode ===
      "alignedReverse" &&
    htfExceptionEligible
  ) {
    marketCap = 0.25;
  }

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
            ),
          bothTransitionP3Testable:
            checked(
              "liveBothTransitionP3Testable"
            ),
          htfP1ReversalEligible:
            htfExceptionEligible,
          basePosition
        }
      )
    );

  if (
    effectiveSetupType === "C"
  ) {
    if (
      variant === "breakout" ||
      variant === "fullRepairAsia" ||
      variant === "fullRepairPure" ||
      variant ===
        "postOpenConfirmation"
    ) {
      if (
        effectivePosition !== "P1" &&
        effectivePosition !== "P2"
      ) {
        matrixSize = 0;
      }
    } else if (
      variant === "p1NoSweep"
    ) {
      if (
        basePosition !== "P1"
      ) {
        matrixSize = 0;
      }
    } else if (
      variant === "trendPullback"
    ) {
      if (
        basePosition !== "P1" &&
        basePosition !== "P2"
      ) {
        matrixSize = 0;
      }
    }
  }

  if (
    variant ===
      "p1ReversalSweep" &&
    basePosition !== "P1"
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

  const obstacleKind =
    $("liveObstacleKind").value;

  const showRF =
    obstacle === "rfManaged";

  const showPartial =
    obstacle === "partial" ||
    (
      obstacle === "rfManaged" &&
      obstacleKind === "hard" &&
      $("liveHardObstacleTreatment")
        .value === "partial"
    );

  const showHard =
    (
      obstacle === "rfManaged" ||
      obstacle === "partial"
    ) &&
    obstacleKind === "hard";

  $("liveRFManagedPanel")
    .classList.toggle(
      "hidden",
      !showRF
    );

  $("livePartialModePanel")
    .classList.toggle(
      "hidden",
      !showPartial
    );

  $("liveHardObstaclePanel")
    .classList.toggle(
      "hidden",
      !showHard
    );

  let obstacleSize =
    rangeSize;

  const obstacleVetoes = [];
  let obstacleNote = "";

  if (obstacle === "inside") {
    obstacleSize =
      Math.min(
        rangeSize,
        insideObstacleCap(
          effectivePosition,
          effectiveQuality
        )
      );
    obstacleNote =
      "身處重大障礙區：套Continuation專用上限。";
  } else if (
    obstacle === "veto"
  ) {
    obstacleSize = 0;
    obstacleVetoes.push(
      "第一真實障礙不足1R。"
    );
    obstacleNote =
      "<1R：Hard Veto。";
  } else if (
    obstacle === "standard"
  ) {
    obstacleNote =
      "≥2R：標準2R模式，唔因障礙降注。";
  } else if (
    obstacle === "rfManaged"
  ) {
    const pqEligible =
      (
        (
          effectivePosition === "P1" ||
          effectivePosition === "P2"
        ) &&
        effectiveQuality === "Q3"
      ) ||
      (
        effectivePosition === "P1" &&
        effectiveQuality === "Q2"
      );

    if (!pqEligible) {
      obstacleVetoes.push(
        "1.5R–2R模式嘅P／Q資格不足。"
      );
      obstacleSize = 0;
    } else if (
      obstacleKind === "soft"
    ) {
      if (
        !checked(
          "liveObstacleSpaceBeyond"
        ) ||
        !checked(
          "liveObstacleRFPlan"
        )
      ) {
        obstacleVetoes.push(
          "RF-managed未確認障礙後2R空間及推RF計劃。"
        );
        obstacleSize = 0;
      } else {
        obstacleNote =
          "1.5R–2R軟障礙：到障礙推RF，再博2R；注碼不自動降低。";
      }
    } else {
      const treatment =
        $("liveHardObstacleTreatment")
          .value;

      if (treatment === "skip") {
        obstacleVetoes.push(
          "硬障礙必須突破先成立。"
        );
        obstacleSize = 0;
      } else if (
        treatment === "partial"
      ) {
        if (
          !checked(
            "liveObstaclePartialPlan"
          )
        ) {
          obstacleVetoes.push(
            "硬障礙部分食糊計劃未完整。"
          );
          obstacleSize = 0;
        } else {
          obstacleNote =
            "1.5R–2R硬障礙：障礙前部分食糊，餘倉推RF。";
        }
      } else if (
        !checked(
          "liveObstacleSpaceBeyond"
        ) ||
        !checked(
          "liveObstacleRFPlan"
        )
      ) {
        obstacleVetoes.push(
          "硬障礙降注＋RF管理條件未完整。"
        );
        obstacleSize = 0;
      } else {
        obstacleSize =
          downgradeOneLevel(
            rangeSize
          );
        obstacleNote =
          "1.5R–2R硬障礙：注碼降一級，到障礙推RF。";
      }
    }
  } else if (
    obstacle === "partial"
  ) {
    const topContext =
      routeCode ===
        "healthyAligned" ||
      checked(
        "liveObstacleClearTransition"
      );

    const eligible =
      effectivePosition === "P1" &&
      effectiveQuality === "Q3" &&
      obstacleKind === "soft" &&
      topContext &&
      checked(
        "liveObstaclePartialPlan"
      );

    if (!eligible) {
      obstacleVetoes.push(
        "1R–1.5R只限P1＋Q3、健康同向／明確結構轉換、軟障礙及部分食糊方案。"
      );
      obstacleSize = 0;
    } else {
      obstacleNote =
        "1R–1.5R頂級Setup：30%–50%障礙前食糊，餘倉推RF。";
    }
  }

  const vetoes = [
    ...obstacleVetoes
  ];

  if (
    effectivePosition === "P4"
  ) {
    vetoes.push(
      "P4／Range中間＝0注。"
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
    euOpeningVariant &&
    $("liveOpeningDriveStatus")
      .value === "expired"
  ) {
    vetoes.push(
      "舊Opening Drive已過期。"
    );
  }

  if (euD) {
    if (
      !checked(
        "liveEuDConfirmed"
      )
    ) {
      vetoes.push(
        "EU-D未確認開市後Opening Drive破結構＋首次弱Retest。"
      );
    }

    if (
      checked(
        "liveEuDPreOpenEntry"
      )
    ) {
      vetoes.push(
        "Asia 2B during POR開市前直接入場已刪除。"
      );
    }
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
  $("liveEffectivePosition")
    .textContent =
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
      "雙健康同向：P1／P2 Q3最高1。",
    weakAligned:
      "同向含弱勢／轉換：P1／P2 Q3最高0.5。",
    alignedReverse:
      "反共同方向正常0；只有窄義HTF P1例外可0.25 Probe。",
    conflictMain:
      "衝突順主判：P1／P2 Q3最高0.5。",
    conflictSecondary:
      "逆主判：P1 Q3最高0.5、Q2最高0.25；P2 Q3要額外資格。",
    transitionConfirmed:
      "包含轉換順已確認方向：最高0.5。",
    transitionReverse:
      "主判Transition而逆次判已確認方向：只限真正P1 Q3，最高0.25。",
    bothTransition:
      "雙轉換／Range只做邊界；P1 Q3 0.5、P2 Q3 0.25。"
  };

  $("liveRelationNote").textContent =
    relationNotes[routeCode] || "";

  const notes = [
    `市場：${MARKET_CONFIG[
      marketCode(true)
    ].label}。`,
    `Setup：${definition.label}。`,
    `方向／市場關係：${liveRouteLabel(routeCode)}。`,
    selectedSetupType === "A" &&
      !typeAQualified
      ? isDesignatedTypeASetup(true)
        ? "Type A未確認高質資格，按Type B處理。"
        : "呢個唔係指定Type A Session 2B；按Type B處理。"
      : `Setup Type：${setupTypeLabel(effectiveSetupType)}。`,
    livePositionTreatment ===
      "nativeP2"
      ? "EU-B／EU-C：完整Full Repair形成真實Breakout＋Acceptance＋首次Retest，按原生P2處理。"
      : livePositionTreatment ===
          "p2Effective"
        ? euD
          ? "EU-D：完整Asia Sweep＋Post-open Confirmation令原始P3獲P2-effective待遇。"
          : "Type A：原始P3獲P2-effective待遇。"
        : `位置：${effectivePosition}。`,
    effectiveSetupType === "A" &&
      $("liveTriggerQuality").value === "Q2" &&
      checked(
        "liveTypeAQ2EdgeOnly"
      )
      ? "Type A：Q2唯一問題係Sweep／Reclaim邊緣，獲Q3待遇。"
      : `Q：${effectiveQuality}。`,
    euD
      ? basePosition === "P1" ||
        basePosition === "P2"
        ? `EU-D已有真實Breakout／Swap位置：維持原生${basePosition}，唔再升級。`
        : "EU-D只可用P3→P2-effective一次；Asia Sweep、Opening Drive同0.618唔可以逐項重複計分，亦唔會額外升Q或創造方向權限。"
      : "",
    euOpeningVariant
      ? $("liveOpeningDriveStatus")
          .selectedOptions[0]
          .textContent
      : "",
    showCounterP2
      ? counterP2Eligible
        ? `逆主判P2資格：${$("liveCounterP2Basis").selectedOptions[0].textContent}。`
        : "逆主判P2未有額外資格，正常0。"
      : "",
    showHTFException
      ? htfExceptionEligible
        ? "窄義HTF P1反轉例外成立：最高0.25 Probe。"
        : "反共同方向正常0；例外未完整。"
      : "",
    rangeState === "outside"
      ? "Range未進入相關25%：降一級。"
      : rangeState === "middle"
        ? "Range中間：0注。"
        : "",
    obstacleNote
  ].filter(Boolean);

  if (
    marketCode(true) === "UK100" ||
    marketCode(true) === "GER40"
  ) {
    notes.push(
      "EU硬規則：Asia 2B during POR唔可以開市前直接入場。"
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

  populateSetupTemplateSelect(
    $("marketCode").value,
    "setupTemplate"
  );

  populateSetupTemplateSelect(
    $("liveMarketCode").value,
    "liveSetupTemplate"
  );

  applySetupTemplate(false);
  applySetupTemplate(true);
}

function syncTypeACriteriaFromChecklist(
  eventTargetId = ""
) {
  if (
    setupTypeFromTemplate(false) !==
    "A"
  ) {
    return;
  }

  if (
    checked("asia2BCleanSweep")
  ) {
    $("validSweep").checked =
      true;
  }

  if (
    checked("asia2BReclaimBreak")
  ) {
    $("validReclaim").checked =
      true;
    $("microStructureShift")
      .checked = true;
  }

  if (
    checked("asia2BWeakRetest")
  ) {
    $("retestQuality").value =
      "weak";
  }
}

function syncTypeACriteriaFromQ(
  eventTargetId = ""
) {
  if (
    setupTypeFromTemplate(false) !==
    "A"
  ) {
    return;
  }

  if (!checked("validSweep")) {
    $("asia2BCleanSweep").checked =
      false;
  }

  if (
    !checked("validReclaim") ||
    !checked("microStructureShift")
  ) {
    $("asia2BReclaimBreak")
      .checked = false;
  } else if (
    eventTargetId ===
      "validReclaim" ||
    eventTargetId ===
      "microStructureShift"
  ) {
    $("asia2BReclaimBreak")
      .checked = true;
  }

  if (
    $("retestQuality").value !==
    "weak"
  ) {
    $("asia2BWeakRetest").checked =
      false;
  } else if (
    eventTargetId ===
    "retestQuality"
  ) {
    $("asia2BWeakRetest").checked =
      true;
  }
}

function resetAllToDefaultsExceptDate() {
  const preservedTradeDate =
    $("tradeDate").value;

  $("decisionForm").reset();
  $("liveDecisionForm").reset();

  $("tradeDate").value =
    preservedTradeDate;

  $("marketCode").value =
    "FX";
  $("liveMarketCode").value =
    "FX";

  populateSetupTemplateSelect(
    "FX",
    "setupTemplate",
    "fx_liquidity_sweep"
  );

  populateSetupTemplateSelect(
    "FX",
    "liveSetupTemplate",
    "fx_liquidity_sweep"
  );

  applySetupTemplate(false);
  applySetupTemplate(true);

  $("timeframePreset").value =
    "fx";
  applyTimeframePreset("fx");

  $("backgroundState").value =
    "轉換中－中性";
  $("mainState").value =
    "健康跌勢";
  $("secondaryState").value =
    "轉換中－偏跌";

  $("marketTimeRuleNote")
    .textContent =
      MARKET_CONFIG.FX.timeRule;

  clearPendingImage();

  recalculateLiveDecision();
  recalculate();

  showToast(
    "已全部回復預設；交易日期保持不變"
  );
}


function setupEvents() {
  $("liveMarketCode")
    .addEventListener(
      "change",
      () => {
        applyMarketPreset(
          $("liveMarketCode").value,
          true
        );
        recalculateLiveDecision();
      }
    );

  $("liveSetupTemplate")
    .addEventListener(
      "change",
      () => {
        applySetupTemplate(true);
        recalculateLiveDecision();
      }
    );

  $("marketCode")
    .addEventListener(
      "change",
      () => {
        applyMarketPreset(
          $("marketCode").value,
          false
        );
        recalculate();
      }
    );

  $("setupTemplate")
    .addEventListener(
      "change",
      () => {
        applySetupTemplate(false);
        recalculate();
      }
    );

  $("setupType")
    .addEventListener(
      "change",
      () => {
        if (
          setupDefinition(false)
            .manualType
        ) {
          applySetupTemplate(false);
        }
      }
    );

  $("liveSetupType")
    .addEventListener(
      "change",
      () => {
        if (
          setupDefinition(true)
            .manualType
        ) {
          applySetupTemplate(true);
        }
      }
    );

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

  [
    "asia2BCleanSweep",
    "asia2BReclaimBreak",
    "asia2BWeakRetest"
  ].forEach((id) => {
    $(id).addEventListener(
      "change",
      () => {
        syncTypeACriteriaFromChecklist(id);
      }
    );
  });

  [
    "validSweep",
    "validReclaim",
    "microStructureShift",
    "retestQuality"
  ].forEach((id) => {
    $(id).addEventListener(
      "change",
      () => {
        syncTypeACriteriaFromQ(id);
      }
    );
  });

  $("microStructureShift")
    .addEventListener(
      "change",
      () => {
        if (
          setupVariant(false) ===
            "postOpenConfirmation"
        ) {
          $("euBrokeMicroStructure")
            .checked =
              $("microStructureShift")
                .checked;
        }
      }
    );

  $("euBrokeMicroStructure")
    .addEventListener(
      "change",
      () => {
        if (
          setupVariant(false) ===
            "postOpenConfirmation"
        ) {
          $("microStructureShift")
            .checked =
              $("euBrokeMicroStructure")
                .checked;
        }
      }
    );

  $("euNewStructureCycle")
    .addEventListener(
      "change",
      () => {
        if (
          $("euNewStructureCycle")
            .checked
        ) {
          $("openingDriveStatus")
            .value = "expired";
        }
      }
    );

  [
    "firstObstacleR",
    "obstacleKind",
    "obstacleSpaceBeyond",
    "obstacleRFPlan",
    "obstaclePartialPlan",
    "obstacleClearTransition",
    "hardObstacleTreatment",
    "insideMajorObstacle"
  ].forEach((id) => {
    $(id).addEventListener(
      "input",
      syncObstacleModelInputs
    );
    $(id).addEventListener(
      "change",
      syncObstacleModelInputs
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

  $("resetAllDefaults")
    .addEventListener(
      "click",
      resetAllToDefaultsExceptDate
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

  $("marketCode").value =
    "FX";
  $("liveMarketCode").value =
    "FX";

  populateSetupTemplateSelect(
    "FX",
    "setupTemplate",
    "fx_liquidity_sweep"
  );

  populateSetupTemplateSelect(
    "FX",
    "liveSetupTemplate",
    "fx_liquidity_sweep"
  );

  applySetupTemplate(false);
  applySetupTemplate(true);

  applyMarketPreset(
    "FX",
    false
  );

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
