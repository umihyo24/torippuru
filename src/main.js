import { MOVES } from "./data/moves.js";
import { MONSTERS } from "./data/monsters.js";
import { TRAITS as TRAIT_LIBRARY } from "./data/traits.js";
import { TYPE_META, TYPE_ICON_GLYPHS, TYPE_FILTER_ORDER } from "./data/types.js";
import { getAssetPath } from "./data/assets.js";
import {
  HANAFUDA_BOSSES,
  HANAFUDA_BOSS_ORDER,
  HANAFUDA_PROGRESS_LESSONS,
  HANAFUDA_BALANCE_ASSUMPTIONS,
  HANAFUDA_TEST_CASES
} from "./data/hanafudaBosses.js";
import { applyMoveEffect, applyTraitEffect, createAttackContext } from "./battle/battleEngine.js";

(() => {
  "use strict";

  const CONFIG = {
    BOARD_COLS: 3,
    BOARD_ROWS: 2,
    PARTY_ACTIVE_COUNT: 3,
    PARTY_TOTAL_COUNT: 6,
    PARTY_RESERVE_COUNT: 3,
    FRONTLINE_DEPLOY_PRIORITY: [1, 0, 2],
    MAX_LOG_LINES: 160,
    MAX_TURNS: 60,
    POISON_RATIO: 0.1,
    BARRIER_RATIO: 0.5,
    ATK_UP_RATIO: 0.25,
    DEF_UP_RATIO: 0.25,
    TURN_START_ATK_STAGE_RATIO: 0.08,
    CRIT_MULTIPLIER: 1.5,
    CRIT_BASE_RATE: 0.08,
    CRIT_STAGE_RATE: 0.18,
    CRIT_STAGE_MAX: 3,
    MOVE_DETAIL_PANEL_HEIGHT: 72,
    MESSAGE_MIN_MS: 480,
    MESSAGE_AUTO_MS: 1200,
    WAIT_SHORT_MS: 220,
    HP_ANIM_MS: 520,
    DEFEAT_VANISH_MS: 320,
    HIGHLIGHT_MS: 220,
    SPEED_BASE: 1,
    UI: {
      FORMATION_EDIT_PADDING: 20,
      FORMATION_LEFT_PANEL_X: 20,
      FORMATION_LEFT_PANEL_Y: 60,
      FORMATION_LEFT_PANEL_WIDTH: 760,
      FORMATION_LEFT_PANEL_HEIGHT: 760,
      FORMATION_RIGHT_PANEL_X: 796,
      FORMATION_RIGHT_PANEL_Y: 60,
      FORMATION_RIGHT_PANEL_WIDTH: 448,
      FORMATION_RIGHT_PANEL_HEIGHT: 760,
      FORMATION_TOP_X: 12,
      FORMATION_TOP_Y: 50,
      FORMATION_TOP_WIDTH: 736,
      FORMATION_TOP_HEIGHT: 228,
      SLOT_WIDTH: 236,
      SLOT_HEIGHT: 102,
      SLOT_IMAGE_HEIGHT: 78,
      SLOT_NAME_HEIGHT: 24,
      SLOT_GAP_X: 12,
      SLOT_GAP_Y: 12,
      DIVIDER_Y: 290,
      DIVIDER_HEIGHT: 4,
      MONSTER_GRID_X: 12,
      MONSTER_GRID_Y: 304,
      MONSTER_GRID_WIDTH: 736,
      MONSTER_GRID_HEIGHT: 396,
      MONSTER_CARD_WIDTH: 116,
      MONSTER_CARD_HEIGHT: 92,
      MONSTER_GRID_COLS: 6,
      MONSTER_GRID_GAP_X: 8,
      MONSTER_GRID_GAP_Y: 8,
      BUTTON_AREA_X: 12,
      BUTTON_AREA_Y: 710,
      BUTTON_AREA_WIDTH: 736,
      BUTTON_AREA_HEIGHT: 42,
      BUTTON_WIDTH: 140,
      BUTTON_HEIGHT: 42,
      BUTTON_GAP: 12,
      BUTTON_MESSAGE_HEIGHT: 18,
      PARTY_START_X: 0,
      PARTY_START_Y: 0,
      PARTY_SPACING_X: 12,
      CARD_WIDTH: 220,
      CARD_HEIGHT: 86,
      HOME_LEFT_X: 36,
      HOME_LEFT_Y: 58,
      HOME_LEFT_WIDTH: 364,
      HOME_LEFT_HEIGHT: 540,
      HOME_MENU_GRID_X: 426,
      HOME_MENU_GRID_Y: 72,
      HOME_MENU_CARD_WIDTH: 196,
      HOME_MENU_CARD_HEIGHT: 124,
      HOME_MENU_COLS: 2,
      HOME_MENU_GAP_X: 16,
      HOME_MENU_GAP_Y: 16,
      HOME_INFO_X: 36,
      HOME_INFO_Y: 624,
      HOME_INFO_WIDTH: 1208,
      HOME_INFO_HEIGHT: 186,
      FORMATION_LIST_X: 20,
      FORMATION_LIST_Y: 72,
      FORMATION_LIST_WIDTH: 740,
      FORMATION_LIST_ITEM_HEIGHT: 56,
      FORMATION_LIST_SPACING_Y: 8,
      BATTLE_PREPARE_LIST_ITEM_HEIGHT: 158,
      BATTLE_PREPARE_SLOT_LABEL_HEIGHT: 22,
      BATTLE_PREPARE_PREVIEW_HEIGHT: 98,
      BATTLE_PREPARE_GRID_COLUMNS: 3,
      BATTLE_PREPARE_GRID_ROWS: 2,
      BATTLE_PREPARE_SUMMARY_HEIGHT: 16,
      FRONT_SLOT_COLOR: "rgba(74, 113, 166, 0.28)",
      RESERVE_SLOT_COLOR: "rgba(89, 122, 96, 0.26)"
    },
    UI_LAYOUT: {
      SHARED_CONTENT_COLUMN: {
        maxWidthPx: 920,
        offsetXPx: 0
      },
      SECTIONS: {
        battleHeader: { widthAdjustPx: 0, offsetXPx: 0 },
        battlefield: { widthAdjustPx: 0, offsetXPx: 0 },
        messageRow: { widthAdjustPx: 0, offsetXPx: 0 },
        commandArea: { widthAdjustPx: 0, offsetXPx: 0 }
      }
    },
    TIEBREAKER_TEAM_ORDER: ["ally", "enemy"],
    HIGHLIGHT_COLORS: {
      attackSource: "#ffe163",
      attackTargetSingle: "#ff6a6a",
      attackTargetAoe: "#ff9f4a",
      statusPoison: "#b07bff",
      statusDefault: "#7d91ff",
      statusRemove: "#8ff5ff",
      traitSource: "#55e9ff",
      traitTarget: "#7bd8ff"
    },
    MONSTER_BUILD: {
      MAX_TOTAL_POINTS: 66,
      PER_STAT_MIN: 0,
      PER_STAT_MAX: 32,
      MAX_SELECTABLE_MOVES: 4,
      NATURE_UP_RATE: 1.1,
      NATURE_DOWN_RATE: 0.9,
      NATURE_ROUNDING: "floor",
      HOLD_REPEAT_INITIAL_MS: 260,
      HOLD_REPEAT_INTERVAL_MS: 90,
      LAYOUT: {
        SCREEN_PADDING_PX: 12,
        LEFT_PANEL_WIDTH_PX: 540,
        COLUMN_GAP_PX: 10,
        PANEL_MIN_HEIGHT_PX: 786,
        PANEL_PADDING_PX: 10,
        SECTION_GAP_PX: 8,
        SUMMARY_IMAGE_WIDTH_PX: 160,
        SUMMARY_IMAGE_HEIGHT_PX: 118,
        STAT_ROW_GAP_PX: 4,
        STAT_BAR_HEIGHT_PX: 14,
        STAT_LABEL_WIDTH_PX: 46,
        STAT_CONTROL_WIDTH_PX: 142,
        STAT_VALUE_WIDTH_PX: 44,
        MOVE_CARD_HEIGHT_PX: 78,
        MOVE_CARD_PADDING_PX: 8,
        MOVE_CARD_BORDER_PX: 1,
        MOVE_CARD_RADIUS_PX: 11,
        MOVE_CARD_ICON_SIZE_PX: 38,
        MOVE_CARD_POWER_WIDTH_PX: 68,
        MOVE_CARD_TITLE_SIZE_PX: 14,
        MOVE_CARD_META_SIZE_PX: 10,
        MOVE_CARD_DESC_SIZE_PX: 11,
        EQUIPPED_CARD_HEIGHT_PX: 52,
        EQUIPPED_CARD_PADDING_PX: 5,
        EQUIPPED_CARD_ICON_SIZE_PX: 30,
        EQUIPPED_CARD_POWER_WIDTH_PX: 54,
        EQUIPPED_CARD_TITLE_SIZE_PX: 13,
        EQUIPPED_SECTION_PADDING_PX: 6,
        EQUIPPED_SECTION_GAP_PX: 4,
        EQUIPPED_SLOT_GAP_PX: 3,
        ACTION_PANEL_MIN_HEIGHT_PX: 78,
        ACTION_BUTTON_HEIGHT_PX: 34,
        FONT_SIZE_BODY_PX: 12,
        FONT_SIZE_TITLE_PX: 22
      }
    }
  };

  const TEAM = { ALLY: "ally", ENEMY: "enemy" };
  const DEBUG_FLAGS = {
    battleTargeting: true
  };
  const PHASE = {
    START: "start",
    HOME: "home",
    FORMATION: "formation",
    FORMATION_EDIT: "formation_edit",
    MONSTER_LIST: "monster_list",
    MONSTER_DETAIL: "monster_detail",
    TRAINER_CARD: "trainer_card",
    SETTINGS: "settings",
    BATTLE_PREPARE: "battle_prepare",
    PLAYING: "playing",
    REWARD: "reward",
    GAMEOVER: "gameover"
  };
  const START_VIEW = {
    HUB: "hub",
    TRIAL_SELECT: "trial_select",
    TRIAL_INTRO: "trial_intro"
  };
  const HOME_MENU_ITEMS = [
    { key: "battle", label: "Battle", icon: "⚔" },
    { key: "formation", label: "Formation", icon: "☷" },
    { key: "monsters", label: "Monster List", icon: "🐾" },
    { key: "hanafudaTrials", label: "十二札試練", icon: "🃏" },
    { key: "settings", label: "Settings", icon: "⚙" }
  ];
  const SAVE_VERSION = 1;
  const STORAGE_KEYS = {
    mainSave: "game_main_save",
    autosaveSlots: "game_autosave_slots",
    sessionSave: "game_session_save"
  };
  const AUTOSAVE_LABELS = ["最新", "1つ前", "2つ前"];

  const patterns = {
    front3: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
    self: [{ x: 0, y: 0 }],
    allyAdjacent: [{ x: -1, y: 0 }, { x: 1, y: 0 }],
    singleAttackReach: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
  };

  Object.values(MOVES).forEach((move) => {
    if (!move || typeof move !== "object") return;
    if (!move.role) move.role = move.category === "status" ? "support" : "attack";
    if (!move.target) move.target = move.targetMode === "all-enemies" ? "all-enemies" : "single";
    if (typeof move.description !== "string" || !move.description) {
      move.description = move.role === "support" ? "補助効果" : (move.target === "all-enemies" ? "全体攻撃" : "単体攻撃");
    }
    if (move.special === undefined) move.special = null;
    if (move.role === "attack" && !Number.isFinite(Number(move.power))) move.power = 0;
  });

  const STATUSES = {
    poison: { kind: "poison", category: "dot", duration: 3, tags: ["poison"] },
    barrier: { kind: "barrier", category: "barrier", duration: 2, tags: ["barrier"] },
    atkUp: { kind: "atkUp", category: "buffAtk", duration: 2, tags: ["buff", "atk"] },
    defUp: { kind: "defUp", category: "buffDef", duration: 2, tags: ["buff", "def"] },
    bind: { kind: "bind", category: "debuffBind", duration: 2, tags: ["debuff", "bind"] }
  };

  const TRAIT_LIBRARY = {
    venomTouch: { key: "venomTouch", name: "ベノムタッチ", description: "攻撃を当てた後、相手をどくにする。", onAfterDamage: [{ type: "applyStatus", status: "poison", duration: 2 }] },
    battleRhythm: { key: "battleRhythm", name: "バトルリズム", description: "ターン開始時、こうげき段階が1上がる。", onTurnStart: [{ type: "addAtkStage", amount: 1, target: "self" }] },
    openingSurge: { key: "openingSurge", name: "オープニングサージ", description: "登場時、こうげき段階が2上がる。", onSwitchIn: [{ type: "addAtkStage", amount: 2, target: "self" }] },
    gyakkyo_maru: { key: "gyakkyo_maru", name: "ぎゃっきょう○", description: "ターン開始時、こうげき段階が1上がる。", onTurnStart: [{ type: "addAtkStage", amount: 1, target: "self" }] },
    intimidate: { key: "intimidate", name: "いあつかん", description: "登場時、正面の相手のこうげきを1段階さげる" },
    wonder_guard: { key: "wonder_guard", name: "ふしぎなまもり", description: "弱点以外の攻撃を受けない" },
    koukakudahou: { key: "koukakudahou", name: "こうかくだほう", description: "自分以外のタイプのわざも一致威力になる" },
    no_guard: { key: "no_guard", name: "ノーガード", description: "お互いのすべての技が必中になる" },
    ino_ichiban: { key: "ino_ichiban", name: "いのいちばん", description: "1ターン目だけ先制しやすくなる", traitKey: "first_turn_priority" },
    innocence: { key: "innocence", name: "イノセンス", description: "能力低下を受けない", traitKey: "ignore_stat_down" },
    innovation: { key: "innovation", name: "イノベーション", description: "攻撃後に攻撃↑防御↓", traitKey: "atk_up_def_down" }
  };

  const INITIAL_PARTY = {
    ally: ["maguma", "sandko", "frostfang", "emberlynx", "hittokage", "stormimp"],
    enemy: ["wyvern", "golem", "shinju"]
  };
  const FORMATION_SLOT_COUNT = 3;
  const FORMATION_MEMBER_COUNT = CONFIG.PARTY_TOTAL_COUNT;

  const STATUS_LABELS = { poison: "どく", barrier: "バリア", atkUp: "こうげきアップ", defUp: "ぼうぎょアップ", critFocus: "精神集中" };
  const STATUS_APPLY_TEXT = {
    poison: (n) => `${n}は どくを うけた！`,
    barrier: (n) => `${n}は バリアに守られた！`,
    atkUp: (n) => `${n}の こうげきが上がった！`,
    defUp: (n) => `${n}の ぼうぎょが上がった！`,
    critFocus: (n) => `${n}は 精神集中した！`,
  };
  const STATUS_FADE_TEXT = {
    poison: (n) => `${n}の どくが消えた。`,
    barrier: (n) => `${n}の バリアが消えた。`,
    atkUp: (n) => `${n}の こうげきアップが切れた。`,
    defUp: (n) => `${n}の ぼうぎょアップが切れた。`,
    critFocus: (n) => `${n}の 精神集中が切れた。`,
  };
  const getTraitLabel = (traitKey) => TRAIT_LIBRARY?.[traitKey]?.name || traitKey || "trait";

  const MOVE_CATEGORY_LABELS = {
    physical: "物理",
    special: "特殊",
    status: "補助"
  };

  const MOVE_CATEGORY_FALLBACK_ICON = {
    physical: "PH",
    special: "SP",
    status: "ST"
  };
  const MOVE_ROLE_LABELS = {
    attack: "攻撃",
    support: "補助"
  };
  const MOVE_TARGET_LABELS = {
    single: "単体",
    "all-enemies": "敵全体"
  };

  const getMoveRole = (move) => move?.role || (move?.category === "status" ? "support" : "attack");
  const getMoveTargetLabel = (move) => MOVE_TARGET_LABELS[move?.target] || (move?.targetMode === "all-enemies" ? "敵全体" : "単体");
  const getMoveEffectText = (move) => {
    if (!move) return "-";
    if (move.effectKey === "multi_hit_by_alive_allies") return "生存味方数ぶん多段攻撃";
    if (move.effectKey === "multi_hit_2") return "2回攻撃";
    if (move.effectKey === "priority_plus_1") return "先制攻撃";
    if (move.effectKey === "always_hit") return "必中";
    if (move.effectKey === "self_def_down") return "使用後に防御が下がる";
    if (move.effectKey === "self_atk_def_down") return "使用後に攻撃と防御が下がる";
    if (move.effectKey === "recoil_20") return "与えたダメージの20%を反動で受ける";
    if ((Number(move.power) || 0) > 0) return `威力 ${move.power}`;
    const effects = Array.isArray(move.beforeDamage) ? move.beforeDamage : [];
    if (effects.some((e) => e?.type === "applyStatus")) return "状態異常を付与";
    if (effects.some((e) => e?.type === "modifyCritStage")) return "急所率を上げる";
    return move.description || "補助効果";
  };

  const createEmptyFormation = () => Array.from({ length: FORMATION_MEMBER_COUNT }, () => null);

  const cloneFormation = (formation) => {
    if (!Array.isArray(formation)) return createEmptyFormation();
    const out = createEmptyFormation();
    for (let i = 0; i < FORMATION_MEMBER_COUNT; i += 1) {
      const unitId = formation[i];
      out[i] = MONSTERS[unitId] ? unitId : null;
    }
    return out;
  };

  const createDefaultFormations = () => {
    const base = createEmptyFormation();
    INITIAL_PARTY.ally.slice(0, FORMATION_MEMBER_COUNT).forEach((unitId, idx) => {
      if (MONSTERS[unitId]) base[idx] = unitId;
    });
    return [base, null, null];
  };

  const normalizeTrialIds = (list = []) => {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list
      .filter((trialId) => typeof trialId === "string" && HANAFUDA_BOSSES[trialId] && !seen.has(trialId) && seen.add(trialId));
  };

  const createDefaultProgress = () => ({
    unlockedTrials: [HANAFUDA_BOSS_ORDER[0] || "tsurumatsu"].filter((id) => !!HANAFUDA_BOSSES[id]),
    clearedTrials: [],
    selectedTrial: null,
    pendingReward: null
  });

  const createProgressState = (seedProgress = null) => {
    const fallback = createDefaultProgress();
    if (!seedProgress || typeof seedProgress !== "object") return fallback;
    const unlockedTrials = normalizeTrialIds(seedProgress.unlockedTrials);
    const clearedTrials = normalizeTrialIds(seedProgress.clearedTrials);
    const selectedTrial = typeof seedProgress.selectedTrial === "string" && HANAFUDA_BOSSES[seedProgress.selectedTrial]
      ? seedProgress.selectedTrial
      : null;
    return {
      unlockedTrials: unlockedTrials.length ? unlockedTrials : fallback.unlockedTrials.slice(),
      clearedTrials,
      selectedTrial,
      pendingReward: null
    };
  };

  const createDefaultStatAllocation = () => ({
    hp: 0,
    atk: 0,
    def: 0,
    spatk: 0,
    spdef: 0,
    spd: 0
  });

  const NATURE_MODIFIER_PRESETS = [
    { key: "no_modifier", label: "補正なし", upStat: null, downStat: null },
    { key: "atk_up_spd_down", label: "攻撃↑ 素早さ↓", upStat: "atk", downStat: "spd" },
    { key: "spatk_up_spd_down", label: "特攻↑ 素早さ↓", upStat: "spatk", downStat: "spd" },
    { key: "def_up_spdef_down", label: "防御↑ 特防↓", upStat: "def", downStat: "spdef" },
    { key: "spdef_up_def_down", label: "特防↑ 防御↓", upStat: "spdef", downStat: "def" }
  ];
  const createNatureModifierByKey = (key) => {
    const preset = NATURE_MODIFIER_PRESETS.find((entry) => entry.key === key) || NATURE_MODIFIER_PRESETS[0];
    return {
      key: preset.key,
      upStat: preset.upStat,
      downStat: preset.downStat,
      upRate: CONFIG.MONSTER_BUILD.NATURE_UP_RATE,
      downRate: CONFIG.MONSTER_BUILD.NATURE_DOWN_RATE
    };
  };

  const createDefaultMonsterBuildState = () => ({
    id: "",
    name: "",
    imageKey: null,
    baseStats: createDefaultStatAllocation(),
    allocatedStats: createDefaultStatAllocation(),
    finalStats: createDefaultStatAllocation(),
    remainingPoints: CONFIG.MONSTER_BUILD.MAX_TOTAL_POINTS,
    maxTotalPoints: CONFIG.MONSTER_BUILD.MAX_TOTAL_POINTS,
    maxPerStatIncrease: CONFIG.MONSTER_BUILD.PER_STAT_MAX,
    natureModifier: createNatureModifierByKey("no_modifier"),
    traits: [],
    selectedTraitKey: null
  });

  const createDefaultMovesBuildState = () => ({
    selected: [],
    moveList: [],
    activeTypeFilter: "all"
  });

  const createDefaultTrainerCardUnlocks = () => ({
    statAdjustmentUnlocked: true,
    perStatCapUnlocked: true,
    moveCustomizationUnlocked: true
  });

  const getSafeFormationSlot = (value) => {
    const max = Math.max(0, FORMATION_SLOT_COUNT - 1);
    return clamp(Number.isFinite(value) ? Math.trunc(value) : 0, 0, max);
  };

  const getSelectableIndex = (value, max) => {
    if (!Number.isFinite(value)) return -1;
    const idx = Math.trunc(value);
    if (idx < 0) return -1;
    return clamp(idx, 0, Math.max(0, max));
  };

  const getSafeHomeIndex = (value) => {
    const max = Math.max(0, getHubMenuItems(gameState).length - 1);
    return clamp(Number.isFinite(value) ? Math.trunc(value) : 0, 0, max);
  };

  const getSafeBoxIndex = (state, value) => {
    const box = Array.isArray(state?.availableMonsters) ? state.availableMonsters : [];
    if (!box.length) return 0;
    return clamp(Number.isFinite(value) ? Math.trunc(value) : 0, 0, box.length - 1);
  };

  const getSafeEditPartyIndex = (value) => {
    const max = Math.max(0, FORMATION_MEMBER_COUNT - 1);
    return clamp(Number.isFinite(value) ? Math.trunc(value) : 0, 0, max);
  };

  const getSafeEditMonsterIndex = (state, value) => getSafeBoxIndex(state, value);

  let UID_COUNTER = 1;
  const backgroundLoadState = new Map();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const byTeamOrder = (team) => CONFIG.TIEBREAKER_TEAM_ORDER.indexOf(team);
  const isAlive = (u) => !!u && u.defeated !== true && u.hp > 0;
  const isDefeated = (u) => !!u && u.hp <= 0;
  const cloneStatus = (kind, duration) => ({ ...STATUSES[kind], duration: duration ?? STATUSES[kind].duration, tags: [...STATUSES[kind].tags] });
  const findStatus = (statuses, kind) => statuses.find((s) => s.kind === kind);

  const normalizeTraitList = (traits = []) => traits
    .map((entry) => {
      if (typeof entry === "string") {
        const lib = TRAIT_LIBRARY[entry];
        if (!lib) return null;
        return { key: lib.key, name: lib.name, description: lib.description };
      }
      const key = typeof entry?.key === "string" ? entry.key : "";
      if (!key) return null;
      const lib = TRAIT_LIBRARY[key];
      return {
        key,
        name: typeof entry?.name === "string" ? entry.name : (lib?.name || "未設定"),
        description: typeof entry?.description === "string" ? entry.description : (lib?.description || "説明なし")
      };
    })
    .filter((trait) => !!trait?.key)
    .slice(0, 3);

  const resolveSelectedTraitKey = (unitId, selectedTraitMap = {}) => {
    const traits = normalizeTraitList(MONSTERS?.[unitId]?.traits || []);
    if (!traits.length) return null;
    const selectedFromDraft = selectedTraitMap?.[unitId];
    if (traits.some((trait) => trait.key === selectedFromDraft)) return selectedFromDraft;
    const selectedFromBase = MONSTERS?.[unitId]?.selectedTraitKey;
    if (traits.some((trait) => trait.key === selectedFromBase)) return selectedFromBase;
    return traits[0].key;
  };

  const createUnit = (unitId, team, slot, options = {}) => {
    const base = MONSTERS[unitId];
    const traitList = normalizeTraitList(base?.traits || []);
    const selectedTraitKey = resolveSelectedTraitKey(unitId, options.selectedTraitByMonsterId || {});
    return {
      uid: `${team}-${unitId}-${slot}-${UID_COUNTER++}`,
      unitId: base.id,
      name: base.name,
      portrait: base.portrait,
      imageKey: base.imageKey || base.portrait || "",
      team,
      slot,
      hp: base.hp,
      maxHp: base.hp,
      atk: base.atk,
      mag: base.mag,
      def: base.def,
      res: base.res,
      spd: base.spd,
      weaknessTypes: Array.isArray(base.weaknessTypes) ? base.weaknessTypes.slice() : [],
      traits: traitList,
      selectedTraitKey,
      moveIds: [...base.moves],
      statuses: [],
      buffs: { atkStage: 0, defStage: 0, spdStage: 0, critStage: 0, critStageDuration: 0 },
      isSwitching: false,
      switchTargetId: null,
      isBoss: base.isBoss === true,
      source: typeof base.source === "string" ? base.source : "monster",
      defeated: false
    };
  };

  const getFormationUnitIds = (formation) => cloneFormation(formation)
    .filter((unitId) => !!unitId && !!MONSTERS[unitId]);

  const getFrontFormationUnitIds = (formation) => cloneFormation(formation)
    .slice(0, CONFIG.PARTY_ACTIVE_COUNT)
    .filter((unitId) => !!unitId && !!MONSTERS[unitId]);

  const hasAnyValidFormationMember = (formation) => getFormationUnitIds(formation).length > 0;

  const createAllyTeamFromFormation = (formation, options = {}) => {
    const normalized = cloneFormation(formation);
    const frontIds = getFrontFormationUnitIds(normalized);
    const activeIdsBySlot = Array.from({ length: CONFIG.BOARD_COLS }, () => null);
    frontIds.slice(0, CONFIG.BOARD_COLS).forEach((unitId, index) => {
      const slot = CONFIG.FRONTLINE_DEPLOY_PRIORITY[index];
      if (!Number.isInteger(slot) || slot < 0 || slot >= CONFIG.BOARD_COLS) return;
      activeIdsBySlot[slot] = unitId;
    });

    const active = activeIdsBySlot.map((unitId, slot) => (unitId ? createUnit(unitId, TEAM.ALLY, slot, options) : null));
    const reserveIds = normalized
      .slice(CONFIG.PARTY_ACTIVE_COUNT, FORMATION_MEMBER_COUNT)
      .filter((unitId) => !!unitId && !!MONSTERS[unitId]);
    const reserve = reserveIds.map((unitId, idx) => createUnit(unitId, TEAM.ALLY, `r${idx}`, options));
    return { active, reserve };
  };

  const createDefaultGameState = (seed = {}) => {
    const seedFormations = Array.isArray(seed.formations) ? seed.formations.slice(0, FORMATION_SLOT_COUNT) : createDefaultFormations();
    while (seedFormations.length < FORMATION_SLOT_COUNT) seedFormations.push(null);
    const seedAvailableMonsters = (() => {
      const allMonsterIds = Object.keys(MONSTERS);
      if (!Array.isArray(seed.availableMonsters) || seed.availableMonsters.length === 0) return allMonsterIds;
      const merged = seed.availableMonsters
        .filter((monsterId, index, src) => typeof monsterId === "string" && !!MONSTERS[monsterId] && src.indexOf(monsterId) === index);
      allMonsterIds.forEach((monsterId) => {
        if (!merged.includes(monsterId)) merged.push(monsterId);
      });
      return merged;
    })();
    const battleFormationIndex = getSafeFormationSlot(seed.battleFormationIndex);
    const selectedFormation = cloneFormation(seedFormations[battleFormationIndex] || null);
    const seedMonsterTraitDrafts = (seed?.monsterTraitDrafts && typeof seed.monsterTraitDrafts === "object")
      ? { ...seed.monsterTraitDrafts }
      : {};
    const allyTeam = createAllyTeamFromFormation(selectedFormation, { selectedTraitByMonsterId: seedMonsterTraitDrafts });
    return ({
      phase: PHASE.HOME,
      turn: 1,
      winner: null,
      systemMessage: "",
      progressionMeta: {
        balanceAssumptions: HANAFUDA_BALANCE_ASSUMPTIONS,
        testCases: HANAFUDA_TEST_CASES
      },
      progress: createProgressState(seed?.progress),
      formations: seedFormations,
      availableMonsters: seedAvailableMonsters,
      autosaveSlots: [],
      settings: (seed?.settings && typeof seed.settings === "object") ? { ...seed.settings } : {},
      currentEditIndex: null,
      battlePrepareIndex: -1,
      selectedMonsterId: null,
      input: {
        mouseX: 0,
        mouseY: 0,
        mouseClicked: false
      },
      uiRects: {
        backButton: null,
        saveButton: null
      },
    battle: {
        mode: "normal",
        trialKey: null,
        turn: 1,
        selectedTargetKey: null,
        log: [],
        enemyTeam: [],
        player: {
          activeIndex: 0,
          party: []
        },
        enemy: {
          activeIndex: 0,
          party: []
        }
      },
      battlefield: { background: getAssetPath("backgrounds", "battle") },
      teams: {
        ally: {
          active: allyTeam.active,
          reserve: allyTeam.reserve,
        statuses: [],
        tileEffects: [[], [], []]
      },
      enemy: {
        active: INITIAL_PARTY.enemy.slice(0, CONFIG.BOARD_COLS).map((unitId, slot) => createUnit(unitId, TEAM.ENEMY, slot)),
        reserve: [],
        statuses: [],
        tileEffects: [[], [], []]
      }
    },
    globalStatuses: [],
    confirmedCommands: Array.from({ length: CONFIG.BOARD_COLS }, () => null),
    turnSwitchRequests: {
      ally: Array.from({ length: CONFIG.BOARD_COLS }, () => null),
      enemy: Array.from({ length: CONFIG.BOARD_COLS }, () => null)
    },
    plannedActions: {},
    enemyPlannedActions: {},
    currentActorIndex: 0,
    selectedMoveId: null,
    selectedTargets: [],
    monster: createDefaultMonsterBuildState(),
    moves: createDefaultMovesBuildState(),
      ui: {
        startView: START_VIEW.HUB,
        trialSelectIndex: 0,
        trialIntroPage: 0,
        rewardChoiceIndex: 0,
        homeIndex: 0,
        homeHoverIndex: -1,
        currentHubSection: HOME_MENU_ITEMS[0]?.key || "battle",
        hubMenuItems: HOME_MENU_ITEMS.map((item) => item.key),
        formationIndex: -1,
        battlePrepareIndex: -1,
        monsterListIndex: -1,
        monsterDetailTab: "status",
        selectedMoveIndex: null,
        monsterDetailSnapshot: null,
        returnTo: null,
        formationEdit: {
          selectedSlotIndex: -1,
          selectedMonsterKey: null,
          returnScreenAfterMonsterEdit: null,
          draft: null,
          scrollOffset: 0
        },
      command: "fight",
      partyIndex: 0,
      selectingParty: false,
      commandMode: "fight",
      previewTargets: [],
      hoverSlot: null,
      switchSelection: null,
      pendingKoSlot: null,
      selectedAction: null,
      targetCandidates: [],
      fastForwardRequested: false,
      isLogOpen: false,
      isMenuOpen: false
    },
    battleFlow: {
      mode: "command",
      eventQueue: [],
      currentEventIndex: 0,
      currentMessage: "わざを選んでください。",
      isEventRunning: false,
      waitUntil: 0,
      turnLogEntries: [],
      playbackSpeed: CONFIG.SPEED_BASE,
      activeEvent: null,
      pendingTurnResult: null,
      koReplacement: {
        activeTeam: null,
        pendingSlots: []
      }
    },
    playing: {
      turnCount: 0,
      hasCompletedFirstTurn: false
    },
    displayState: {
      hpAnimations: {},
      hpDisplay: {},
      defeatVanish: {},
      hiddenDefeatedPortraits: {}
    },
    battleHighlight: {
      active: false,
      sources: [],
      targets: [],
      effectType: null,
      statusKind: null,
      traitKind: null,
      removeKind: null
    },
      log: [],
      monsterTrainingDrafts: {},
      monsterMoveDrafts: {},
      monsterNatureDrafts: {},
      monsterTraitDrafts: seedMonsterTraitDrafts,
      trainerCard: {
        badges: {
          novice: true,
          tactician: false,
          veteran: false
        },
        unlocks: createDefaultTrainerCardUnlocks()
      },
      trialBattle: {
        bossId: null,
        gimmick: null
      },
      temp: { renderCells: [] }
    });
  };
  const createInitialState = (seed = {}) => createDefaultGameState(seed);

  const hasLocalStorage = () => {
    try {
      return typeof window !== "undefined" && !!window.localStorage;
    } catch (error) {
      return false;
    }
  };
  const safeJsonParse = (raw) => {
    if (typeof raw !== "string" || !raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  };
  const safeStorageGet = (key) => {
    if (!hasLocalStorage()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };
  const safeStorageSet = (key, value) => {
    if (!hasLocalStorage()) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  };
  const safeStorageRemove = (key) => {
    if (!hasLocalStorage()) return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  };
  const validateFormationForSave = (formation) => {
    if (!Array.isArray(formation)) return false;
    if (formation.length !== FORMATION_MEMBER_COUNT) return false;
    return formation.every((unitId) => unitId === null || (typeof unitId === "string" && !!MONSTERS[unitId]));
  };
  const validateMonsterEntryForSave = (entry) => {
    if (!entry || typeof entry !== "object") return false;
    const allocation = entry.statAllocation;
    if (!allocation || typeof allocation !== "object") return false;
    const keys = ["hp", "atk", "def", "spatk", "spdef", "spd"];
    if (!keys.every((key) => Number.isFinite(Number(allocation[key])))) return false;
    if (!Array.isArray(entry.selectedMoves)) return false;
    if (entry.selectedMoves.length > CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) return false;
    return true;
  };
  const validateMainSaveData = (saveData) => {
    if (!saveData || typeof saveData !== "object") return false;
    if (saveData.version !== SAVE_VERSION) return false;
    if (!Number.isFinite(Number(saveData.savedAt))) return false;
    if (!saveData.monsters || typeof saveData.monsters !== "object") return false;
    if (!Array.isArray(saveData.formations)) return false;
    if (!saveData.settings || typeof saveData.settings !== "object") return false;
    if (!saveData.progress || typeof saveData.progress !== "object") return false;
    if (!Array.isArray(saveData.progress.unlockedTrials)) return false;
    if (!Array.isArray(saveData.progress.clearedTrials)) return false;
    if (!saveData.formations.every((formation) => formation === null || validateFormationForSave(formation))) return false;
    return Object.values(saveData.monsters).every(validateMonsterEntryForSave);
  };
  const validateAndMigrateMainSaveData = (rawSave) => {
    if (!rawSave || typeof rawSave !== "object") return null;
    if (rawSave.version !== SAVE_VERSION) return null;
    if (!validateMainSaveData(rawSave)) return null;
    return rawSave;
  };
  const validateSessionSaveData = (sessionData) => {
    if (!sessionData || typeof sessionData !== "object") return false;
    if (sessionData.version !== SAVE_VERSION) return false;
    if (!Number.isFinite(Number(sessionData.startedAt))) return false;
    if (!["battlePrepare", "home", "trialSelect", "start"].includes(sessionData.lastSafeScreen)) return false;
    if (!(sessionData.selectedFormationId === null || typeof sessionData.selectedFormationId === "string")) return false;
    if (!["in_battle", "interrupted"].includes(sessionData.status)) return false;
    if (!(sessionData.battleMode === undefined || typeof sessionData.battleMode === "string")) return false;
    if (!(sessionData.trialKey === undefined || sessionData.trialKey === null || typeof sessionData.trialKey === "string")) return false;
    return true;
  };
  const createSaveDataFromGameState = (state) => {
    const monsters = {};
    Object.keys(MONSTERS).forEach((monsterId) => {
      const draftStats = state?.monsterTrainingDrafts?.[monsterId] || createDefaultStatAllocation();
      const selectedMoves = Array.isArray(state?.monsterMoveDrafts?.[monsterId]) ? state.monsterMoveDrafts[monsterId] : [];
      monsters[monsterId] = {
        statAllocation: {
          hp: Number(draftStats.hp) || 0,
          atk: Number(draftStats.atk) || 0,
          def: Number(draftStats.def) || 0,
          spatk: Number(draftStats.spatk) || 0,
          spdef: Number(draftStats.spdef) || 0,
          spd: Number(draftStats.spd) || 0
        },
        selectedMoves: selectedMoves.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES),
        selectedTraitKey: state?.monsterTraitDrafts?.[monsterId] || null,
        natureKey: state?.monsterNatureDrafts?.[monsterId] || "no_modifier"
      };
    });
    return {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      monsters,
      formations: (state?.formations || []).map((formation) => (Array.isArray(formation) ? cloneFormation(formation) : null)),
      settings: (state?.settings && typeof state.settings === "object") ? { ...state.settings } : {},
      progress: {
        unlockedTrials: normalizeTrialIds(state?.progress?.unlockedTrials),
        clearedTrials: normalizeTrialIds(state?.progress?.clearedTrials)
      }
    };
  };
  const applySaveDataToGameState = (state, saveData) => {
    const valid = validateAndMigrateMainSaveData(saveData);
    if (!valid) return false;
    const nextFormations = Array.isArray(valid.formations) ? valid.formations.slice(0, FORMATION_SLOT_COUNT) : [];
    while (nextFormations.length < FORMATION_SLOT_COUNT) nextFormations.push(null);
    state.formations = nextFormations.map((formation) => (Array.isArray(formation) ? cloneFormation(formation) : null));
    state.settings = { ...(valid.settings || {}) };
    state.progress = createProgressState({
      unlockedTrials: valid?.progress?.unlockedTrials || [],
      clearedTrials: valid?.progress?.clearedTrials || [],
      selectedTrial: null
    });
    state.monsterTrainingDrafts = {};
    state.monsterMoveDrafts = {};
    state.monsterTraitDrafts = {};
    state.monsterNatureDrafts = {};
    Object.entries(valid.monsters || {}).forEach(([monsterId, entry]) => {
      if (!MONSTERS[monsterId] || !validateMonsterEntryForSave(entry)) return;
      state.monsterTrainingDrafts[monsterId] = {
        hp: Number(entry.statAllocation.hp) || 0,
        atk: Number(entry.statAllocation.atk) || 0,
        def: Number(entry.statAllocation.def) || 0,
        spatk: Number(entry.statAllocation.spatk) || 0,
        spdef: Number(entry.statAllocation.spdef) || 0,
        spd: Number(entry.statAllocation.spd) || 0
      };
      state.monsterMoveDrafts[monsterId] = entry.selectedMoves
        .filter((moveId) => moveId === null || !!MOVES[moveId])
        .slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES);
      state.monsterTraitDrafts[monsterId] = typeof entry.selectedTraitKey === "string" ? entry.selectedTraitKey : null;
      state.monsterNatureDrafts[monsterId] = typeof entry.natureKey === "string" ? entry.natureKey : "no_modifier";
    });
    return true;
  };
  const loadMainSave = () => {
    const parsed = safeJsonParse(safeStorageGet(STORAGE_KEYS.mainSave));
    const migrated = validateAndMigrateMainSaveData(parsed);
    return migrated || null;
  };
  const loadAutosaveSlots = () => {
    const parsed = safeJsonParse(safeStorageGet(STORAGE_KEYS.autosaveSlots));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((slot) => slot && typeof slot === "object" && Number.isInteger(slot.slot) && validateMainSaveData(slot.data))
      .slice(0, 3);
  };
  const writeAutosave = () => {
    const currentMainShape = createSaveDataFromGameState(gameState);
    const existing = loadAutosaveSlots();
    const next = [
      { slot: 0, label: AUTOSAVE_LABELS[0], savedAt: Date.now(), data: currentMainShape },
      existing[0] ? { ...existing[0], slot: 1, label: AUTOSAVE_LABELS[1] } : null,
      existing[1] ? { ...existing[1], slot: 2, label: AUTOSAVE_LABELS[2] } : null
    ].filter(Boolean);
    safeStorageSet(STORAGE_KEYS.autosaveSlots, next);
    gameState.autosaveSlots = next;
    return next;
  };
  const restoreAutosaveSlot = (index) => {
    const slots = loadAutosaveSlots();
    const target = slots.find((slot) => slot.slot === index);
    if (!target || !validateMainSaveData(target.data)) return false;
    const applied = applySaveDataToGameState(gameState, target.data);
    if (applied) ensureUiSafety();
    return applied;
  };
  const saveMainGame = () => {
    const payload = createSaveDataFromGameState(gameState);
    const success = safeStorageSet(STORAGE_KEYS.mainSave, payload);
    if (success) gameState.systemMessage = "メインセーブを保存しました。";
    return success;
  };
  const writeSessionSave = (data) => {
    const payload = {
      version: SAVE_VERSION,
      startedAt: Number(data?.startedAt) || Date.now(),
      lastSafeScreen: data?.lastSafeScreen === "battlePrepare" ? "battlePrepare" : (data?.lastSafeScreen === "trialSelect" ? "trialSelect" : "home"),
      selectedFormationId: data?.selectedFormationId ?? null,
      status: data?.status === "interrupted" ? "interrupted" : "in_battle",
      battleMode: typeof data?.battleMode === "string" ? data.battleMode : "normal",
      trialKey: typeof data?.trialKey === "string" ? data.trialKey : null
    };
    safeStorageSet(STORAGE_KEYS.sessionSave, payload);
    return payload;
  };
  const clearSessionSave = () => safeStorageRemove(STORAGE_KEYS.sessionSave);
  const bootGame = () => {
    const bootState = createDefaultGameState();
    bootState.autosaveSlots = loadAutosaveSlots();
    const mainSave = loadMainSave();
    if (mainSave) {
      applySaveDataToGameState(bootState, mainSave);
    } else if (safeStorageGet(STORAGE_KEYS.mainSave)) {
      bootState.systemMessage = "セーブデータが破損していたため、初期状態で復旧しました。";
    }
    const sessionRaw = safeJsonParse(safeStorageGet(STORAGE_KEYS.sessionSave));
    if (validateSessionSaveData(sessionRaw) && (sessionRaw.status === "in_battle" || sessionRaw.status === "interrupted")) {
      if (sessionRaw.lastSafeScreen === "battlePrepare") {
        bootState.phase = PHASE.BATTLE_PREPARE;
      } else if (sessionRaw.lastSafeScreen === "trialSelect") {
        bootState.phase = PHASE.START;
        bootState.ui.startView = START_VIEW.TRIAL_SELECT;
      } else {
        bootState.phase = PHASE.START;
      }
      bootState.systemMessage = "前回のバトルは安全に中断されました。準備画面から再開してください。";
      clearSessionSave();
    }
    return bootState;
  };

  const TRAINING_TOTAL_CAP = CONFIG.MONSTER_BUILD.MAX_TOTAL_POINTS;
  const TRAINING_PER_STAT_CAP = CONFIG.MONSTER_BUILD.PER_STAT_MAX;
  const TRAINING_STAT_ROWS = [
    { key: "hp", label: "HP", baseKey: "hp" },
    { key: "atk", label: "攻撃", baseKey: "atk" },
    { key: "def", label: "防御", baseKey: "def" },
    { key: "spatk", label: "特攻", baseKey: "mag" },
    { key: "spdef", label: "特防", baseKey: "res" },
    { key: "spd", label: "素早さ", baseKey: "spd" }
  ];
  const MONSTER_STAT_KEYS = TRAINING_STAT_ROWS.map((row) => row.baseKey);

  const validateUnitLibraryStats = () => {
    const rows = Object.values(MONSTERS).map((unit) => {
      const total = MONSTER_STAT_KEYS.reduce((sum, key) => sum + (Number(unit[key]) || 0), 0);
      const allMultiplesOfFive = MONSTER_STAT_KEYS.every((key) => ((Number(unit[key]) || 0) % 5) === 0);
      return { id: unit.id, total, allMultiplesOfFive };
    });
    console.table(rows);
    const sampleAttackerPhysical = createUnit("maguma", TEAM.ALLY, "debug-phy");
    const sampleAttackerSpecial = createUnit("stormimp", TEAM.ALLY, "debug-sp");
    const sampleDefender = createUnit("golem", TEAM.ENEMY, "debug-def");
    console.log("[Debug] golem receiving physical damage (maguma quakeWave):", calcDamage(sampleAttackerPhysical, sampleDefender, MOVES.quakeWave, { isCritical: false }));
    console.log("[Debug] golem receiving special damage (stormimp toxicSpit):", calcDamage(sampleAttackerSpecial, sampleDefender, MOVES.toxicSpit, { isCritical: false }));
    console.log("[Debug] stormimp using special move toxicSpit:", calcDamage(sampleAttackerSpecial, sampleDefender, MOVES.toxicSpit, { isCritical: false }));
    console.log("[Debug] maguma using physical move quakeWave:", calcDamage(sampleAttackerPhysical, sampleDefender, MOVES.quakeWave, { isCritical: false }));
  };

  let gameState = bootGame();
  let statAdjustHoldTimer = null;

  const getFormationAt = (state, index) => {
    const list = Array.isArray(state?.formations) ? state.formations : [];
    const safeIndex = getSafeFormationSlot(index);
    const value = list[safeIndex];
    return Array.isArray(value) ? cloneFormation(value) : null;
  };

  const getUnitName = (unitId) => MONSTERS?.[unitId]?.name || "UNKNOWN";
  const getMonsterLibraryIds = (state = gameState) => Array.isArray(state?.availableMonsters) ? state.availableMonsters.filter((id) => !!MONSTERS[id]) : [];
  const getSafeMonsterListIndex = (state, value) => {
    const ids = getMonsterLibraryIds(state);
    if (!ids.length) return -1;
    return clamp(Number.isFinite(value) ? Math.trunc(value) : 0, 0, ids.length - 1);
  };
  const getSelectedMonster = (state = gameState) => {
    const selectedId = state?.selectedMonsterId;
    if (selectedId && MONSTERS[selectedId]) return MONSTERS[selectedId];
    const ids = getMonsterLibraryIds(state);
    return ids.length ? MONSTERS[ids[0]] : null;
  };
  const getMonsterTrainingDraft = (monsterId, state = gameState) => {
    if (!monsterId || !MONSTERS[monsterId]) return createDefaultStatAllocation();
    if (!state.monsterTrainingDrafts[monsterId]) state.monsterTrainingDrafts[monsterId] = createDefaultStatAllocation();
    const out = createDefaultStatAllocation();
    const source = state.monsterTrainingDrafts[monsterId];
    TRAINING_STAT_ROWS.forEach((row) => {
      out[row.key] = clamp(Number(source?.[row.key]) || 0, 0, TRAINING_PER_STAT_CAP);
    });
    return out;
  };
  const getMonsterNatureDraft = (monsterId, state = gameState) => {
    if (!monsterId || !MONSTERS[monsterId]) return createNatureModifierByKey("no_modifier");
    const storedKey = state?.monsterNatureDrafts?.[monsterId];
    const draft = createNatureModifierByKey(storedKey || "no_modifier");
    state.monsterNatureDrafts[monsterId] = draft.key;
    return draft;
  };
  const getAllocatedTrainingPoints = (allocation) => TRAINING_STAT_ROWS.reduce((sum, row) => sum + (Number(allocation?.[row.key]) || 0), 0);
  const getRemainingTrainingPoints = (allocation) => Math.max(0, TRAINING_TOTAL_CAP - getAllocatedTrainingPoints(allocation));
  const roundFinalStat = (value) => {
    const raw = Number.isFinite(value) ? value : 0;
    return CONFIG.MONSTER_BUILD.NATURE_ROUNDING === "floor" ? Math.floor(raw) : Math.round(raw);
  };
  const calculateFinalMonsterStats = (monster, allocation, natureModifier) => {
    const baseStats = createDefaultStatAllocation();
    const allocatedStats = createDefaultStatAllocation();
    const finalStats = createDefaultStatAllocation();
    const safeNature = createNatureModifierByKey(natureModifier?.key || "no_modifier");
    TRAINING_STAT_ROWS.forEach((row) => {
      const base = Number(monster?.[row.baseKey]) || 0;
      const allocated = clamp(Number(allocation?.[row.key]) || 0, CONFIG.MONSTER_BUILD.PER_STAT_MIN, CONFIG.MONSTER_BUILD.PER_STAT_MAX);
      const unmodified = base + allocated;
      const isHp = row.key === "hp";
      const isUp = !isHp && safeNature.upStat === row.key;
      const isDown = !isHp && safeNature.downStat === row.key;
      let modified = unmodified;
      if (isUp) modified = unmodified * safeNature.upRate;
      if (isDown) modified = unmodified * safeNature.downRate;
      baseStats[row.key] = base;
      allocatedStats[row.key] = allocated;
      finalStats[row.key] = roundFinalStat(modified);
    });
    return { baseStats, allocatedStats, finalStats, natureModifier: safeNature };
  };
  const canAdjustTrainingStat = ({ allocation, statKey, delta }) => {
    const current = Number(allocation?.[statKey]) || 0;
    if (delta < 0) return current > 0;
    if (current >= TRAINING_PER_STAT_CAP) return false;
    return getAllocatedTrainingPoints(allocation) < TRAINING_TOTAL_CAP;
  };
  const getMonsterMoveDraft = (monsterId, state = gameState) => {
    const baseMoves = Array.isArray(MONSTERS?.[monsterId]?.moves) ? MONSTERS[monsterId].moves : [];
    const baseSelected = [];
    for (const moveId of baseMoves) {
      if (!MOVES[moveId] || baseSelected.includes(moveId)) continue;
      baseSelected.push(moveId);
      if (baseSelected.length >= CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) break;
    }
    while (baseSelected.length < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) baseSelected.push(null);
    const storedSelected = Array.isArray(state?.monsterMoveDrafts?.[monsterId]) ? state.monsterMoveDrafts[monsterId] : [];
    const selected = [];
    for (let i = 0; i < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES; i += 1) {
      const moveId = storedSelected[i] || null;
      if (!moveId || !MOVES[moveId] || selected.includes(moveId)) {
        selected.push(baseSelected[i] || null);
        continue;
      }
      selected.push(moveId);
    }
    while (selected.length < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) selected.push(null);
    state.monsterMoveDrafts[monsterId] = selected.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES);
    const moveList = Object.keys(MOVES);
    const activeTypeFilter = TYPE_FILTER_ORDER.includes(state?.moves?.activeTypeFilter) ? state.moves.activeTypeFilter : "all";
    state.moves = { selected, moveList, activeTypeFilter };
    return selected;
  };

  const getMonsterTraits = (monsterId) => {
    return normalizeTraitList(MONSTERS?.[monsterId]?.traits || []);
  };

  const getMonsterTraitDraft = (monsterId, state = gameState) => {
    const traits = getMonsterTraits(monsterId);
    if (!traits.length) {
      if (state?.monsterTraitDrafts && monsterId) state.monsterTraitDrafts[monsterId] = null;
      return { traits: [], selectedTraitKey: null };
    }
    const current = state?.monsterTraitDrafts?.[monsterId];
    const selectedTraitKey = traits.some((trait) => trait.key === current) ? current : traits[0].key;
    if (state?.monsterTraitDrafts && monsterId) state.monsterTraitDrafts[monsterId] = selectedTraitKey;
    return { traits, selectedTraitKey };
  };

  const syncMonsterBuildState = (monsterId, state = gameState) => {
    const monster = MONSTERS[monsterId];
    if (!monster) return;
    const draft = getMonsterTrainingDraft(monsterId, state);
    const natureModifier = getMonsterNatureDraft(monsterId, state);
    const traitDraft = getMonsterTraitDraft(monsterId, state);
    const computed = calculateFinalMonsterStats(monster, draft, natureModifier);
    state.monster = {
      id: monster.id || "",
      name: monster.name || "",
      imageKey: monster.imageKey || monster.portrait || null,
      baseStats: computed.baseStats,
      allocatedStats: computed.allocatedStats,
      finalStats: computed.finalStats,
      remainingPoints: getRemainingTrainingPoints(draft),
      maxTotalPoints: CONFIG.MONSTER_BUILD.MAX_TOTAL_POINTS,
      maxPerStatIncrease: CONFIG.MONSTER_BUILD.PER_STAT_MAX,
      natureModifier: computed.natureModifier,
      traits: traitDraft.traits,
      selectedTraitKey: traitDraft.selectedTraitKey
    };
    getMonsterMoveDraft(monsterId, state);
  };

  const captureMonsterDetailSnapshot = (monsterId, state = gameState) => {
    if (!monsterId || !MONSTERS[monsterId]) return null;
    return {
      monsterId,
      training: getMonsterTrainingDraft(monsterId, state),
      natureKey: getMonsterNatureDraft(monsterId, state)?.key || "no_modifier",
      selectedTraitKey: getMonsterTraitDraft(monsterId, state).selectedTraitKey,
      selectedMoves: getMonsterMoveDraft(monsterId, state).slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES)
    };
  };

  const restoreMonsterDetailSnapshot = (state = gameState) => {
    const snapshot = state?.ui?.monsterDetailSnapshot;
    if (!snapshot?.monsterId || !MONSTERS[snapshot.monsterId]) return false;
    state.monsterTrainingDrafts[snapshot.monsterId] = { ...createDefaultStatAllocation(), ...(snapshot.training || {}) };
    state.monsterNatureDrafts[snapshot.monsterId] = snapshot.natureKey || "no_modifier";
    state.monsterTraitDrafts[snapshot.monsterId] = snapshot.selectedTraitKey || null;
    const selected = Array.isArray(snapshot.selectedMoves) ? snapshot.selectedMoves.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) : [];
    while (selected.length < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) selected.push(null);
    state.monsterMoveDrafts[snapshot.monsterId] = selected;
    syncMonsterBuildState(snapshot.monsterId, state);
    state.ui.selectedMoveIndex = null;
    return true;
  };

  const getFormationMembers = (formation) => {
    const memberIds = getFormationUnitIds(formation).slice(0, FORMATION_MEMBER_COUNT);
    return memberIds.map((unitId) => {
      const unit = MONSTERS[unitId];
      return unit ? { unitId, unit } : null;
    }).filter(Boolean);
  };

  const getMiniMonsterMetaTokens = (unit) => {
    if (!unit || typeof unit !== "object") return [];
    const tokens = [];
    if (unit.gender === "male") tokens.push("♂");
    if (unit.gender === "female") tokens.push("♀");
    if (typeof unit.role === "string" && unit.role.trim()) tokens.push(unit.role.trim().toUpperCase());
    if (Array.isArray(unit.types) && unit.types.length > 0 && typeof unit.types[0] === "string" && unit.types[0].trim()) {
      tokens.push(unit.types[0].trim());
    }
    return tokens.slice(0, 2);
  };

  const renderMiniMonsterCard = (unitId, cardIndex = 0) => {
    const unit = unitId ? MONSTERS[unitId] : null;
    if (!unit) {
      const missing = createEl("div", "mini-monster-card is-missing");
      missing.append(
        createEl("div", "mini-monster-empty", "不明"),
        createEl("div", "mini-monster-name", "データなし")
      );
      return missing;
    }
    const card = createEl("div", "mini-monster-card");
    const portrait = createImageWithFallback({
      src: getMonsterImageSrc(unit),
      alt: unit.name,
      wrapperClass: "mini-monster-portrait",
      placeholderLabel: "未設定",
      placeholderSubLabel: unit.name
    });
    const name = createEl("div", "mini-monster-name", unit.name || `Monster ${cardIndex + 1}`);
    const metaTokens = getMiniMonsterMetaTokens(unit);
    const meta = createEl("div", `mini-monster-meta${metaTokens.length ? "" : " hidden"}`);
    if (metaTokens.length) meta.textContent = metaTokens.join(" · ");
    card.append(portrait, name, meta);
    return card;
  };

  const renderFormationPreview = (formation, options = {}) => {
    const emptySubText = typeof options.emptySubText === "string" && options.emptySubText.trim()
      ? options.emptySubText.trim()
      : "モンスターを設定してください";
    const preview = createEl("div", "formation-preview-grid");
    const members = getFormationUnitIds(formation).slice(0, FORMATION_MEMBER_COUNT);
    if (!members.length) {
      const empty = createEl("div", "formation-empty-state");
      empty.append(
        createEl("div", "formation-empty-title", "未編成"),
        createEl("div", "formation-empty-sub", emptySubText)
      );
      preview.appendChild(empty);
      return preview;
    }
    members.forEach((unitId, index) => {
      preview.appendChild(renderMiniMonsterCard(unitId, index));
    });
    return preview;
  };

  const renderFormationSlotCard = ({
    formation,
    index,
    isSelected = false,
    action = "formation-select",
    showSummary = false,
    previewOptions = {},
    extraClassName = ""
  } = {}) => {
    const members = getFormationMembers(formation);
    const hasMembers = members.length > 0;
    const hasExtraClass = typeof extraClassName === "string" && extraClassName.trim();
    const item = createEl(
      "button",
      `formation-slot-item formation-preview-card${isSelected ? " active" : ""}${hasMembers ? " filled" : ""}${hasExtraClass ? ` ${extraClassName.trim()}` : ""}`
    );
    item.dataset.action = action;
    item.dataset.index = String(getSafeFormationSlot(index));
    item.appendChild(createEl("div", "formation-slot-name", `Slot ${index + 1}`));
    item.appendChild(renderFormationPreview(formation, previewOptions));
    if (showSummary) {
      item.appendChild(createEl("div", "formation-slot-summary", `メンバー ${members.length}/${FORMATION_MEMBER_COUNT}`));
    }
    return item;
  };

  const getHomeInfo = (index, state) => {
    const menuItems = getHubMenuItems(state);
    const safeIndex = getSelectableIndex(index, menuItems.length - 1);
    if (safeIndex < 0) {
      return { title: "HOME", description: "メニューを選択してください。" };
    }
    const menuKey = menuItems[safeIndex]?.key || "";
    if (menuKey === "battle") {
      return {
        title: "Battle",
        description: "編成を選択してバトルを開始します。",
        extra: { lines: ["戦闘前に編成選択画面へ移動します。"] }
      };
    }
    if (menuKey === "hanafudaTrials") {
      return {
        title: "十二札試練",
        description: "花札ボスに挑戦し、試練を順に解放します。",
        extra: { lines: ["Hub → 試練選択 → 導入 → ボス戦 → 報酬"] }
      };
    }
    if (menuKey === "formation") {
      const formations = Array.isArray(state?.formations) ? state.formations : [];
      const savedCount = formations.filter((entry) => Array.isArray(entry)).length;
      return {
        title: "Formation",
        description: "編成を確認・編集します。",
        extra: { lines: [`Saved: ${savedCount}/${FORMATION_SLOT_COUNT}`] }
      };
    }
    if (menuKey === "monsters") {
      const unlockedCount = getMonsterLibraryIds(state).length;
      return {
        title: "Monster List",
        description: "モンスター一覧を確認し、育成詳細を開きます。",
        extra: { lines: [`Monsters: ${unlockedCount}`] }
      };
    }
    if (menuKey === "story") return { title: "Story", description: "ストーリーモードは準備中です。今後の拡張をお待ちください。" };
    if (menuKey === "gacha") return { title: "Gacha", description: "モンスター勧誘機能は準備中です。実装後はここから利用できます。" };
    if (menuKey === "settings") return { title: "Settings", description: "ゲーム設定は準備中です。音量や表示設定を追加予定です。" };
    return { title: "", description: "" };
  };

  const getHomeInfoIndex = (state = gameState) => {
    const menuItems = getHubMenuItems(state);
    const hoverIndex = getSelectableIndex(state?.ui?.homeHoverIndex, menuItems.length - 1);
    if (hoverIndex >= 0) return hoverIndex;
    return getSelectableIndex(state?.ui?.homeIndex, menuItems.length - 1);
  };

  const getHubMenuItems = (state = gameState) => {
    const keys = Array.isArray(state?.ui?.hubMenuItems) && state.ui.hubMenuItems.length
      ? state.ui.hubMenuItems
      : HOME_MENU_ITEMS.map((item) => item.key);
    return keys.map((key) => HOME_MENU_ITEMS.find((item) => item.key === key)).filter(Boolean);
  };

  const getHomeMenuCardRects = (state = gameState) => {
    const menuItems = getHubMenuItems(state);
    const rects = [];
    const cols = Math.max(1, Math.trunc(CONFIG.UI.HOME_MENU_COLS));
    for (let i = 0; i < menuItems.length; i += 1) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      rects.push({
        index: i,
        x: CONFIG.UI.HOME_MENU_GRID_X + (col * (CONFIG.UI.HOME_MENU_CARD_WIDTH + CONFIG.UI.HOME_MENU_GAP_X)),
        y: CONFIG.UI.HOME_MENU_GRID_Y + (row * (CONFIG.UI.HOME_MENU_CARD_HEIGHT + CONFIG.UI.HOME_MENU_GAP_Y)),
        width: CONFIG.UI.HOME_MENU_CARD_WIDTH,
        height: CONFIG.UI.HOME_MENU_CARD_HEIGHT
      });
    }
    return rects;
  };

  const ensureUiSafety = () => {
    if (!gameState.progress || typeof gameState.progress !== "object") gameState.progress = createDefaultProgress();
    gameState.progress.unlockedTrials = normalizeTrialIds(gameState.progress.unlockedTrials);
    if (!gameState.progress.unlockedTrials.length) gameState.progress.unlockedTrials = [HANAFUDA_BOSS_ORDER[0]];
    gameState.progress.clearedTrials = normalizeTrialIds(gameState.progress.clearedTrials);
    gameState.progress.selectedTrial = (typeof gameState.progress.selectedTrial === "string" && HANAFUDA_BOSSES[gameState.progress.selectedTrial])
      ? gameState.progress.selectedTrial
      : null;
    gameState.ui.hubMenuItems = HOME_MENU_ITEMS.map((item) => item.key);
    const menuItems = getHubMenuItems(gameState);
    gameState.ui.homeIndex = getSelectableIndex(gameState.ui.homeIndex, menuItems.length - 1);
    gameState.ui.homeHoverIndex = getSelectableIndex(gameState.ui.homeHoverIndex, menuItems.length - 1);
    const safeHubKey = menuItems[gameState.ui.homeIndex]?.key || menuItems[0]?.key || "battle";
    if (!gameState.ui.hubMenuItems.includes(gameState.ui.currentHubSection)) {
      gameState.ui.currentHubSection = safeHubKey;
    }
    gameState.ui.formationIndex = getSelectableIndex(gameState.ui.formationIndex, FORMATION_SLOT_COUNT - 1);
    gameState.ui.battlePrepareIndex = getSelectableIndex(gameState.ui.battlePrepareIndex, FORMATION_SLOT_COUNT - 1);
    gameState.ui.monsterListIndex = getSafeMonsterListIndex(gameState, gameState.ui.monsterListIndex);
    if (!Object.values(START_VIEW).includes(gameState.ui.startView)) gameState.ui.startView = START_VIEW.HUB;
    gameState.ui.trialSelectIndex = getSelectableIndex(gameState.ui.trialSelectIndex, HANAFUDA_BOSS_ORDER.length - 1);
    gameState.ui.trialIntroPage = clamp(Number(gameState.ui.trialIntroPage) || 0, 0, 1);
    gameState.ui.rewardChoiceIndex = getSelectableIndex(gameState.ui.rewardChoiceIndex, 2);
    if (gameState.ui.monsterDetailTab !== "moves") gameState.ui.monsterDetailTab = "status";
    gameState.ui.selectedMoveIndex = Number.isInteger(gameState.ui.selectedMoveIndex)
      ? clamp(gameState.ui.selectedMoveIndex, 0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES - 1)
      : null;
    if (!gameState.moves || typeof gameState.moves !== "object") gameState.moves = createDefaultMovesBuildState();
    if (!TYPE_FILTER_ORDER.includes(gameState.moves.activeTypeFilter)) gameState.moves.activeTypeFilter = "all";
    const monsterIds = getMonsterLibraryIds(gameState);
    if (!MONSTERS[gameState.selectedMonsterId]) {
      gameState.selectedMonsterId = monsterIds.length ? monsterIds[0] : null;
    }
    if (!gameState.trainerCard || typeof gameState.trainerCard !== "object") {
      gameState.trainerCard = { badges: {}, unlocks: createDefaultTrainerCardUnlocks() };
    }
    if (!gameState.trainerCard.unlocks || typeof gameState.trainerCard.unlocks !== "object") {
      gameState.trainerCard.unlocks = createDefaultTrainerCardUnlocks();
    }
    const edit = gameState.ui.formationEdit;
    edit.selectedSlotIndex = getSelectableIndex(edit.selectedSlotIndex, FORMATION_MEMBER_COUNT - 1);
    edit.selectedMonsterKey = MONSTERS[edit.selectedMonsterKey] ? edit.selectedMonsterKey : null;
    edit.returnScreenAfterMonsterEdit = edit.returnScreenAfterMonsterEdit === "formationEdit" ? "formationEdit" : null;
    if (!Array.isArray(edit.draft)) edit.draft = createEmptyFormation();
    edit.draft = cloneFormation(edit.draft);
    edit.scrollOffset = Math.max(0, Number.isFinite(edit.scrollOffset) ? Math.trunc(edit.scrollOffset) : 0);
    gameState.ui.returnTo = gameState.ui.returnTo === "formationEdit" ? "formationEdit" : null;
  };

  const setPhase = (phase) => {
    gameState.phase = phase;
    if ([PHASE.GAMEOVER, PHASE.HOME, PHASE.START, PHASE.BATTLE_PREPARE, PHASE.REWARD].includes(phase)) clearSessionSave();
    ensureUiSafety();
  };

  const getSelectedTrialBoss = () => {
    const trialId = gameState?.progress?.selectedTrial;
    return (typeof trialId === "string" && HANAFUDA_BOSSES[trialId]) ? HANAFUDA_BOSSES[trialId] : null;
  };

  const getNextTrialId = (trialId) => {
    const index = HANAFUDA_BOSS_ORDER.indexOf(trialId);
    if (index < 0 || index >= HANAFUDA_BOSS_ORDER.length - 1) return null;
    return HANAFUDA_BOSS_ORDER[index + 1] || null;
  };

  const markTrialCleared = (trialId) => {
    gameState.progress.clearedTrials = normalizeTrialIds([...gameState.progress.clearedTrials, trialId]);
    gameState.progress.unlockedTrials = normalizeTrialIds([...gameState.progress.unlockedTrials, trialId]);
    const nextTrialId = getNextTrialId(trialId);
    if (nextTrialId) {
      gameState.progress.unlockedTrials = normalizeTrialIds([...gameState.progress.unlockedTrials, nextTrialId]);
    }
  };

  const buildTrialRewardChoices = (bossDef) => {
    const allMoveIds = Object.keys(MOVES);
    const moveId = allMoveIds[(bossDef.order - 1) % Math.max(1, allMoveIds.length)] || "clawStrike";
    const allMonsterIds = Object.keys(MONSTERS);
    const monsterId = allMonsterIds[(bossDef.order + 2) % Math.max(1, allMonsterIds.length)] || allMonsterIds[0];
    return [
      {
        key: "move",
        title: "Move Reward",
        description: `${bossDef.data.rewardConcept} / ${MOVES[moveId]?.name || moveId} を研究開放`,
        payload: { moveId, rewardConcept: bossDef.data.rewardConcept }
      },
      {
        key: "stat",
        title: "Stat Reward",
        description: `${bossDef.name}の教訓に基づき先頭モンスターの全能力+1`,
        payload: { statBonus: 1, lesson: bossDef.data.intendedLesson }
      },
      {
        key: "monster",
        title: "Monster Reward",
        description: `${MONSTERS[monsterId]?.name || monsterId} を図鑑に加入`,
        payload: { monsterId, themeIdentity: bossDef.data.themeIdentity }
      }
    ];
  };

  const applyTrialRewardChoice = (choice) => {
    if (!choice || typeof choice !== "object") return;
    if (choice.key === "move") {
      const moveId = choice.payload?.moveId;
      if (!moveId || !MOVES[moveId]) return;
      Object.keys(MONSTERS).forEach((monsterId) => {
        const draft = Array.isArray(gameState.monsterMoveDrafts[monsterId]) ? gameState.monsterMoveDrafts[monsterId].slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) : [];
        if (draft.includes(moveId) || draft.length >= CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) return;
        draft.push(moveId);
        gameState.monsterMoveDrafts[monsterId] = draft;
      });
      return;
    }
    if (choice.key === "stat") {
      const leaderId = getFormationAt(gameState, 0)?.find((unitId) => !!MONSTERS[unitId]);
      if (!leaderId) return;
      const draft = { ...(getMonsterTrainingDraft(leaderId, gameState) || createDefaultStatAllocation()) };
      ["hp", "atk", "def", "spatk", "spdef", "spd"].forEach((statKey) => {
        draft[statKey] = clamp((Number(draft[statKey]) || 0) + 1, 0, TRAINING_PER_STAT_CAP);
      });
      gameState.monsterTrainingDrafts[leaderId] = draft;
      syncMonsterBuildState(leaderId, gameState);
      return;
    }
    if (choice.key === "monster") {
      const monsterId = choice.payload?.monsterId;
      if (!monsterId || !MONSTERS[monsterId]) return;
      if (!gameState.availableMonsters.includes(monsterId)) gameState.availableMonsters.push(monsterId);
    }
  };

  const enterHub = () => {
    gameState.ui.startView = START_VIEW.HUB;
    gameState.progress.selectedTrial = null;
    gameState.progress.pendingReward = null;
    setPhase(PHASE.HOME);
  };

  const enterTrialSelect = () => {
    gameState.ui.startView = START_VIEW.TRIAL_SELECT;
    const selectedIndex = HANAFUDA_BOSS_ORDER.indexOf(gameState.progress.selectedTrial);
    gameState.ui.trialSelectIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setPhase(PHASE.START);
  };

  const enterTrialIntro = (trialId) => {
    if (!HANAFUDA_BOSSES[trialId]) return;
    if (!gameState.progress.unlockedTrials.includes(trialId)) return;
    gameState.progress.selectedTrial = trialId;
    gameState.ui.startView = START_VIEW.TRIAL_INTRO;
    gameState.ui.trialIntroPage = 0;
    setPhase(PHASE.START);
  };

  const enterHome = () => {
    gameState.ui.startView = START_VIEW.HUB;
    gameState.progress.selectedTrial = null;
    setPhase(PHASE.HOME);
  };

  const enterFormation = () => {
    gameState.ui.formationIndex = -1;
    setPhase(PHASE.FORMATION);
  };

  const enterFormationEdit = (index) => {
    const safeIndex = getSafeFormationSlot(index);
    const source = getFormationAt(gameState, safeIndex) || createEmptyFormation();
    const firstMonsterInDraft = source.find((unitId) => MONSTERS[unitId]) || null;
    gameState.currentEditIndex = safeIndex;
    gameState.ui.formationEdit.selectedSlotIndex = -1;
    gameState.ui.formationEdit.selectedMonsterKey = firstMonsterInDraft;
    gameState.ui.formationEdit.returnScreenAfterMonsterEdit = null;
    gameState.ui.formationEdit.draft = cloneFormation(source);
    gameState.ui.formationEdit.scrollOffset = 0;
    setPhase(PHASE.FORMATION_EDIT);
  };

  const enterBattlePrepare = () => {
    gameState.battlePrepareIndex = -1;
    gameState.ui.battlePrepareIndex = -1;
    setPhase(PHASE.BATTLE_PREPARE);
  };

  const enterMonsterList = () => {
    gameState.ui.monsterListIndex = getSafeMonsterListIndex(gameState, gameState.ui.monsterListIndex);
    const ids = getMonsterLibraryIds(gameState);
    if (!MONSTERS[gameState.selectedMonsterId]) {
      gameState.selectedMonsterId = ids[gameState.ui.monsterListIndex] || ids[0] || null;
    }
    gameState.ui.returnTo = null;
    gameState.ui.formationEdit.returnScreenAfterMonsterEdit = null;
    setPhase(PHASE.MONSTER_LIST);
  };

  const enterMonsterDetail = (monsterId) => {
    if (!MONSTERS[monsterId]) return;
    gameState.selectedMonsterId = monsterId;
    gameState.ui.monsterDetailTab = "status";
    gameState.ui.selectedMoveIndex = null;
    gameState.moves.activeTypeFilter = "all";
    getMonsterTrainingDraft(monsterId, gameState);
    syncMonsterBuildState(monsterId, gameState);
    gameState.ui.monsterDetailSnapshot = captureMonsterDetailSnapshot(monsterId, gameState);
    setPhase(PHASE.MONSTER_DETAIL);
  };

  const enterTrainerCard = () => {
    setPhase(PHASE.TRAINER_CARD);
  };

  const enterSettings = () => {
    setPhase(PHASE.SETTINGS);
  };

  const setMonsterDetailTab = (tab) => {
    gameState.ui.monsterDetailTab = tab === "moves" ? "moves" : "status";
    if (gameState.ui.monsterDetailTab !== "moves") gameState.ui.selectedMoveIndex = null;
  };

  const adjustMonsterTrainingStat = (monsterId, statKey, delta) => {
    if (!MONSTERS[monsterId]) return;
    const unlocks = gameState.trainerCard?.unlocks || createDefaultTrainerCardUnlocks();
    if (!unlocks.statAdjustmentUnlocked) return;
    const draft = getMonsterTrainingDraft(monsterId, gameState);
    const next = { ...draft };
    const direction = delta >= 0 ? 1 : -1;
    let remainingSteps = Math.abs(Math.trunc(delta));
    while (remainingSteps > 0) {
      if (!canAdjustTrainingStat({ allocation: next, statKey, delta: direction })) break;
      next[statKey] = clamp((Number(next[statKey]) || 0) + direction, 0, TRAINING_PER_STAT_CAP);
      remainingSteps -= 1;
    }
    gameState.monsterTrainingDrafts[monsterId] = next;
    syncMonsterBuildState(monsterId, gameState);
  };

  const setMonsterNatureModifier = (monsterId, modifierKey) => {
    if (!MONSTERS[monsterId]) return;
    const next = createNatureModifierByKey(modifierKey).key;
    gameState.monsterNatureDrafts[monsterId] = next;
    syncMonsterBuildState(monsterId, gameState);
  };

  const setMonsterTraitSelection = (monsterId, traitKey) => {
    if (!monsterId || !MONSTERS[monsterId]) return;
    const { traits } = getMonsterTraitDraft(monsterId, gameState);
    if (!traits.length) {
      gameState.monsterTraitDrafts[monsterId] = null;
      syncMonsterBuildState(monsterId, gameState);
      return;
    }
    const selected = traits.some((trait) => trait.key === traitKey) ? traitKey : traits[0].key;
    gameState.monsterTraitDrafts[monsterId] = selected;
    syncMonsterBuildState(monsterId, gameState);
  };

  const chooseSelectableMoveSlot = (slotIndex) => {
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) return;
    const selected = gameState.moves?.selected || [];
    if (!selected[slotIndex]) {
      gameState.ui.selectedMoveIndex = slotIndex;
      return;
    }
    if (gameState.ui.selectedMoveIndex === null) {
      gameState.ui.selectedMoveIndex = slotIndex;
      return;
    }
    if (gameState.ui.selectedMoveIndex === slotIndex) {
      gameState.ui.selectedMoveIndex = null;
      return;
    }
    const next = selected.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES);
    const sourceIndex = gameState.ui.selectedMoveIndex;
    const temp = next[sourceIndex] || null;
    next[sourceIndex] = next[slotIndex] || null;
    next[slotIndex] = temp;
    gameState.moves.selected = next;
    if (gameState.selectedMonsterId) gameState.monsterMoveDrafts[gameState.selectedMonsterId] = next.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES);
    gameState.ui.selectedMoveIndex = null;
  };

  const assignMoveFromMoveList = (moveId) => {
    if (!MOVES[moveId]) return;
    const selected = Array.isArray(gameState.moves?.selected) ? gameState.moves.selected.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) : [];
    while (selected.length < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) selected.push(null);
    if (selected.includes(moveId)) return;
    const selectedMoveIndex = Number.isInteger(gameState.ui.selectedMoveIndex) ? gameState.ui.selectedMoveIndex : null;
    if (selectedMoveIndex !== null && selectedMoveIndex >= 0 && selectedMoveIndex < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) {
      selected[selectedMoveIndex] = moveId;
      gameState.ui.selectedMoveIndex = null;
    } else {
      const emptyIndex = selected.findIndex((id) => !id);
      if (emptyIndex < 0) return;
      selected[emptyIndex] = moveId;
    }
    gameState.moves.selected = selected;
    if (gameState.selectedMonsterId) gameState.monsterMoveDrafts[gameState.selectedMonsterId] = selected.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES);
  };

  const removeSelectedMove = (slotIndex) => {
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) return;
    const selected = Array.isArray(gameState.moves?.selected) ? gameState.moves.selected.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) : [];
    while (selected.length < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) selected.push(null);
    selected[slotIndex] = null;
    gameState.moves.selected = selected;
    if (gameState.selectedMonsterId) gameState.monsterMoveDrafts[gameState.selectedMonsterId] = selected.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES);
    if (gameState.ui.selectedMoveIndex === slotIndex) gameState.ui.selectedMoveIndex = null;
  };

  const saveMonsterDetailAndExit = () => {
    const monsterId = gameState.selectedMonsterId;
    if (monsterId && MONSTERS[monsterId]) {
      const selected = Array.isArray(gameState.moves?.selected) ? gameState.moves.selected.slice(0, CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) : [];
      while (selected.length < CONFIG.MONSTER_BUILD.MAX_SELECTABLE_MOVES) selected.push(null);
      gameState.monsterMoveDrafts[monsterId] = selected;
      gameState.ui.monsterDetailSnapshot = captureMonsterDetailSnapshot(monsterId, gameState);
      writeAutosave();
    }
    const shouldReturnFormation = gameState.ui.returnTo === "formationEdit" || gameState.ui.formationEdit.returnScreenAfterMonsterEdit === "formationEdit";
    gameState.ui.returnTo = null;
    gameState.ui.formationEdit.returnScreenAfterMonsterEdit = null;
    if (shouldReturnFormation) {
      if (monsterId && MONSTERS[monsterId]) gameState.ui.formationEdit.selectedMonsterKey = monsterId;
      setPhase(PHASE.FORMATION_EDIT);
      return;
    }
    enterMonsterList();
  };

  const cancelMonsterDetailAndExit = () => {
    restoreMonsterDetailSnapshot(gameState);
    gameState.ui.monsterDetailSnapshot = null;
    const shouldReturnFormation = gameState.ui.returnTo === "formationEdit" || gameState.ui.formationEdit.returnScreenAfterMonsterEdit === "formationEdit";
    gameState.ui.returnTo = null;
    gameState.ui.formationEdit.returnScreenAfterMonsterEdit = null;
    if (shouldReturnFormation) {
      setPhase(PHASE.FORMATION_EDIT);
      return;
    }
    enterMonsterList();
  };

  const resetMonsterDetailBuild = () => {
    const monsterId = gameState.selectedMonsterId;
    if (!monsterId || !MONSTERS[monsterId]) return;
    gameState.monsterTrainingDrafts[monsterId] = createDefaultStatAllocation();
    gameState.monsterNatureDrafts[monsterId] = "no_modifier";
    syncMonsterBuildState(monsterId, gameState);
  };

  const stopStatAdjustHold = () => {
    if (!statAdjustHoldTimer) return;
    clearInterval(statAdjustHoldTimer);
    statAdjustHoldTimer = null;
  };

  const startStatAdjustHold = (statKey, delta, useShiftBoost = false) => {
    stopStatAdjustHold();
    const unitDelta = useShiftBoost && Math.abs(delta) === 1 ? delta * 5 : delta;
    adjustMonsterTrainingStat(gameState.selectedMonsterId, statKey, unitDelta);
    render();
    statAdjustHoldTimer = setInterval(() => {
      adjustMonsterTrainingStat(gameState.selectedMonsterId, statKey, unitDelta);
      render();
    }, CONFIG.MONSTER_BUILD.HOLD_REPEAT_INTERVAL_MS);
  };

  const saveFormationEdit = () => {
    const index = getSafeFormationSlot(gameState.currentEditIndex);
    const draft = cloneFormation(gameState.ui.formationEdit.draft);
    const isEmpty = draft.every((unitId) => !unitId);
    gameState.formations[index] = isEmpty ? null : draft;
    gameState.ui.formationEdit.returnScreenAfterMonsterEdit = null;
    gameState.ui.returnTo = null;
    gameState.currentEditIndex = null;
    writeAutosave();
    enterFormation();
  };

  const cancelFormationEdit = () => {
    gameState.ui.formationEdit.draft = createEmptyFormation();
    gameState.ui.formationEdit.selectedMonsterKey = null;
    gameState.ui.formationEdit.returnScreenAfterMonsterEdit = null;
    gameState.ui.returnTo = null;
    gameState.currentEditIndex = null;
    enterFormation();
  };

  const resetFormationEditDraft = () => {
    gameState.ui.formationEdit.draft = createEmptyFormation();
    gameState.ui.formationEdit.selectedSlotIndex = 0;
    gameState.ui.formationEdit.selectedMonsterKey = null;
    gameState.ui.formationEdit.scrollOffset = 0;
  };

  const handleHomeMenuConfirm = (index) => {
    if (!Number.isFinite(index) || index < 0) return;
    const hubItems = getHubMenuItems(gameState);
    const safeIndex = getSelectableIndex(index, hubItems.length - 1);
    if (safeIndex < 0) return;
    gameState.ui.homeIndex = safeIndex;
    const selectedKey = hubItems[safeIndex]?.key;
    gameState.ui.currentHubSection = selectedKey || hubItems[0]?.key || "battle";
    if (selectedKey === "battle") {
      enterBattlePrepare();
      return;
    }
    if (selectedKey === "hanafudaTrials") {
      enterTrialSelect();
      return;
    }
    if (selectedKey === "formation") {
      enterFormation();
      return;
    }
    if (selectedKey === "monsters") {
      enterMonsterList();
      return;
    }
    if (selectedKey === "settings") {
      enterSettings();
    }
  };

  const handleFormationSelection = (index, shouldEnterEdit = false) => {
    if (!Number.isFinite(index) || index < 0) return;
    gameState.ui.formationIndex = getSafeFormationSlot(index);
    if (shouldEnterEdit) enterFormationEdit(gameState.ui.formationIndex);
  };

  const handleFormationSlotSelect = (index) => {
    const safeIndex = getSafeEditPartyIndex(index);
    gameState.ui.formationEdit.selectedSlotIndex = safeIndex;
    const selectedKey = safeIndex >= 0 ? gameState.ui.formationEdit.draft[safeIndex] : null;
    gameState.ui.formationEdit.selectedMonsterKey = MONSTERS[selectedKey] ? selectedKey : null;
  };

  const findMonsterSlotInDraft = (draft, monsterId) => cloneFormation(draft).findIndex((unitId) => unitId === monsterId);

  const getAssignedSlotLabel = (draft, monsterId) => {
    const slotIndex = findMonsterSlotInDraft(draft, monsterId);
    return slotIndex >= 0 ? `SET:${slotIndex + 1}` : "";
  };

  const assignOrSwapMonsterInDraft = (draft, targetSlotIndex, monsterId) => {
    const out = cloneFormation(draft);
    const safeTarget = getSelectableIndex(targetSlotIndex, FORMATION_MEMBER_COUNT - 1);
    if (safeTarget < 0 || !MONSTERS[monsterId]) return out;
    const existingSlotIndex = findMonsterSlotInDraft(out, monsterId);
    if (existingSlotIndex === -1) {
      out[safeTarget] = monsterId;
      return out;
    }
    if (existingSlotIndex === safeTarget) return out;
    const previousTarget = out[safeTarget] || null;
    out[safeTarget] = monsterId;
    out[existingSlotIndex] = previousTarget;
    return out;
  };

  const assignMonsterToSelectedSlot = (monsterIndex) => {
    const boxIndex = getSafeEditMonsterIndex(gameState, monsterIndex);
    const unitId = gameState.availableMonsters[boxIndex] || null;
    if (!unitId) return;
    gameState.ui.formationEdit.selectedMonsterKey = unitId;
    const slotIndex = getSelectableIndex(gameState.ui.formationEdit.selectedSlotIndex, FORMATION_MEMBER_COUNT - 1);
    if (slotIndex < 0) return;
    gameState.ui.formationEdit.draft = assignOrSwapMonsterInDraft(gameState.ui.formationEdit.draft, slotIndex, unitId);
  };

  const getFormationEditSelectedMonsterId = (state = gameState) => {
    const selected = state?.ui?.formationEdit?.selectedMonsterKey;
    if (selected && MONSTERS[selected]) return selected;
    const slotIndex = getSelectableIndex(state?.ui?.formationEdit?.selectedSlotIndex, FORMATION_MEMBER_COUNT - 1);
    if (slotIndex >= 0) {
      const fromSlot = state?.ui?.formationEdit?.draft?.[slotIndex];
      if (fromSlot && MONSTERS[fromSlot]) return fromSlot;
    }
    return null;
  };

  const getMonsterTypeKeys = (monsterId) => {
    if (!monsterId || !MONSTERS[monsterId]) return [];
    const moves = getMonsterMoveDraft(monsterId, gameState);
    const typeKeys = [];
    moves.forEach((moveId) => {
      const typeKey = MOVES?.[moveId]?.type;
      if (!TYPE_META[typeKey] || typeKeys.includes(typeKey)) return;
      typeKeys.push(typeKey);
    });
    return typeKeys;
  };

  const openMonsterEditFromFormation = () => {
    const monsterId = getFormationEditSelectedMonsterId(gameState);
    if (!monsterId) return;
    gameState.ui.formationEdit.selectedMonsterKey = monsterId;
    gameState.ui.formationEdit.returnScreenAfterMonsterEdit = "formationEdit";
    gameState.ui.returnTo = "formationEdit";
    enterMonsterDetail(monsterId);
  };

  const getTeamState = (state, team) => state.teams[team];
  const toBoardPos = (team, slot) => ({ x: slot, y: team === TEAM.ENEMY ? 0 : 1 });
  const inBounds = (pos) => pos.x >= 0 && pos.x < CONFIG.BOARD_COLS && pos.y >= 0 && pos.y < CONFIG.BOARD_ROWS;
  const isValidTeamValue = (team) => team === TEAM.ALLY || team === TEAM.ENEMY;

  const debugBattleLog = (...args) => {
    if (!DEBUG_FLAGS.battleTargeting) return;
    console.debug("[battle-debug]", ...args);
  };

  const validateUnitTeam = (unit, expectedTeam = null, context = "") => {
    if (!unit) return false;
    if (!isValidTeamValue(unit.team)) {
      console.warn("[battle-debug] Invalid team value", { context, uid: unit.uid, name: unit.name, team: unit.team, expectedTeam });
      return false;
    }
    if (expectedTeam && unit.team !== expectedTeam) {
      console.warn("[battle-debug] Team mismatch", { context, uid: unit.uid, name: unit.name, team: unit.team, expectedTeam });
      return false;
    }
    return true;
  };

  const inferTeamFromBoardPosition = (pos) => (pos.y === 0 ? TEAM.ENEMY : TEAM.ALLY);

  const debugLogBattleTeams = (state, context = "battle-start") => {
    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      const teamState = state?.teams?.[team];
      if (!teamState) return;
      const allUnits = [
        ...(Array.isArray(teamState.active) ? teamState.active : []),
        ...(Array.isArray(teamState.reserve) ? teamState.reserve : [])
      ].filter(Boolean);
      allUnits.forEach((unit) => validateUnitTeam(unit, team, context));
      const activeSummary = (teamState.active || [])
        .map((unit, slot) => (unit ? { name: unit.name, uid: unit.uid, team: unit.team, slot } : null))
        .filter(Boolean);
      const reserveSummary = (teamState.reserve || [])
        .filter(Boolean)
        .map((unit, index) => ({ name: unit.name, uid: unit.uid, team: unit.team, slot: `r${index}` }));
      debugBattleLog(`${context}:${team}:active`, activeSummary);
      debugBattleLog(`${context}:${team}:reserve`, reserveSummary);
    });
  };

  const getUnitAtFromState = (state, pos) => {
    if (!inBounds(pos)) return null;
    const inferredTeam = inferTeamFromBoardPosition(pos);
    const unit = state.teams[inferredTeam].active[pos.x] || null;
    if (unit && unit.team !== inferredTeam) {
      console.warn("[battle-debug] Board side/team mismatch", {
        uid: unit.uid,
        name: unit.name,
        unitTeam: unit.team,
        inferredTeam,
        slot: unit.slot,
        boardPos: pos
      });
    }
    return unit;
  };

  const getLivingMonsters = (team, state = gameState) => {
    const teamState = state?.teams?.[team];
    if (!teamState) return [];
    const active = Array.isArray(teamState.active) ? teamState.active.filter(isAlive) : [];
    const reserve = Array.isArray(teamState.reserve) ? teamState.reserve.filter(isAlive) : [];
    return [...active, ...reserve];
  };

  const getActiveFieldUnits = (team, state = gameState) => {
    const active = state?.teams?.[team]?.active;
    if (!Array.isArray(active)) return [];
    return active.filter(isAlive);
  };

  const getUnitByUid = (uid) => {
    for (const team of [TEAM.ALLY, TEAM.ENEMY]) {
      for (const unit of gameState.teams[team].active) {
        if (unit && unit.uid === uid) return unit;
      }
      for (const unit of gameState.teams[team].reserve) {
        if (unit && unit.uid === uid) return unit;
      }
    }
    return null;
  };

  const normalizeUidList = (items = []) => items.filter((id) => typeof id === "string" && id.length > 0);

  const clearBattleHighlight = () => {
    gameState.battleHighlight.active = false;
    gameState.battleHighlight.sources = [];
    gameState.battleHighlight.targets = [];
    gameState.battleHighlight.effectType = null;
    gameState.battleHighlight.statusKind = null;
    gameState.battleHighlight.traitKind = null;
    gameState.battleHighlight.removeKind = null;
  };

  const setBattleHighlight = ({ sources = [], targets = [], effectType = null, statusKind = null, traitKind = null, removeKind = null } = {}) => {
    const nextSources = normalizeUidList(sources);
    const nextTargets = normalizeUidList(targets);
    if (!nextSources.length && !nextTargets.length) {
      clearBattleHighlight();
      return;
    }
    gameState.battleHighlight.active = true;
    gameState.battleHighlight.sources = nextSources;
    gameState.battleHighlight.targets = nextTargets;
    gameState.battleHighlight.effectType = effectType;
    gameState.battleHighlight.statusKind = statusKind;
    gameState.battleHighlight.traitKind = traitKind;
    gameState.battleHighlight.removeKind = removeKind;
  };

  const getEffectiveStat = (unit, key, options = {}) => {
    const { ignoreDefUp = false } = options;
    let value = unit[key];
    if (key === "atk" && findStatus(unit.statuses, "atkUp")) value = Math.floor(value * (1 + CONFIG.ATK_UP_RATIO));
    if (key === "atk" && Number.isFinite(unit?.buffs?.atkStage) && unit.buffs.atkStage !== 0) {
      value = Math.max(1, Math.floor(value * (1 + (CONFIG.TURN_START_ATK_STAGE_RATIO * unit.buffs.atkStage))));
    }
    if (key === "def" && Number.isFinite(unit?.buffs?.defStage) && unit.buffs.defStage !== 0) {
      value = Math.max(1, Math.floor(value * (1 + (CONFIG.TURN_START_ATK_STAGE_RATIO * unit.buffs.defStage))));
    }
    if (key === "spd" && Number.isFinite(unit?.buffs?.spdStage) && unit.buffs.spdStage !== 0) {
      value = Math.max(1, Math.floor(value * (1 + (CONFIG.TURN_START_ATK_STAGE_RATIO * unit.buffs.spdStage))));
    }
    if (key === "def" && !ignoreDefUp && findStatus(unit.statuses, "defUp")) value = Math.floor(value * (1 + CONFIG.DEF_UP_RATIO));
    return value;
  };

  const isDamageMoveCategory = (category) => category === "physical" || category === "special";

  const getAttackStatForMove = (attacker, move) => {
    if (!attacker || !move) return 0;
    if (move.category === "physical") return getEffectiveStat(attacker, "atk");
    if (move.category === "special") return getEffectiveStat(attacker, "mag");
    return 0;
  };

  const getDefenseStatForMove = (defender, move, options = {}) => {
    if (!defender || !move) return 0;
    if (move.category === "physical") return getEffectiveStat(defender, "def", options);
    if (move.category === "special") return getEffectiveStat(defender, "res", options);
    return 0;
  };

  const isCriticalHit = (attacker, move) => {
    if (!attacker || !move || !isDamageMoveCategory(move.category)) return false;
    if (move.guaranteedCrit || move.alwaysCrit) return true;
    const critStage = clamp(Number(attacker?.buffs?.critStage) || 0, 0, CONFIG.CRIT_STAGE_MAX);
    const bonus = Number(move.critRateBonus) || 0;
    const chance = clamp(CONFIG.CRIT_BASE_RATE + (critStage * CONFIG.CRIT_STAGE_RATE) + bonus, 0, 1);
    return Math.random() < chance;
  };

  const getSelectedTrait = (unit) => {
    if (!unit) return null;
    const traits = Array.isArray(unit.traits) ? unit.traits : [];
    if (!traits.length) return null;
    return traits.find((trait) => trait.key === unit.selectedTraitKey) || traits[0] || null;
  };

  const adjustAtkStage = (unit, amount) => {
    if (!unit || !Number.isFinite(amount)) return 0;
    const before = Number(unit?.buffs?.atkStage) || 0;
    const next = clamp(before + Math.trunc(amount), -CONFIG.CRIT_STAGE_MAX, CONFIG.CRIT_STAGE_MAX);
    unit.buffs.atkStage = next;
    return next - before;
  };

  const adjustDefStage = (unit, amount) => {
    if (!unit || !Number.isFinite(amount)) return 0;
    const before = Number(unit?.buffs?.defStage) || 0;
    const next = clamp(before + Math.trunc(amount), -CONFIG.CRIT_STAGE_MAX, CONFIG.CRIT_STAGE_MAX);
    unit.buffs.defStage = next;
    return next - before;
  };

  const adjustSpdStage = (unit, amount) => {
    if (!unit || !Number.isFinite(amount)) return 0;
    const before = Number(unit?.buffs?.spdStage) || 0;
    const next = clamp(before + Math.trunc(amount), -CONFIG.CRIT_STAGE_MAX, CONFIG.CRIT_STAGE_MAX);
    unit.buffs.spdStage = next;
    return next - before;
  };

  const getTraitEffectKey = (unit) => {
    const selectedTrait = getSelectedTrait(unit);
    const traitDef = TRAIT_LIBRARY[selectedTrait?.key];
    return typeof traitDef?.traitKey === "string" ? traitDef.traitKey : "";
  };

  const ignoresStatDown = (unit) => {
    const traitCtx = applyTraitEffect(createAttackContext({ attacker: unit }), getTraitEffectKey(unit));
    return !!traitCtx?.ignoreStatDown;
  };

  const adjustStageWithTraitRule = (unit, statKey, amount) => {
    if (!unit || !Number.isFinite(amount)) return 0;
    if (amount < 0 && ignoresStatDown(unit)) return 0;
    if (statKey === "atk") return adjustAtkStage(unit, amount);
    if (statKey === "def") return adjustDefStage(unit, amount);
    if (statKey === "spd") return adjustSpdStage(unit, amount);
    return 0;
  };

  const isWeaknessHit = (defender, move) => {
    const weaknessTypes = Array.isArray(defender?.weaknessTypes) ? defender.weaknessTypes : [];
    if (!weaknessTypes.length) return true;
    const moveType = typeof move?.type === "string" ? move.type : "";
    return weaknessTypes.includes(moveType);
  };

  const applyTraitEffects = (eventType, context = {}) => {
    const out = { forceHit: false, overrideDamage: null, messages: [], effects: [] };
    const actor = context.actor || null;
    const target = context.target || null;
    const source = context.source || actor || null;
    const sourceTrait = getSelectedTrait(source);
    const targetTrait = getSelectedTrait(target);

    if ((eventType === "onBattleStart" || eventType === "onSwitchIn") && source && sourceTrait?.key === "intimidate") {
      const opponent = context.opponent || null;
      if (opponent && isAlive(opponent)) {
        const changed = adjustStageWithTraitRule(opponent, "atk", -1);
        if (changed !== 0) {
          out.effects.push({ type: "addAtkStage", amount: changed, targetId: opponent.uid, targetName: opponent.name });
          out.messages.push(`${source.name}の ${sourceTrait.name}が 発動した！`);
          out.messages.push(`${opponent.name}の こうげきが さがった！`);
        }
      }
    }

    if (eventType === "beforeHitCheck") {
      if (sourceTrait?.key === "no_guard" || targetTrait?.key === "no_guard") out.forceHit = true;
    }

    if (eventType === "beforeDamage" && target && targetTrait?.key === "wonder_guard" && context.move) {
      if (!isWeaknessHit(target, context.move)) out.overrideDamage = 0;
    }

    if (eventType === "afterDamage" && source && sourceTrait) {
      const traitDef = TRAIT_LIBRARY[sourceTrait.key];
      (traitDef?.onAfterDamage || []).forEach((effect) => {
        if (effect.type === "applyStatus" && target && isAlive(target)) {
          addStatus(target, effect.status, effect.duration);
          out.effects.push({
            type: "applyStatus",
            statusId: effect.status,
            duration: effect.duration,
            sourceType: "trait",
            sourceId: source.uid,
            sourceName: source.name,
            traitKind: sourceTrait.key,
            targetId: target.uid,
            targetName: target.name
          });
        }
      });
    }

    if (eventType === "onTurnStart" && source && sourceTrait) {
      const traitDef = TRAIT_LIBRARY[sourceTrait.key];
      (traitDef?.onTurnStart || []).forEach((effect) => {
        if (effect.type === "addAtkStage") {
          const changed = adjustStageWithTraitRule(source, "atk", Number(effect.amount) || 0);
          if (changed !== 0) out.effects.push({ type: "addAtkStage", amount: changed, targetId: source.uid, targetName: source.name });
        }
      });
    }

    return out;
  };

  const doesMoveHit = ({ actor, target, move, state }) => {
    const traitResult = applyTraitEffects("beforeHitCheck", { actor, target, move });
    if (traitResult.forceHit) return true;
    const ctx = applyMoveEffect(createAttackContext({ attacker: actor, defender: target, move, aliveAllies: getAliveAlliesCount(state, actor?.team) }));
    if (ctx.alwaysHit) return true;
    return true;
  };

  const calcDamage = (attacker, defender, move, options = {}) => {
    const { isCritical = false } = options;
    const beforeDamageTrait = applyTraitEffects("beforeDamage", { actor: attacker, target: defender, move });
    if (beforeDamageTrait.overrideDamage === 0) return 0;
    const atk = getAttackStatForMove(attacker, move) + Math.floor(move.power / 10);
    const def = getDefenseStatForMove(defender, move, { ignoreDefUp: isCritical });
    let dmg = Math.max(1, atk - def);
    if (!isCritical && findStatus(defender.statuses, "barrier")) dmg = Math.max(1, Math.floor(dmg * CONFIG.BARRIER_RATIO));
    if (isCritical) dmg = Math.max(1, Math.floor(dmg * CONFIG.CRIT_MULTIPLIER));
    return Math.min(dmg, defender.hp);
  };

  validateUnitLibraryStats();

  const addStatus = (unit, statusKind, duration) => {
    const next = cloneStatus(statusKind, duration);
    const idx = unit.statuses.findIndex((s) => s.category === next.category);
    if (idx >= 0) unit.statuses[idx] = next;
    else unit.statuses.push(next);
  };

  const getStatusState = (unit) => {
    const statusKinds = unit.statuses.map((s) => s.kind);
    return {
      canSwitch: !statusKinds.includes("bind"),
      statuses: statusKinds
    };
  };

  const clearSwitchSensitiveStatuses = (unit) => {
    unit.statuses = unit.statuses.filter((s) => s.kind === "poison");
  };

  const clearSwitchFlags = (unit) => {
    if (!unit) return;
    unit.isSwitching = false;
    unit.switchTargetId = null;
  };

  const getAvailableSwitchCandidates = (state, team, excludingUids = []) => {
    const blocked = new Set(Array.isArray(excludingUids) ? excludingUids.filter(Boolean) : []);
    const reserve = state?.teams?.[team]?.reserve;
    if (!Array.isArray(reserve)) return [];
    return reserve
      .map((unit, index) => ({ unit, index }))
      .filter(({ unit }) => !!unit && isAlive(unit) && !blocked.has(unit.uid));
  };

  const clearTurnSwitchRequests = () => {
    gameState.turnSwitchRequests = {
      ally: Array.from({ length: CONFIG.BOARD_COLS }, () => null),
      enemy: Array.from({ length: CONFIG.BOARD_COLS }, () => null)
    };
  };

  const clearSwitchRequestForSlot = (team, slot) => {
    const requests = gameState?.turnSwitchRequests?.[team];
    if (!Array.isArray(requests)) return;
    if (!Number.isInteger(slot) || slot < 0 || slot >= requests.length) return;
    requests[slot] = null;
  };

  const isValidSwitchTarget = ({ state, team, slot, targetIndex }) => {
    const teamState = state?.teams?.[team];
    if (!teamState || !Array.isArray(teamState.active) || !Array.isArray(teamState.reserve)) return false;
    if (!Number.isInteger(slot) || slot < 0 || slot >= teamState.active.length) return false;
    if (!Number.isInteger(targetIndex) || !teamState.reserve.length) return false;
    const clampedIndex = clamp(targetIndex, 0, teamState.reserve.length - 1);
    const actor = teamState.active[slot];
    const target = teamState.reserve[clampedIndex];
    if (!actor || !isAlive(actor)) return false;
    if (!target || !isAlive(target)) return false;
    if (actor.uid === target.uid) return false;
    return true;
  };

  const requestSwitch = ({ team, slot, targetIndex }) => {
    if (!isValidSwitchTarget({ state: gameState, team, slot, targetIndex })) return false;
    const requests = gameState?.turnSwitchRequests?.[team];
    if (!Array.isArray(requests) || !Number.isInteger(slot) || slot < 0 || slot >= requests.length) return false;
    const clampedIndex = clamp(targetIndex, 0, gameState.teams[team].reserve.length - 1);
    requests[slot] = { team, slot, targetIndex: clampedIndex };
    return true;
  };

  const replaceActiveUnitFromReserve = ({
    state,
    team,
    slot,
    incomingUnitId,
    reserveIndexHint = null,
    reserveMode = "swap",
    requireDefeatedOutgoing = false
  }) => {
    const teamState = state?.teams?.[team];
    if (!teamState || !Array.isArray(teamState.active) || !Array.isArray(teamState.reserve)) return null;
    if (!Number.isInteger(slot) || slot < 0 || slot >= teamState.active.length || !incomingUnitId) return null;

    const outgoing = teamState.active[slot] || null;
    if (!outgoing) return null;
    if (requireDefeatedOutgoing && !isDefeated(outgoing)) return null;

    let reserveIndex = -1;
    if (Number.isInteger(reserveIndexHint) && reserveIndexHint >= 0 && teamState.reserve[reserveIndexHint]?.uid === incomingUnitId) {
      reserveIndex = reserveIndexHint;
    } else {
      reserveIndex = teamState.reserve.findIndex((unit) => unit?.uid === incomingUnitId);
    }
    if (reserveIndex < 0) return null;

    const incoming = teamState.reserve[reserveIndex];
    if (!incoming || !isAlive(incoming)) return null;
    if (!validateUnitTeam(incoming, team, "replaceActiveUnitFromReserve:incoming")) return null;
    if (!validateUnitTeam(outgoing, team, "replaceActiveUnitFromReserve:outgoing")) return null;

    teamState.active[slot] = incoming;
    incoming.slot = slot;
    clearSwitchFlags(incoming);

    if (reserveMode === "consume") {
      teamState.reserve.splice(reserveIndex, 1);
    } else {
      teamState.reserve[reserveIndex] = outgoing;
      outgoing.slot = `r${reserveIndex}`;
      clearSwitchFlags(outgoing);
    }

    return { incoming, outgoing, reserveIndex };
  };

  const getDefeatedActiveSlots = (state, team) => state.teams[team].active
    .map((unit, slot) => (isDefeated(unit) ? slot : null))
    .filter((slot) => slot !== null);

  const getAvailableReserveIndices = (state, team) => state.teams[team].reserve
    .map((unit, index) => (isAlive(unit) ? index : null))
    .filter((index) => index !== null);

  const hasAnyRemainingUnits = (state, team) => state.teams[team].active.some(isAlive) || state.teams[team].reserve.some(isAlive);

  const getWinnerFromRemainingUnits = (state) => {
    const allyHasAny = hasAnyRemainingUnits(state, TEAM.ALLY);
    const enemyHasAny = hasAnyRemainingUnits(state, TEAM.ENEMY);
    if (!allyHasAny && !enemyHasAny) return "draw";
    if (!allyHasAny) return TEAM.ENEMY;
    if (!enemyHasAny) return TEAM.ALLY;
    return null;
  };

  const removeExpired = (arr) => arr.filter((s) => s.duration > 0);

  const resolveUnitOnEnterEffects = ({ state, team, slot, unit }) => {
    const messages = [];
    const statusApplies = [];
    const applyEffects = (effects = [], sourceLabel = null, announceAbility = false) => {
      if (!effects.length) return;
      if (announceAbility && sourceLabel) messages.push(`${unit.name}の ${sourceLabel}が 発動した！`);
      effects.forEach((effect) => {
        if (effect.type !== "applyStatus") return;
        const duration = effect.duration ?? STATUSES[effect.status]?.duration ?? 1;
        addStatus(unit, effect.status, duration);
        const text = STATUS_APPLY_TEXT[effect.status]?.(unit.name) || `${unit.name}に ${effect.status}！`;
        messages.push(text);
        statusApplies.push({ targetId: unit.uid, statusId: effect.status, duration });
      });
    };
    const applyStatEffects = (effects = [], sourceLabel = null, announceAbility = false) => {
      if (!effects.length) return;
      if (announceAbility && sourceLabel) messages.push(`${unit.name}の ${sourceLabel}が 発動した！`);
      effects.forEach((effect) => {
        if (effect.type === "addAtkStage") {
          const amount = Math.max(0, Number(effect.amount) || 0);
          if (amount <= 0) return;
          unit.buffs.atkStage = clamp((Number(unit?.buffs?.atkStage) || 0) + amount, -CONFIG.CRIT_STAGE_MAX, CONFIG.CRIT_STAGE_MAX);
          messages.push(`${unit.name}の こうげき体勢が高まった！`);
        }
      });
    };

    state.globalStatuses.forEach((status) => applyEffects(status.onEnter, STATUS_LABELS[status.kind] || status.kind));
    state.teams[team].statuses.forEach((status) => applyEffects(status.onEnter, STATUS_LABELS[status.kind] || status.kind));
    (state.teams[team].tileEffects?.[slot] || []).forEach((tileEffect) => applyEffects(tileEffect.onEnter, tileEffect.name || tileEffect.kind || "tile effect"));
    const selectedTrait = getSelectedTrait(unit);
    const traitDef = TRAIT_LIBRARY[selectedTrait?.key];
    applyEffects(traitDef?.onSwitchIn, selectedTrait?.name || selectedTrait?.key || "trait", true);
    applyStatEffects(traitDef?.onSwitchIn, selectedTrait?.name || selectedTrait?.key || "trait", false);
    const opponent = state?.teams?.[team === TEAM.ALLY ? TEAM.ENEMY : TEAM.ALLY]?.active?.[slot] || null;
    const traitResult = applyTraitEffects("onSwitchIn", { source: unit, opponent, state, team, slot });
    messages.push(...traitResult.messages);

    return { messages, statusApplies };
  };

  const isEnemyOnlyTargetRule = (move) => move?.targetRule === "enemy"
    || (isDamageMoveCategory(move?.category) && move?.targetRule === "anyOtherSingle");

  const isRuleMatchForTarget = (actor, move, targetUnit) => {
    if (!actor || !move || !targetUnit || !isAlive(targetUnit)) return false;
    if (!validateUnitTeam(actor, null, "isRuleMatchForTarget:actor")) return false;
    if (!validateUnitTeam(targetUnit, null, "isRuleMatchForTarget:target")) return false;
    if (move.targetRule === "selfOnly") return targetUnit.uid === actor.uid;
    if (move.targetRule === "allyOtherSingle") return targetUnit.team === actor.team && targetUnit.uid !== actor.uid;
    if (move.targetRule === "anyOtherSingle") {
      if (targetUnit.uid === actor.uid) return false;
      if (isEnemyOnlyTargetRule(move)) return targetUnit.team !== actor.team;
      return true;
    }
    if (move.targetRule === "enemy") return targetUnit.team !== actor.team;
    return true;
  };

  const isRuleMatchAtPosition = (actor, move, pos) => {
    if (!actor || !move || !inBounds(pos)) return false;
    const targetTeam = inferTeamFromBoardPosition(pos);
    const actorPos = toBoardPos(actor.team, actor.slot);
    if (move.targetRule === "selfOnly") {
      return actorPos.x === pos.x && actorPos.y === pos.y;
    }
    if (move.targetRule === "allyOtherSingle") {
      return targetTeam === actor.team && !(actorPos.x === pos.x && actorPos.y === pos.y);
    }
    if (move.targetRule === "anyOtherSingle") {
      if (actorPos.x === pos.x && actorPos.y === pos.y) return false;
      if (isEnemyOnlyTargetRule(move)) return targetTeam !== actor.team;
      return true;
    }
    if (move.targetRule === "enemy") return targetTeam !== actor.team;
    return true;
  };

  const validateTargetingContext = (actor, target, move, context = "resolve", targetPos = null) => {
    if (!actor || !move) return false;
    const valid = target
      ? isRuleMatchForTarget(actor, move, target)
      : isRuleMatchAtPosition(actor, move, targetPos);
    debugBattleLog(`${context}:target`, {
      actorName: actor.name,
      actorUid: actor.uid,
      actorTeam: actor.team,
      moveId: move.id,
      moveTargetRule: move.targetRule,
      targetName: target?.name || "(empty)",
      targetUid: target?.uid || null,
      targetTeam: target?.team || inferTeamFromBoardPosition(targetPos || { x: -1, y: -1 }),
      valid
    });
    if (isDamageMoveCategory(move.category) && isEnemyOnlyTargetRule(move) && target && actor.team === target.team) {
      console.warn("[battle-debug] Illegal same-team damaging target rejected", {
        actorName: actor.name,
        actorUid: actor.uid,
        actorTeam: actor.team,
        moveId: move.id,
        moveTargetRule: move.targetRule,
        targetName: target.name,
        targetUid: target.uid,
        targetTeam: target.team
      });
      return false;
    }
    return valid;
  };

  const getValidTargetsForMoveInState = (state, actor, move) => {
    if (!state || !actor || !move) return [];
    if (move.targetMode === "all-enemies") {
      const targetY = actor.team === TEAM.ALLY ? 0 : 1;
      return Array.from({ length: CONFIG.BOARD_COLS }, (_, x) => {
        const pos = { x, y: targetY };
        const unit = getUnitAtFromState(state, pos);
        return { x, y: targetY, uid: unit?.uid || null };
      }).filter((pos) => isRuleMatchAtPosition(actor, move, pos));
    }
    const actorPos = toBoardPos(actor.team, actor.slot);
    const orientation = actor.team === TEAM.ALLY ? 1 : -1;
    const offsets = patterns[move.patternId] || [];
    return offsets
      .map((o) => ({ x: actorPos.x + o.x, y: actorPos.y + (o.y * orientation) }))
      .filter(inBounds)
      .filter((pos) => isRuleMatchAtPosition(actor, move, pos))
      .map((pos) => {
        const unit = getUnitAtFromState(state, pos);
        return { x: pos.x, y: pos.y, uid: unit?.uid || null };
      });
  };

  const getValidEnemyTargetsForSelection = () => {
    return Array.from({ length: CONFIG.BOARD_COLS }, (_, x) => {
      const unit = getUnitAtFromState(gameState, { x, y: 0 });
      return { x, y: 0, uid: unit?.uid || null };
    });
  };

  const ensureSelectedEnemyTarget = (preferredSlot = null) => {
    const validTargets = getValidEnemyTargetsForSelection();
    const validSlots = new Set(validTargets.map((entry) => entry.x));
    if (Number.isInteger(preferredSlot) && validSlots.has(preferredSlot)) {
      gameState.battle.selectedTargetKey = preferredSlot;
      return preferredSlot;
    }
    if (validSlots.has(gameState.battle.selectedTargetKey)) return gameState.battle.selectedTargetKey;
    const next = validTargets[0]?.x ?? null;
    gameState.battle.selectedTargetKey = next;
    return next;
  };

  const getActionTargetPositions = ({ state, actor, move, action }) => {
    if (!state || !actor || !move || !action) return [];
    if (move.targetMode === "single") return action.targetPos ? [{ x: action.targetPos.x, y: action.targetPos.y }] : [];
    if (move.targetMode === "all-enemies") return getValidTargetsForMoveInState(state, actor, move);
    return getPatternPositionsForMove(actor, move);
  };

  const getAliveAlliesCount = (state, team) => {
    const teamState = state?.teams?.[team];
    if (!teamState) return 1;
    const alive = [...(Array.isArray(teamState.active) ? teamState.active : []), ...(Array.isArray(teamState.reserve) ? teamState.reserve : [])]
      .filter((unit) => unit && isAlive(unit)).length;
    return Math.max(1, alive);
  };

  const getMoveHitCount = ({ state, actor, move, defender = null }) => {
    if (!state || !actor || !move) return 1;
    const ctx = applyMoveEffect(createAttackContext({ attacker: actor, defender, move, aliveAllies: getAliveAlliesCount(state, actor.team) }));
    return Math.max(1, Number(ctx.hitCount) || 1);
  };

  const getActionPriority = (action, state) => {
    if (!action || action.type !== "fight") return 0;
    const move = MOVES[action.moveId];
    if (!move) return 0;
    const actor = state?.teams?.[action.team]?.active?.[action.slot];
    if (!actor || !isAlive(actor)) return 0;
    const turnNumber = Math.max(1, Number(state?.turn) || Number(gameState?.turn) || 1);
    const ctx = applyMoveEffect(createAttackContext({ attacker: actor, move, aliveAllies: getAliveAlliesCount(state, actor.team), turnNumber }));
    applyTraitEffect(ctx, getTraitEffectKey(actor));
    return Math.max(0, Number(ctx.priority) || 0);
  };

  const hasDefeatedAlly = (state, actor) => {
    if (!state || !actor) return false;
    const units = [
      ...(Array.isArray(state?.teams?.[actor.team]?.active) ? state.teams[actor.team].active : []),
      ...(Array.isArray(state?.teams?.[actor.team]?.reserve) ? state.teams[actor.team].reserve : [])
    ];
    return units.some((unit) => unit && unit.uid !== actor.uid && isDefeated(unit));
  };

  const applyMoveDamageModifier = ({ damage, move, actor, target, actedThisTurn = null, attackingActorUids = null, state = null }) => {
    let nextDamage = Math.max(0, Number(damage) || 0);
    if (nextDamage <= 0 || !move || !actor || !target) return nextDamage;
    const ctx = applyMoveEffect(createAttackContext({ attacker: actor, defender: target, move, aliveAllies: getAliveAlliesCount(state, actor.team) }));
    let applyModifier = true;
    if (ctx.requiresTargetActed && !actedThisTurn?.has(target.uid)) applyModifier = false;
    if (ctx.requiresTargetAttacking && !attackingActorUids?.has(target.uid)) applyModifier = false;
    if (ctx.requiresAllyDefeated && !hasDefeatedAlly(state, actor)) applyModifier = false;
    if (applyModifier) {
      const ratio = Math.max(1, Number(ctx.powerModifier) || 1);
      nextDamage = Math.max(1, Math.floor(nextDamage * ratio));
    }
    return nextDamage;
  };

  const getPatternPositionsForMove = (actor, move) => {
    const actorPos = toBoardPos(actor.team, actor.slot);
    const orientation = actor.team === TEAM.ALLY ? 1 : -1;
    return (patterns[move.patternId] || [])
      .map((o) => ({ x: actorPos.x + o.x, y: actorPos.y + (o.y * orientation) }))
      .filter(inBounds);
  };

  const canMoveReachTarget = (attacker, defender, moveId) => {
    if (!attacker || !defender || !moveId) return null;
    const move = MOVES[moveId];
    if (!move) return null;
    if (!isDamageMoveCategory(move.category)) return false;
    if (!patterns[move.patternId]) return null;
    const reachable = getPatternPositionsForMove(attacker, move);
    const targetPos = toBoardPos(defender.team, defender.slot);
    if (!reachable.some((pos) => pos.x === targetPos.x && pos.y === targetPos.y)) return false;
    return isRuleMatchAtPosition(attacker, move, defender);
  };

  const hasAnyReachableMove = (attacker, defender) => {
    if (!attacker || !defender) return true;
    const moveIds = Array.isArray(attacker.moveIds) ? attacker.moveIds : [];
    let checkedAnyAttackMove = false;
    for (const moveId of moveIds) {
      const move = MOVES[moveId];
      if (!move) return true;
      if (!isDamageMoveCategory(move.category)) continue;
      checkedAnyAttackMove = true;
      const canReach = canMoveReachTarget(attacker, defender, moveId);
      if (canReach === null) return true;
      if (canReach) return true;
    }
    return !checkedAnyAttackMove ? true : false;
  };

  const shouldTriggerResetMove = (state = gameState) => {
    if (!state?.playing?.hasCompletedFirstTurn) return false;
    const allyLiving = getLivingMonsters(TEAM.ALLY, state);
    const enemyLiving = getLivingMonsters(TEAM.ENEMY, state);
    if (allyLiving.length !== 1 || enemyLiving.length !== 1) return false;
    const allyActive = getActiveFieldUnits(TEAM.ALLY, state);
    const enemyActive = getActiveFieldUnits(TEAM.ENEMY, state);
    if (allyActive.length !== 1 || enemyActive.length !== 1) return false;
    if (allyActive[0].uid !== allyLiving[0].uid || enemyActive[0].uid !== enemyLiving[0].uid) return false;
    const allyCanReach = hasAnyReachableMove(allyActive[0], enemyActive[0]);
    const enemyCanReach = hasAnyReachableMove(enemyActive[0], allyActive[0]);
    return !allyCanReach && !enemyCanReach;
  };

  const applyResetMove = (state = gameState) => {
    const centerSlot = Math.floor(CONFIG.BOARD_COLS / 2);
    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      const activeUnits = getActiveFieldUnits(team, state);
      if (activeUnits.length !== 1) return;
      const unit = activeUnits[0];
      if (unit.slot === centerSlot) return;
      const teamActive = state.teams[team].active;
      if (!Array.isArray(teamActive)) return;
      teamActive[unit.slot] = null;
      teamActive[centerSlot] = unit;
      unit.slot = centerSlot;
    });
  };

  const isPlaybackBusy = () => gameState.battleFlow.mode === "playback" || gameState.battleFlow.mode === "resolve";

  const appendBattleLogEntry = (text) => {
    gameState.battleFlow.turnLogEntries.push(text);
    const turnNumber = Math.max(1, gameState.turn - 1);
    const hasTurnHeader = gameState.log.some((entry) => entry?.type === "turn" && entry.turn === turnNumber);
    if (!hasTurnHeader) gameState.log.push({ type: "turn", turn: turnNumber, text: `ターン${turnNumber}` });
    gameState.log.push({ type: "line", turn: turnNumber, text });
    if (gameState.log.length > CONFIG.MAX_LOG_LINES) gameState.log.splice(0, gameState.log.length - CONFIG.MAX_LOG_LINES);
  };

  const resolveTurn = () => {
    const sim = JSON.parse(JSON.stringify({ teams: gameState.teams, globalStatuses: gameState.globalStatuses, turn: gameState.turn }));
    const actions = [...Object.values(gameState.plannedActions), ...Object.values(gameState.enemyPlannedActions)];
    const speedSort = (a, b) => {
      const ua = sim.teams[a.team].active[a.slot];
      const ub = sim.teams[b.team].active[b.slot];
      const pa = getActionPriority(a, sim);
      const pb = getActionPriority(b, sim);
      if (pa !== pb) return pb - pa;
      const sa = ua ? getEffectiveStat(ua, "spd") : -1;
      const sb = ub ? getEffectiveStat(ub, "spd") : -1;
      if (sa !== sb) return sb - sa;
      if (a.team !== b.team) return byTeamOrder(a.team) - byTeamOrder(b.team);
      return a.slot - b.slot;
    };
    const switchActions = actions.filter((a) => a.type === "switch").sort(speedSort);
    const otherActions = actions.filter((a) => a.type !== "switch").sort(speedSort);

    const turnResult = {
      turnNumber: gameState.turn,
      switchStepResults: [],
      turnStartStepResults: { abilityStatuses: [], statBoosts: [] },
      actionResults: [],
      endStepResults: { poisonTicks: [], expiredStatuses: [], expiredFieldEffects: [] },
      nextState: { winner: null }
    };
    const switchInsThisTurn = [];
    const getCurrentFieldMonsters = () => {
      const out = [];
      [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
        const activeList = sim?.teams?.[team]?.active;
        if (!Array.isArray(activeList)) return;
        activeList.forEach((unit) => {
          if (unit && isAlive(unit)) out.push(unit);
        });
      });
      return out;
    };

    const processForcedSwitchIfNeeded = () => {
      switchInsThisTurn.forEach((entry) => {
        const unit = sim?.teams?.[entry.team]?.active?.[entry.slot];
        if (!unit || !isAlive(unit)) return;
        clearSwitchFlags(unit);
      });
    };

    const processSwitchInEffects = () => {
      switchInsThisTurn.forEach((entry) => {
        const unit = sim?.teams?.[entry.team]?.active?.[entry.slot];
        if (!unit || !isAlive(unit) || unit.uid !== entry.incomingUnitId) return;
        const enter = resolveUnitOnEnterEffects({ state: sim, team: entry.team, slot: entry.slot, unit });
        entry.enterEffects = enter.messages;
        entry.enterStatusApplies = enter.statusApplies;
      });
    };

    const processTurnStartPassives = () => {
      getCurrentFieldMonsters().forEach((unit) => {
        const selectedTrait = getSelectedTrait(unit);
        if (!selectedTrait) return;
        const traitResult = applyTraitEffects("onTurnStart", { source: unit, state: sim });
        traitResult.effects.forEach((effect) => {
          if (effect.type !== "addAtkStage") return;
          turnResult.turnStartStepResults.statBoosts.push({
            sourceId: unit.uid,
            sourceName: unit.name,
            traitKind: selectedTrait.key || "trait",
            targetId: unit.uid,
            targetName: unit.name,
            amount: effect.amount
          });
        });
      });
    };

    const runSwitchAction = (action) => {
      const actor = sim.teams[action.team].active[action.slot];
      if (!actor || !isAlive(actor)) {
        turnResult.actionResults.push({ type: "skip", reason: "actorDown", actorId: actor?.uid, actorName: actor?.name || "不明" });
        return;
      }
      const switchState = getStatusState(actor);
      if (!switchState.canSwitch) {
        turnResult.actionResults.push({ type: "skip", reason: "cannotSwitch", actorId: actor.uid, actorName: actor.name });
        return;
      }
      const teamState = sim.teams[action.team];
      const reserveIndex = teamState.reserve.findIndex((r) => r?.uid === action.switchTargetId);
      const reserve = reserveIndex >= 0 ? teamState.reserve[reserveIndex] : null;
      if (!reserve) {
        turnResult.actionResults.push({ type: "skip", reason: "invalidSwitchTarget", actorId: actor.uid, actorName: actor.name });
        return;
      }
      const slot = action.slot;
      const outgoing = teamState.active[slot] || null;
      if (!outgoing) return;
      clearSwitchSensitiveStatuses(outgoing);
      const replacement = replaceActiveUnitFromReserve({
        state: sim,
        team: action.team,
        slot,
        incomingUnitId: reserve.uid,
        reserveIndexHint: reserveIndex,
        reserveMode: "swap"
      });
      if (!replacement) {
        turnResult.actionResults.push({ type: "skip", reason: "invalidSwitchTarget", actorId: actor.uid, actorName: actor.name });
        return;
      }
      const actionResult = {
        type: "switch",
        team: action.team,
        playerId: action.team,
        slot,
        slotIndex: slot,
        incomingUnitId: reserve.uid,
        reserveIndex,
        reserveIn: { uid: reserve.uid, name: reserve.name, reserveIndex },
        reserveOut: { uid: outgoing.uid, name: outgoing.name },
        enterEffects: [],
        enterStatusApplies: []
      };
      switchInsThisTurn.push(actionResult);
      turnResult.switchStepResults.push(actionResult);
    };

    switchActions.forEach(runSwitchAction);
    processForcedSwitchIfNeeded();
    processSwitchInEffects();
    processTurnStartPassives();

    const actedThisTurn = new Set();
    const attackingActorUids = new Set(
      otherActions
        .filter((queuedAction) => queuedAction?.type === "fight")
        .map((queuedAction) => {
          const queuedMove = MOVES[queuedAction.moveId];
          if (!queuedMove || !isDamageMoveCategory(queuedMove.category)) return null;
          return sim?.teams?.[queuedAction.team]?.active?.[queuedAction.slot]?.uid || null;
        })
        .filter(Boolean)
    );

    otherActions.forEach((action) => {
      const actor = sim.teams[action.team].active[action.slot];
      if (!actor || !isAlive(actor)) {
        turnResult.actionResults.push({ type: "skip", reason: "actorDown", actorId: actor?.uid, actorName: actor?.name || "不明" });
        return;
      }
      const move = MOVES[action.moveId];
      if (!move) return;
      debugBattleLog("actor-before-action", {
        actorName: actor.name,
        actorUid: actor.uid,
        actorTeam: actor.team,
        moveId: move.id,
        moveTargetRule: move.targetRule
      });
      const patternPositions = getPatternPositionsForMove(actor, move);
      const targets = getActionTargetPositions({ state: sim, actor, move, action });
      const actionResult = { type: "fight", team: action.team, actorId: actor.uid, actorName: actor.name, moveId: move.id, moveName: move.name, targets: [], selfHpBefore: actor.hp, selfHpAfter: actor.hp, selfHeal: 0, selfStatChanges: [], isCritical: false };
      const isCritical = isCriticalHit(actor, move);
      const moveCtx = applyMoveEffect(createAttackContext({ attacker: actor, move, aliveAllies: getAliveAlliesCount(sim, actor.team) }));
      const hitCount = getMoveHitCount({ state: sim, actor, move });

      targets.forEach((targetPos) => {
        if (!inBounds(targetPos)) return;
        if (move.targetMode !== "all-enemies" && !patternPositions.some((p) => p.x === targetPos.x && p.y === targetPos.y)) return;
        const target = getUnitAtFromState(sim, targetPos);
        if (!validateTargetingContext(actor, target, move, "resolveTurn", targetPos)) return;
        const targetLabel = target?.name || `${targetPos.y === 0 ? "敵" : "味方"}${targetPos.x + 1}`;
        const targetResult = {
          targetId: target?.uid || null,
          targetName: targetLabel,
          targetPos: { x: targetPos.x, y: targetPos.y },
          hpBefore: target?.hp ?? 0,
          hpAfter: target?.hp ?? 0,
          damage: 0,
          effectiveness: "normal",
          appliedStatuses: [],
          defeated: false,
          isCritical: false,
          missed: !target || !isAlive(target)
        };

        if (!target || !isAlive(target)) {
          actionResult.targets.push(targetResult);
          return;
        }

        move.beforeDamage.forEach((effect) => {
          if (effect.type === "applyStatus") {
            addStatus(target, effect.status, effect.duration);
            targetResult.appliedStatuses.push({ statusId: effect.status, duration: effect.duration, sourceType: "move" });
          }
          if (effect.type === "modifyCritStage") {
            const effectTarget = effect.target === "self" ? actor : target;
            if (!effectTarget?.buffs) return;
            const stages = Math.max(0, Number(effect.stages) || 0);
            const duration = Math.max(0, Number(effect.duration) || 0);
            effectTarget.buffs.critStage = clamp((Number(effectTarget.buffs.critStage) || 0) + stages, 0, CONFIG.CRIT_STAGE_MAX);
            effectTarget.buffs.critStageDuration = Math.max(Number(effectTarget.buffs.critStageDuration) || 0, duration);
            targetResult.appliedStatuses.push({ statusId: "critFocus", duration, sourceType: "move", targetId: effectTarget.uid, targetName: effectTarget.name });
          }
        });

        if (isDamageMoveCategory(move.category)) {
          for (let hit = 0; hit < hitCount; hit += 1) {
            if (!isAlive(target)) break;
            if (!doesMoveHit({ actor, target, move, state: sim })) continue;
            const baseDamage = calcDamage(actor, target, move, { isCritical });
            const damage = applyMoveDamageModifier({
              damage: baseDamage,
              move,
              actor,
              target,
              actedThisTurn,
              attackingActorUids,
              state: sim
            });
            target.hp = clamp(target.hp - damage, 0, target.maxHp);
            syncUnitDefeatedState(target);
            targetResult.damage += damage;
            targetResult.hpAfter = target.hp;
            targetResult.isCritical = isCritical;
            actionResult.isCritical = isCritical;
          }
        }

        move.afterDamage.forEach((effect) => {
          if (effect.type === "drain" && targetResult.damage > 0) {
            const heal = Math.max(1, Math.floor(targetResult.damage * effect.ratio));
            const before = actor.hp;
            actor.hp = clamp(actor.hp + heal, 0, actor.maxHp);
            syncUnitDefeatedState(actor);
            actionResult.selfHeal += actor.hp - before;
          }
          if (effect.type === "applyStatus") {
            addStatus(target, effect.status, effect.duration);
            targetResult.appliedStatuses.push({ statusId: effect.status, duration: effect.duration, sourceType: "move" });
          }
          if (effect.type === "recoil" && targetResult.damage > 0) {
            const recoil = Math.max(1, Math.floor(targetResult.damage * (Number(effect.ratio) || 0)));
            const before = actor.hp;
            actor.hp = clamp(actor.hp - recoil, 0, actor.maxHp);
            syncUnitDefeatedState(actor);
            actionResult.selfHeal -= (before - actor.hp);
          }
        });
        if ((Number(moveCtx.recoilRate) || 0) > 0 && targetResult.damage > 0) {
          const recoil = Math.max(1, Math.floor(targetResult.damage * moveCtx.recoilRate));
          const before = actor.hp;
          actor.hp = clamp(actor.hp - recoil, 0, actor.maxHp);
          syncUnitDefeatedState(actor);
          actionResult.selfHeal -= (before - actor.hp);
        }

        const afterDamageTrait = applyTraitEffects("afterDamage", { source: actor, target, move, damage: targetResult.damage, state: sim });
        afterDamageTrait.effects.forEach((effect) => {
          if (effect.type !== "applyStatus") return;
          targetResult.appliedStatuses.push({
            statusId: effect.statusId,
            duration: effect.duration,
            sourceType: effect.sourceType,
            sourceId: effect.sourceId,
            sourceName: effect.sourceName,
            traitKind: effect.traitKind,
            targetId: effect.targetId,
            targetName: effect.targetName
          });
        });

        targetResult.defeated = target.hp <= 0;
        actionResult.targets.push(targetResult);
      });

      const moveSelfChanges = Array.isArray(moveCtx?.selfStatChanges) ? moveCtx.selfStatChanges : [];
      moveSelfChanges.forEach((change) => {
        const stat = typeof change?.stat === "string" ? change.stat : "";
        const amount = Math.trunc(Number(change?.amount) || 0);
        if (!stat || amount === 0) return;
        const changed = adjustStageWithTraitRule(actor, stat, amount);
        if (changed === 0) return;
        actionResult.selfStatChanges.push({ stat, amount: changed, source: "move" });
      });
      const traitAfterCtx = applyTraitEffect(createAttackContext({ attacker: actor, move }), getTraitEffectKey(actor));
      const traitSelfChanges = Array.isArray(traitAfterCtx?.afterAttackSelfChanges) ? traitAfterCtx.afterAttackSelfChanges : [];
      traitSelfChanges.forEach((change) => {
        const stat = typeof change?.stat === "string" ? change.stat : "";
        const amount = Math.trunc(Number(change?.amount) || 0);
        if (!stat || amount === 0) return;
        const changed = adjustStageWithTraitRule(actor, stat, amount);
        if (changed === 0) return;
        actionResult.selfStatChanges.push({ stat, amount: changed, source: "trait" });
      });

      actionResult.selfHpAfter = actor.hp;
      turnResult.actionResults.push(actionResult);
      actedThisTurn.add(actor.uid);
    });

    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      sim.teams[team].active.forEach((unit) => {
        if (!unit || !isAlive(unit)) return;
        if (findStatus(unit.statuses, "poison")) {
          const hpBefore = unit.hp;
          const dmg = Math.max(1, Math.floor(unit.maxHp * CONFIG.POISON_RATIO));
          unit.hp = clamp(unit.hp - dmg, 0, unit.maxHp);
          syncUnitDefeatedState(unit);
          turnResult.endStepResults.poisonTicks.push({ targetId: unit.uid, targetName: unit.name, hpBefore, hpAfter: unit.hp, damage: hpBefore - unit.hp, defeated: unit.hp <= 0 });
        }
        unit.statuses.forEach((s) => { s.duration -= 1; });
        unit.statuses.filter((s) => s.duration <= 0).forEach((s) => turnResult.endStepResults.expiredStatuses.push({ ownerType: "unit", ownerId: unit.uid, ownerName: unit.name, statusId: s.kind }));
        unit.statuses = removeExpired(unit.statuses);
        if ((Number(unit?.buffs?.critStageDuration) || 0) > 0) {
          unit.buffs.critStageDuration -= 1;
          if (unit.buffs.critStageDuration <= 0 && (Number(unit.buffs.critStage) || 0) > 0) {
            unit.buffs.critStage = 0;
            turnResult.endStepResults.expiredStatuses.push({ ownerType: "unit", ownerId: unit.uid, ownerName: unit.name, statusId: "critFocus" });
          }
        }
      });

      sim.teams[team].statuses.forEach((s) => { s.duration -= 1; });
      sim.teams[team].statuses.filter((s) => s.duration <= 0).forEach((s) => turnResult.endStepResults.expiredFieldEffects.push({ ownerType: "team", ownerTeam: team, effectId: s.kind, ownerName: team === TEAM.ALLY ? "味方側" : "敵側" }));
      sim.teams[team].statuses = removeExpired(sim.teams[team].statuses);
    });

    sim.globalStatuses.forEach((s) => { s.duration -= 1; });
    sim.globalStatuses.filter((s) => s.duration <= 0).forEach((s) => turnResult.endStepResults.expiredFieldEffects.push({ ownerType: "global", effectId: s.kind, ownerName: STATUS_LABELS[s.kind] || s.kind }));
    sim.globalStatuses = removeExpired(sim.globalStatuses);

    turnResult.nextState.winner = getWinnerFromRemainingUnits(sim);

    return turnResult;
  };

  const buildBattleEventQueue = (turnResult) => {
    const q = [];
    turnResult.switchStepResults.forEach((a) => {
      q.push({ type: "message", text: "交代処理", loggable: true });
      q.push({ type: "message", text: `${a.reserveOut.name}は 交代した！`, loggable: true });
      q.push({
        type: "switchApply",
        playerId: a.playerId ?? a.team,
        team: a.team,
        slotIndex: a.slotIndex ?? a.slot,
        slot: a.slot,
        incomingUnitId: a.incomingUnitId ?? a.reserveIn?.uid,
        reserveIndex: a.reserveIndex ?? a.reserveIn?.reserveIndex
      });
      q.push({ type: "message", text: "交代完了", loggable: true });
      q.push({ type: "message", text: `${a.reserveIn.name}が 場に出た！`, loggable: true });
      q.push({ type: "message", text: "交代後特性発動", loggable: true });
      (a.enterStatusApplies || []).forEach((s) => q.push({ type: "statusApply", targetId: s.targetId, statusId: s.statusId, duration: s.duration }));
      (a.enterEffects || []).forEach((line) => q.push({ type: "message", text: line, loggable: true }));
      q.push({ type: "wait", duration: CONFIG.WAIT_SHORT_MS });
    });
    const hasTurnStartPassives = (turnResult.turnStartStepResults.abilityStatuses.length > 0 || turnResult.turnStartStepResults.statBoosts.length > 0);
    if (hasTurnStartPassives) {
      q.push({ type: "message", text: "場のモンスターの特性発動", loggable: true });
    }
    turnResult.turnStartStepResults.abilityStatuses.forEach((s) => {
      const abilityName = getTraitLabel(s.traitKind);
      q.push({
        type: "battleHighlight",
        sources: [s.sourceId],
        targets: [s.targetId],
        effectType: "trait",
        traitKind: s.traitKind
      });
      q.push({ type: "message", text: `${s.sourceName}の ${abilityName}が 発動した！`, loggable: true });
      const text = STATUS_APPLY_TEXT[s.statusId]?.(s.targetName) || `${s.targetName}に ${s.statusId}！`;
      q.push({ type: "message", text, loggable: true });
      q.push({ type: "statusApply", targetId: s.targetId, statusId: s.statusId, duration: s.duration });
      q.push({ type: "clearBattleHighlight" });
    });
    turnResult.turnStartStepResults.statBoosts.forEach((boost) => {
      const abilityName = getTraitLabel(boost.traitKind);
      q.push({
        type: "battleHighlight",
        sources: [boost.sourceId],
        targets: [boost.targetId],
        effectType: "trait",
        traitKind: boost.traitKind
      });
      q.push({ type: "message", text: `${boost.sourceName}の ${abilityName}が 発動した！`, loggable: true });
      q.push({ type: "message", text: `${boost.targetName}の こうげき体勢が高まった！`, loggable: true });
      q.push({ type: "clearBattleHighlight" });
    });

    turnResult.actionResults.forEach((a) => {
      if (a.type === "skip") {
        q.push({ type: "message", text: `${a.actorName}は 行動できない！`, loggable: true });
        return;
      }
      const targetIds = a.targets.map((t) => t.targetId).filter(Boolean);
      const isAoe = a.targets.length > 1;
      q.push({
        type: "battleHighlight",
        sources: [a.actorId],
        targets: targetIds,
        effectType: isAoe ? "aoe" : "attack"
      });
      q.push({ type: "message", text: `${a.actorName}の ${a.moveName}！`, loggable: true });
      if (a.isCritical) q.push({ type: "message", text: "きゅうしょに あたった！", loggable: true });
      const aoeAnimations = [];
      a.targets.forEach((t) => {
        if (!t.targetId) return;
        if (t.damage > 0 || t.hpBefore !== t.hpAfter) {
          const anim = { targetId: t.targetId, fromHp: t.hpBefore, toHp: t.hpAfter, duration: CONFIG.HP_ANIM_MS };
          if (isAoe) aoeAnimations.push(anim);
          else q.push({ type: "hpAnimation", ...anim });
        }
      });
      if (isAoe && aoeAnimations.length) q.push({ type: "hpAnimationBatch", animations: aoeAnimations });
      a.targets.forEach((t) => {
        if (t.missed) {
          q.push({ type: "message", text: `${t.targetName}には あたらなかった！`, loggable: true });
          return;
        }
        t.appliedStatuses.forEach((applied) => {
          const statusId = applied?.statusId;
          if (!statusId) return;
          const appliedTargetId = applied?.targetId || t.targetId;
          const appliedTargetName = applied?.targetName || t.targetName;
          if (applied.sourceType === "trait") {
            const abilityName = getTraitLabel(applied.traitKind);
            q.push({
              type: "battleHighlight",
              sources: [applied.sourceId],
              targets: [appliedTargetId],
              effectType: "trait",
              traitKind: applied.traitKind
            });
            q.push({ type: "message", text: `${applied.sourceName}の ${abilityName}が 発動した！`, loggable: true });
          }
          const text = STATUS_APPLY_TEXT[statusId]?.(appliedTargetName) || `${appliedTargetName}に ${statusId}！`;
          q.push({ type: "message", text, loggable: true });
          q.push({ type: "statusApply", targetId: appliedTargetId, statusId, duration: applied.duration });
          if (applied.sourceType === "trait") q.push({ type: "clearBattleHighlight" });
        });
        if (t.defeated) q.push({ type: "message", text: `${t.targetName}は たおれた！`, loggable: true });
      });
      if (a.selfHeal > 0) q.push({ type: "hpAnimation", targetId: a.actorId, fromHp: a.selfHpBefore, toHp: a.selfHpAfter, duration: CONFIG.HP_ANIM_MS });
      q.push({ type: "clearBattleHighlight" });
      q.push({ type: "wait", duration: CONFIG.WAIT_SHORT_MS });
    });

    turnResult.endStepResults.poisonTicks.forEach((p) => {
      q.push({
        type: "battleHighlight",
        sources: [],
        targets: [p.targetId],
        effectType: "status",
        statusKind: "poison"
      });
      q.push({ type: "message", text: `${p.targetName}は どくの ダメージを うけた！`, loggable: true });
      q.push({ type: "hpAnimation", targetId: p.targetId, fromHp: p.hpBefore, toHp: p.hpAfter, duration: CONFIG.HP_ANIM_MS });
      if (p.defeated) q.push({ type: "message", text: `${p.targetName}は たおれた！`, loggable: true });
      q.push({ type: "clearBattleHighlight" });
    });

    turnResult.endStepResults.expiredStatuses.forEach((s) => {
      const text = STATUS_FADE_TEXT[s.statusId]?.(s.ownerName) || `${s.ownerName}の ${s.statusId}が切れた。`;
      if (s.ownerType === "unit") {
        q.push({
          type: "battleHighlight",
          sources: [],
          targets: [s.ownerId],
          effectType: "statusRemove",
          removeKind: s.statusId
        });
      }
      q.push({ type: "message", text, loggable: true });
      if (s.ownerType === "unit") {
        q.push({ type: "statusRemove", targetId: s.ownerId, statusId: s.statusId });
        q.push({ type: "clearBattleHighlight" });
      }
    });

    turnResult.endStepResults.expiredFieldEffects.forEach((f) => {
      q.push({ type: "fieldEffectExpire", effectId: f.effectId, ownerType: f.ownerType, ownerTeam: f.ownerTeam });
      q.push({ type: "message", text: `${f.ownerName}の ${STATUS_LABELS[f.effectId] || f.effectId}は 消え失せた`, loggable: true });
    });

    q.push({ type: "turnSeparator" });
    return q;
  };

  const startBattlePlayback = (eventQueue, turnResult) => {
    gameState.battleFlow.mode = "playback";
    gameState.battleFlow.eventQueue = eventQueue;
    gameState.battleFlow.currentEventIndex = 0;
    gameState.battleFlow.currentMessage = "";
    gameState.battleFlow.waitUntil = 0;
    gameState.battleFlow.isEventRunning = false;
    gameState.battleFlow.turnLogEntries = [];
    gameState.battleFlow.pendingTurnResult = turnResult;
    gameState.battleFlow.activeEvent = null;
    gameState.ui.fastForwardRequested = false;
  };

  const finishCurrentEvent = () => {
    gameState.battleFlow.isEventRunning = false;
    gameState.battleFlow.activeEvent = null;
    gameState.battleFlow.currentEventIndex += 1;
    gameState.ui.fastForwardRequested = false;
  };

  const animateHpChange = (targetId, fromHp, toHp, duration) => {
    const unit = getUnitByUid(targetId);
    if (!unit) return;
    gameState.displayState.hpAnimations[targetId] = { fromHp, toHp, startMs: performance.now(), durationMs: Math.max(1, duration / gameState.battleFlow.playbackSpeed) };
    gameState.displayState.hpDisplay[targetId] = fromHp;
  };

  const applyStatusMarker = (targetId, statusId, duration = null) => {
    const unit = getUnitByUid(targetId);
    if (!unit) return;
    if (statusId === "critFocus") {
      unit.buffs.critStage = clamp((Number(unit?.buffs?.critStage) || 0) + 1, 0, CONFIG.CRIT_STAGE_MAX);
      unit.buffs.critStageDuration = Math.max(Number(unit?.buffs?.critStageDuration) || 0, duration ?? 1);
      return;
    }
    addStatus(unit, statusId, duration ?? STATUSES[statusId]?.duration ?? 1);
  };

  const expireFieldEffect = (effectId, ownerType, ownerTeam) => {
    if (ownerType === "global") {
      gameState.globalStatuses = gameState.globalStatuses.filter((s) => s.kind !== effectId);
      return;
    }
    if (ownerType === "team") {
      gameState.teams[ownerTeam].statuses = gameState.teams[ownerTeam].statuses.filter((s) => s.kind !== effectId);
    }
  };

  const removeStatusMarker = (targetId, statusId) => {
    const unit = getUnitByUid(targetId);
    if (!unit) return;
    if (statusId === "critFocus") {
      unit.buffs.critStage = 0;
      unit.buffs.critStageDuration = 0;
      return;
    }
    unit.statuses = unit.statuses.filter((s) => s.kind !== statusId);
  };

  const syncUnitDefeatedState = (unit) => {
    if (!unit) return;
    const wasDefeated = unit.defeated === true;
    unit.defeated = Number(unit.hp) <= 0;
    if (unit.defeated && !wasDefeated) {
      gameState.displayState.defeatVanish[unit.uid] = {
        startedAt: performance.now(),
        durationMs: CONFIG.DEFEAT_VANISH_MS
      };
      gameState.displayState.hiddenDefeatedPortraits[unit.uid] = false;
    }
  };

  const applySwitchResult = (event) => {
    const team = event?.playerId ?? event?.team;
    const slot = event?.slotIndex ?? event?.slot;
    const incomingUnitId = event?.incomingUnitId ?? event?.reserveIn?.uid;
    if (!team || !Number.isInteger(slot) || !incomingUnitId) return;
    const outgoing = gameState.teams[team]?.active?.[slot] || null;
    if (!outgoing) return;
    clearSwitchSensitiveStatuses(outgoing);
    delete gameState.displayState.hpDisplay[outgoing.uid];
    delete gameState.displayState.hpAnimations[outgoing.uid];

    const replacement = replaceActiveUnitFromReserve({
      state: gameState,
      team,
      slot,
      incomingUnitId,
      reserveIndexHint: event?.reserveIndex ?? event?.reserveIn?.reserveIndex,
      reserveMode: "swap"
    });
    if (!replacement) return;

    gameState.displayState.hpDisplay[replacement.incoming.uid] = replacement.incoming.hp;
    delete gameState.displayState.hpAnimations[replacement.incoming.uid];
  };

  const beginEvent = (event, now) => {
    gameState.battleFlow.isEventRunning = true;
    gameState.battleFlow.activeEvent = event;

    if (event.type === "message") {
      gameState.battleFlow.currentMessage = event.text;
      if (event.loggable) appendBattleLogEntry(event.text);
      gameState.battleFlow.waitUntil = now + (CONFIG.MESSAGE_AUTO_MS / gameState.battleFlow.playbackSpeed);
      return;
    }
    if (event.type === "wait") {
      gameState.battleFlow.waitUntil = now + (event.duration / gameState.battleFlow.playbackSpeed);
      return;
    }
    if (event.type === "battleHighlight") {
      setBattleHighlight({
        sources: event.sources,
        targets: event.targets,
        effectType: event.effectType || null,
        statusKind: event.statusKind || null,
        traitKind: event.traitKind || null,
        removeKind: event.removeKind || null
      });
      gameState.battleFlow.waitUntil = now + (CONFIG.HIGHLIGHT_MS / gameState.battleFlow.playbackSpeed);
      return;
    }
    if (event.type === "hpAnimation") {
      animateHpChange(event.targetId, event.fromHp, event.toHp, event.duration || CONFIG.HP_ANIM_MS);
      const unit = getUnitByUid(event.targetId);
      if (unit) {
        unit.hp = event.toHp;
        syncUnitDefeatedState(unit);
      }
      return;
    }
    if (event.type === "hpAnimationBatch") {
      const animations = Array.isArray(event.animations) ? event.animations : [];
      animations.forEach((anim) => {
        if (!anim?.targetId) return;
        animateHpChange(anim.targetId, anim.fromHp, anim.toHp, anim.duration || CONFIG.HP_ANIM_MS);
        const unit = getUnitByUid(anim.targetId);
        if (unit) {
          unit.hp = anim.toHp;
          syncUnitDefeatedState(unit);
        }
      });
      return;
    }
    if (event.type === "statusApply") {
      applyStatusMarker(event.targetId, event.statusId, event.duration);
      finishCurrentEvent();
      return;
    }
    if (event.type === "statusRemove") {
      removeStatusMarker(event.targetId, event.statusId);
      finishCurrentEvent();
      return;
    }
    if (event.type === "fieldEffectExpire") {
      expireFieldEffect(event.effectId, event.ownerType, event.ownerTeam);
      finishCurrentEvent();
      return;
    }
    if (event.type === "switchApply") {
      applySwitchResult(event);
      finishCurrentEvent();
      return;
    }
    if (event.type === "clearBattleHighlight") {
      clearBattleHighlight();
      finishCurrentEvent();
      return;
    }
    if (event.type === "turnSeparator") {
      clearBattleHighlight();
      finishCurrentEvent();
      return;
    }
    finishCurrentEvent();
  };

  const updateHpAnimations = (now) => {
    Object.entries(gameState.displayState.hpAnimations).forEach(([uid, anim]) => {
      const elapsed = now - anim.startMs;
      const t = clamp(elapsed / anim.durationMs, 0, 1);
      const v = Math.round(anim.fromHp + (anim.toHp - anim.fromHp) * t);
      gameState.displayState.hpDisplay[uid] = v;
      if (t >= 1) delete gameState.displayState.hpAnimations[uid];
    });
  };

  const updateDefeatVanishAnimations = (now) => {
    Object.entries(gameState.displayState.defeatVanish).forEach(([uid, anim]) => {
      if (!anim) return;
      const elapsed = now - (Number(anim.startedAt) || 0);
      const duration = Math.max(1, Number(anim.durationMs) || CONFIG.DEFEAT_VANISH_MS);
      if (elapsed < duration) return;
      gameState.displayState.hiddenDefeatedPortraits[uid] = true;
      delete gameState.displayState.defeatVanish[uid];
    });
  };

  const handleBattleFinished = (winner) => {
    gameState.winner = winner;
    const trialId = gameState?.progress?.selectedTrial;
    const bossDef = (trialId && HANAFUDA_BOSSES[trialId]) ? HANAFUDA_BOSSES[trialId] : null;
    if (!bossDef) {
      setPhase(PHASE.GAMEOVER);
      return;
    }
    if (winner === TEAM.ALLY) {
      const rewardChoices = buildTrialRewardChoices(bossDef);
      gameState.progress.pendingReward = {
        trialId,
        bossName: bossDef.name,
        rewardConcept: bossDef.data.rewardConcept,
        choices: rewardChoices,
        selectedIndex: 0
      };
      markTrialCleared(trialId);
      gameState.ui.rewardChoiceIndex = 0;
      setPhase(PHASE.REWARD);
      return;
    }
    gameState.systemMessage = `${bossDef.name}に敗北。進行度は失われません。`;
    setPhase(PHASE.GAMEOVER);
  };

  const updateBattlePlayback = (now) => {
    const flow = gameState.battleFlow;
    const event = flow.eventQueue[flow.currentEventIndex];

    if (!event) {
      if (flow.pendingTurnResult?.nextState?.winner) {
        handleBattleFinished(flow.pendingTurnResult.nextState.winner);
      } else {
        finalizeTurnAndProceed();
      }
      return;
    }

    if (!flow.isEventRunning) beginEvent(event, now);

    if (!flow.isEventRunning) return;

    if (event.type === "message") {
      const minReady = now >= (flow.waitUntil - ((CONFIG.MESSAGE_AUTO_MS - CONFIG.MESSAGE_MIN_MS) / gameState.battleFlow.playbackSpeed));
      if ((gameState.ui.fastForwardRequested && minReady) || now >= flow.waitUntil) finishCurrentEvent();
      return;
    }

    if (event.type === "wait" || event.type === "battleHighlight") {
      if (now >= flow.waitUntil) finishCurrentEvent();
      return;
    }

    if (event.type === "hpAnimation") {
      if (!gameState.displayState.hpAnimations[event.targetId]) {
        gameState.displayState.hpDisplay[event.targetId] = event.toHp;
        finishCurrentEvent();
      }
      return;
    }

    if (event.type === "hpAnimationBatch") {
      const animations = Array.isArray(event.animations) ? event.animations : [];
      const isRunning = animations.some((anim) => !!gameState.displayState.hpAnimations[anim.targetId]);
      if (!isRunning) {
        animations.forEach((anim) => {
          if (!anim?.targetId) return;
          gameState.displayState.hpDisplay[anim.targetId] = anim.toHp;
        });
        finishCurrentEvent();
      }
    }
  };

  const getCurrentPlaybackMessage = () => gameState.battleFlow.currentMessage;

  const getCurrentActor = () => gameState.teams.ally.active[gameState.currentActorIndex] || null;
  const getSelectedMove = () => MOVES[gameState.selectedMoveId] || null;
  const getPartyReserve = () => (Array.isArray(gameState?.teams?.ally?.reserve) ? gameState.teams.ally.reserve : []);
  const getSafePartyIndex = (index = gameState.ui.partyIndex) => {
    const reserve = getPartyReserve();
    if (reserve.length <= 0) return 0;
    return clamp(Number.isFinite(index) ? Math.trunc(index) : 0, 0, reserve.length - 1);
  };
  const syncPartyUiState = () => {
    gameState.ui.partyIndex = getSafePartyIndex(gameState.ui.partyIndex);
    gameState.ui.commandMode = gameState.ui.command === "party" ? "switch" : "fight";
    gameState.ui.selectingParty = gameState.ui.command === "party";
  };
  const setPartyUiCommand = (command = "fight") => {
    gameState.ui.command = command === "party" ? "party" : "fight";
    syncPartyUiState();
    if (gameState.ui.command !== "party") clearSwitchUiState();
  };
  const clearSwitchUiState = () => {
    gameState.ui.hoverSlot = null;
    gameState.ui.switchSelection = null;
    gameState.ui.pendingKoSlot = null;
  };

  const findNextLivingAllySlot = (from = -1) => {
    for (let i = from + 1; i < CONFIG.BOARD_COLS; i += 1) if (isAlive(gameState.teams.ally.active[i])) return i;
    return null;
  };

  const clearTargetPreview = () => {
    gameState.selectedMoveId = null;
    gameState.selectedTargets = [];
    gameState.ui.previewTargets = [];
    gameState.ui.targetCandidates = [];
    clearSwitchUiState();
    gameState.ui.selectedAction = null;
  };

  const isKoReplacementPhase = () => gameState.battleFlow.mode === "replacement";

  const getPendingKoReplacementSlots = (team) => {
    const availableReserves = getAvailableReserveIndices(gameState, team);
    if (!availableReserves.length) return [];
    return getDefeatedActiveSlots(gameState, team);
  };

  const startKoReplacementPhase = (team) => {
    gameState.battleFlow.mode = "replacement";
    gameState.battleFlow.koReplacement.activeTeam = team;
    gameState.battleFlow.koReplacement.pendingSlots = getPendingKoReplacementSlots(team);
    gameState.battleFlow.currentMessage = "Choose a reserve monster to replace a defeated ally.";
    clearSwitchUiState();
    setPartyUiCommand("fight");
    appendBattleLogEntry(`— ${team === TEAM.ALLY ? "Ally" : "Enemy"} KO Replacement —`);
  };

  const applyKoReplacement = ({ team, reserveIndex, slot, withLog = true }) => {
    const teamState = gameState.teams[team];
    const reserve = teamState.reserve[reserveIndex];
    const replacement = replaceActiveUnitFromReserve({
      state: gameState,
      team,
      slot,
      incomingUnitId: reserve?.uid,
      reserveIndexHint: reserveIndex,
      reserveMode: "consume",
      requireDefeatedOutgoing: true
    });
    if (!replacement) return false;
    const enter = resolveUnitOnEnterEffects({ state: gameState, team, slot, unit: replacement.incoming });
    if (withLog) {
      appendBattleLogEntry("交代処理");
      appendBattleLogEntry("交代完了");
      appendBattleLogEntry("交代後特性発動");
      enter.messages.forEach((line) => appendBattleLogEntry(line));
      appendBattleLogEntry("場のモンスターの特性発動");
    }
    return { enteredUnit: replacement.incoming, enterMessages: enter.messages };
  };

  const autoResolveKoReplacementsForTeam = (team) => {
    let pending = getPendingKoReplacementSlots(team);
    if (!pending.length) return;
    appendBattleLogEntry(`— ${team === TEAM.ALLY ? "Ally" : "Enemy"} KO Replacement —`);
    while (pending.length) {
      const reserveIndex = getAvailableReserveIndices(gameState, team)[0];
      if (reserveIndex === undefined) break;
      const slot = pending[0];
      const result = applyKoReplacement({ team, reserveIndex, slot, withLog: false });
      if (!result) break;
      appendBattleLogEntry(`[${result.enteredUnit.name}] entered the battle!`);
      result.enterMessages.forEach((line) => appendBattleLogEntry(line));
      pending = getPendingKoReplacementSlots(team);
    }
  };

  const finalizeTurnAndProceed = () => {
    gameState.battleFlow.mode = "command";
    gameState.battleFlow.currentMessage = "わざを選んでください。";
    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      gameState.teams[team].active.forEach(clearSwitchFlags);
      gameState.teams[team].reserve.forEach(clearSwitchFlags);
    });
    gameState.turn += 1;
    gameState.enemyPlannedActions = {};
    gameState.plannedActions = {};
    gameState.confirmedCommands = Array.from({ length: CONFIG.BOARD_COLS }, () => null);
    clearTurnSwitchRequests();
    clearTargetPreview();
    autoResolveKoReplacementsForTeam(TEAM.ENEMY);
    if (getPendingKoReplacementSlots(TEAM.ALLY).length) {
      startKoReplacementPhase(TEAM.ALLY);
      return;
    }
    const winner = getWinnerFromRemainingUnits(gameState);
    if (winner) {
      handleBattleFinished(winner);
      return;
    }
    gameState.playing.turnCount += 1;
    if (gameState.playing.turnCount >= 1) gameState.playing.hasCompletedFirstTurn = true;
    initializePlanningTurn();
    if (gameState.turn > CONFIG.MAX_TURNS && gameState.phase !== PHASE.GAMEOVER) {
      handleBattleFinished("draw");
    }
  };

  const initializePlanningTurn = () => {
    const first = findNextLivingAllySlot(-1);
    if (first === null) return;
    gameState.currentActorIndex = first;
    clearTargetPreview();
    setPartyUiCommand("fight");
  };

  const applyBattleStartTraitEffects = (state = gameState) => {
    if (!state?.teams) return;
    const events = [];
    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      const opponentTeam = team === TEAM.ALLY ? TEAM.ENEMY : TEAM.ALLY;
      const active = Array.isArray(state.teams?.[team]?.active) ? state.teams[team].active : [];
      active.forEach((unit, slot) => {
        if (!unit || !isAlive(unit)) return;
        const opponent = state?.teams?.[opponentTeam]?.active?.[slot] || null;
        const traitResult = applyTraitEffects("onBattleStart", { source: unit, opponent, state, team, slot });
        if (!traitResult.messages.length) return;
        events.push({ sourceId: unit.uid, targetId: opponent?.uid || null, traitKind: getSelectedTrait(unit)?.key || null, messages: traitResult.messages });
      });
    });
    events.forEach((event) => {
      if (event.sourceId) {
        setBattleHighlight({
          sources: [event.sourceId],
          targets: event.targetId ? [event.targetId] : [],
          effectType: "trait",
          traitKind: event.traitKind
        });
      }
      event.messages.forEach((line) => appendBattleLogEntry(line));
      clearBattleHighlight();
    });
  };

  const advancePlanningSlot = () => {
    const next = findNextLivingAllySlot(gameState.currentActorIndex);
    if (next === null) return false;
    gameState.currentActorIndex = next;
    clearTargetPreview();
    return true;
  };

  const scoreAction = ({ actor, move, target }) => {
    if (!target) return { score: -1, dmg: 0 };
    if (!isDamageMoveCategory(move.category)) return { score: 2, dmg: 0 };
    const dmg = calcDamage(actor, target, move, { isCritical: isCriticalHit(actor, move) });
    return { score: dmg >= target.hp ? 999 + dmg : dmg, dmg };
  };

  const chooseEnemyAction = (slot) => {
    const actor = gameState.teams.enemy.active[slot];
    if (!actor || !isAlive(actor)) return null;
    let best = null;
    actor.moveIds.forEach((moveId) => {
      const move = MOVES[moveId];
      if (!move) return;
      const cands = getValidTargetsForMoveInState(gameState, actor, move);
      if (move.targetMode === "single") {
        cands.forEach((c) => {
          const s = scoreAction({ actor, move, target: getUnitAtFromState(gameState, { x: c.x, y: c.y }) });
          if (!best || s.score > best.score) best = { moveId, targetPos: { x: c.x, y: c.y }, score: s.score };
        });
      } else {
        const score = cands.reduce((sum, c) => {
          const target = getUnitAtFromState(gameState, { x: c.x, y: c.y });
          if (!target || !isAlive(target)) return sum;
          return sum + calcDamage(actor, target, move, { isCritical: isCriticalHit(actor, move) });
        }, 0);
        if (!best || score > best.score) best = { moveId, targetPos: null, score };
      }
    });
    return best ? { type: "fight", team: TEAM.ENEMY, slot, moveId: best.moveId, targetPos: best.targetPos } : null;
  };

  const buildEnemyPlans = () => {
    const out = {};
    for (let i = 0; i < CONFIG.BOARD_COLS; i += 1) {
      const a = chooseEnemyAction(i);
      if (a) out[i] = a;
    }
    return out;
  };

  const allLivingAlliesPlanned = () => gameState.teams.ally.active.every((u, i) => !isAlive(u) || !!gameState.confirmedCommands[i]);

  const buildPlannedActionsFromConfirmedCommands = () => {
    const out = {};
    gameState.confirmedCommands.forEach((c, i) => {
      if (c?.action && c.action.type !== "switch") out[i] = { ...c.action };
    });
    const allyRequests = Array.isArray(gameState?.turnSwitchRequests?.ally) ? gameState.turnSwitchRequests.ally : [];
    allyRequests.forEach((request, slot) => {
      if (!request) return;
      if (!isValidSwitchTarget({ state: gameState, team: TEAM.ALLY, slot, targetIndex: request.targetIndex })) return;
      const reserve = gameState.teams.ally.reserve[request.targetIndex];
      if (!reserve?.uid) return;
      out[slot] = { type: "switch", team: TEAM.ALLY, slot, switchTargetId: reserve.uid };
    });
    return out;
  };

  const queueTurnResolution = () => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy() || !allLivingAlliesPlanned()) return;
    clearTargetPreview();
    gameState.battleFlow.mode = "resolve";
    gameState.enemyPlannedActions = buildEnemyPlans();
    gameState.plannedActions = buildPlannedActionsFromConfirmedCommands();
    const result = resolveTurn();
    const queue = buildBattleEventQueue(result);
    startBattlePlayback(queue, result);
  };

  const chooseMode = (mode) => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy() || isKoReplacementPhase()) return;
    setPartyUiCommand(mode);
    clearTargetPreview();
    gameState.ui.selectedAction = mode;
  };

  const setFightMove = (moveId) => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy() || isKoReplacementPhase()) return;
    const actor = getCurrentActor();
    if (!actor || !isAlive(actor)) return;
    const move = MOVES[moveId];
    if (!move) return;
    const cands = getValidTargetsForMoveInState(gameState, actor, move);
    if (!cands.length && getValidEnemyTargetsForSelection().length === 0) {
      handleBattleFinished(TEAM.ALLY);
      return;
    }
    gameState.selectedMoveId = moveId;
    gameState.ui.selectedAction = "fight";
    gameState.ui.previewTargets = (Array.isArray(cands) ? cands : []).map((c) => ({ x: c.x, y: c.y }));
    gameState.ui.targetCandidates = Array.isArray(cands) ? cands : [];
    if (move.targetMode === "single") {
      const preferred = gameState.ui.targetCandidates.find((c) => c.x === gameState.battle.selectedTargetKey)?.x;
      ensureSelectedEnemyTarget(preferred ?? gameState.ui.targetCandidates[0]?.x ?? null);
    } else {
      gameState.battle.selectedTargetKey = null;
    }
  };

  const getBattleSlotLabel = (pos) => {
    if (!pos || !Number.isInteger(pos.x) || !Number.isInteger(pos.y)) return "不明";
    const teamLabel = pos.y === 0 ? "敵" : "味方";
    return `${teamLabel}${pos.x + 1}`;
  };

  const createConfirmedFightCommand = ({ slot, actor, move, targets, targetPos = null }) => ({
    actorId: actor.uid,
    actorName: actor.name,
    moveId: move.id,
    moveName: move.name,
    targetType: getMoveTargetLabel(move),
    targetNames: targets.map((t) => t?.name || getBattleSlotLabel(targetPos)),
    action: { type: "fight", team: TEAM.ALLY, slot, moveId: move.id, targetPos: move.targetMode === "single" ? targetPos : null }
  });

  const confirmCurrentFightAction = ({ slot, move, targetPos }) => {
    const actor = gameState.teams.ally.active[slot];
    if (!actor) return;
    const targets = move.targetMode === "single"
      ? [getUnitAtFromState(gameState, targetPos)]
      : gameState.ui.targetCandidates.map((c) => getUnitAtFromState(gameState, { x: c.x, y: c.y })).filter(Boolean);
    if (move.targetMode !== "single" && !targets.length) return;

    gameState.confirmedCommands[slot] = createConfirmedFightCommand({ slot, actor, move, targets, targetPos });
    clearSwitchRequestForSlot(TEAM.ALLY, slot);
    if (!advancePlanningSlot()) queueTurnResolution();
  };

  const chooseFightTarget = (x, y) => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy()) return;
    if (isKoReplacementPhase()) {
      const pending = gameState.battleFlow.koReplacement.pendingSlots;
      if (gameState.battleFlow.koReplacement.activeTeam !== TEAM.ALLY) return;
      gameState.ui.pendingKoSlot = y === 1 ? x : null;
      const selectedReserveIndex = gameState.ui.switchSelection?.mode === "koReplacement" ? gameState.ui.switchSelection.reserveIndex : null;
      if (y !== 1 || !pending.includes(x) || selectedReserveIndex === null) return;
      const reserveIndex = selectedReserveIndex;
      const reserve = gameState.teams.ally.reserve[reserveIndex];
      if (!reserve || !isAlive(reserve)) return;
      const result = applyKoReplacement({ team: TEAM.ALLY, reserveIndex, slot: x, withLog: true });
      if (!result) return;
      clearSwitchUiState();
      gameState.battleFlow.koReplacement.pendingSlots = getPendingKoReplacementSlots(TEAM.ALLY);
      if (!gameState.battleFlow.koReplacement.pendingSlots.length) {
        const winner = getWinnerFromRemainingUnits(gameState);
        if (winner) {
          handleBattleFinished(winner);
          return;
        }
        gameState.battleFlow.mode = "command";
        gameState.battleFlow.currentMessage = "わざを選んでください。";
        clearSwitchUiState();
        initializePlanningTurn();
      }
      return;
    }
    const move = getSelectedMove();
    if (!move) return;
    if (!gameState.ui.targetCandidates.find((c) => c.x === x && c.y === y)) return;
    if (move.targetMode === "single") {
      ensureSelectedEnemyTarget(x);
    }
    confirmCurrentFightAction({ slot: gameState.currentActorIndex, move, targetPos: move.targetMode === "single" ? { x, y } : null });
  };

  const chooseReserve = (reserveIndex) => {
    if (isPlaybackBusy()) return;
    const safeReserveIndex = getSafePartyIndex(reserveIndex);
    if (isKoReplacementPhase()) {
      const reserve = gameState.teams.ally.reserve[safeReserveIndex];
      if (!reserve || !isAlive(reserve)) return;
      gameState.ui.partyIndex = safeReserveIndex;
      gameState.ui.switchSelection = { mode: "koReplacement", reserveIndex: safeReserveIndex };
      return;
    }
    const reserve = gameState.teams.ally.reserve[safeReserveIndex];
    if (!reserve) return;
    const alreadyPickedTargetIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.switchTargetId);
    const switchingActorIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.actorId);
    const activeAllyIds = gameState.teams.ally.active.map((unit) => unit?.uid).filter(Boolean);
    const candidates = getAvailableSwitchCandidates(gameState, TEAM.ALLY, [...alreadyPickedTargetIds, ...switchingActorIds, ...activeAllyIds]);
    if (!candidates.some((c) => c.index === safeReserveIndex && c.unit?.uid === reserve.uid)) return;
    gameState.ui.partyIndex = safeReserveIndex;
    gameState.ui.switchSelection = { mode: "commandSwitch", reserveIndex: safeReserveIndex };
  };

  const confirmCurrentSwitchAction = () => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy() || isKoReplacementPhase()) return;
    const actor = getCurrentActor();
    const selectedReserveIndex = gameState.ui.switchSelection?.mode === "commandSwitch"
      ? clamp(getSafePartyIndex(gameState.ui.switchSelection.reserveIndex), 0, Math.max(0, getPartyReserve().length - 1))
      : null;
    if (!actor || !isAlive(actor) || selectedReserveIndex === null) return;
    const state = getStatusState(actor);
    if (!state.canSwitch) return;
    const reserve = gameState.teams.ally.reserve[selectedReserveIndex];
    if (!reserve) return;
    const alreadyPickedTargetIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.switchTargetId);
    const switchingActorIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.actorId);
    const activeAllyIds = gameState.teams.ally.active.map((unit) => unit?.uid).filter(Boolean);
    const candidates = getAvailableSwitchCandidates(gameState, TEAM.ALLY, [...alreadyPickedTargetIds, ...switchingActorIds, ...activeAllyIds]);
    if (!candidates.some((c) => c.index === selectedReserveIndex && c.unit?.uid === reserve.uid)) return;
    if (!requestSwitch({ team: TEAM.ALLY, slot: gameState.currentActorIndex, targetIndex: selectedReserveIndex })) return;
    gameState.confirmedCommands[gameState.currentActorIndex] = {
      actorId: actor.uid,
      actorName: actor.name,
      moveId: "switch",
      moveName: `Switch予約 → ${reserve.name}`,
      targetType: "交代",
      targetNames: [reserve.name],
      action: { type: "switch", team: TEAM.ALLY, slot: gameState.currentActorIndex, switchTargetId: reserve.uid }
    };
    setPartyUiCommand("fight");
    if (!advancePlanningSlot()) queueTurnResolution();
  };

  const canCancelSelection = () => {
    if (gameState.ui.selectingParty) return true;
    return gameState.ui.command === "fight" && (!!gameState.selectedMoveId || gameState.selectedTargets.length > 0);
  };
  const canUndoPreviousCommand = () => !isKoReplacementPhase() && gameState.confirmedCommands.some(Boolean);

  const cancelCurrentSelection = () => {
    if (!canCancelSelection() || isPlaybackBusy()) return;
    if (gameState.ui.selectingParty) {
      setPartyUiCommand("fight");
      return;
    }
    gameState.selectedMoveId = null;
    gameState.selectedTargets = [];
    gameState.ui.previewTargets = [];
    gameState.ui.targetCandidates = [];
  };

  const undoLastConfirmedCommand = () => {
    if (!canUndoPreviousCommand() || isPlaybackBusy()) return;
    for (let i = CONFIG.BOARD_COLS - 1; i >= 0; i -= 1) {
      if (!gameState.confirmedCommands[i]) continue;
      gameState.confirmedCommands[i] = null;
      clearSwitchRequestForSlot(TEAM.ALLY, i);
      gameState.currentActorIndex = i;
      clearTargetPreview();
      setPartyUiCommand("fight");
      return;
    }
  };

  const resetBattle = () => {
    gameState = createInitialState({
      formations: gameState.formations,
      availableMonsters: gameState.availableMonsters,
      monsterTraitDrafts: gameState.monsterTraitDrafts,
      progress: gameState.progress
    });
    setPhase(PHASE.PLAYING);
    applyBattleStartTraitEffects(gameState);
    initializePlanningTurn();
  };


  const closeAuxiliaryPanels = () => {
    gameState.ui.isLogOpen = false;
    gameState.ui.isMenuOpen = false;
  };

  const toggleBattleLogModal = () => {
    const next = !gameState.ui.isLogOpen;
    gameState.ui.isLogOpen = next;
    if (next) gameState.ui.isMenuOpen = false;
  };

  const toggleMainMenuModal = () => {
    const next = !gameState.ui.isMenuOpen;
    gameState.ui.isMenuOpen = next;
    if (next) gameState.ui.isLogOpen = false;
  };

  const createBattlePartyFromFormation = (formationIndex) => {
    const safeIndex = getSafeFormationSlot(formationIndex);
    const formation = getFormationAt(gameState, safeIndex);
    const partyIds = getFormationUnitIds(formation);
    return partyIds
      .filter((unitId) => MONSTERS[unitId])
      .map((unitId, idx) => ({ unitId, slot: idx, maxHp: MONSTERS[unitId].hp, hp: MONSTERS[unitId].hp, statuses: [] }));
  };

  const selectBossTemplateMonsterId = (bossDef) => {
    const library = Object.keys(MONSTERS);
    if (!library.length) return null;
    const keyBase = bossDef?.id || "";
    const hash = keyBase.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return library[hash % library.length] || library[0];
  };

  const pickMoveIdsForBoss = (bossDef, fallbackMonster) => {
    const fallbackMoves = Array.isArray(fallbackMonster?.moves) ? fallbackMonster.moves.slice(0, 4) : ["clawStrike", "ironGuard", "rallyHowl", "shellStance"];
    const movePool = Object.keys(MOVES);
    const seed = (bossDef?.id || "").length;
    if (!movePool.length) return fallbackMoves;
    return Array.from({ length: 4 }, (_, idx) => movePool[(seed + idx) % movePool.length]);
  };

  const createBossMonsterFromHanafudaBoss = (bossDef) => {
    if (!bossDef || typeof bossDef !== "object") return null;
    const templateId = selectBossTemplateMonsterId(bossDef);
    const template = templateId ? MONSTERS[templateId] : null;
    const baseStats = {
      hp: Number(template?.hp) || 100,
      atk: Number(template?.atk) || 80,
      mag: Number(template?.mag) || 80,
      def: Number(template?.def) || 80,
      res: Number(template?.res) || 80,
      spd: Number(template?.spd) || 80
    };
    const id = `hanafuda_${bossDef.id}`;
    const bossTypes = Array.isArray(bossDef.data?.elementalTyping)
      ? bossDef.data.elementalTyping.filter((typeKey) => typeof typeKey === "string").slice(0, 2)
      : [];
    const maxHp = Math.max(1, Number(baseStats.hp) || 1);
    return {
      key: id,
      id,
      name: bossDef.name || template?.name || bossDef.id,
      imageKey: template?.imageKey || template?.portrait || "wyvern",
      types: bossTypes,
      stats: { ...baseStats },
      currentHp: maxHp,
      maxHp,
      traits: Array.isArray(template?.traits) ? template.traits.slice(0, 3) : ["battleRhythm", "openingSurge", "intimidate"],
      moves: pickMoveIdsForBoss(bossDef, template),
      weaknessTypes: Array.isArray(template?.weaknessTypes) ? template.weaknessTypes.slice(0, 2) : [],
      selectedTraitKey: Array.isArray(template?.traits) && template.traits[0] ? template.traits[0] : "battleRhythm",
      source: "hanafudaBoss",
      isBoss: true,
      defeated: false
    };
  };

  const ensureBossMonsterRegistered = (bossMonster) => {
    if (!bossMonster?.id) return null;
    MONSTERS[bossMonster.id] = {
      id: bossMonster.id,
      name: bossMonster.name,
      portrait: bossMonster.imageKey,
      imageKey: bossMonster.imageKey,
      hp: bossMonster.stats.hp,
      atk: bossMonster.stats.atk,
      mag: bossMonster.stats.mag,
      def: bossMonster.stats.def,
      res: bossMonster.stats.res,
      spd: bossMonster.stats.spd,
      traits: bossMonster.traits,
      selectedTraitKey: bossMonster.selectedTraitKey,
      moves: bossMonster.moves,
      weaknessTypes: bossMonster.weaknessTypes,
      isBoss: true,
      source: "hanafudaBoss"
    };
    return bossMonster.id;
  };

  const getEnemySlotsForCount = (count) => {
    if (count <= 1) return [1];
    if (count === 2) return [0, 2];
    return [0, 1, 2];
  };

  const resolveBattleFormationIndex = () => {
    const candidates = (gameState.formations || []).map((formation, index) => ({ formation, index }));
    const selected = candidates.find((entry) => hasAnyValidFormationMember(entry.formation));
    return selected ? selected.index : 0;
  };

  const startBattleFromFormation = (formationIndex) => {
    const safeIndex = getSafeFormationSlot(formationIndex);
    const formation = getFormationAt(gameState, safeIndex);
    if (!hasAnyValidFormationMember(formation)) return;
    const playerParty = createBattlePartyFromFormation(safeIndex);
    const nextState = createInitialState({
      formations: gameState.formations,
      availableMonsters: gameState.availableMonsters,
      battleFormationIndex: safeIndex,
      monsterTraitDrafts: gameState.monsterTraitDrafts,
      progress: gameState.progress
    });
    nextState.battle.player.party = playerParty;
    nextState.battle.player.activeIndex = 0;
    nextState.battle.enemy.party = INITIAL_PARTY.enemy
      .filter((unitId) => MONSTERS[unitId])
      .map((unitId, idx) => ({ unitId, slot: idx, maxHp: MONSTERS[unitId].hp, hp: MONSTERS[unitId].hp, statuses: [] }));
    nextState.battle.enemy.activeIndex = 0;
    nextState.battle.turn = 1;
    nextState.battle.selectedTargetKey = null;
    nextState.battle.log = [];
    const selectedFormationId = `formation_${safeIndex}`;
    writeSessionSave({
      startedAt: Date.now(),
      lastSafeScreen: "battlePrepare",
      selectedFormationId,
      status: "in_battle"
    });
    gameState = nextState;
    debugLogBattleTeams(gameState, "battle-start");
    setPhase(PHASE.PLAYING);
    applyBattleStartTraitEffects(gameState);
    initializePlanningTurn();
  };

  const startHanafudaTrial = (trialKey) => {
    if (typeof trialKey !== "string") return false;
    const bossDef = HANAFUDA_BOSSES?.[trialKey] || null;
    if (!bossDef) return false;
    if (!gameState.progress.unlockedTrials.includes(trialKey)) return false;
    const bossMonster = createBossMonsterFromHanafudaBoss(bossDef);
    const bossMonsterId = ensureBossMonsterRegistered(bossMonster);
    if (!bossMonsterId) return false;
    const safeIndex = resolveBattleFormationIndex();
    const formation = getFormationAt(gameState, safeIndex);
    if (!hasAnyValidFormationMember(formation)) return false;
    const playerParty = createBattlePartyFromFormation(safeIndex);
    const enemyParty = [{ unitId: bossMonsterId, slot: 0, maxHp: MONSTERS[bossMonsterId].hp, hp: MONSTERS[bossMonsterId].hp, statuses: [] }];
    const nextState = createInitialState({
      formations: gameState.formations,
      availableMonsters: gameState.availableMonsters,
      battleFormationIndex: safeIndex,
      monsterTraitDrafts: gameState.monsterTraitDrafts,
      progress: gameState.progress
    });
    nextState.battle.player.party = playerParty;
    nextState.battle.player.activeIndex = 0;
    nextState.battle.enemy.party = enemyParty;
    nextState.battle.enemy.activeIndex = 0;
    nextState.progress.selectedTrial = trialKey;
    nextState.battle.mode = "hanafudaTrial";
    nextState.battle.trialKey = trialKey;
    nextState.battle.turn = 1;
    nextState.battle.log = [];
    nextState.battle.selectedTargetKey = null;
    nextState.battle.enemyTeam = [bossMonster];
    const enemySlots = getEnemySlotsForCount(nextState.battle.enemyTeam.length);
    nextState.teams.enemy.active = Array.from({ length: CONFIG.BOARD_COLS }, () => null);
    nextState.battle.enemyTeam.forEach((enemy, index) => {
      const slot = enemySlots[index] ?? index;
      if (!enemy?.key) return;
      nextState.teams.enemy.active[slot] = createUnit(enemy.key, TEAM.ENEMY, slot);
    });
    nextState.teams.enemy.reserve = [];
    nextState.trialBattle = {
      bossId: trialKey,
      gimmick: {
        key: bossDef.data.bossGimmick?.key || null,
        hooks: bossDef.data.bossGimmick?.gameStateHooks || [],
        stateInit: bossDef.data.bossGimmick?.stateInit || {}
      }
    };
    writeSessionSave({
      startedAt: Date.now(),
      lastSafeScreen: "trialSelect",
      selectedFormationId: `formation_${safeIndex}`,
      status: "in_battle",
      battleMode: "hanafudaTrial",
      trialKey
    });
    gameState = nextState;
    debugLogBattleTeams(gameState, `trial-start:${trialKey}`);
    setPhase(PHASE.PLAYING);
    applyBattleStartTraitEffects(gameState);
    initializePlanningTurn();
    return true;
  };

  const dispatch = (action) => {
    switch (action.type) {
      case "RESET": resetBattle(); break;
      case "MODE": chooseMode(action.mode); break;
      case "MOVE": setFightMove(action.moveId); break;
      case "TARGET": chooseFightTarget(action.x, action.y); break;
      case "RESERVE": chooseReserve(action.reserveIndex); break;
      case "DEST": confirmCurrentSwitchAction(); break;
      case "CANCEL": cancelCurrentSelection(); break;
      case "UNDO": undoLastConfirmedCommand(); break;
      case "FAST_FORWARD": if (isPlaybackBusy()) gameState.ui.fastForwardRequested = true; break;
      case "TOGGLE_LOG": toggleBattleLogModal(); break;
      case "TOGGLE_MENU": toggleMainMenuModal(); break;
      case "CLOSE_PANELS": closeAuxiliaryPanels(); break;
      default: break;
    }
    render();
  };

  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const getSharedContentRect = (sectionKey) => {
    const base = CONFIG.UI_LAYOUT?.SHARED_CONTENT_COLUMN || {};
    const section = CONFIG.UI_LAYOUT?.SECTIONS?.[sectionKey] || {};
    const baseMaxWidth = Number(base.maxWidthPx) || 0;
    const baseOffsetX = Number(base.offsetXPx) || 0;
    const widthAdjust = Number(section.widthAdjustPx) || 0;
    const sectionOffsetX = Number(section.offsetXPx) || 0;
    return {
      maxWidthPx: Math.max(0, baseMaxWidth + widthAdjust),
      offsetXPx: baseOffsetX + sectionOffsetX
    };
  };

  const applySharedContentRect = (el, sectionKey) => {
    if (!el) return;
    const rect = getSharedContentRect(sectionKey);
    el.style.setProperty("--section-max-width-px", `${rect.maxWidthPx}px`);
    el.style.setProperty("--section-offset-x-px", `${rect.offsetXPx}px`);
  };

  const createImageWithFallback = ({ src, alt, mirror = false, wrapperClass = "portrait-wrap", placeholderLabel = "画像なし", placeholderSubLabel = "NO SIGNAL" }) => {
    const baseClass = "portrait-wrap";
    const normalizedWrapperClass = typeof wrapperClass === "string" && wrapperClass.trim() ? wrapperClass.trim() : baseClass;
    const mergedClass = normalizedWrapperClass === baseClass ? baseClass : `${baseClass} ${normalizedWrapperClass}`;
    const wrap = createEl("div", `${mergedClass}${mirror ? " mirror" : ""}`);
    const img = document.createElement("img");
    const placeholder = createEl("div", "img-placeholder");
    const normalizedSrc = typeof src === "string" ? src.trim() : "";
    const setLoadedState = () => {
      wrap.classList.add("is-loaded");
      wrap.classList.remove("is-fallback");
    };
    const setFallbackState = () => {
      wrap.classList.add("is-fallback");
      wrap.classList.remove("is-loaded");
    };
    img.alt = alt || "";
    img.loading = "eager";
    img.decoding = "async";
    img.draggable = false;
    img.onerror = () => setFallbackState();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) setLoadedState();
      else setFallbackState();
    };
    placeholder.append(createEl("div", "img-placeholder-label", placeholderLabel), createEl("div", "img-placeholder-sub", placeholderSubLabel));
    setFallbackState();
    if (normalizedSrc) {
      img.src = normalizedSrc;
      if (img.complete) {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) setLoadedState();
        else setFallbackState();
      }
    }
    wrap.append(img, placeholder);
    return wrap;
  };

  const applyBoardBackgroundWithFallback = (boardEl, src) => {
    if (!boardEl) return;
    const gradient = "linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.2))";
    const normalizedSrc = typeof src === "string" ? src.trim() : "";
    boardEl.style.backgroundImage = gradient;
    if (!normalizedSrc) return;
    const cachedStatus = backgroundLoadState.get(normalizedSrc);
    if (cachedStatus === "loaded") {
      boardEl.style.backgroundImage = `${gradient}, url('${normalizedSrc}')`;
      return;
    }
    if (cachedStatus === "loading" || cachedStatus === "error") return;
    backgroundLoadState.set(normalizedSrc, "loading");
    const bg = new Image();
    bg.onload = () => {
      backgroundLoadState.set(normalizedSrc, "loaded");
    };
    bg.onerror = () => { backgroundLoadState.set(normalizedSrc, "error"); };
    bg.src = normalizedSrc;
  };

  const clearTempArrays = () => { gameState.temp.renderCells.length = 0; };

  const getMoveCategoryIconPath = (category) => getAssetPath("icons", category);

  const renderMoveTypeIcon = (move) => {
    const category = move?.category || "status";
    const wrapper = createImageWithFallback({
      src: getMoveCategoryIconPath(category),
      alt: `${MOVE_CATEGORY_LABELS[category] || category} icon`,
      wrapperClass: "move-icon-asset",
      placeholderLabel: MOVE_CATEGORY_FALLBACK_ICON[category] || "MV",
      placeholderSubLabel: "TYPE"
    });
    return wrapper;
  };

  const formatEnemyHpPercent = (unit, hp) => `${Math.round((hp / unit.maxHp) * 100)}%`;
  const formatAllyHp = (unit, hp) => `${hp} / ${unit.maxHp}`;
  const getHpRatio = (unit, hp) => {
    const maxHp = Math.max(1, Number(unit?.maxHp) || 0);
    const safeHp = clamp(Number(hp) || 0, 0, maxHp);
    return safeHp / maxHp;
  };
  const getHpFillClass = (ratio) => {
    if (ratio > 0.5) return "hp-high";
    if (ratio > 0.2) return "hp-mid";
    return "hp-low";
  };

  const getDisplayHp = (unit) => gameState.displayState.hpDisplay[unit.uid] ?? unit.hp;
  const statusText = (s) => `${STATUS_LABELS[s.kind] || s.kind}（${s.duration}T）`;
  const isDefeatVanishRunning = (unit) => !!gameState.displayState.defeatVanish?.[unit?.uid];
  const isUnitPortraitHidden = (unit) => !!gameState.displayState.hiddenDefeatedPortraits?.[unit?.uid];

  const getNavigationMessageText = () => {
    if (gameState.phase === PHASE.GAMEOVER) return "バトル終了。";
    if (isPlaybackBusy()) return getCurrentPlaybackMessage() || "戦闘演出中…";
    if (isKoReplacementPhase()) return "Choose a reserve monster to replace a defeated ally.";
    if (gameState.ui.selectingParty) return gameState.ui.switchSelection?.mode === "commandSwitch" ? "選択中の交代先で確定してください。" : "交代する控えを選んでください。";
    if (!getSelectedMove()) return "わざを選んでください。";
    return getSelectedMove().targetMode === "single" ? "ハイライトされたマスから対象を選んでください。" : "このわざはハイライト対象全員に当たります。";
  };

  const renderBattleTopHeader = () => {
    const header = createEl("section", "battle-header shared-content-width");
    applySharedContentRect(header, "battleHeader");
    const menuBtn = createEl("button", "header-util-btn", "☰");
    menuBtn.dataset.action = "toggle-menu";
    menuBtn.setAttribute("aria-label", "メニュー");

    const turnLabel = gameState.phase === PHASE.GAMEOVER
      ? `ターン ${gameState.turn} / 勝者: ${gameState.winner || "なし"}`
      : `ターン ${gameState.turn} / フェーズ: ${gameState.phase}`;
    const center = createEl("div", "battle-header-center", turnLabel);

    const logBtn = createEl("button", "header-util-btn", "ログ");
    logBtn.dataset.action = "toggle-log";
    logBtn.setAttribute("aria-label", "ログ");

    header.append(menuBtn, center, logBtn);
    return header;
  };

  const renderBattleMessageBox = () => {
    const nav = createEl("button", "nav-message shared-content-width");
    applySharedContentRect(nav, "messageRow");
    nav.dataset.action = "fast-forward";
    nav.disabled = !isPlaybackBusy();
    nav.appendChild(createEl("div", "nav-message-text", getNavigationMessageText()));
    return nav;
  };

  const renderBattleLogPanel = (extraClass = "") => {
    const className = extraClass ? `log ${extraClass}` : "log";
    const log = createEl("div", className);
    if (!Array.isArray(gameState.log) || gameState.log.length === 0) {
      log.appendChild(createEl("div", "log-empty", "ログはまだありません。"));
      return log;
    }
    gameState.log.forEach((entry) => {
      if (!entry || typeof entry.text !== "string") return;
      if (entry.type === "turn") {
        log.appendChild(createEl("div", "log-turn", entry.text));
        return;
      }
      log.appendChild(createEl("div", "log-line", entry.text));
    });
    return log;
  };


  const renderLogModal = () => {
    if (!gameState.ui.isLogOpen) return null;
    const overlay = createEl("section", "overlay");
    overlay.dataset.action = "close-panels";
    const modal = createEl("div", "modal");
    modal.addEventListener("click", (event) => event.stopPropagation());
    const header = createEl("div", "modal-header");
    header.append(createEl("div", "", "バトルログ"), createEl("button", "action-btn", "閉じる"));
    header.lastChild.dataset.action = "toggle-log";
    const body = createEl("div", "modal-body");
    body.appendChild(renderBattleLogPanel("modal-log"));
    modal.append(header, body);
    overlay.appendChild(modal);
    return overlay;
  };

  const renderMenuModal = () => {
    if (!gameState.ui.isMenuOpen) return null;
    const overlay = createEl("section", "overlay");
    overlay.dataset.action = "close-panels";
    const modal = createEl("div", "modal");
    modal.addEventListener("click", (event) => event.stopPropagation());

    const header = createEl("div", "modal-header");
    header.append(createEl("div", "", "メニュー"), createEl("button", "action-btn", "戻る"));
    header.lastChild.dataset.action = "toggle-menu";

    const body = createEl("div", "modal-body");
    const list = createEl("div", "menu-list");
    const resetBtn = createEl("button", "action-btn", "リセット");
    resetBtn.dataset.action = "reset";
    const settingsBtn = createEl("button", "action-btn", "設定（準備中）");
    settingsBtn.disabled = true;
    const closeBtn = createEl("button", "action-btn", "バトルに戻る");
    closeBtn.dataset.action = "toggle-menu";
    list.append(resetBtn, settingsBtn, closeBtn);
    body.appendChild(list);

    modal.append(header, body);
    overlay.appendChild(modal);
    return overlay;
  };

  const getMonsterImageSrc = (unit) => {
    if (!unit || typeof unit !== "object") return "";
    const imageKey = typeof unit.imageKey === "string" && unit.imageKey.trim()
      ? unit.imageKey.trim()
      : (typeof unit.portrait === "string" ? unit.portrait.trim() : "");
    if (!imageKey) return "";
    return getAssetPath("portraits", imageKey);
  };

  const getUnitPortraitPath = (unit) => {
    return getMonsterImageSrc(unit);
  };

  const renderBattleSprite = (unit) => {
    const shouldMirror = unit.team === TEAM.ENEMY;
    const sprite = createImageWithFallback({
      src: getUnitPortraitPath(unit),
      alt: unit.name,
      mirror: shouldMirror,
      wrapperClass: "unit-portrait",
      placeholderLabel: unit.name,
      placeholderSubLabel: "NO SPRITE"
    });
    return sprite;
  };


  const applyUnitHighlightState = (cell, x, y) => {
    const unit = getUnitAtFromState(gameState, { x, y });
    const showPreview = gameState.phase === PHASE.PLAYING && !isPlaybackBusy();
    const candidate = showPreview && gameState.ui.previewTargets.some((c) => c.x === x && c.y === y);
    const replacementCandidate = isKoReplacementPhase()
      && gameState.battleFlow.koReplacement.activeTeam === TEAM.ALLY
      && y === 1
      && gameState.battleFlow.koReplacement.pendingSlots.includes(x);
    const selectedKoReplacement = gameState.ui.switchSelection?.mode === "koReplacement" ? gameState.ui.switchSelection : null;
    if (candidate) cell.classList.add(y === 0 ? "valid-enemy" : "valid-ally");
    if (replacementCandidate) cell.classList.add("valid-ally", "replacement-target");

    const highlight = gameState.battleHighlight;
    if (isPlaybackBusy() && highlight.active === true && unit?.uid) {
      const sourceSet = new Set(highlight.sources || []);
      const targetSet = new Set(highlight.targets || []);
      const isSource = sourceSet.has(unit.uid);
      const isTarget = targetSet.has(unit.uid);
      if (isSource) cell.classList.add(highlight.effectType === "trait" ? "source-trait" : "active-actor");
      if (isTarget) {
        if (highlight.effectType === "status" && highlight.statusKind === "poison") cell.classList.add("targeted-status-poison");
        else if (highlight.effectType === "status") cell.classList.add("targeted-status-default");
        else if (highlight.effectType === "statusRemove") cell.classList.add("targeted-status-remove");
        else if (highlight.effectType === "trait") cell.classList.add("targeted-trait");
        else if (highlight.effectType === "aoe") cell.classList.add("targeted-aoe");
        else cell.classList.add("targeted-single");
      }
    } else if (replacementCandidate && selectedKoReplacement && gameState.ui.pendingKoSlot === x) {
      cell.classList.add("targeted");
    } else if (!isPlaybackBusy() && gameState.phase === PHASE.PLAYING && y === 1 && x === gameState.currentActorIndex) {
      cell.classList.add("active-actor");
    }
  };

  const createBattleCellButton = (className, x, y) => {
    const btn = createEl("button", className);
    btn.dataset.action = "target-cell";
    btn.dataset.x = String(x);
    btn.dataset.y = String(y);
    btn.disabled = !!(isPlaybackBusy() || gameState.phase !== PHASE.PLAYING);
    applyUnitHighlightState(btn, x, y);
    return btn;
  };

  const renderStatusIcons = (unit) => {
    const wrap = createEl("div", "status-icons");
    const statuses = Array.isArray(unit?.statuses) ? unit.statuses : [];
    statuses.forEach((status) => {
      const kind = status?.kind;
      const label = STATUS_LABELS[kind] || kind || "状態";
      const icon = createEl("span", "status-icon", label);
      icon.title = statusText(status);
      wrap.appendChild(icon);
    });
    if ((Number(unit?.buffs?.critStageDuration) || 0) > 0) {
      const critIcon = createEl("span", "status-icon", STATUS_LABELS.critFocus);
      critIcon.title = `精神集中（${unit.buffs.critStageDuration}T）`;
      wrap.appendChild(critIcon);
    }
    if (wrap.childElementCount === 0) wrap.appendChild(createEl("span", "status-empty", "-"));
    return wrap;
  };

  const getPartyStatusLabel = (unit) => {
    if (!unit || !Array.isArray(unit.statuses) || unit.statuses.length === 0) return "-";
    const firstStatus = unit.statuses.find((status) => !!status?.kind);
    if (!firstStatus) return "-";
    return STATUS_LABELS[firstStatus.kind] || firstStatus.kind || "-";
  };

  const createPartySlotButton = ({ unit, index, isActive, isDisabled }) => {
    const btn = createEl("button", `party-slot${isActive ? " active" : ""}`);
    btn.dataset.action = "pick-reserve";
    btn.dataset.reserveIndex = String(index);
    btn.disabled = !!isDisabled;
    btn.style.setProperty("--party-card-width", `${CONFIG.UI.CARD_WIDTH}px`);
    btn.style.setProperty("--party-card-height", `${CONFIG.UI.CARD_HEIGHT}px`);

    const thumb = createImageWithFallback({
      src: getUnitPortraitPath(unit),
      alt: unit?.name || "empty",
      wrapperClass: "party-slot-thumb",
      placeholderLabel: unit?.name || "空き",
      placeholderSubLabel: "NO IMG"
    });
    const body = createEl("div", "party-slot-body");
    const name = createEl("div", "party-slot-name", unit?.name || "空き");
    const hpText = `${Math.max(0, Number(unit?.hp) || 0)} / ${Math.max(0, Number(unit?.maxHp) || 0)}`;
    const hp = createEl("div", "party-slot-hp", `HP ${hpText}`);
    const status = createEl("div", "party-slot-status", `状態 ${getPartyStatusLabel(unit)}`);
    body.append(name, hp, status);
    btn.append(thumb, body);
    return btn;
  };

  const renderStatusPanel = (x, y) => {
    const panel = createBattleCellButton("status-panel", x, y);
    const unit = getUnitAtFromState(gameState, { x, y });
    if (!unit) {
      panel.classList.add("empty");
      panel.appendChild(createEl("div", "unit-empty", "待機"));
      return panel;
    }
    if (isDefeated(unit)) {
      panel.classList.add("empty", "defeated-slot");
      panel.appendChild(createEl("div", "unit-empty", "EMPTY ✕"));
      return panel;
    }
    if (unit.isBoss === true) panel.classList.add("boss-panel");

    const hp = getDisplayHp(unit);
    const hpRatio = getHpRatio(unit, hp);
    const hpPct = Math.round(hpRatio * 100);

    const top = createEl("div", "status-top");
    const nameWrap = createEl("div", "unit-name-wrap");
    if (unit.isBoss === true) nameWrap.appendChild(createEl("span", "boss-badge", "BOSS"));
    nameWrap.appendChild(createEl("div", "unit-name", unit.name));
    top.appendChild(nameWrap);
    top.appendChild(renderStatusIcons(unit));

    const hpBlock = createEl("div", "status-hp");
    const bar = createEl("div", "hp-bar");
    const fill = createEl("div", `hp-bar-fill ${getHpFillClass(hpRatio)}`);
    fill.style.width = `${hpPct}%`;
    bar.appendChild(fill);
    hpBlock.append(bar, createEl("div", "unit-hp", unit.team === TEAM.ENEMY ? formatEnemyHpPercent(unit, hp) : formatAllyHp(unit, hp)));

    panel.append(top, hpBlock);
    return panel;
  };

  const renderSpriteSlot = (x, y) => {
    const slot = createBattleCellButton("sprite-slot", x, y);
    const unit = getUnitAtFromState(gameState, { x, y });
    if (!unit) {
      slot.classList.add("empty");
      slot.appendChild(createEl("div", "unit-empty", "待機"));
      return slot;
    }
    if (isDefeated(unit)) {
      slot.classList.add("empty", "defeated-slot");
      const isVanishing = isDefeatVanishRunning(unit);
      if (isVanishing) {
        slot.classList.add("vanishing");
        slot.appendChild(createEl("div", "unit-empty", "FAINT..."));
      } else {
        slot.appendChild(createEl("div", "unit-empty", "EMPTY ✕"));
      }
      if (isUnitPortraitHidden(unit)) return slot;
    }
    slot.classList.add(unit.team === TEAM.ENEMY ? "team-enemy" : "team-ally");
    if (unit.isBoss === true) slot.classList.add("boss-panel");
    const spriteArea = createEl("div", "sprite-portrait-box");
    if (unit.isBoss === true) spriteArea.classList.add("boss-portrait-box");
    if (unit.isBoss === true) spriteArea.appendChild(createEl("div", "boss-title", unit.name));
    spriteArea.appendChild(renderBattleSprite(unit));
    slot.appendChild(spriteArea);
    return slot;
  };

  const renderBattleRow = (rowClass, renderer, y) => {
    const row = createEl("div", `battle-row ${rowClass}`);
    for (let x = 0; x < CONFIG.BOARD_COLS; x += 1) {
      row.appendChild(renderer(x, y));
    }
    return row;
  };

  const renderBattlefield = () => {
    const board = createEl("section", "battlefield shared-content-width");
    applySharedContentRect(board, "battlefield");
    applyBoardBackgroundWithFallback(board, gameState.battlefield.background);
    ensureSelectedEnemyTarget();

    board.append(
      renderBattleRow("enemy-status-row", renderStatusPanel, 0),
      renderBattleRow("enemy-sprite-row", renderSpriteSlot, 0),
      renderBattleRow("ally-sprite-row", renderSpriteSlot, 1),
      renderBattleRow("ally-status-row", renderStatusPanel, 1)
    );
    return board;
  };

  const renderCommandArea = () => {
    const wrap = createEl("div", "command shared-content-width");
    applySharedContentRect(wrap, "commandArea");
    if (isPlaybackBusy()) wrap.classList.add("disabled");
    const actor = getCurrentActor();
    if (isKoReplacementPhase()) {
      wrap.appendChild(createEl("h3", "", "KO交代フェーズ"));
      wrap.appendChild(createEl("div", "mini", "Choose a reserve monster to replace a defeated ally."));
      const switches = createEl("div", "switches");
      gameState.teams.ally.reserve.forEach((u, idx) => {
        const isActive = gameState.ui.switchSelection?.mode === "koReplacement" && gameState.ui.switchSelection.reserveIndex === idx;
        const btn = createEl("button", `reserve-card${isActive ? " active" : ""}`);
        btn.dataset.action = "pick-reserve";
        btn.dataset.reserveIndex = String(idx);
        btn.disabled = !u || !isAlive(u);
        btn.appendChild(createEl("div", "name", u ? u.name : "空き"));
        switches.appendChild(btn);
      });
      wrap.appendChild(switches);
      wrap.appendChild(createEl("div", "mini", "倒れた味方スロットを選択して配置してください。"));
      return wrap;
    }

    wrap.appendChild(createEl("h3", "", `コマンド：${actor ? actor.name : "-"}`));

    const actions = createEl("div", "actions");
    const fight = createEl("button", `action-btn${gameState.ui.command === "fight" ? " active" : ""}`, "たたかう");
    fight.dataset.action = "mode-fight";
    fight.disabled = isPlaybackBusy();
    const sw = createEl("button", `action-btn${gameState.ui.command === "party" ? " active" : ""}`, "なかま");
    sw.dataset.action = "mode-party";
    const actorStatusState = actor ? getStatusState(actor) : { canSwitch: false, statuses: [] };
    sw.disabled = isPlaybackBusy() || !actorStatusState.canSwitch;
    const cancel = createEl("button", "action-btn", "キャンセル");
    cancel.dataset.action = "cancel-selection";
    cancel.disabled = !canCancelSelection() || isPlaybackBusy();
    const undo = createEl("button", "action-btn", "前の選択に戻る");
    undo.dataset.action = "undo-command";
    undo.disabled = !canUndoPreviousCommand() || isPlaybackBusy();
    actions.append(fight, sw, cancel, undo);
    wrap.appendChild(actions);
    if (actor && !actorStatusState.canSwitch) {
      wrap.appendChild(createEl("div", "mini", "Cannot switch (Bound)"));
    }

    if (gameState.ui.command === "fight" && actor) {
      const moves = createEl("div", "moves");
      const moveIds = Array.isArray(actor.moveIds) ? actor.moveIds : [];
      moveIds.forEach((moveId) => {
        const move = MOVES[moveId];
        if (!move) return;
        const btn = createEl("button", `move ${move.category} type-${move.type}${gameState.selectedMoveId === moveId ? " active" : ""}`);
        btn.dataset.action = "pick-move";
        btn.dataset.moveId = moveId;
        btn.disabled = isPlaybackBusy();
        const iconBadge = createEl("div", `move-icon-badge move-icon-${move.category}`, MOVE_CATEGORY_FALLBACK_ICON[move.category] || "MV");
        iconBadge.title = `分類: ${MOVE_CATEGORY_LABELS[move.category] || move.category}`;
        iconBadge.appendChild(renderMoveTypeIcon(move));
        const details = createEl("div", "move-detail");
        details.appendChild(createEl("div", "move-name", move.name));
        const role = MOVE_ROLE_LABELS[getMoveRole(move)] || "-";
        const targetLabel = getMoveTargetLabel(move);
        details.appendChild(createEl("div", "move-meta", `${role} / ${targetLabel} / ${getMoveEffectText(move)}`));
        details.appendChild(createEl("div", "mini", move.description || "-"));
        btn.append(iconBadge, details);
        moves.appendChild(btn);
      });
      wrap.appendChild(moves);
    }

    if (gameState.ui.selectingParty) {
      const switches = createEl("div", "party-row");
      switches.style.setProperty("--party-start-x", `${CONFIG.UI.PARTY_START_X}px`);
      switches.style.setProperty("--party-start-y", `${CONFIG.UI.PARTY_START_Y}px`);
      switches.style.setProperty("--party-spacing-x", `${CONFIG.UI.PARTY_SPACING_X}px`);
      const alreadyPickedTargetIds = gameState.confirmedCommands
        .map((c) => c?.action)
        .filter((a) => a?.type === "switch")
        .map((a) => a.switchTargetId);
      const switchingActorIds = gameState.confirmedCommands
        .map((c) => c?.action)
        .filter((a) => a?.type === "switch")
        .map((a) => a.actorId);
      const activeAllyIds = gameState.teams.ally.active.map((unit) => unit?.uid).filter(Boolean);
      const allowedCandidates = getAvailableSwitchCandidates(gameState, TEAM.ALLY, [...alreadyPickedTargetIds, ...switchingActorIds, ...activeAllyIds]);
      const allowedIndexSet = new Set(allowedCandidates.map((entry) => entry.index));
      const safePartyIndex = getSafePartyIndex(gameState.ui.partyIndex);
      gameState.teams.ally.reserve.forEach((u, idx) => {
        const blocked = !u || !allowedIndexSet.has(idx);
        const isActive = idx === safePartyIndex;
        const btn = createPartySlotButton({ unit: u, index: idx, isActive, isDisabled: blocked || isPlaybackBusy() });
        switches.appendChild(btn);
      });
      wrap.appendChild(switches);

      const dests = createEl("div", "destinations");
      const btn = createEl("button", "dest-btn", "こうたい");
      btn.dataset.action = "pick-destination";
      btn.dataset.toSlot = String(gameState.currentActorIndex);
      const selectedReserve = getPartyReserve()[getSafePartyIndex(gameState.ui.partyIndex)];
      btn.disabled = isPlaybackBusy() || !gameState.ui.selectingParty || !selectedReserve || !actorStatusState.canSwitch;
      dests.appendChild(btn);
      wrap.appendChild(dests);
    }

    return wrap;
  };

  const isPointInRect = (x, y, rect) => {
    if (!rect) return false;
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  };

  const getFormationSlotRects = () => {
    const rects = [];
    for (let i = 0; i < FORMATION_MEMBER_COUNT; i += 1) {
      const row = Math.floor(i / CONFIG.PARTY_ACTIVE_COUNT);
      const col = i % CONFIG.PARTY_ACTIVE_COUNT;
      rects.push({
        index: i,
        x: CONFIG.UI.FORMATION_TOP_X + (col * (CONFIG.UI.SLOT_WIDTH + CONFIG.UI.SLOT_GAP_X)),
        y: CONFIG.UI.FORMATION_TOP_Y + (row * (CONFIG.UI.SLOT_HEIGHT + CONFIG.UI.SLOT_GAP_Y)),
        width: CONFIG.UI.SLOT_WIDTH,
        height: CONFIG.UI.SLOT_HEIGHT
      });
    }
    return rects;
  };

  const getMonsterGridItemRects = (scrollOffset = 0, count = 0) => {
    const itemCount = Math.max(0, count);
    const maxVisibleRows = Math.max(1, Math.floor((CONFIG.UI.MONSTER_GRID_HEIGHT + CONFIG.UI.MONSTER_GRID_GAP_Y)
      / (CONFIG.UI.MONSTER_CARD_HEIGHT + CONFIG.UI.MONSTER_GRID_GAP_Y)));
    const maxScroll = Math.max(0, Math.ceil(itemCount / CONFIG.UI.MONSTER_GRID_COLS) - maxVisibleRows);
    const safeScroll = clamp(Number.isFinite(scrollOffset) ? Math.trunc(scrollOffset) : 0, 0, maxScroll);
    const rects = [];
    for (let i = 0; i < itemCount; i += 1) {
      const row = Math.floor(i / CONFIG.UI.MONSTER_GRID_COLS);
      const col = i % CONFIG.UI.MONSTER_GRID_COLS;
      const viewRow = row - safeScroll;
      if (viewRow < 0) continue;
      const y = CONFIG.UI.MONSTER_GRID_Y + (viewRow * (CONFIG.UI.MONSTER_CARD_HEIGHT + CONFIG.UI.MONSTER_GRID_GAP_Y));
      if (y + CONFIG.UI.MONSTER_CARD_HEIGHT > CONFIG.UI.MONSTER_GRID_Y + CONFIG.UI.MONSTER_GRID_HEIGHT) continue;
      rects.push({
        index: i,
        x: CONFIG.UI.MONSTER_GRID_X + (col * (CONFIG.UI.MONSTER_CARD_WIDTH + CONFIG.UI.MONSTER_GRID_GAP_X)),
        y,
        width: CONFIG.UI.MONSTER_CARD_WIDTH,
        height: CONFIG.UI.MONSTER_CARD_HEIGHT
      });
    }
    return rects;
  };

  const getMonsterGridMaxScroll = (count = 0) => {
    const itemCount = Math.max(0, count);
    const visibleRows = Math.max(1, Math.floor((CONFIG.UI.MONSTER_GRID_HEIGHT + CONFIG.UI.MONSTER_GRID_GAP_Y)
      / (CONFIG.UI.MONSTER_CARD_HEIGHT + CONFIG.UI.MONSTER_GRID_GAP_Y)));
    return Math.max(0, Math.ceil(itemCount / CONFIG.UI.MONSTER_GRID_COLS) - visibleRows);
  };

  const renderTrialSelectScreen = () => {
    const wrap = createEl("section", "formation-screen hanafuda-trial-select-screen");
    wrap.appendChild(createEl("h2", "formation-title", "十二札試練"));
    wrap.appendChild(createEl("p", "formation-help", "解放済みの試練を選択して挑戦してください。"));
    const list = createEl("div", "hanafuda-trial-grid");
    HANAFUDA_BOSS_ORDER.forEach((trialId, index) => {
      const boss = HANAFUDA_BOSSES[trialId];
      const unlocked = gameState.progress.unlockedTrials.includes(trialId);
      const cleared = gameState.progress.clearedTrials.includes(trialId);
      const lessonFocus = HANAFUDA_PROGRESS_LESSONS[index] || boss?.data?.intendedLesson || "-";
      const card = createEl("button", `hanafuda-trial-card${index === gameState.ui.trialSelectIndex ? " active" : ""}${!unlocked ? " locked" : ""}${cleared ? " cleared" : ""}`);
      card.disabled = !unlocked;
      card.dataset.action = "select-trial";
      card.dataset.trialId = trialId;
      card.dataset.index = String(index);
      const statusText = cleared ? "CLEARED" : (unlocked ? "UNLOCKED" : "LOCKED");
      card.append(
        createEl("div", "trial-card-index", `第${index + 1}試練`),
        createEl("div", "trial-card-title", boss?.name || trialId),
        createEl("div", "trial-card-lesson", `Focus: ${lessonFocus}`),
        createEl("div", "trial-card-status", statusText)
      );
      list.appendChild(card);
    });
    const buttons = createEl("div", "screen-button-row");
    const back = createEl("button", "screen-nav-btn", "もどる");
    back.dataset.action = "go-home";
    buttons.appendChild(back);
    wrap.append(list, buttons);
    return wrap;
  };

  const renderTrialIntroScreen = () => {
    const bossDef = getSelectedTrialBoss();
    const wrap = createEl("section", "formation-screen");
    if (!bossDef) {
      wrap.appendChild(createEl("p", "formation-help", "試練データが見つかりません。"));
      return wrap;
    }
    const trialNo = HANAFUDA_BOSS_ORDER.indexOf(bossDef.id) + 1;
    const introTitle = `Trial ${trialNo}: ${bossDef.coreConcept || bossDef.name}`;
    const lesson = bossDef.data.intendedLesson || HANAFUDA_PROGRESS_LESSONS[Math.max(0, trialNo - 1)] || "-";
    const hint = bossDef.bossGimmickSummary || bossDef.data.bossGimmick?.key || "-";
    wrap.appendChild(createEl("h2", "formation-title", bossDef.name));
    wrap.appendChild(createEl("div", "formation-help", `試練題目: ${introTitle}`));
    wrap.appendChild(createEl("p", "home-info-description", `Lesson: ${lesson}`));
    wrap.appendChild(createEl("p", "home-info-description", `Hint: ${hint}`));
    const buttons = createEl("div", "screen-button-row");
    const back = createEl("button", "screen-nav-btn", "もどる");
    back.dataset.action = "open-trial-select";
    const start = createEl("button", "screen-nav-btn primary", "試練開始");
    start.dataset.action = "start-selected-trial";
    buttons.append(back, start);
    wrap.appendChild(buttons);
    return wrap;
  };

  const renderRewardScreen = () => {
    const reward = gameState.progress.pendingReward;
    const wrap = createEl("section", "formation-screen");
    wrap.appendChild(createEl("h2", "formation-title", `Reward - ${reward?.bossName || ""}`));
    const choices = Array.isArray(reward?.choices) ? reward.choices : [];
    const list = createEl("div", "monster-list-grid");
    choices.forEach((choice, index) => {
      const card = createEl("button", `monster-list-item${index === gameState.ui.rewardChoiceIndex ? " active" : ""}`);
      card.dataset.action = "pick-reward";
      card.dataset.index = String(index);
      card.append(
        createEl("div", "monster-list-name", choice.title),
        createEl("div", "monster-list-sub", choice.description)
      );
      list.appendChild(card);
    });
    const row = createEl("div", "screen-button-row");
    const confirm = createEl("button", "screen-nav-btn primary", "受け取ってHubへ");
    confirm.dataset.action = "confirm-reward";
    row.appendChild(confirm);
    wrap.append(list, row);
    return wrap;
  };

  const renderBattleResultScreen = () => {
    const wrap = createEl("section", "formation-screen");
    wrap.appendChild(createEl("h2", "formation-title", gameState.winner === TEAM.ALLY ? "Victory" : "Trial Failed"));
    wrap.appendChild(createEl("p", "home-info-description", gameState.systemMessage || "敗北しても試練進行は失われません。"));
    const back = createEl("button", "screen-nav-btn primary", "Hubへ戻る");
    back.dataset.action = "go-home";
    wrap.appendChild(back);
    return wrap;
  };

  const renderStartPhaseScreen = () => {
    if (gameState.ui.startView === START_VIEW.TRIAL_INTRO) return renderTrialIntroScreen();
    return renderTrialSelectScreen();
  };

  const renderHomeScreen = () => {
    const wrap = createEl("section", "home-screen");
    const hubItems = getHubMenuItems(gameState);
    const left = createEl("div", "home-left-panel");
    left.style.left = `${CONFIG.UI.HOME_LEFT_X}px`;
    left.style.top = `${CONFIG.UI.HOME_LEFT_Y}px`;
    left.style.width = `${CONFIG.UI.HOME_LEFT_WIDTH}px`;
    left.style.height = `${CONFIG.UI.HOME_LEFT_HEIGHT}px`;
    left.appendChild(createEl("h2", "home-left-title", "Trainer Hub"));
    const mascotId = Array.isArray(gameState?.formations?.[0]) ? gameState.formations[0].find((unitId) => MONSTERS[unitId]) : null;
    const mascot = MONSTERS[mascotId] || MONSTERS[INITIAL_PARTY.ally[0]];
    const portrait = createImageWithFallback({
      src: getMonsterImageSrc(mascot),
      alt: mascot?.name || "Mascot",
      wrapperClass: "home-mascot-portrait",
      placeholderLabel: mascot?.name || "Mascot",
      placeholderSubLabel: "NO IMAGE"
    });
    const mascotWrap = createEl("div", "home-mascot-wrap");
    mascotWrap.appendChild(portrait);
    left.append(mascotWrap, createEl("div", "home-mascot-name", mascot?.name || "No Monster"));

    const menu = createEl("div", "home-menu-grid");
    const cardRects = getHomeMenuCardRects(gameState);
    const hoverIndex = getSelectableIndex(gameState.ui.homeHoverIndex, hubItems.length - 1);
    cardRects.forEach((rect) => {
      const menuItem = hubItems[rect.index];
      const isSelected = rect.index === gameState.ui.homeIndex;
      const isHovered = rect.index === hoverIndex;
      const card = createEl("button", `home-menu-card${isSelected ? " active" : ""}${isHovered ? " hover" : ""}`);
      card.style.left = `${rect.x}px`;
      card.style.top = `${rect.y}px`;
      card.style.width = `${rect.width}px`;
      card.style.height = `${rect.height}px`;
      card.dataset.action = "home-card-confirm";
      card.dataset.index = String(rect.index);
      card.append(
        createEl("div", "home-menu-icon", menuItem?.icon || "■"),
        createEl("div", "home-menu-label", menuItem?.label || "")
      );
      menu.appendChild(card);
    });

    const panel = createEl("div", "home-bottom-info-panel");
    panel.style.left = `${CONFIG.UI.HOME_INFO_X}px`;
    panel.style.top = `${CONFIG.UI.HOME_INFO_Y}px`;
    panel.style.width = `${CONFIG.UI.HOME_INFO_WIDTH}px`;
    panel.style.height = `${CONFIG.UI.HOME_INFO_HEIGHT}px`;
    const infoIndex = getHomeInfoIndex(gameState);
    const info = getHomeInfo(infoIndex, gameState) || { title: "HOME", description: "メニューを選択してください。" };
    panel.appendChild(createEl("h2", "home-info-title", info?.title || ""));
    panel.appendChild(createEl("p", "home-info-description", info?.description || ""));
    const lines = Array.isArray(info?.extra?.lines) ? info.extra.lines : [];
    if (info?.extra?.label) panel.appendChild(createEl("div", "home-info-sub", info.extra.label));
    lines.forEach((line) => panel.appendChild(createEl("div", "home-info-line", String(line))));
    wrap.append(left, menu, panel);
    return wrap;
  };

  const renderFormationScreen = () => {
    const wrap = createEl("section", "formation-screen");
    wrap.style.setProperty("--formation-list-x", `${CONFIG.UI.FORMATION_LIST_X}px`);
    wrap.style.setProperty("--formation-list-y", `${CONFIG.UI.FORMATION_LIST_Y}px`);
    wrap.style.setProperty("--formation-list-width", `${CONFIG.UI.FORMATION_LIST_WIDTH}px`);
    wrap.style.setProperty("--formation-list-item-height", `${CONFIG.UI.BATTLE_PREPARE_LIST_ITEM_HEIGHT}px`);
    wrap.style.setProperty("--formation-list-spacing-y", `${CONFIG.UI.FORMATION_LIST_SPACING_Y}px`);
    wrap.style.setProperty("--formation-slot-label-height", `${CONFIG.UI.BATTLE_PREPARE_SLOT_LABEL_HEIGHT}px`);
    wrap.style.setProperty("--formation-preview-height", `${CONFIG.UI.BATTLE_PREPARE_PREVIEW_HEIGHT}px`);
    wrap.style.setProperty("--formation-preview-cols", `${CONFIG.UI.BATTLE_PREPARE_GRID_COLUMNS}`);
    wrap.style.setProperty("--formation-preview-rows", `${CONFIG.UI.BATTLE_PREPARE_GRID_ROWS}`);
    wrap.style.setProperty("--formation-summary-height", "0px");
    wrap.appendChild(createEl("h2", "formation-title", "Formation"));
    const list = createEl("div", "formation-slot-list");
    for (let i = 0; i < FORMATION_SLOT_COUNT; i += 1) {
      const formation = getFormationAt(gameState, i);
      const isSelected = i === gameState.ui.formationIndex;
      list.appendChild(renderFormationSlotCard({
        formation,
        index: i,
        isSelected,
        action: "formation-select",
        showSummary: false
      }));
    }
    wrap.appendChild(list);
    const buttons = createEl("div", "screen-button-row");
    const home = createEl("button", "screen-nav-btn", "Back HOME");
    home.dataset.action = "go-home";
    buttons.appendChild(home);
    wrap.append(buttons, createEl("div", "formation-help", "Click slot to edit / Esc:HOME"));
    return wrap;
  };

  const renderMonsterListScreen = () => {
    const wrap = createEl("section", "monster-list-screen");
    wrap.appendChild(createEl("h2", "formation-title", "Monster List"));
    const list = createEl("div", "monster-list-grid");
    const ids = getMonsterLibraryIds(gameState);
    ids.forEach((monsterId, index) => {
      const monster = MONSTERS[monsterId];
      const isSelected = monsterId === gameState.selectedMonsterId || index === gameState.ui.monsterListIndex;
      const card = createEl("button", `monster-list-item${isSelected ? " active" : ""}`);
      card.dataset.action = "monster-open-detail";
      card.dataset.monsterId = monsterId;
      const portrait = createImageWithFallback({
        src: getMonsterImageSrc(monster),
        alt: monster.name,
        wrapperClass: "monster-list-portrait",
        placeholderLabel: monster.name,
        placeholderSubLabel: "NO IMAGE"
      });
      card.append(
        portrait,
        createEl("div", "monster-list-name", monster.name),
        createEl("div", "monster-list-sub", `基礎合計 ${MONSTER_STAT_KEYS.reduce((sum, key) => sum + (monster[key] || 0), 0)}`)
      );
      list.appendChild(card);
    });
    const buttons = createEl("div", "screen-button-row");
    const back = createEl("button", "screen-nav-btn", "Back HOME");
    back.dataset.action = "go-home";
    buttons.append(back);
    wrap.append(list, buttons);
    return wrap;
  };

  const renderMonsterStatEditingSection = (monster, draft, unlocks) => {
    const panel = createEl("section", "monster-build-panel");
    panel.appendChild(createEl("h3", "mini-heading", `能力値（残り ${gameState.monster.remainingPoints} ポイント）`));
    TRAINING_STAT_ROWS.forEach((row) => {
      const line = createEl("div", "training-stat-row");
      const base = Number(gameState.monster?.baseStats?.[row.key]) || Number(monster[row.baseKey]) || 0;
      const allocated = Number(gameState.monster?.allocatedStats?.[row.key]) || Number(draft?.[row.key]) || 0;
      const finalValue = Number(gameState.monster?.finalStats?.[row.key]) || 0;
      const maxValue = base + TRAINING_PER_STAT_CAP;
      const fillPercent = maxValue > 0 ? clamp(((base + allocated) / maxValue) * 100, 0, 100) : 0;
      const fill = createEl("div", `training-stat-fill ${allocated > 0 ? "inc" : ""}`);
      fill.style.width = `${fillPercent}%`;
      const bar = createEl("div", "training-stat-bar");
      bar.appendChild(fill);
      const controls = createEl("div", "training-stat-controls");
      const minus = createEl("button", "tiny-adjust-btn", "−");
      minus.dataset.action = "monster-training-adjust";
      minus.dataset.statKey = row.key;
      minus.dataset.delta = "-1";
      const valueBtn = createEl("div", "training-stat-alloc", `${allocated}`);
      const plus = createEl("button", "tiny-adjust-btn", "+");
      plus.dataset.action = "monster-training-adjust";
      plus.dataset.statKey = row.key;
      plus.dataset.delta = "1";
      const plus5 = createEl("button", "tiny-adjust-btn alt", "+5");
      plus5.dataset.action = "monster-training-adjust";
      plus5.dataset.statKey = row.key;
      plus5.dataset.delta = "5";
      const canEdit = !!unlocks.statAdjustmentUnlocked;
      minus.disabled = !canEdit || !canAdjustTrainingStat({ allocation: draft, statKey: row.key, delta: -1 });
      plus.disabled = !canEdit || !canAdjustTrainingStat({ allocation: draft, statKey: row.key, delta: 1 });
      plus5.disabled = !canEdit || !canAdjustTrainingStat({ allocation: draft, statKey: row.key, delta: 1 });
      controls.append(minus, valueBtn, plus, plus5);
      line.append(createEl("div", "training-stat-label", row.label), bar, controls, createEl("div", "training-stat-value", `${finalValue}`));
      panel.appendChild(line);
    });
    panel.appendChild(createEl("div", "monster-detail-note", `1ポイント=1上昇 / HPは補正対象外 / 上限: stat ${TRAINING_PER_STAT_CAP}, total ${TRAINING_TOTAL_CAP}`));
    return panel;
  };

  const renderMonsterNatureSection = () => {
    const section = createEl("section", "monster-nature-panel");
    section.appendChild(createEl("h3", "mini-heading", "性格補正（能力補正）"));
    const currentKey = gameState.monster?.natureModifier?.key || "no_modifier";
    const row = createEl("div", "nature-option-row");
    NATURE_MODIFIER_PRESETS.forEach((preset) => {
      const btn = createEl("button", `nature-option-btn${preset.key === currentKey ? " active" : ""}`, preset.label);
      btn.dataset.action = "monster-set-nature";
      btn.dataset.natureKey = preset.key;
      row.appendChild(btn);
    });
    section.appendChild(row);
    section.appendChild(createEl("div", "monster-detail-note", "上昇は+10%、下降は-10%。補正は割り振り後の実数値へ適用されます。"));
    return section;
  };

  const renderMoveCard = (move, {
    className = "move-info-card",
    slotLabel = "",
    removeAction = null,
    stateLabel = "",
    stateClassName = "",
    isSelectable = false,
    variant = "list"
  } = {}) => {
    const card = createEl("div", className);
    const typeKey = typeof move?.type === "string" ? move.type : "";
    const meta = TYPE_META[typeKey] || null;
    const typeIcon = meta?.icon && TYPE_ICON_GLYPHS[meta.icon] ? TYPE_ICON_GLYPHS[meta.icon] : "◈";
    const role = getMoveRole(move);
    const isAttack = role === "attack";
    const typeColor = meta?.color || "#6d80a8";
    card.style.setProperty("--type-color", typeColor);
    if (isSelectable) card.classList.add("is-selectable");
    if (stateClassName) card.classList.add(stateClassName);

    const icon = createEl("div", "move-card-icon");
    icon.append(
      createEl("span", "move-card-icon-glyph", typeIcon),
      createEl("span", "move-card-icon-type", meta?.label || typeKey || "不明")
    );
    const info = createEl("div", "move-card-main");
    const top = createEl("div", "move-card-topline");
    top.append(
      createEl("div", "move-info-name", move?.name || "未設定"),
      slotLabel ? createEl("span", "move-slot-chip", slotLabel) : createEl("span", "move-slot-chip hidden", "")
    );
    const metaRow = createEl("div", "move-card-meta-row");
    metaRow.append(
      createEl("span", "move-meta-badge role", MOVE_ROLE_LABELS[role] || "不明"),
      createEl("span", "move-meta-badge target", getMoveTargetLabel(move)),
      createEl("span", "move-meta-badge type", meta?.label || typeKey || "不明")
    );
    const shouldShowDesc = variant !== "equipped" || !isAttack;
    info.append(top, metaRow);
    if (shouldShowDesc) info.appendChild(createEl("div", "move-info-desc", move?.description || getMoveEffectText(move)));

    const right = createEl("div", "move-card-right");
    if (isAttack) {
      right.append(createEl("div", "move-power-label", "威力"), createEl("div", "move-power-value", String(Number(move?.power) || 0)));
    } else {
      right.append(createEl("div", "move-power-label", "補助"), createEl("div", "move-power-value support", "支援"));
    }
    right.appendChild(createEl("div", "move-effect-mini", getMoveEffectText(move)));

    if (stateLabel) {
      const state = createEl("span", "move-card-state-chip", stateLabel);
      card.appendChild(state);
    }
    if (removeAction) {
      const remove = createEl("button", "move-card-action-btn", "✕");
      remove.dataset.action = removeAction.action;
      if (Number.isInteger(removeAction.slotIndex)) remove.dataset.slotIndex = String(removeAction.slotIndex);
      remove.disabled = !!removeAction.disabled;
      card.appendChild(remove);
    }
    card.append(icon, info, right);
    return card;
  };

  const getMoveListFilters = (moveIds) => {
    const types = new Set();
    (Array.isArray(moveIds) ? moveIds : []).forEach((moveId) => {
      const type = MOVES?.[moveId]?.type;
      if (TYPE_META[type]) types.add(type);
    });
    return TYPE_FILTER_ORDER.filter((key) => key === "all" || types.has(key));
  };

  const renderMonsterTraitSection = () => {
    const section = createEl("section", "monster-trait-panel");
    section.appendChild(createEl("h3", "mini-heading", "特性"));
    const traits = Array.isArray(gameState.monster?.traits) ? gameState.monster.traits : [];
    const selectedTraitKey = gameState.monster?.selectedTraitKey || null;
    if (!traits.length) {
      section.appendChild(createEl("div", "monster-detail-note", "特性なし"));
      return section;
    }
    const row = createEl("div", "trait-option-row");
    traits.forEach((trait) => {
      const btn = createEl("button", `trait-option-btn${trait.key === selectedTraitKey ? " active" : ""}`, trait.name);
      btn.dataset.action = "monster-select-trait";
      btn.dataset.traitKey = trait.key;
      row.appendChild(btn);
    });
    const selectedTrait = traits.find((trait) => trait.key === selectedTraitKey) || traits[0];
    section.append(row, createEl("div", "monster-detail-note", selectedTrait?.description || "説明なし"));
    return section;
  };

  const renderMonsterDetailScreen = () => {
    const wrap = createEl("section", "monster-detail-screen");
    const layout = CONFIG.MONSTER_BUILD.LAYOUT || {};
    wrap.style.setProperty("--mb-screen-padding", `${Math.max(8, Number(layout.SCREEN_PADDING_PX) || 12)}px`);
    wrap.style.setProperty("--mb-left-width", `${Math.max(320, Number(layout.LEFT_PANEL_WIDTH_PX) || 540)}px`);
    wrap.style.setProperty("--mb-column-gap", `${Math.max(4, Number(layout.COLUMN_GAP_PX) || 10)}px`);
    wrap.style.setProperty("--mb-panel-min-h", `${Math.max(620, Number(layout.PANEL_MIN_HEIGHT_PX) || 786)}px`);
    wrap.style.setProperty("--mb-panel-padding", `${Math.max(4, Number(layout.PANEL_PADDING_PX) || 10)}px`);
    wrap.style.setProperty("--mb-section-gap", `${Math.max(4, Number(layout.SECTION_GAP_PX) || 8)}px`);
    wrap.style.setProperty("--mb-summary-image-w", `${Math.max(112, Number(layout.SUMMARY_IMAGE_WIDTH_PX) || 160)}px`);
    wrap.style.setProperty("--mb-summary-image-h", `${Math.max(92, Number(layout.SUMMARY_IMAGE_HEIGHT_PX) || 118)}px`);
    wrap.style.setProperty("--mb-stat-row-gap", `${Math.max(2, Number(layout.STAT_ROW_GAP_PX) || 4)}px`);
    wrap.style.setProperty("--mb-stat-bar-h", `${Math.max(10, Number(layout.STAT_BAR_HEIGHT_PX) || 14)}px`);
    wrap.style.setProperty("--mb-stat-label-w", `${Math.max(40, Number(layout.STAT_LABEL_WIDTH_PX) || 46)}px`);
    wrap.style.setProperty("--mb-stat-control-w", `${Math.max(124, Number(layout.STAT_CONTROL_WIDTH_PX) || 142)}px`);
    wrap.style.setProperty("--mb-stat-value-w", `${Math.max(40, Number(layout.STAT_VALUE_WIDTH_PX) || 44)}px`);
    wrap.style.setProperty("--mb-move-card-h", `${Math.max(44, Number(layout.MOVE_CARD_HEIGHT_PX) || 56)}px`);
    wrap.style.setProperty("--mb-move-card-p", `${Math.max(4, Number(layout.MOVE_CARD_PADDING_PX) || 6)}px`);
    wrap.style.setProperty("--mb-move-card-border", `${Math.max(1, Number(layout.MOVE_CARD_BORDER_PX) || 1)}px`);
    wrap.style.setProperty("--mb-move-card-radius", `${Math.max(8, Number(layout.MOVE_CARD_RADIUS_PX) || 11)}px`);
    wrap.style.setProperty("--mb-move-icon-size", `${Math.max(30, Number(layout.MOVE_CARD_ICON_SIZE_PX) || 38)}px`);
    wrap.style.setProperty("--mb-move-power-w", `${Math.max(56, Number(layout.MOVE_CARD_POWER_WIDTH_PX) || 68)}px`);
    wrap.style.setProperty("--mb-move-title-size", `${Math.max(12, Number(layout.MOVE_CARD_TITLE_SIZE_PX) || 14)}px`);
    wrap.style.setProperty("--mb-move-meta-size", `${Math.max(9, Number(layout.MOVE_CARD_META_SIZE_PX) || 10)}px`);
    wrap.style.setProperty("--mb-move-desc-size", `${Math.max(10, Number(layout.MOVE_CARD_DESC_SIZE_PX) || 11)}px`);
    wrap.style.setProperty("--mb-equipped-card-h", `${Math.max(42, Number(layout.EQUIPPED_CARD_HEIGHT_PX) || 52)}px`);
    wrap.style.setProperty("--mb-equipped-card-p", `${Math.max(3, Number(layout.EQUIPPED_CARD_PADDING_PX) || 5)}px`);
    wrap.style.setProperty("--mb-equipped-icon-size", `${Math.max(24, Number(layout.EQUIPPED_CARD_ICON_SIZE_PX) || 30)}px`);
    wrap.style.setProperty("--mb-equipped-power-w", `${Math.max(42, Number(layout.EQUIPPED_CARD_POWER_WIDTH_PX) || 54)}px`);
    wrap.style.setProperty("--mb-equipped-title-size", `${Math.max(11, Number(layout.EQUIPPED_CARD_TITLE_SIZE_PX) || 13)}px`);
    wrap.style.setProperty("--mb-equipped-section-p", `${Math.max(4, Number(layout.EQUIPPED_SECTION_PADDING_PX) || 6)}px`);
    wrap.style.setProperty("--mb-equipped-section-gap", `${Math.max(2, Number(layout.EQUIPPED_SECTION_GAP_PX) || 4)}px`);
    wrap.style.setProperty("--mb-equipped-slot-gap", `${Math.max(2, Number(layout.EQUIPPED_SLOT_GAP_PX) || 3)}px`);
    wrap.style.setProperty("--mb-action-panel-min-h", `${Math.max(64, Number(layout.ACTION_PANEL_MIN_HEIGHT_PX) || 78)}px`);
    wrap.style.setProperty("--mb-action-btn-h", `${Math.max(30, Number(layout.ACTION_BUTTON_HEIGHT_PX) || 34)}px`);
    wrap.style.setProperty("--mb-font-body", `${Math.max(11, Number(layout.FONT_SIZE_BODY_PX) || 12)}px`);
    wrap.style.setProperty("--mb-font-title", `${Math.max(18, Number(layout.FONT_SIZE_TITLE_PX) || 22)}px`);
    const monster = getSelectedMonster(gameState);
    if (!monster) {
      wrap.appendChild(createEl("div", "formation-help", "モンスターが存在しません。"));
      return wrap;
    }
    const unlocks = gameState.trainerCard?.unlocks || createDefaultTrainerCardUnlocks();
    const draft = getMonsterTrainingDraft(monster.id, gameState);
    const body = createEl("div", "monster-build-layout");
    const leftPanel = createEl("aside", "monster-build-left-panel");
    const summary = createEl("div", "monster-summary-card");
    const portrait = createImageWithFallback({
      src: getMonsterImageSrc(monster),
      alt: monster.name,
      wrapperClass: "monster-detail-portrait",
      placeholderLabel: monster.name,
      placeholderSubLabel: "NO IMAGE"
    });
    const title = createEl("div", "monster-detail-title-block");
    title.append(
      createEl("h2", "monster-detail-name", gameState.monster?.name || monster.name),
      createEl("div", "monster-list-sub", `ID: ${gameState.monster?.id || monster.id}`)
    );
    summary.append(portrait, title);
    const leftBody = createEl("div", "monster-build-left-body");
    leftBody.append(summary, renderMonsterTraitSection());

    const currentMovesSection = createEl("section", "move-section move-section-primary");
    const selectedSection = createEl("div", "move-section");
    selectedSection.appendChild(createEl("h3", "mini-heading", "装備わざ（最大4）"));
    const selectedList = createEl("div", "move-list");
    (gameState.moves?.selected || []).forEach((moveId, index) => {
      const row = createEl("div", `move-slot-row${gameState.ui.selectedMoveIndex === index ? " active" : ""}`);
      if (unlocks.moveCustomizationUnlocked) {
        row.dataset.action = "monster-select-move-slot";
        row.dataset.slotIndex = String(index);
      }
      row.classList.toggle("disabled", !unlocks.moveCustomizationUnlocked);
      row.appendChild(renderMoveCard(MOVES[moveId], {
        className: "move-info-card compact equipped",
        slotLabel: `SLOT ${index + 1}`,
        variant: "equipped",
        removeAction: {
          action: "monster-remove-selected-move",
          slotIndex: index,
          disabled: !unlocks.moveCustomizationUnlocked || !moveId
        }
      }));
      selectedList.appendChild(row);
    });
    selectedSection.appendChild(selectedList);
    currentMovesSection.append(selectedSection);
    leftBody.append(currentMovesSection, renderMonsterStatEditingSection(monster, draft, unlocks), renderMonsterNatureSection());
    leftPanel.append(leftBody);
    body.appendChild(leftPanel);

    const movePanel = createEl("section", "monster-moves-panel");
    const movePanelHeader = createEl("div", "monster-moves-header");
    movePanelHeader.appendChild(createEl("h3", "monster-move-list-title", "わざリスト"));
    const filters = getMoveListFilters(gameState.moves?.moveList || []);
    const activeFilter = filters.includes(gameState.moves?.activeTypeFilter || "") ? gameState.moves.activeTypeFilter : "all";
    const filterRow = createEl("div", "type-filter-row");
    filters.forEach((filterKey) => {
      const meta = TYPE_META[filterKey] || null;
      const icon = meta?.icon && TYPE_ICON_GLYPHS[meta.icon] ? TYPE_ICON_GLYPHS[meta.icon] : "◉";
      const btn = createEl("button", `type-filter-btn${activeFilter === filterKey ? " active" : ""}`);
      if (meta) btn.style.setProperty("--type-color", meta.color);
      btn.dataset.action = "monster-set-move-filter";
      btn.dataset.filterKey = filterKey;
      btn.append(
        createEl("span", "type-badge-icon", icon),
        createEl("span", "type-badge-label", filterKey === "all" ? "すべて" : (meta?.label || filterKey))
      );
      filterRow.appendChild(btn);
    });
    movePanelHeader.appendChild(filterRow);
    movePanel.appendChild(movePanelHeader);
    const moveListBody = createEl("div", "monster-moves-scroll-body");
    const moveList = createEl("div", "move-pool-grid");
    (gameState.moves?.moveList || []).forEach((moveId) => {
      const move = MOVES[moveId];
      const filterKey = activeFilter || "all";
      if (filterKey !== "all" && move?.type !== filterKey) return;
      const row = createEl("button", "move-candidate-row");
      row.dataset.action = "monster-pool-pick";
      row.dataset.moveId = moveId;
      const alreadySelected = (gameState.moves?.selected || []).includes(moveId);
      row.disabled = !unlocks.moveCustomizationUnlocked || alreadySelected;
      row.classList.toggle("disabled-picked", alreadySelected);
      row.appendChild(renderMoveCard(move, {
        className: "move-info-card compact list",
        variant: "list",
        isSelectable: true,
        stateLabel: alreadySelected ? "選択済" : (unlocks.moveCustomizationUnlocked ? "選択可" : "ロック"),
        stateClassName: alreadySelected ? "is-disabled" : ""
      }));
      moveList.appendChild(row);
    });
    if (!moveList.childElementCount) moveList.appendChild(renderMoveCard(null, { className: "move-info-card compact list is-disabled" }));
    moveListBody.appendChild(moveList);
    movePanel.appendChild(moveListBody);
    const actions = createEl("div", "monster-detail-actions action-panel-bottom-right");
    const save = createEl("button", "screen-nav-btn", "保存");
    save.dataset.action = "monster-detail-save";
    const back = createEl("button", "screen-nav-btn", "戻る");
    back.dataset.action = "monster-detail-back";
    const reset = createEl("button", "screen-nav-btn danger", "リセット");
    reset.dataset.action = "monster-detail-reset";
    actions.append(save, back, reset);
    movePanel.appendChild(actions);
    body.appendChild(movePanel);
    wrap.appendChild(body);
    return wrap;
  };

  const renderTrainerCardScreen = () => {
    const wrap = createEl("section", "trainer-card-screen");
    const unlocks = gameState.trainerCard?.unlocks || createDefaultTrainerCardUnlocks();
    wrap.appendChild(createEl("h2", "formation-title", "Trainer Card"));
    const badges = createEl("div", "trainer-badge-row");
    Object.entries(gameState.trainerCard?.badges || {}).forEach(([key, unlocked]) => {
      badges.appendChild(createEl("div", `trainer-badge${unlocked ? "" : " locked"}`, key));
    });
    const unlockList = createEl("div", "trainer-unlock-list");
    [
      ["statAdjustmentUnlocked", "stat adjustment unlocked"],
      ["perStatCapUnlocked", "per-stat cap unlocked"],
      ["moveCustomizationUnlocked", "move customization unlocked"]
    ].forEach(([key, label]) => {
      unlockList.appendChild(createEl("div", `trainer-unlock-item${unlocks[key] ? "" : " locked"}`, `${unlocks[key] ? "✓" : "🔒"} ${label}`));
    });
    const back = createEl("button", "screen-nav-btn", "Back HOME");
    back.dataset.action = "go-home";
    wrap.append(badges, unlockList, back);
    return wrap;
  };

  const renderSettingsScreen = () => {
    const wrap = createEl("section", "trainer-card-screen");
    wrap.appendChild(createEl("h2", "formation-title", "Settings"));
    wrap.appendChild(createEl("div", "formation-help", "セーブ/ロード管理"));
    const saveBtn = createEl("button", "screen-nav-btn", "メインセーブ");
    saveBtn.dataset.action = "main-save";
    const recoverLatest = createEl("button", "screen-nav-btn", "最新オートセーブ復元");
    recoverLatest.dataset.action = "restore-autosave";
    recoverLatest.dataset.slot = "0";
    const recoverPrev = createEl("button", "screen-nav-btn", "1つ前を復元");
    recoverPrev.dataset.action = "restore-autosave";
    recoverPrev.dataset.slot = "1";
    const recoverOld = createEl("button", "screen-nav-btn", "2つ前を復元");
    recoverOld.dataset.action = "restore-autosave";
    recoverOld.dataset.slot = "2";
    const autosaves = Array.isArray(gameState.autosaveSlots) ? gameState.autosaveSlots : [];
    const info = createEl("div", "formation-help", autosaves.length
      ? autosaves.map((slot) => `${slot.label}: ${new Date(slot.savedAt).toLocaleString()}`).join(" / ")
      : "オートセーブなし");
    const back = createEl("button", "screen-nav-btn", "Back HOME");
    back.dataset.action = "go-home";
    wrap.append(saveBtn, recoverLatest, recoverPrev, recoverOld, info, back);
    return wrap;
  };

  const renderFormationEditScreen = () => {
    const wrap = createEl("section", "formation-edit-screen");
    const edit = gameState.ui.formationEdit;
    const draft = cloneFormation(edit.draft);
    const selectedMonsterId = getFormationEditSelectedMonsterId(gameState);
    const selectedMonster = selectedMonsterId ? MONSTERS[selectedMonsterId] : null;
    const slotRects = getFormationSlotRects();
    const monsterRects = getMonsterGridItemRects(edit.scrollOffset, gameState.availableMonsters.length);
    const saveEnabled = hasAnyValidFormationMember(draft);
    const disableReason = saveEnabled ? "" : "保存するには1体以上を編成してください";
    wrap.style.padding = `${CONFIG.UI.FORMATION_EDIT_PADDING}px`;
    wrap.style.setProperty("--front-slot-color", CONFIG.UI.FRONT_SLOT_COLOR);
    wrap.style.setProperty("--reserve-slot-color", CONFIG.UI.RESERVE_SLOT_COLOR);
    const body = createEl("div", "formation-edit-body two-panel");
    const leftPanel = createEl("section", "formation-edit-left-panel");
    leftPanel.style.left = `${CONFIG.UI.FORMATION_LEFT_PANEL_X}px`;
    leftPanel.style.top = `${CONFIG.UI.FORMATION_LEFT_PANEL_Y}px`;
    leftPanel.style.width = `${CONFIG.UI.FORMATION_LEFT_PANEL_WIDTH}px`;
    leftPanel.style.height = `${CONFIG.UI.FORMATION_LEFT_PANEL_HEIGHT}px`;
    leftPanel.appendChild(createEl("h2", "formation-title", `Formation Edit: Slot ${getSafeFormationSlot(gameState.currentEditIndex) + 1}`));

    const leftBody = createEl("div", "formation-left-main");
    const formationArea = createEl("div", "formation-edit-area formation-grid-area");
    formationArea.style.left = `${CONFIG.UI.FORMATION_TOP_X}px`;
    formationArea.style.top = `${CONFIG.UI.FORMATION_TOP_Y}px`;
    formationArea.style.width = `${CONFIG.UI.FORMATION_TOP_WIDTH}px`;
    formationArea.style.height = `${CONFIG.UI.FORMATION_TOP_HEIGHT}px`;
    formationArea.appendChild(createEl("div", "formation-pane-title", "Formation Slots"));
    const frontLabel = createEl("div", "formation-zone-label front", "FRONT 1-3");
    frontLabel.style.top = "4px";
    const reserveLabel = createEl("div", "formation-zone-label reserve", "RESERVE 4-6");
    reserveLabel.style.top = `${CONFIG.UI.SLOT_HEIGHT + CONFIG.UI.SLOT_GAP_Y + 4}px`;
    formationArea.append(frontLabel, reserveLabel);
    slotRects.forEach((rect) => {
      const unitId = draft[rect.index] || null;
      const unit = unitId ? MONSTERS[unitId] : null;
      const isSelected = edit.selectedSlotIndex === rect.index;
      const isFront = rect.index < CONFIG.PARTY_ACTIVE_COUNT;
      const row = createEl("button", `formation-row formation-slot-row ${isFront ? "front" : "reserve"}${isSelected ? " active" : ""}`);
      row.style.left = `${rect.x - CONFIG.UI.FORMATION_TOP_X}px`;
      row.style.top = `${rect.y - CONFIG.UI.FORMATION_TOP_Y}px`;
      row.style.width = `${rect.width}px`;
      row.style.height = `${rect.height}px`;
      const imageWrap = createEl("div", "formation-slot-image");
      if (unit) {
        const portrait = createImageWithFallback({
          src: getMonsterImageSrc(unit),
          alt: unit.name,
          wrapperClass: "slot-portrait",
          placeholderLabel: unit.name,
          placeholderSubLabel: "NO IMAGE"
        });
        imageWrap.appendChild(portrait);
      } else {
        imageWrap.appendChild(createEl("div", "formation-slot-empty-image", "EMPTY"));
      }
      const name = createEl("div", "formation-slot-name", unit ? unit.name : "未設定");
      const zone = createEl("span", "formation-row-tag", isFront ? "FRONT" : "RESERVE");
      row.append(imageWrap, name, zone);
      formationArea.appendChild(row);
    });

    const divider = createEl("div", "formation-edit-divider");
    divider.style.left = `${CONFIG.UI.FORMATION_TOP_X}px`;
    divider.style.top = `${CONFIG.UI.DIVIDER_Y}px`;
    divider.style.width = `${CONFIG.UI.FORMATION_TOP_WIDTH}px`;
    divider.style.height = `${CONFIG.UI.DIVIDER_HEIGHT}px`;

    const box = createEl("div", "formation-edit-area formation-monster-area");
    box.style.left = `${CONFIG.UI.MONSTER_GRID_X}px`;
    box.style.top = `${CONFIG.UI.MONSTER_GRID_Y}px`;
    box.style.width = `${CONFIG.UI.MONSTER_GRID_WIDTH}px`;
    box.style.height = `${CONFIG.UI.MONSTER_GRID_HEIGHT}px`;
    box.appendChild(createEl("div", "formation-pane-title", "Available Monsters"));
    monsterRects.forEach((rect) => {
      const unitId = gameState.availableMonsters[rect.index];
      const unit = MONSTERS[unitId];
      if (!unit) return;
      const assignedSlot = findMonsterSlotInDraft(draft, unitId);
      const row = createEl("button", `formation-row monster-row${assignedSlot >= 0 ? " assigned" : ""}`);
      row.style.left = `${rect.x - CONFIG.UI.MONSTER_GRID_X}px`;
      row.style.top = `${rect.y - CONFIG.UI.MONSTER_GRID_Y}px`;
      row.style.width = `${rect.width}px`;
      row.style.height = `${rect.height}px`;
      const portrait = createImageWithFallback({
        src: getMonsterImageSrc(unit),
        alt: unit.name,
        wrapperClass: "monster-card-portrait",
        placeholderLabel: unit.name,
        placeholderSubLabel: "NO IMAGE"
      });
      row.appendChild(portrait);
      row.appendChild(createEl("div", "monster-card-name", unit.name));
      const slotLabel = getAssignedSlotLabel(draft, unitId);
      if (slotLabel) row.appendChild(createEl("span", "assigned-badge", slotLabel));
      box.appendChild(row);
    });

    leftBody.append(formationArea, divider, box);

    const footer = createEl("div", "formation-edit-footer");
    footer.style.left = `${CONFIG.UI.BUTTON_AREA_X}px`;
    footer.style.top = `${CONFIG.UI.BUTTON_AREA_Y}px`;
    footer.style.width = `${CONFIG.UI.BUTTON_AREA_WIDTH}px`;
    footer.style.height = `${CONFIG.UI.BUTTON_AREA_HEIGHT + CONFIG.UI.BUTTON_MESSAGE_HEIGHT}px`;
    const backBtn = createEl("button", "screen-nav-btn", "もどる");
    backBtn.style.width = `${CONFIG.UI.BUTTON_WIDTH}px`;
    backBtn.style.height = `${CONFIG.UI.BUTTON_HEIGHT}px`;
    backBtn.style.left = "0px";
    backBtn.style.top = "0px";
    backBtn.dataset.action = "formation-edit-back";
    const saveBtn = createEl("button", "screen-nav-btn primary", "保存/確定");
    saveBtn.style.width = `${CONFIG.UI.BUTTON_WIDTH}px`;
    saveBtn.style.height = `${CONFIG.UI.BUTTON_HEIGHT}px`;
    saveBtn.style.left = `${CONFIG.UI.BUTTON_WIDTH + CONFIG.UI.BUTTON_GAP}px`;
    saveBtn.style.top = "0px";
    saveBtn.dataset.action = "formation-edit-save";
    saveBtn.disabled = !saveEnabled;
    const footerMessage = createEl("div", "formation-save-message", disableReason || "\u00a0");
    footer.append(backBtn, saveBtn);
    footer.appendChild(footerMessage);
    leftPanel.append(leftBody, footer);

    gameState.uiRects.backButton = {
      x: CONFIG.UI.BUTTON_AREA_X,
      y: CONFIG.UI.BUTTON_AREA_Y,
      width: CONFIG.UI.BUTTON_WIDTH,
      height: CONFIG.UI.BUTTON_HEIGHT
    };
    gameState.uiRects.saveButton = {
      x: CONFIG.UI.BUTTON_AREA_X + CONFIG.UI.BUTTON_WIDTH + CONFIG.UI.BUTTON_GAP,
      y: CONFIG.UI.BUTTON_AREA_Y,
      width: CONFIG.UI.BUTTON_WIDTH,
      height: CONFIG.UI.BUTTON_HEIGHT
    };

    const rightPanel = createEl("section", "formation-edit-right-panel");
    rightPanel.style.left = `${CONFIG.UI.FORMATION_RIGHT_PANEL_X}px`;
    rightPanel.style.top = `${CONFIG.UI.FORMATION_RIGHT_PANEL_Y}px`;
    rightPanel.style.width = `${CONFIG.UI.FORMATION_RIGHT_PANEL_WIDTH}px`;
    rightPanel.style.height = `${CONFIG.UI.FORMATION_RIGHT_PANEL_HEIGHT}px`;
    rightPanel.appendChild(createEl("h3", "formation-detail-title", "選択中モンスター"));

    if (!selectedMonster) {
      rightPanel.appendChild(createEl("div", "formation-empty-detail", "モンスターを選択してください"));
    } else {
      const detailTop = createEl("div", "formation-detail-top");
      detailTop.appendChild(createImageWithFallback({
        src: getMonsterImageSrc(selectedMonster),
        alt: selectedMonster.name,
        wrapperClass: "formation-detail-portrait",
        placeholderLabel: selectedMonster.name,
        placeholderSubLabel: "NO IMAGE"
      }));
      const topInfo = createEl("div", "formation-detail-top-info");
      topInfo.append(
        createEl("div", "formation-detail-name", selectedMonster.name || "-"),
        createEl("div", "formation-detail-key", `ID: ${selectedMonsterId}`)
      );
      const typeRow = createEl("div", "formation-detail-type-row");
      const typeKeys = getMonsterTypeKeys(selectedMonsterId);
      if (typeKeys.length) {
        typeKeys.forEach((typeKey) => {
          const meta = TYPE_META[typeKey] || {};
          const badge = createEl("span", "formation-type-badge", meta.label || typeKey);
          if (meta.color) badge.style.setProperty("--type-color", meta.color);
          typeRow.appendChild(badge);
        });
      } else {
        typeRow.appendChild(createEl("span", "formation-type-badge muted", "TYPE情報なし"));
      }
      topInfo.appendChild(typeRow);
      detailTop.appendChild(topInfo);

      const traitDraft = getMonsterTraitDraft(selectedMonsterId, gameState);
      const selectedTrait = traitDraft.traits.find((trait) => trait.key === traitDraft.selectedTraitKey) || null;
      const traitBox = createEl("div", "formation-detail-trait", `特性: ${selectedTrait?.name || "なし"}`);
      const statsDraft = getMonsterTrainingDraft(selectedMonsterId, gameState);
      const nature = getMonsterNatureDraft(selectedMonsterId, gameState);
      const computed = calculateFinalMonsterStats(selectedMonster, statsDraft, nature);
      const statGrid = createEl("div", "formation-detail-stat-grid");
      TRAINING_STAT_ROWS.forEach((row) => {
        const line = createEl("div", "formation-detail-stat-row");
        line.append(
          createEl("span", "stat-label", row.label),
          createEl("span", "stat-value", String(Number(computed.finalStats?.[row.key]) || 0))
        );
        statGrid.appendChild(line);
      });

      const moveSection = createEl("div", "formation-detail-move-list");
      const equippedMoves = getMonsterMoveDraft(selectedMonsterId, gameState);
      equippedMoves.forEach((moveId, index) => {
        const move = MOVES[moveId] || null;
        const row = createEl("div", "formation-detail-move-row");
        const meta = TYPE_META[move?.type] || null;
        const role = MOVE_ROLE_LABELS[getMoveRole(move)] || "不明";
        row.append(
          createEl("span", "move-slot", `M${index + 1}`),
          createEl("span", "move-name", move?.name || "未設定"),
          createEl("span", "move-type", meta?.label || "-"),
          createEl("span", "move-role", role),
          createEl("span", "move-power", move ? getMoveEffectText(move) : "-")
        );
        moveSection.appendChild(row);
      });
      const editBtn = createEl("button", "screen-nav-btn primary formation-open-build-btn", "能力設定へ");
      editBtn.dataset.action = "formation-edit-open-monster-detail";
      rightPanel.append(detailTop, traitBox, statGrid, moveSection, editBtn);
    }

    body.append(leftPanel, rightPanel);
    wrap.append(body);
    return wrap;
  };

  const renderBattlePrepareScreen = () => {
    const wrap = createEl("section", "formation-screen battle-prepare-screen");
    wrap.style.setProperty("--formation-list-x", `${CONFIG.UI.FORMATION_LIST_X}px`);
    wrap.style.setProperty("--formation-list-y", `${CONFIG.UI.FORMATION_LIST_Y}px`);
    wrap.style.setProperty("--formation-list-width", `${CONFIG.UI.FORMATION_LIST_WIDTH}px`);
    wrap.style.setProperty("--formation-list-item-height", `${CONFIG.UI.BATTLE_PREPARE_LIST_ITEM_HEIGHT}px`);
    wrap.style.setProperty("--formation-list-spacing-y", `${CONFIG.UI.FORMATION_LIST_SPACING_Y}px`);
    wrap.style.setProperty("--formation-slot-label-height", `${CONFIG.UI.BATTLE_PREPARE_SLOT_LABEL_HEIGHT}px`);
    wrap.style.setProperty("--formation-preview-height", `${CONFIG.UI.BATTLE_PREPARE_PREVIEW_HEIGHT}px`);
    wrap.style.setProperty("--formation-preview-cols", `${CONFIG.UI.BATTLE_PREPARE_GRID_COLUMNS}`);
    wrap.style.setProperty("--formation-preview-rows", `${CONFIG.UI.BATTLE_PREPARE_GRID_ROWS}`);
    wrap.style.setProperty("--formation-summary-height", `${CONFIG.UI.BATTLE_PREPARE_SUMMARY_HEIGHT}px`);
    wrap.appendChild(createEl("h2", "formation-title", "Battle Prepare"));
    const selectedIndex = getSelectableIndex(gameState.ui.battlePrepareIndex, FORMATION_SLOT_COUNT - 1);
    const selectedFormation = selectedIndex >= 0 ? getFormationAt(gameState, selectedIndex) : null;
    const selectedMemberCount = getFormationMembers(selectedFormation).length;
    wrap.appendChild(createEl(
      "div",
      "battle-prepare-status",
      `選択中: Slot ${selectedIndex + 1} / メンバー ${selectedMemberCount}/${FORMATION_MEMBER_COUNT}`
    ));
    const list = createEl("div", "formation-slot-list");
    for (let i = 0; i < FORMATION_SLOT_COUNT; i += 1) {
      const formation = getFormationAt(gameState, i);
      const isSelected = i === gameState.ui.battlePrepareIndex;
      list.appendChild(renderFormationSlotCard({
        formation,
        index: i,
        isSelected,
        action: "battle-prepare-select",
        showSummary: true,
        previewOptions: { emptySubText: "モンスターを編成して出撃" },
        extraClassName: "battle-prepare-slot"
      }));
    }
    const buttons = createEl("div", "screen-button-row");
    buttons.classList.add("battle-prepare-actions");
    const back = createEl("button", "screen-nav-btn", "もどる");
    back.dataset.action = "go-home";
    const start = createEl("button", "screen-nav-btn primary", "勝ちにいく");
    start.dataset.action = "battle-start";
    start.disabled = selectedIndex < 0 || !hasAnyValidFormationMember(selectedFormation);
    buttons.append(back, start);
    wrap.append(list, buttons, createEl("div", "formation-help", "編成を確認して出撃しましょう"));
    return wrap;
  };

  const render = () => {
    ensureUiSafety();
    if (gameState.phase === PHASE.PLAYING) {
      syncPartyUiState();
    }
    clearTempArrays();
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.style.setProperty("--detail-h", `${CONFIG.MOVE_DETAIL_PANEL_HEIGHT}px`);
    app.style.setProperty("--hl-attacker", CONFIG.HIGHLIGHT_COLORS.attackSource);
    app.style.setProperty("--hl-target-single", CONFIG.HIGHLIGHT_COLORS.attackTargetSingle);
    app.style.setProperty("--hl-target-aoe", CONFIG.HIGHLIGHT_COLORS.attackTargetAoe);
    app.style.setProperty("--hl-status-poison", CONFIG.HIGHLIGHT_COLORS.statusPoison);
    app.style.setProperty("--hl-status-default", CONFIG.HIGHLIGHT_COLORS.statusDefault);
    app.style.setProperty("--hl-status-remove", CONFIG.HIGHLIGHT_COLORS.statusRemove);
    app.style.setProperty("--hl-trait-source", CONFIG.HIGHLIGHT_COLORS.traitSource);
    app.style.setProperty("--hl-trait-target", CONFIG.HIGHLIGHT_COLORS.traitTarget);
    if (gameState.systemMessage) {
      const message = createEl("div", "formation-help", gameState.systemMessage);
      app.appendChild(message);
    }

    const main = createEl("div", "main");
    if (gameState.phase === PHASE.START) {
      main.appendChild(renderStartPhaseScreen());
    } else if (gameState.phase === PHASE.REWARD) {
      main.appendChild(renderRewardScreen());
    } else if (gameState.phase === PHASE.GAMEOVER) {
      main.appendChild(renderBattleResultScreen());
    } else if (gameState.phase === PHASE.HOME) {
      main.appendChild(renderHomeScreen());
    } else if (gameState.phase === PHASE.FORMATION) {
      main.appendChild(renderFormationScreen());
    } else if (gameState.phase === PHASE.MONSTER_LIST) {
      main.appendChild(renderMonsterListScreen());
    } else if (gameState.phase === PHASE.MONSTER_DETAIL) {
      main.appendChild(renderMonsterDetailScreen());
    } else if (gameState.phase === PHASE.TRAINER_CARD) {
      main.appendChild(renderTrainerCardScreen());
    } else if (gameState.phase === PHASE.SETTINGS) {
      main.appendChild(renderSettingsScreen());
    } else if (gameState.phase === PHASE.BATTLE_PREPARE) {
      main.appendChild(renderBattlePrepareScreen());
    } else if (gameState.phase === PHASE.FORMATION_EDIT) {
      main.appendChild(renderFormationEditScreen());
    } else {
      const battleStage = createEl("div", "battle-stage");
      battleStage.appendChild(renderBattleTopHeader());
      battleStage.appendChild(renderBattlefield());
      battleStage.appendChild(renderBattleMessageBox());
      main.appendChild(battleStage);
      main.appendChild(renderCommandArea());
    }
    app.append(main);
    const logModal = renderLogModal();
    if (logModal) app.appendChild(logModal);
    const menuModal = renderMenuModal();
    if (menuModal) app.appendChild(menuModal);
  };

  const update = (now) => {
    gameState.input.mouseClicked = false;
    const hasHpAnimations = Object.keys(gameState.displayState.hpAnimations).length > 0;
    const hasDefeatVanish = Object.keys(gameState.displayState.defeatVanish).length > 0;
    const hasPlayback = gameState.phase === PHASE.PLAYING && gameState.battleFlow.mode === "playback";
    if (!hasHpAnimations && !hasDefeatVanish && !hasPlayback) return;
    updateHpAnimations(now);
    updateDefeatVanishAnimations(now);
    if (hasPlayback) updateBattlePlayback(now);
    render();    
  };

  const loop = (now) => {
    update(now);
    requestAnimationFrame(loop);
  };

  const getLocalPointerPosition = (event) => {
    const appRect = document.getElementById("app")?.getBoundingClientRect?.();
    const localX = appRect ? event.clientX - appRect.left : 0;
    const localY = appRect ? event.clientY - appRect.top : 0;
    return {
      x: Number.isFinite(localX) ? localX : 0,
      y: Number.isFinite(localY) ? localY : 0
    };
  };

  const getCanvasPoint = (event) => {
    const app = document.getElementById("app");
    const rect = app?.getBoundingClientRect?.();
    const x = rect ? event.clientX - rect.left : 0;
    const y = rect ? event.clientY - rect.top : 0;
    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0
    };
  };

  const getFormationEditLocalPointerPosition = (event) => {
    const leftMain = document.querySelector(".formation-left-main");
    const panelRect = leftMain?.getBoundingClientRect?.();
    if (!panelRect) return { x: -1, y: -1 };
    const localX = event.clientX - panelRect.left;
    const localY = event.clientY - panelRect.top;
    return {
      x: Number.isFinite(localX) ? localX : -1,
      y: Number.isFinite(localY) ? localY : -1
    };
  };

  const getHomeLocalPointerPosition = (event) => {
    const screenRect = document.querySelector(".home-screen")?.getBoundingClientRect?.();
    if (!screenRect) return { x: -1, y: -1 };
    const localX = event.clientX - screenRect.left;
    const localY = event.clientY - screenRect.top;
    return {
      x: Number.isFinite(localX) ? localX : -1,
      y: Number.isFinite(localY) ? localY : -1
    };
  };

  const updateHomeHoverFromPoint = (x, y) => {
    let nextHover = -1;
    const rects = getHomeMenuCardRects();
    for (const rect of rects) {
      if (isPointInRect(x, y, rect)) {
        nextHover = rect.index;
        break;
      }
    }
    if (gameState.ui.homeHoverIndex !== nextHover) {
      gameState.ui.homeHoverIndex = nextHover;
      return true;
    }
    return false;
  };

  const handleHomeCardPointerClick = (x, y) => {
    const rects = getHomeMenuCardRects();
    for (const rect of rects) {
      if (isPointInRect(x, y, rect)) {
        handleHomeMenuConfirm(rect.index);
        return true;
      }
    }
    return false;
  };

  const handleFormationEditPointerClick = (x, y) => {
    const slotRects = getFormationSlotRects();
    for (const rect of slotRects) {
      if (isPointInRect(x, y, rect)) {
        handleFormationSlotSelect(rect.index);
        return true;
      }
    }
    const monsterRects = getMonsterGridItemRects(gameState.ui.formationEdit.scrollOffset, gameState.availableMonsters.length);
    for (const rect of monsterRects) {
      if (isPointInRect(x, y, rect)) {
        assignMonsterToSelectedSlot(rect.index);
        return true;
      }
    }
    return false;
  };

  const handleFormationButtonAction = (buttonKey) => {
    if (buttonKey === "back") {
      cancelFormationEdit();
      return true;
    }
    if (buttonKey === "save") {
      const draft = cloneFormation(gameState?.ui?.formationEdit?.draft);
      if (!hasAnyValidFormationMember(draft)) {
        gameState.systemMessage = "保存するには1体以上を編成してください。";
        return true;
      }
      saveFormationEdit();
      return true;
    }
    return false;
  };

  const handleFormationButtonClick = (point) => {
    if (gameState.phase !== PHASE.FORMATION_EDIT) return false;
    const appRect = document.getElementById("app")?.getBoundingClientRect?.();
    const leftMain = document.querySelector(".formation-left-main");
    const panelRect = leftMain?.getBoundingClientRect?.();
    if (!panelRect || !appRect) return false;
    const localPoint = {
      x: point.x - (panelRect.left - appRect.left),
      y: point.y - (panelRect.top - appRect.top)
    };
    if (isPointInRect(localPoint.x, localPoint.y, gameState?.uiRects?.backButton || null)) {
      return handleFormationButtonAction("back");
    }
    if (isPointInRect(localPoint.x, localPoint.y, gameState?.uiRects?.saveButton || null)) {
      return handleFormationButtonAction("save");
    }
    return false;
  };

  document.addEventListener("click", (event) => {
    const canvasPoint = getCanvasPoint(event);
    if (handleFormationButtonClick(canvasPoint)) {
      render();
      return;
    }
    if (gameState.phase === PHASE.HOME) {
      const pointer = getHomeLocalPointerPosition(event);
      if (handleHomeCardPointerClick(pointer.x, pointer.y)) {
        render();
        return;
      }
    }
    if (gameState.phase === PHASE.FORMATION_EDIT) {
      const pointer = getFormationEditLocalPointerPosition(event);
      if (handleFormationEditPointerClick(pointer.x, pointer.y)) {
        render();
        return;
      }
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const a = target.dataset.action;
    if (a === "home-card-confirm") {
      handleHomeMenuConfirm(Number(target.dataset.index));
      render();
      return;
    }
    if (a === "open-trial-select") {
      enterTrialSelect();
      render();
      return;
    }
    if (a === "select-trial") {
      const trialId = target.dataset.trialId;
      const index = Number(target.dataset.index);
      gameState.ui.trialSelectIndex = getSelectableIndex(index, HANAFUDA_BOSS_ORDER.length - 1);
      if (trialId && gameState.progress.unlockedTrials.includes(trialId)) enterTrialIntro(trialId);
      render();
      return;
    }
    if (a === "start-selected-trial") {
      if (gameState.progress.selectedTrial) startHanafudaTrial(gameState.progress.selectedTrial);
      render();
      return;
    }
    if (a === "pick-reward") {
      gameState.ui.rewardChoiceIndex = getSelectableIndex(Number(target.dataset.index), 2);
      render();
      return;
    }
    if (a === "confirm-reward") {
      const reward = gameState.progress.pendingReward;
      const choices = Array.isArray(reward?.choices) ? reward.choices : [];
      const selected = choices[gameState.ui.rewardChoiceIndex] || choices[0] || null;
      if (selected) applyTrialRewardChoice(selected);
      gameState.progress.pendingReward = null;
      gameState.progress.selectedTrial = null;
      writeAutosave();
      saveMainGame();
      enterHub();
      render();
      return;
    }
    if (a === "formation-select") {
      const index = Number(target.dataset.index);
      const safe = getSafeFormationSlot(index);
      handleFormationSelection(safe, true);
      render();
      return;
    }
    if (a === "formation-edit-save") {
      handleFormationButtonAction("save");
      render();
      return;
    }
    if (a === "formation-edit-back") {
      handleFormationButtonAction("back");
      render();
      return;
    }
    if (a === "formation-edit-open-monster-detail") {
      openMonsterEditFromFormation();
      render();
      return;
    }
    if (a === "monster-open-detail") {
      enterMonsterDetail(target.dataset.monsterId);
      render();
      return;
    }
    if (a === "monster-detail-save") {
      saveMonsterDetailAndExit();
      render();
      return;
    }
    if (a === "monster-detail-back") {
      cancelMonsterDetailAndExit();
      render();
      return;
    }
    if (a === "monster-detail-reset") {
      resetMonsterDetailBuild();
      render();
      return;
    }
    if (a === "monster-training-adjust") {
      const baseDelta = Number(target.dataset.delta) || 0;
      const delta = event.shiftKey && Math.abs(baseDelta) === 1 ? baseDelta * 5 : baseDelta;
      adjustMonsterTrainingStat(gameState.selectedMonsterId, target.dataset.statKey, delta);
      render();
      return;
    }
    if (a === "monster-select-move-slot") {
      chooseSelectableMoveSlot(Number(target.dataset.slotIndex));
      render();
      return;
    }
    if (a === "monster-pool-pick") {
      assignMoveFromMoveList(target.dataset.moveId);
      render();
      return;
    }
    if (a === "monster-set-nature") {
      setMonsterNatureModifier(gameState.selectedMonsterId, target.dataset.natureKey);
      render();
      return;
    }
    if (a === "monster-set-move-filter") {
      gameState.moves.activeTypeFilter = TYPE_FILTER_ORDER.includes(target.dataset.filterKey || "") ? target.dataset.filterKey : "all";
      render();
      return;
    }
    if (a === "monster-select-trait") {
      setMonsterTraitSelection(gameState.selectedMonsterId, target.dataset.traitKey);
      render();
      return;
    }
    if (a === "monster-remove-selected-move") {
      removeSelectedMove(Number(target.dataset.slotIndex));
      render();
      return;
    }
    if (a === "battle-prepare-select") {
      gameState.ui.battlePrepareIndex = getSafeFormationSlot(Number(target.dataset.index));
      gameState.battlePrepareIndex = gameState.ui.battlePrepareIndex;
      render();
      return;
    }
    if (a === "battle-start") {
      if (gameState.ui.battlePrepareIndex >= 0) startBattleFromFormation(gameState.ui.battlePrepareIndex);
      render();
      return;
    }
    if (a === "main-save") {
      const confirmed = window.confirm("現在の状態をメインセーブに保存しますか？");
      if (confirmed) {
        saveMainGame();
        writeAutosave();
      }
      render();
      return;
    }
    if (a === "restore-autosave") {
      const slot = clamp(Number(target.dataset.slot), 0, 2);
      const confirmed = window.confirm(`オートセーブ(slot:${slot})を復元しますか？`);
      if (confirmed && restoreAutosaveSlot(slot)) {
        gameState.systemMessage = `オートセーブ ${AUTOSAVE_LABELS[slot]} を復元しました。`;
      } else if (confirmed) {
        gameState.systemMessage = "復元可能なオートセーブがありません。";
      }
      render();
      return;
    }
    if (a === "go-home") {
      enterHome();
      render();
      return;
    }
    if (a === "reset") dispatch({ type: "RESET" });
    if (a === "mode-fight") dispatch({ type: "MODE", mode: "fight" });
    if (a === "mode-party") dispatch({ type: "MODE", mode: "party" });
    if (a === "pick-move") dispatch({ type: "MOVE", moveId: target.dataset.moveId });
    if (a === "target-cell") dispatch({ type: "TARGET", x: Number(target.dataset.x), y: Number(target.dataset.y) });
    if (a === "pick-reserve") dispatch({ type: "RESERVE", reserveIndex: Number(target.dataset.reserveIndex) });
    if (a === "pick-destination") dispatch({ type: "DEST", toSlot: Number(target.dataset.toSlot) });
    if (a === "cancel-selection") dispatch({ type: "CANCEL" });
    if (a === "undo-command") dispatch({ type: "UNDO" });
    if (a === "fast-forward") dispatch({ type: "FAST_FORWARD" });
    if (a === "toggle-log") dispatch({ type: "TOGGLE_LOG" });
    if (a === "toggle-menu") dispatch({ type: "TOGGLE_MENU" });
    if (a === "close-panels") dispatch({ type: "CLOSE_PANELS" });
  });

  document.addEventListener("mousemove", (event) => {
    if (gameState.phase !== PHASE.HOME) return;
    const pointer = getHomeLocalPointerPosition(event);
    if (updateHomeHoverFromPoint(pointer.x, pointer.y)) render();
  });

  document.addEventListener("mousedown", (event) => {
    const target = event.target.closest("[data-action='monster-training-adjust']");
    if (!target || gameState.phase !== PHASE.MONSTER_DETAIL) return;
    const statKey = target.dataset.statKey;
    const delta = Number(target.dataset.delta) || 0;
    if (!statKey || !delta) return;
    startStatAdjustHold(statKey, delta, event.shiftKey);
  });

  document.addEventListener("mouseup", stopStatAdjustHold);
  document.addEventListener("mouseleave", stopStatAdjustHold);

  document.addEventListener("mouseleave", () => {
    if (gameState.phase !== PHASE.HOME) return;
    if (gameState.ui.homeHoverIndex !== -1) {
      gameState.ui.homeHoverIndex = -1;
      render();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (gameState.phase === PHASE.START) {
      if (gameState.ui.startView === START_VIEW.TRIAL_SELECT) {
        if (event.key === "ArrowUp") gameState.ui.trialSelectIndex -= 1;
        if (event.key === "ArrowDown") gameState.ui.trialSelectIndex += 1;
        gameState.ui.trialSelectIndex = getSelectableIndex(gameState.ui.trialSelectIndex, HANAFUDA_BOSS_ORDER.length - 1);
        if (event.key === "Enter") {
          const trialId = HANAFUDA_BOSS_ORDER[gameState.ui.trialSelectIndex];
          if (trialId && gameState.progress.unlockedTrials.includes(trialId)) enterTrialIntro(trialId);
        }
        if (event.key === "Escape") enterHub();
      } else if (gameState.ui.startView === START_VIEW.TRIAL_INTRO) {
        if (event.key === "Enter") {
          if (gameState.progress.selectedTrial) startHanafudaTrial(gameState.progress.selectedTrial);
        }
        if (event.key === "Escape") enterTrialSelect();
      }
      render();
      return;
    }

    if (gameState.phase === PHASE.REWARD) {
      if (event.key === "ArrowUp") gameState.ui.rewardChoiceIndex -= 1;
      if (event.key === "ArrowDown") gameState.ui.rewardChoiceIndex += 1;
      gameState.ui.rewardChoiceIndex = getSelectableIndex(gameState.ui.rewardChoiceIndex, 2);
      if (event.key === "Enter") {
        const reward = gameState.progress.pendingReward;
        const selected = reward?.choices?.[gameState.ui.rewardChoiceIndex] || reward?.choices?.[0];
        if (selected) applyTrialRewardChoice(selected);
        gameState.progress.pendingReward = null;
        gameState.progress.selectedTrial = null;
        enterHub();
      }
      render();
      return;
    }

    if (gameState.phase === PHASE.GAMEOVER) {
      if (event.key === "Enter" || event.key === "Escape") {
        enterHub();
        render();
      }
      return;
    }

    if (gameState.phase === PHASE.HOME) {
      const cols = Math.max(1, Math.trunc(CONFIG.UI.HOME_MENU_COLS));
      const current = getSafeHomeIndex(gameState.ui.homeIndex);
      if (event.key === "ArrowUp") gameState.ui.homeIndex = current - cols;
      if (event.key === "ArrowDown") gameState.ui.homeIndex = current + cols;
      if (event.key === "ArrowLeft") gameState.ui.homeIndex = current - 1;
      if (event.key === "ArrowRight") gameState.ui.homeIndex = current + 1;
      if (event.key === "Enter") handleHomeMenuConfirm(gameState.ui.homeIndex);
      ensureUiSafety();
      const hubItems = getHubMenuItems(gameState);
      gameState.ui.currentHubSection = hubItems[gameState.ui.homeIndex]?.key || hubItems[0]?.key || "battle";
      render();
      return;
    }

    if (gameState.phase === PHASE.FORMATION) {
      if (event.key === "ArrowUp") gameState.ui.formationIndex -= 1;
      if (event.key === "ArrowDown") gameState.ui.formationIndex += 1;
      if (event.key === "Enter") handleFormationSelection(gameState.ui.formationIndex, true);
      if (event.key === "Escape") enterHome();
      ensureUiSafety();
      render();
      return;
    }

    if (gameState.phase === PHASE.MONSTER_LIST) {
      if (event.key === "ArrowUp") gameState.ui.monsterListIndex -= 1;
      if (event.key === "ArrowDown") gameState.ui.monsterListIndex += 1;
      if (event.key === "Enter") {
        const ids = getMonsterLibraryIds(gameState);
        const safeIndex = getSafeMonsterListIndex(gameState, gameState.ui.monsterListIndex);
        if (safeIndex >= 0 && ids[safeIndex]) enterMonsterDetail(ids[safeIndex]);
      }
      if (event.key === "Escape") enterHome();
      ensureUiSafety();
      render();
      return;
    }

    if (gameState.phase === PHASE.MONSTER_DETAIL) {
      if (event.key === "Escape") cancelMonsterDetailAndExit();
      render();
      return;
    }

    if (gameState.phase === PHASE.TRAINER_CARD) {
      if (event.key === "Escape") enterHome();
      render();
      return;
    }

    if (gameState.phase === PHASE.SETTINGS) {
      if (event.key === "Escape") enterHome();
      render();
      return;
    }

    if (gameState.phase === PHASE.BATTLE_PREPARE) {
      if (event.key === "ArrowUp") gameState.ui.battlePrepareIndex -= 1;
      if (event.key === "ArrowDown") gameState.ui.battlePrepareIndex += 1;
      if (event.key === "Enter" && gameState.ui.battlePrepareIndex >= 0) startBattleFromFormation(gameState.ui.battlePrepareIndex);
      if (event.key === "Escape") enterHome();
      ensureUiSafety();
      render();
      return;
    }

    if (gameState.phase === PHASE.FORMATION_EDIT) {
      const edit = gameState.ui.formationEdit;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") edit.selectedSlotIndex -= 1;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") edit.selectedSlotIndex += 1;
      if (event.key === "Backspace") {
        const idx = getSelectableIndex(edit.selectedSlotIndex, FORMATION_MEMBER_COUNT - 1);
        if (idx >= 0) {
          const draft = cloneFormation(edit.draft);
          if (draft[idx] && draft[idx] === edit.selectedMonsterKey) edit.selectedMonsterKey = null;
          draft[idx] = null;
          edit.draft = draft;
        }
      }
      if (event.key.toLowerCase() === "s") saveFormationEdit();
      if (event.key === "Escape") cancelFormationEdit();
      ensureUiSafety();
      render();
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && isPlaybackBusy()) {
      event.preventDefault();
      dispatch({ type: "FAST_FORWARD" });
    }
  });

  document.addEventListener("mousemove", (event) => {
    const pointer = getLocalPointerPosition(event);
    gameState.input.mouseX = pointer.x;
    gameState.input.mouseY = pointer.y;
    if (!isKoReplacementPhase()) return;
    const target = event.target?.closest?.("[data-action='target-cell']");
    const x = Number(target?.dataset?.x);
    const y = Number(target?.dataset?.y);
    const nextHover = Number.isInteger(x) && y === 1 ? x : null;
    if (gameState.ui.hoverSlot === nextHover) return;
    gameState.ui.hoverSlot = nextHover;
    gameState.ui.pendingKoSlot = nextHover;
    render();
  });

  document.addEventListener("wheel", (event) => {
    if (gameState.phase !== PHASE.FORMATION_EDIT) return;
    const pointer = getFormationEditLocalPointerPosition(event);
    const gridRect = {
      x: CONFIG.UI.MONSTER_GRID_X,
      y: CONFIG.UI.MONSTER_GRID_Y,
      width: CONFIG.UI.MONSTER_GRID_WIDTH,
      height: CONFIG.UI.MONSTER_GRID_HEIGHT
    };
    if (!isPointInRect(pointer.x, pointer.y, gridRect)) return;
    const maxScroll = getMonsterGridMaxScroll(gameState.availableMonsters.length);
    if (maxScroll <= 0) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    const next = clamp(gameState.ui.formationEdit.scrollOffset + direction, 0, maxScroll);
    if (next === gameState.ui.formationEdit.scrollOffset) return;
    gameState.ui.formationEdit.scrollOffset = next;
    render();
  }, { passive: false });

  document.addEventListener("mousedown", () => {
    gameState.input.mouseClicked = true;
  });

  ensureUiSafety();
  render();
  requestAnimationFrame(loop);
})();
