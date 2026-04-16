(() => {
  "use strict";

  const CONFIG = {
    BOARD_COLS: 3,
    BOARD_ROWS: 2,
    MAX_LOG_LINES: 160,
    MAX_TURNS: 60,
    POISON_RATIO: 0.1,
    BARRIER_RATIO: 0.5,
    ATK_UP_RATIO: 0.25,
    DEF_UP_RATIO: 0.25,
    MOVE_DETAIL_PANEL_HEIGHT: 72,
    SUMMARY_PANEL_HEIGHT: 128,
    MESSAGE_MIN_MS: 480,
    MESSAGE_AUTO_MS: 1200,
    WAIT_SHORT_MS: 220,
    HP_ANIM_MS: 520,
    HIGHLIGHT_MS: 220,
    SPEED_BASE: 1,
    TIEBREAKER_TEAM_ORDER: ["ally", "enemy"]
  };

  const TEAM = { ALLY: "ally", ENEMY: "enemy" };
  const PHASE = { START: "start", PLAYING: "playing", GAMEOVER: "gameover" };

  const ASSETS = {
    backgrounds: { battle: "./assets/backgrounds/background_battle.jpg" },
    icons: { attack: "./assets/icons/icon_attack.png", status: "./assets/icons/icon_status.png" },
    portraits: {
      emberlynx: "./assets/portraits/ally_emberlynx.png",
      mossblob: "./assets/portraits/ally_mossblob.png",
      frostfang: "./assets/portraits/ally_frostfang.png",
      stormimp: "./assets/portraits/ally_stormimp.png",
      ironboar: "./assets/portraits/ally_ironboar.png",
      wyvern: "./assets/portraits/enemy_wyvern.png",
      golem: "./assets/portraits/enemy_golem.png",
      thunderroc: "./assets/portraits/enemy_thunderroc.png",
      venomtoad: "./assets/portraits/enemy_venomtoad.png",
      duskmoth: "./assets/portraits/enemy_duskmoth.png"
    }
  };

  const getAssetPath = (type, key) => (ASSETS[type] && ASSETS[type][key]) || "";

  const patterns = {
    front3: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
    self: [{ x: 0, y: 0 }],
    allyAdjacent: [{ x: -1, y: 0 }, { x: 1, y: 0 }],
    singleAttackReach: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
  };

  const MOVES = {
    clawStrike: { id: "clawStrike", name: "クロー・ストライク", category: "attack", type: "fire", power: 32, patternId: "singleAttackReach", targetRule: "anyOtherSingle", targetMode: "single", beforeDamage: [], afterDamage: [] },
    drainBite: { id: "drainBite", name: "ドレインバイト", category: "attack", type: "nature", power: 28, patternId: "singleAttackReach", targetRule: "anyOtherSingle", targetMode: "single", beforeDamage: [], afterDamage: [{ type: "drain", ratio: 0.5 }] },
    quakeWave: { id: "quakeWave", name: "クエイクウェーブ", category: "attack", type: "earth", power: 24, patternId: "front3", targetRule: "enemy", targetMode: "allPattern", beforeDamage: [], afterDamage: [] },
    frostLance: { id: "frostLance", name: "フロストランス", category: "attack", type: "water", power: 34, patternId: "singleAttackReach", targetRule: "anyOtherSingle", targetMode: "single", beforeDamage: [], afterDamage: [] },
    toxicSpit: { id: "toxicSpit", name: "トキシックスピット", category: "attack", type: "shadow", power: 18, patternId: "singleAttackReach", targetRule: "anyOtherSingle", targetMode: "single", beforeDamage: [], afterDamage: [] },
    ironGuard: { id: "ironGuard", name: "アイアンガード", category: "status", type: "earth", power: 0, patternId: "self", targetRule: "selfOnly", targetMode: "single", beforeDamage: [{ type: "applyStatus", status: "barrier", duration: 2 }], afterDamage: [] },
    rallyHowl: { id: "rallyHowl", name: "ラリーハウル", category: "status", type: "light", power: 0, patternId: "allyAdjacent", targetRule: "allyOtherSingle", targetMode: "single", beforeDamage: [{ type: "applyStatus", status: "atkUp", duration: 2 }], afterDamage: [] },
    shellStance: { id: "shellStance", name: "シェルスタンス", category: "status", type: "water", power: 0, patternId: "self", targetRule: "selfOnly", targetMode: "single", beforeDamage: [{ type: "applyStatus", status: "defUp", duration: 2 }], afterDamage: [] },
    venomBless: { id: "venomBless", name: "ベノムブレス", category: "status", type: "shadow", power: 0, patternId: "self", targetRule: "selfOnly", targetMode: "single", beforeDamage: [{ type: "applyStatus", status: "atkUp", duration: 2 }], afterDamage: [] }
  };

  const STATUSES = {
    poison: { kind: "poison", category: "dot", duration: 3, tags: ["poison"] },
    barrier: { kind: "barrier", category: "barrier", duration: 2, tags: ["barrier"] },
    atkUp: { kind: "atkUp", category: "buffAtk", duration: 2, tags: ["buff", "atk"] },
    defUp: { kind: "defUp", category: "buffDef", duration: 2, tags: ["buff", "def"] },
    bind: { kind: "bind", category: "debuffBind", duration: 2, tags: ["debuff", "bind"] }
  };

  const ABILITIES = {
    venomTouch: { id: "venomTouch", onAfterDamage: [{ type: "applyStatus", status: "poison", duration: 2 }] },
    guardianPulse: {
      id: "guardianPulse",
      onTurnStart: [{ type: "applyStatus", status: "barrier", duration: 1, target: "self" }],
      onEnter: [{ type: "applyStatus", status: "barrier", duration: 1, target: "self" }]
    }
  };

  const UNIT_LIBRARY = {
    emberlynx: { id: "emberlynx", name: "エンバーリンクス", portrait: "emberlynx", hp: 88, atk: 38, def: 22, spd: 35, abilityId: "venomTouch", moves: ["clawStrike", "drainBite", "rallyHowl", "shellStance"] },
    mossblob: { id: "mossblob", name: "モスブロブ", portrait: "mossblob", hp: 96, atk: 28, def: 30, spd: 18, abilityId: "guardianPulse", moves: ["quakeWave", "drainBite", "ironGuard", "shellStance"] },
    frostfang: { id: "frostfang", name: "フロストファング", portrait: "frostfang", hp: 82, atk: 34, def: 24, spd: 37, abilityId: null, moves: ["frostLance", "clawStrike", "rallyHowl", "shellStance"] },
    stormimp: { id: "stormimp", name: "ストームインプ", portrait: "stormimp", hp: 70, atk: 30, def: 18, spd: 42, abilityId: null, moves: ["toxicSpit", "clawStrike", "venomBless", "ironGuard"] },
    ironboar: { id: "ironboar", name: "アイアンボア", portrait: "ironboar", hp: 108, atk: 36, def: 34, spd: 15, abilityId: "guardianPulse", moves: ["quakeWave", "clawStrike", "ironGuard", "rallyHowl"] },
    wyvern: { id: "wyvern", name: "ブルーワイバーン", portrait: "wyvern", hp: 90, atk: 37, def: 23, spd: 33, abilityId: null, moves: ["clawStrike", "drainBite", "rallyHowl", "shellStance"] },
    golem: { id: "golem", name: "ロックゴーレム", portrait: "golem", hp: 110, atk: 35, def: 36, spd: 12, abilityId: "guardianPulse", moves: ["quakeWave", "ironGuard", "shellStance", "clawStrike"] },
    thunderroc: { id: "thunderroc", name: "サンダーロック", portrait: "thunderroc", hp: 85, atk: 34, def: 21, spd: 39, abilityId: null, moves: ["frostLance", "clawStrike", "toxicSpit", "venomBless"] }
  };

  const STATUS_LABELS = { poison: "どく", barrier: "バリア", atkUp: "こうげきアップ", defUp: "ぼうぎょアップ" };
  const STATUS_APPLY_TEXT = {
    poison: (n) => `${n}は どくを うけた！`,
    barrier: (n) => `${n}は バリアに守られた！`,
    atkUp: (n) => `${n}の こうげきが上がった！`,
    defUp: (n) => `${n}の ぼうぎょが上がった！`
  };
  const STATUS_FADE_TEXT = {
    poison: (n) => `${n}の どくが消えた。`,
    barrier: (n) => `${n}の バリアが消えた。`,
    atkUp: (n) => `${n}の こうげきアップが切れた。`,
    defUp: (n) => `${n}の ぼうぎょアップが切れた。`
  };

  let UID_COUNTER = 1;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const byTeamOrder = (team) => CONFIG.TIEBREAKER_TEAM_ORDER.indexOf(team);
  const isAlive = (u) => !!u && u.hp > 0;
  const isDefeated = (u) => !!u && u.hp <= 0;
  const cloneStatus = (kind, duration) => ({ ...STATUSES[kind], duration: duration ?? STATUSES[kind].duration, tags: [...STATUSES[kind].tags] });
  const findStatus = (statuses, kind) => statuses.find((s) => s.kind === kind);

  const createUnit = (unitId, team, slot) => {
    const base = UNIT_LIBRARY[unitId];
    return {
      uid: `${team}-${unitId}-${slot}-${UID_COUNTER++}`,
      unitId: base.id,
      name: base.name,
      portrait: base.portrait,
      team,
      slot,
      hp: base.hp,
      maxHp: base.hp,
      atk: base.atk,
      def: base.def,
      spd: base.spd,
      abilityId: base.abilityId,
      moveIds: [...base.moves],
      statuses: [],
      isSwitching: false,
      switchTargetId: null
    };
  };

  const createInitialState = () => ({
    phase: PHASE.PLAYING,
    turn: 1,
    winner: null,
    battlefield: { background: getAssetPath("backgrounds", "battle") },
    teams: {
      ally: { active: [createUnit("emberlynx", TEAM.ALLY, 0), createUnit("mossblob", TEAM.ALLY, 1), createUnit("frostfang", TEAM.ALLY, 2)], reserve: [createUnit("stormimp", TEAM.ALLY, "r0"), createUnit("ironboar", TEAM.ALLY, "r1")], statuses: [], tileEffects: [[], [], []] },
      enemy: { active: [createUnit("wyvern", TEAM.ENEMY, 0), createUnit("golem", TEAM.ENEMY, 1), createUnit("thunderroc", TEAM.ENEMY, 2)], reserve: [], statuses: [], tileEffects: [[], [], []] }
    },
    globalStatuses: [],
    confirmedCommands: [null, null, null],
    plannedActions: {},
    enemyPlannedActions: {},
    currentActorIndex: 0,
    selectedMoveId: null,
    selectedTargets: [],
    ui: {
      commandMode: "fight",
      previewTargets: [],
      selectedReserveIndex: null,
      selectedReplacementReserveIndex: null,
      selectedSwitchDestination: null,
      targetCandidates: [],
      fastForwardRequested: false
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
    displayState: {
      hpAnimations: {},
      hpDisplay: {},
      highlightActorId: null,
      highlightTargetId: null
    },
    log: [],
    temp: { renderCells: [] }
  });

  let gameState = createInitialState();

  const getTeamState = (state, team) => state.teams[team];
  const toBoardPos = (team, slot) => ({ x: slot, y: team === TEAM.ENEMY ? 0 : 1 });
  const inBounds = (pos) => pos.x >= 0 && pos.x < CONFIG.BOARD_COLS && pos.y >= 0 && pos.y < CONFIG.BOARD_ROWS;

  const getUnitAtFromState = (state, pos) => {
    if (!inBounds(pos)) return null;
    const team = pos.y === 0 ? TEAM.ENEMY : TEAM.ALLY;
    return state.teams[team].active[pos.x] || null;
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

  const getEffectiveStat = (unit, key) => {
    let value = unit[key];
    if (key === "atk" && findStatus(unit.statuses, "atkUp")) value = Math.floor(value * (1 + CONFIG.ATK_UP_RATIO));
    if (key === "def" && findStatus(unit.statuses, "defUp")) value = Math.floor(value * (1 + CONFIG.DEF_UP_RATIO));
    return value;
  };

  const calcDamage = (attacker, defender, move) => {
    const atk = getEffectiveStat(attacker, "atk") + Math.floor(move.power / 10);
    const def = getEffectiveStat(defender, "def");
    let dmg = Math.max(1, atk - def);
    if (findStatus(defender.statuses, "barrier")) dmg = Math.max(1, Math.floor(dmg * CONFIG.BARRIER_RATIO));
    return Math.min(dmg, defender.hp);
  };

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

    state.globalStatuses.forEach((status) => applyEffects(status.onEnter, STATUS_LABELS[status.kind] || status.kind));
    state.teams[team].statuses.forEach((status) => applyEffects(status.onEnter, STATUS_LABELS[status.kind] || status.kind));
    (state.teams[team].tileEffects?.[slot] || []).forEach((tileEffect) => applyEffects(tileEffect.onEnter, tileEffect.name || tileEffect.kind || "tile effect"));
    const ability = ABILITIES[unit.abilityId];
    applyEffects(ability?.onEnter, ability?.id || "ability", true);

    return { messages, statusApplies };
  };

  const getValidTargetsForMoveInState = (state, actor, move) => {
    const isRuleMatch = (targetUnit) => {
      if (!targetUnit || !isAlive(targetUnit)) return false;
      if (move.targetRule === "enemy") return targetUnit.team !== actor.team;
      if (move.targetRule === "selfOnly") return targetUnit.uid === actor.uid;
      if (move.targetRule === "allyOtherSingle") return targetUnit.team === actor.team && targetUnit.uid !== actor.uid;
      if (move.targetRule === "anyOtherSingle") return targetUnit.uid !== actor.uid;
      return true;
    };
    const actorPos = toBoardPos(actor.team, actor.slot);
    const orientation = actor.team === TEAM.ALLY ? 1 : -1;
    const offsets = patterns[move.patternId] || [];
    return offsets
      .map((o) => ({ x: actorPos.x + o.x, y: actorPos.y + (o.y * orientation) }))
      .filter(inBounds)
      .map((pos) => ({ pos, unit: getUnitAtFromState(state, pos) }))
      .filter(({ unit }) => isRuleMatch(unit))
      .map(({ pos, unit }) => ({ x: pos.x, y: pos.y, uid: unit.uid }));
  };

  const getPatternPositionsForMove = (actor, move) => {
    const actorPos = toBoardPos(actor.team, actor.slot);
    const orientation = actor.team === TEAM.ALLY ? 1 : -1;
    return (patterns[move.patternId] || [])
      .map((o) => ({ x: actorPos.x + o.x, y: actorPos.y + (o.y * orientation) }))
      .filter(inBounds);
  };

  const isRuleMatchAtPosition = (actor, move, targetUnit) => {
    if (!targetUnit || !isAlive(targetUnit)) return false;
    if (move.targetRule === "enemy") return targetUnit.team !== actor.team;
    if (move.targetRule === "selfOnly") return targetUnit.uid === actor.uid;
    if (move.targetRule === "allyOtherSingle") return targetUnit.team === actor.team && targetUnit.uid !== actor.uid;
    if (move.targetRule === "anyOtherSingle") return targetUnit.uid !== actor.uid;
    return true;
  };

  const isPlaybackBusy = () => gameState.battleFlow.mode === "playback" || gameState.battleFlow.mode === "resolve";

  const appendBattleLogEntry = (text) => {
    gameState.battleFlow.turnLogEntries.push(text);
    gameState.log.push({ title: `ターン ${Math.max(1, gameState.turn - 1)} ログ`, lines: [text] });
    if (gameState.log.length > CONFIG.MAX_LOG_LINES) gameState.log.splice(0, gameState.log.length - CONFIG.MAX_LOG_LINES);
  };

  const resolveTurn = () => {
    const sim = JSON.parse(JSON.stringify({ teams: gameState.teams, globalStatuses: gameState.globalStatuses }));
    const actions = [...Object.values(gameState.plannedActions), ...Object.values(gameState.enemyPlannedActions)];
    const speedSort = (a, b) => {
      const ua = sim.teams[a.team].active[a.slot];
      const ub = sim.teams[b.team].active[b.slot];
      const sa = ua ? ua.spd : -1;
      const sb = ub ? ub.spd : -1;
      if (sa !== sb) return sb - sa;
      if (a.team !== b.team) return byTeamOrder(a.team) - byTeamOrder(b.team);
      return a.slot - b.slot;
    };
    const switchActions = actions.filter((a) => a.type === "switch").sort(speedSort);
    const otherActions = actions.filter((a) => a.type !== "switch").sort(speedSort);

    const turnResult = {
      turnNumber: gameState.turn,
      startStepResults: { abilityStatuses: [] },
      actionResults: [],
      endStepResults: { poisonTicks: [], expiredStatuses: [], expiredFieldEffects: [] },
      nextState: { winner: null }
    };

    for (const team of [TEAM.ALLY, TEAM.ENEMY]) {
      sim.teams[team].active.forEach((unit) => {
        if (!unit || !isAlive(unit) || !unit.abilityId) return;
        const ability = ABILITIES[unit.abilityId];
        (ability?.onTurnStart || []).forEach((e) => {
          if (e.type !== "applyStatus") return;
          addStatus(unit, e.status, e.duration);
          turnResult.startStepResults.abilityStatuses.push({ targetId: unit.uid, targetName: unit.name, statusId: e.status, duration: e.duration, sourceName: unit.name });
        });
      });
    }

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
      teamState.active[slot] = reserve;
      reserve.slot = slot;
      clearSwitchFlags(reserve);
      teamState.reserve[reserveIndex] = outgoing;
      outgoing.slot = `r${reserveIndex}`;
      clearSwitchFlags(outgoing);
      const enter = resolveUnitOnEnterEffects({ state: sim, team: action.team, slot, unit: reserve });
      turnResult.actionResults.push({
        type: "switch",
        team: action.team,
        slot,
        reserveIn: { uid: reserve.uid, name: reserve.name, reserveIndex },
        reserveOut: { uid: outgoing.uid, name: outgoing.name },
        enterEffects: enter.messages,
        enterStatusApplies: enter.statusApplies
      });
    };

    switchActions.forEach(runSwitchAction);

    otherActions.forEach((action) => {
      const actor = sim.teams[action.team].active[action.slot];
      if (!actor || !isAlive(actor)) {
        turnResult.actionResults.push({ type: "skip", reason: "actorDown", actorId: actor?.uid, actorName: actor?.name || "不明" });
        return;
      }
      const move = MOVES[action.moveId];
      if (!move) return;
      const patternPositions = getPatternPositionsForMove(actor, move);
      const targets = move.targetMode === "single"
        ? (action.targetPos ? [{ x: action.targetPos.x, y: action.targetPos.y }] : [])
        : patternPositions;
      const actionResult = { type: "fight", team: action.team, actorId: actor.uid, actorName: actor.name, moveId: move.id, moveName: move.name, targets: [], selfHpBefore: actor.hp, selfHpAfter: actor.hp, selfHeal: 0 };

      targets.forEach((targetPos) => {
        if (!inBounds(targetPos)) return;
        if (!patternPositions.some((p) => p.x === targetPos.x && p.y === targetPos.y)) return;
        const target = getUnitAtFromState(sim, targetPos);
        if (!isRuleMatchAtPosition(actor, move, target)) return;
        const targetResult = { targetId: target.uid, targetName: target.name, hpBefore: target.hp, hpAfter: target.hp, damage: 0, effectiveness: "normal", appliedStatuses: [], defeated: false };

        move.beforeDamage.forEach((effect) => {
          if (effect.type === "applyStatus") {
            addStatus(target, effect.status, effect.duration);
            targetResult.appliedStatuses.push(effect.status);
          }
        });

        if (move.category === "attack") {
          const damage = calcDamage(actor, target, move);
          target.hp = clamp(target.hp - damage, 0, target.maxHp);
          targetResult.damage = damage;
          targetResult.hpAfter = target.hp;
        }

        move.afterDamage.forEach((effect) => {
          if (effect.type === "drain" && targetResult.damage > 0) {
            const heal = Math.max(1, Math.floor(targetResult.damage * effect.ratio));
            const before = actor.hp;
            actor.hp = clamp(actor.hp + heal, 0, actor.maxHp);
            actionResult.selfHeal += actor.hp - before;
          }
          if (effect.type === "applyStatus") {
            addStatus(target, effect.status, effect.duration);
            targetResult.appliedStatuses.push(effect.status);
          }
        });

        const ability = ABILITIES[actor.abilityId];
        (ability?.onAfterDamage || []).forEach((effect) => {
          if (effect.type === "applyStatus" && isAlive(target)) {
            addStatus(target, effect.status, effect.duration);
            targetResult.appliedStatuses.push(effect.status);
          }
        });

        targetResult.defeated = target.hp <= 0;
        actionResult.targets.push(targetResult);
      });

      actionResult.selfHpAfter = actor.hp;
      turnResult.actionResults.push(actionResult);
    });

    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      sim.teams[team].active.forEach((unit) => {
        if (!unit || !isAlive(unit)) return;
        if (findStatus(unit.statuses, "poison")) {
          const hpBefore = unit.hp;
          const dmg = Math.max(1, Math.floor(unit.maxHp * CONFIG.POISON_RATIO));
          unit.hp = clamp(unit.hp - dmg, 0, unit.maxHp);
          turnResult.endStepResults.poisonTicks.push({ targetId: unit.uid, targetName: unit.name, hpBefore, hpAfter: unit.hp, damage: hpBefore - unit.hp, defeated: unit.hp <= 0 });
        }
        unit.statuses.forEach((s) => { s.duration -= 1; });
        unit.statuses.filter((s) => s.duration <= 0).forEach((s) => turnResult.endStepResults.expiredStatuses.push({ ownerType: "unit", ownerId: unit.uid, ownerName: unit.name, statusId: s.kind }));
        unit.statuses = removeExpired(unit.statuses);
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
    turnResult.startStepResults.abilityStatuses.forEach((s) => {
      const text = STATUS_APPLY_TEXT[s.statusId]?.(s.targetName) || `${s.targetName}に ${s.statusId}！`;
      q.push({ type: "message", text, loggable: true });
      q.push({ type: "statusApply", targetId: s.targetId, statusId: s.statusId, duration: s.duration });
    });

    turnResult.actionResults.forEach((a) => {
      if (a.type === "skip") {
        q.push({ type: "message", text: `${a.actorName}は 行動できない！`, loggable: true });
        return;
      }
      if (a.type === "switch") {
        q.push({ type: "message", text: `${a.reserveOut.name}は 交代した！`, loggable: true });
        q.push({ type: "switchApply", ...a });
        q.push({ type: "message", text: `${a.reserveIn.name}が 場に出た！`, loggable: true });
        (a.enterStatusApplies || []).forEach((s) => q.push({ type: "statusApply", targetId: s.targetId, statusId: s.statusId, duration: s.duration }));
        a.enterEffects.forEach((line) => q.push({ type: "message", text: line, loggable: true }));
        q.push({ type: "wait", duration: CONFIG.WAIT_SHORT_MS });
        return;
      }

      q.push({ type: "highlightActor", actorId: a.actorId });
      q.push({ type: "message", text: `${a.actorName}の ${a.moveName}！`, loggable: true });
      a.targets.forEach((t) => {
        q.push({ type: "highlightTarget", targetId: t.targetId });
        if (t.damage > 0 || t.hpBefore !== t.hpAfter) q.push({ type: "hpAnimation", targetId: t.targetId, fromHp: t.hpBefore, toHp: t.hpAfter, duration: CONFIG.HP_ANIM_MS });
        t.appliedStatuses.forEach((statusId) => {
          const text = STATUS_APPLY_TEXT[statusId]?.(t.targetName) || `${t.targetName}に ${statusId}！`;
          q.push({ type: "message", text, loggable: true });
          q.push({ type: "statusApply", targetId: t.targetId, statusId });
        });
        if (t.defeated) q.push({ type: "message", text: `${t.targetName}は たおれた！`, loggable: true });
      });
      if (a.selfHeal > 0) q.push({ type: "hpAnimation", targetId: a.actorId, fromHp: a.selfHpBefore, toHp: a.selfHpAfter, duration: CONFIG.HP_ANIM_MS });
      q.push({ type: "wait", duration: CONFIG.WAIT_SHORT_MS });
    });

    turnResult.endStepResults.poisonTicks.forEach((p) => {
      q.push({ type: "message", text: `${p.targetName}は どくの ダメージを うけた！`, loggable: true });
      q.push({ type: "hpAnimation", targetId: p.targetId, fromHp: p.hpBefore, toHp: p.hpAfter, duration: CONFIG.HP_ANIM_MS });
      if (p.defeated) q.push({ type: "message", text: `${p.targetName}は たおれた！`, loggable: true });
    });

    turnResult.endStepResults.expiredStatuses.forEach((s) => {
      const text = STATUS_FADE_TEXT[s.statusId]?.(s.ownerName) || `${s.ownerName}の ${s.statusId}が切れた。`;
      q.push({ type: "message", text, loggable: true });
      if (s.ownerType === "unit") q.push({ type: "statusRemove", targetId: s.ownerId, statusId: s.statusId });
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
    unit.statuses = unit.statuses.filter((s) => s.kind !== statusId);
  };

  const applySwitchResult = (event) => {
    const teamState = gameState.teams[event.team];
    const reserveIndex = teamState.reserve.findIndex((unit) => unit?.uid === event.reserveIn.uid);
    if (reserveIndex < 0) return;

    const reserve = teamState.reserve[reserveIndex];
    const outgoing = teamState.active[event.slot] || null;

    if (outgoing) {
      clearSwitchSensitiveStatuses(outgoing);
      delete gameState.displayState.hpDisplay[outgoing.uid];
      delete gameState.displayState.hpAnimations[outgoing.uid];
    }

    teamState.active[event.slot] = reserve;
    reserve.slot = event.slot;
    clearSwitchFlags(reserve);
    gameState.displayState.hpDisplay[reserve.uid] = reserve.hp;
    delete gameState.displayState.hpAnimations[reserve.uid];

    teamState.reserve[reserveIndex] = outgoing;
    if (outgoing) {
      outgoing.slot = `r${reserveIndex}`;
      clearSwitchFlags(outgoing);
    }
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
    if (event.type === "highlightActor") {
      gameState.displayState.highlightActorId = event.actorId;
      gameState.battleFlow.waitUntil = now + (CONFIG.HIGHLIGHT_MS / gameState.battleFlow.playbackSpeed);
      return;
    }
    if (event.type === "highlightTarget") {
      gameState.displayState.highlightTargetId = event.targetId;
      gameState.battleFlow.waitUntil = now + (CONFIG.HIGHLIGHT_MS / gameState.battleFlow.playbackSpeed);
      return;
    }
    if (event.type === "hpAnimation") {
      animateHpChange(event.targetId, event.fromHp, event.toHp, event.duration || CONFIG.HP_ANIM_MS);
      const unit = getUnitByUid(event.targetId);
      if (unit) unit.hp = event.toHp;
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
    if (event.type === "turnSeparator") {
      gameState.displayState.highlightActorId = null;
      gameState.displayState.highlightTargetId = null;
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

  const updateBattlePlayback = (now) => {
    const flow = gameState.battleFlow;
    const event = flow.eventQueue[flow.currentEventIndex];

    if (!event) {
      if (flow.pendingTurnResult?.nextState?.winner) {
        gameState.phase = PHASE.GAMEOVER;
        gameState.winner = flow.pendingTurnResult.nextState.winner;
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

    if (event.type === "wait" || event.type === "highlightActor" || event.type === "highlightTarget") {
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
  };

  const getCurrentPlaybackMessage = () => gameState.battleFlow.currentMessage;

  const getCurrentActor = () => gameState.teams.ally.active[gameState.currentActorIndex] || null;
  const getSelectedMove = () => MOVES[gameState.selectedMoveId] || null;

  const findNextLivingAllySlot = (from = -1) => {
    for (let i = from + 1; i < CONFIG.BOARD_COLS; i += 1) if (isAlive(gameState.teams.ally.active[i])) return i;
    return null;
  };

  const clearTargetPreview = () => {
    gameState.selectedMoveId = null;
    gameState.selectedTargets = [];
    gameState.ui.previewTargets = [];
    gameState.ui.targetCandidates = [];
    gameState.ui.selectedReserveIndex = null;
    gameState.ui.selectedReplacementReserveIndex = null;
    gameState.ui.selectedSwitchDestination = null;
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
    gameState.ui.selectedReplacementReserveIndex = null;
    gameState.ui.commandMode = "fight";
    appendBattleLogEntry(`— ${team === TEAM.ALLY ? "Ally" : "Enemy"} KO Replacement —`);
  };

  const applyKoReplacement = ({ team, reserveIndex, slot, withLog = true }) => {
    const teamState = gameState.teams[team];
    const reserve = teamState.reserve[reserveIndex];
    const current = teamState.active[slot];
    if (!reserve || !current || !isDefeated(current) || !isAlive(reserve)) return false;
    teamState.active[slot] = reserve;
    reserve.slot = slot;
    clearSwitchFlags(reserve);
    teamState.reserve.splice(reserveIndex, 1);
    const enter = resolveUnitOnEnterEffects({ state: gameState, team, slot, unit: reserve });
    if (withLog) {
      appendBattleLogEntry(`[${reserve.name}] entered the battle!`);
      enter.messages.forEach((line) => appendBattleLogEntry(line));
    }
    return { enteredUnit: reserve, enterMessages: enter.messages };
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
    gameState.confirmedCommands = [null, null, null];
    clearTargetPreview();
    autoResolveKoReplacementsForTeam(TEAM.ENEMY);
    if (getPendingKoReplacementSlots(TEAM.ALLY).length) {
      startKoReplacementPhase(TEAM.ALLY);
      return;
    }
    const winner = getWinnerFromRemainingUnits(gameState);
    if (winner) {
      gameState.phase = PHASE.GAMEOVER;
      gameState.winner = winner;
      return;
    }
    initializePlanningTurn();
    if (gameState.turn > CONFIG.MAX_TURNS && gameState.phase !== PHASE.GAMEOVER) {
      gameState.phase = PHASE.GAMEOVER;
      gameState.winner = "draw";
    }
  };

  const initializePlanningTurn = () => {
    const first = findNextLivingAllySlot(-1);
    if (first === null) return;
    gameState.currentActorIndex = first;
    clearTargetPreview();
    gameState.ui.commandMode = "fight";
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
    if (move.category !== "attack") return { score: 2, dmg: 0 };
    const dmg = calcDamage(actor, target, move);
    return { score: dmg >= target.hp ? 999 + dmg : dmg, dmg };
  };

  const chooseEnemyAction = (slot) => {
    const actor = gameState.teams.enemy.active[slot];
    if (!actor || !isAlive(actor)) return null;
    let best = null;
    actor.moveIds.forEach((moveId) => {
      const move = MOVES[moveId];
      const cands = getValidTargetsForMoveInState(gameState, actor, move);
      if (move.targetMode === "single") {
        cands.forEach((c) => {
          const s = scoreAction({ actor, move, target: getUnitAtFromState(gameState, { x: c.x, y: c.y }) });
          if (!best || s.score > best.score) best = { moveId, targetPos: { x: c.x, y: c.y }, score: s.score };
        });
      } else {
        const score = cands.reduce((sum, c) => sum + calcDamage(actor, getUnitAtFromState(gameState, { x: c.x, y: c.y }), move), 0);
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
    gameState.confirmedCommands.forEach((c, i) => { if (c?.action) out[i] = { ...c.action }; });
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
    gameState.ui.commandMode = mode;
    clearTargetPreview();
  };

  const setFightMove = (moveId) => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy() || isKoReplacementPhase()) return;
    const actor = getCurrentActor();
    if (!actor || !isAlive(actor)) return;
    const move = MOVES[moveId];
    const cands = getValidTargetsForMoveInState(gameState, actor, move);
    gameState.selectedMoveId = moveId;
    gameState.ui.previewTargets = cands.map((c) => ({ x: c.x, y: c.y }));
    gameState.ui.targetCandidates = cands;
  };

  const createConfirmedFightCommand = ({ slot, actor, move, targets }) => ({
    actorId: actor.uid,
    actorName: actor.name,
    moveId: move.id,
    moveName: move.name,
    targetType: move.targetMode === "single" ? "単体" : "範囲",
    targetNames: targets.map((t) => t.name),
    action: { type: "fight", team: TEAM.ALLY, slot, moveId: move.id, targetPos: move.targetMode === "single" ? toBoardPos(targets[0].team, targets[0].slot) : null }
  });

  const confirmCurrentFightAction = ({ slot, move, targetPos }) => {
    const actor = gameState.teams.ally.active[slot];
    if (!actor) return;
    const targets = move.targetMode === "single"
      ? [getUnitAtFromState(gameState, targetPos)].filter(Boolean)
      : gameState.ui.targetCandidates.map((c) => getUnitAtFromState(gameState, { x: c.x, y: c.y })).filter(Boolean);
    if (!targets.length) return;

    gameState.confirmedCommands[slot] = createConfirmedFightCommand({ slot, actor, move, targets });
    if (!advancePlanningSlot()) queueTurnResolution();
  };

  const chooseFightTarget = (x, y) => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy()) return;
    if (isKoReplacementPhase()) {
      const pending = gameState.battleFlow.koReplacement.pendingSlots;
      if (gameState.battleFlow.koReplacement.activeTeam !== TEAM.ALLY) return;
      if (y !== 1 || !pending.includes(x) || gameState.ui.selectedReplacementReserveIndex === null) return;
      const reserveIndex = gameState.ui.selectedReplacementReserveIndex;
      const reserve = gameState.teams.ally.reserve[reserveIndex];
      if (!reserve || !isAlive(reserve)) return;
      const result = applyKoReplacement({ team: TEAM.ALLY, reserveIndex, slot: x, withLog: true });
      if (!result) return;
      gameState.ui.selectedReplacementReserveIndex = null;
      gameState.battleFlow.koReplacement.pendingSlots = getPendingKoReplacementSlots(TEAM.ALLY);
      if (!gameState.battleFlow.koReplacement.pendingSlots.length) {
        const winner = getWinnerFromRemainingUnits(gameState);
        if (winner) {
          gameState.phase = PHASE.GAMEOVER;
          gameState.winner = winner;
          return;
        }
        gameState.battleFlow.mode = "command";
        gameState.battleFlow.currentMessage = "わざを選んでください。";
        initializePlanningTurn();
      }
      return;
    }
    const move = getSelectedMove();
    if (!move) return;
    if (!gameState.ui.targetCandidates.find((c) => c.x === x && c.y === y)) return;
    confirmCurrentFightAction({ slot: gameState.currentActorIndex, move, targetPos: move.targetMode === "single" ? { x, y } : null });
  };

  const chooseReserve = (reserveIndex) => {
    if (isPlaybackBusy()) return;
    if (isKoReplacementPhase()) {
      const reserve = gameState.teams.ally.reserve[reserveIndex];
      if (!reserve || !isAlive(reserve)) return;
      gameState.ui.selectedReplacementReserveIndex = reserveIndex;
      return;
    }
    const reserve = gameState.teams.ally.reserve[reserveIndex];
    if (!reserve) return;
    const alreadyPickedTargetIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.switchTargetId);
    const switchingActorIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.actorId);
    if (alreadyPickedTargetIds.includes(reserve.uid)) return;
    if (switchingActorIds.includes(reserve.uid)) return;
    gameState.ui.selectedReserveIndex = reserveIndex;
  };

  const confirmCurrentSwitchAction = () => {
    if (gameState.phase !== PHASE.PLAYING || isPlaybackBusy() || isKoReplacementPhase()) return;
    const actor = getCurrentActor();
    if (!actor || !isAlive(actor) || gameState.ui.selectedReserveIndex === null) return;
    const state = getStatusState(actor);
    if (!state.canSwitch) return;
    const reserve = gameState.teams.ally.reserve[gameState.ui.selectedReserveIndex];
    if (!reserve) return;
    const alreadyPickedTargetIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.switchTargetId);
    const switchingActorIds = gameState.confirmedCommands
      .map((c) => c?.action)
      .filter((a) => a?.type === "switch")
      .map((a) => a.actorId);
    if (alreadyPickedTargetIds.includes(reserve.uid) || switchingActorIds.includes(reserve.uid)) return;
    gameState.confirmedCommands[gameState.currentActorIndex] = {
      actorId: actor.uid,
      actorName: actor.name,
      moveId: "switch",
      moveName: `Switch → ${reserve.name}`,
      targetType: "交代",
      targetNames: reserve ? [reserve.name] : [],
      action: { type: "switch", team: TEAM.ALLY, slot: gameState.currentActorIndex, actorId: actor.uid, switchTargetId: reserve.uid }
    };
    if (!advancePlanningSlot()) queueTurnResolution();
  };

  const canCancelSelection = () => gameState.ui.commandMode === "fight" && (!!gameState.selectedMoveId || gameState.selectedTargets.length > 0);
  const canUndoPreviousCommand = () => !isKoReplacementPhase() && gameState.confirmedCommands.some(Boolean);

  const cancelCurrentSelection = () => {
    if (!canCancelSelection() || isPlaybackBusy()) return;
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
      gameState.currentActorIndex = i;
      clearTargetPreview();
      gameState.ui.commandMode = "fight";
      return;
    }
  };

  const resetBattle = () => {
    gameState = createInitialState();
    initializePlanningTurn();
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

  const createImageWithFallback = ({ src, alt, mirror = false, wrapperClass = "portrait-wrap", placeholderLabel = "画像なし", placeholderSubLabel = "NO SIGNAL" }) => {
    const wrap = createEl("div", `${wrapperClass}${mirror ? " mirror" : ""}`);
    const img = document.createElement("img");
    img.alt = alt;
    img.src = src;
    img.loading = "lazy";
    const placeholder = createEl("div", "img-placeholder");
    placeholder.append(createEl("div", "img-placeholder-label", placeholderLabel), createEl("div", "img-placeholder-sub", placeholderSubLabel));
    img.onerror = () => { img.style.display = "none"; placeholder.style.display = "flex"; };
    wrap.append(img, placeholder);
    return wrap;
  };

  const applyBoardBackgroundWithFallback = (boardEl, src) => {
    const gradient = "linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.2))";
    boardEl.style.backgroundImage = gradient;
    if (!src) return;
    const bg = new Image();
    bg.onload = () => { boardEl.style.backgroundImage = `${gradient}, url('${src}')`; };
    bg.onerror = () => { boardEl.style.backgroundImage = gradient; };
    bg.src = src;
  };

  const clearTempArrays = () => { gameState.temp.renderCells.length = 0; };

  const formatEnemyHpPercent = (unit, hp) => `${Math.round((hp / unit.maxHp) * 100)}%`;
  const formatAllyHp = (unit, hp) => `${hp} / ${unit.maxHp}`;

  const getDisplayHp = (unit) => gameState.displayState.hpDisplay[unit.uid] ?? unit.hp;
  const statusText = (s) => `${STATUS_LABELS[s.kind] || s.kind}（${s.duration}T）`;

  const getNavigationMessageText = () => {
    if (gameState.phase === PHASE.GAMEOVER) return "バトル終了。";
    if (isPlaybackBusy()) return getCurrentPlaybackMessage() || "戦闘演出中…";
    if (isKoReplacementPhase()) return "Choose a reserve monster to replace a defeated ally.";
    if (gameState.ui.commandMode === "switch") return gameState.ui.selectedReserveIndex === null ? "交代する控えを選んでください。" : "選択中の交代先で確定してください。";
    if (!getSelectedMove()) return "わざを選んでください。";
    return getSelectedMove().targetMode === "single" ? "ハイライトされたマスから対象を選んでください。" : "このわざはハイライト対象全員に当たります。";
  };

  const renderBattleMessageBox = () => {
    const nav = createEl("button", "nav-message");
    nav.dataset.action = "fast-forward";
    nav.disabled = !isPlaybackBusy();
    nav.appendChild(createEl("div", "nav-message-text", getNavigationMessageText()));
    return nav;
  };

  const renderBattleLogPanel = () => {
    const log = createEl("div", "log");
    gameState.log.forEach((entry) => {
      const card = createEl("article", "log-entry neutral");
      card.appendChild(createEl("div", "log-title", entry.title));
      const body = createEl("div", "log-lines");
      (entry.lines || []).forEach((line) => body.appendChild(createEl("div", "log-line", line)));
      card.appendChild(body);
      log.appendChild(card);
    });
    return log;
  };

  const renderMiniBattleUnit = (unit, mirror = false) => {
    const mini = createImageWithFallback({ src: getAssetPath("portraits", unit.portrait), alt: unit.name, mirror });
    mini.classList.add("mini-portrait");
    return mini;
  };

  const renderBoardCell = (x, y) => {
    const cell = createEl("div", "cell");
    const unit = getUnitAtFromState(gameState, { x, y });
    const showPreview = gameState.phase === PHASE.PLAYING && !isPlaybackBusy();
    const candidate = showPreview && gameState.ui.previewTargets.some((c) => c.x === x && c.y === y);
    const replacementCandidate = isKoReplacementPhase()
      && gameState.battleFlow.koReplacement.activeTeam === TEAM.ALLY
      && y === 1
      && gameState.battleFlow.koReplacement.pendingSlots.includes(x);
    if (candidate) cell.classList.add(y === 0 ? "valid-enemy" : "valid-ally");
    if (replacementCandidate) cell.classList.add("valid-ally", "replacement-target");
    if (isPlaybackBusy() && (gameState.displayState.highlightActorId || gameState.displayState.highlightTargetId)) {
      if (unit?.uid === gameState.displayState.highlightActorId) cell.classList.add("active-actor");
      if (unit?.uid === gameState.displayState.highlightTargetId) cell.classList.add("targeted");
    } else if (replacementCandidate && gameState.ui.selectedReplacementReserveIndex !== null) {
      cell.classList.add("targeted");
    } else if (gameState.phase === PHASE.PLAYING && y === 1 && x === gameState.currentActorIndex) {
      cell.classList.add("active-actor");
    }

    cell.dataset.action = "target-cell";
    cell.dataset.x = String(x);
    cell.dataset.y = String(y);

    if (!unit) {
      cell.classList.add("empty");
      cell.append(createEl("div", "mini", "—"), createEl("div", "mini", "待機マス"));
      return cell;
    }

    cell.appendChild(renderMiniBattleUnit(unit, unit.team === TEAM.ALLY));
    const main = createEl("div", "cell-unit-main");
    const hp = getDisplayHp(unit);
    const hpPct = Math.round((hp / unit.maxHp) * 100);
    main.appendChild(createEl("div", "cell-name", unit.name));
    main.appendChild(createEl("div", "cell-hp", `HP ${unit.team === TEAM.ENEMY ? formatEnemyHpPercent(unit, hp) : formatAllyHp(unit, hp)}`));
    const bar = createEl("div", "hp-bar");
    const fill = createEl("div", "hp-bar-fill");
    fill.style.width = `${hpPct}%`;
    bar.appendChild(fill);
    main.appendChild(bar);
    main.appendChild(createEl("div", "mini", unit.statuses.map(statusText).join(" ") || "状態なし"));
    cell.appendChild(main);
    return cell;
  };

  const renderCommandArea = () => {
    const wrap = createEl("div", "command");
    if (isPlaybackBusy()) wrap.classList.add("disabled");
    const actor = getCurrentActor();
    if (isKoReplacementPhase()) {
      wrap.appendChild(createEl("h3", "", "KO交代フェーズ"));
      wrap.appendChild(createEl("div", "mini", "Choose a reserve monster to replace a defeated ally."));
      const switches = createEl("div", "switches");
      gameState.teams.ally.reserve.forEach((u, idx) => {
        const btn = createEl("button", `reserve-card${gameState.ui.selectedReplacementReserveIndex === idx ? " active" : ""}`);
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
    const fight = createEl("button", `action-btn${gameState.ui.commandMode === "fight" ? " active" : ""}`, "たたかう");
    fight.dataset.action = "mode-fight";
    fight.disabled = isPlaybackBusy();
    const sw = createEl("button", `action-btn${gameState.ui.commandMode === "switch" ? " active" : ""}`, "こうたい");
    sw.dataset.action = "mode-switch";
    const actorStatusState = actor ? getStatusState(actor) : { canSwitch: false, statuses: [] };
    sw.disabled = isPlaybackBusy() || !actorStatusState.canSwitch;
    actions.append(fight, sw);
    wrap.appendChild(actions);
    if (actor && !actorStatusState.canSwitch) {
      wrap.appendChild(createEl("div", "mini", "Cannot switch (Bound)"));
    }

    const controls = createEl("div", "actions");
    const cancel = createEl("button", "action-btn", "キャンセル");
    cancel.dataset.action = "cancel-selection";
    cancel.disabled = !canCancelSelection() || isPlaybackBusy();
    const undo = createEl("button", "action-btn", "前の選択に戻る");
    undo.dataset.action = "undo-command";
    undo.disabled = !canUndoPreviousCommand() || isPlaybackBusy();
    controls.append(cancel, undo);
    wrap.appendChild(controls);

    if (gameState.ui.commandMode === "fight" && actor) {
      const moves = createEl("div", "moves");
      actor.moveIds.forEach((moveId) => {
        const move = MOVES[moveId];
        const btn = createEl("button", `move ${move.category} type-${move.type}${gameState.selectedMoveId === moveId ? " active" : ""}`);
        btn.dataset.action = "pick-move";
        btn.dataset.moveId = moveId;
        btn.disabled = isPlaybackBusy();
        btn.appendChild(createEl("div", "move-name", move.name));
        moves.appendChild(btn);
      });
      wrap.appendChild(moves);
    }

    if (gameState.ui.commandMode === "switch") {
      const switches = createEl("div", "switches");
      const alreadyPickedTargetIds = gameState.confirmedCommands
        .map((c) => c?.action)
        .filter((a) => a?.type === "switch")
        .map((a) => a.switchTargetId);
      const switchingActorIds = gameState.confirmedCommands
        .map((c) => c?.action)
        .filter((a) => a?.type === "switch")
        .map((a) => a.actorId);
      gameState.teams.ally.reserve.forEach((u, idx) => {
        const btn = createEl("button", `reserve-card${gameState.ui.selectedReserveIndex === idx ? " active" : ""}`);
        btn.dataset.action = "pick-reserve";
        btn.dataset.reserveIndex = String(idx);
        const blocked = !u || alreadyPickedTargetIds.includes(u.uid) || switchingActorIds.includes(u.uid);
        btn.disabled = blocked || isPlaybackBusy();
        btn.appendChild(createEl("div", "name", u ? u.name : "空き"));
        switches.appendChild(btn);
      });
      wrap.appendChild(switches);

      const dests = createEl("div", "destinations");
      const btn = createEl("button", "dest-btn", "交代を確定");
      btn.dataset.action = "pick-destination";
      btn.dataset.toSlot = String(gameState.currentActorIndex);
      btn.disabled = isPlaybackBusy() || gameState.ui.selectedReserveIndex === null || !actorStatusState.canSwitch;
      dests.appendChild(btn);
      wrap.appendChild(dests);
    }

    return wrap;
  };

  const renderCommandSummaryCards = () => {
    const plans = createEl("div", "command-summary");
    for (let i = 0; i < CONFIG.BOARD_COLS; i += 1) {
      const box = createEl("div", "summary-card");
      const unit = gameState.teams.ally.active[i];
      const cmd = gameState.confirmedCommands[i];
      box.appendChild(createEl("div", "summary-title", `${i + 1}. ${unit ? unit.name : "-"}`));
      if (cmd?.action?.type === "switch") {
        box.appendChild(createEl("div", "summary-line", cmd.moveName));
        box.appendChild(createEl("div", "summary-line", "対象: 自身スロット"));
      } else {
        box.appendChild(createEl("div", "summary-line", `技: ${cmd?.moveName || "未選択"}`));
        box.appendChild(createEl("div", "summary-line", `対象: ${cmd?.targetNames?.join("、") || "未選択"}`));
      }
      plans.appendChild(box);
    }
    return plans;
  };

  const renderSidebar = () => {
    const side = createEl("div", "sidebar");
    side.appendChild(createEl("div", "stats", `ターン ${gameState.turn} | フェーズ: ${gameState.phase}`));
    const footer = createEl("div", "footer");
    const reset = createEl("button", "", "リセット");
    reset.dataset.action = "reset";
    footer.appendChild(reset);
    if (gameState.phase === PHASE.GAMEOVER) footer.appendChild(createEl("div", "stats", `勝者: ${gameState.winner}`));
    side.appendChild(footer);
    side.appendChild(renderBattleLogPanel());
    return side;
  };

  const render = () => {
    clearTempArrays();
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.style.setProperty("--detail-h", `${CONFIG.MOVE_DETAIL_PANEL_HEIGHT}px`);
    app.style.setProperty("--summary-h", `${CONFIG.SUMMARY_PANEL_HEIGHT}px`);

    const main = createEl("div", "main");
    const board = createEl("div", "board");
    applyBoardBackgroundWithFallback(board, gameState.battlefield.background);
    for (let y = 0; y < CONFIG.BOARD_ROWS; y += 1) for (let x = 0; x < CONFIG.BOARD_COLS; x += 1) board.appendChild(renderBoardCell(x, y));
    main.appendChild(board);
    main.appendChild(renderBattleMessageBox());
    if (gameState.phase !== PHASE.GAMEOVER) {
      main.appendChild(renderCommandArea());
      if (!isKoReplacementPhase()) main.appendChild(renderCommandSummaryCards());
    }
    app.append(main, renderSidebar());
  };

  const update = (now) => {
    const hasHpAnimations = Object.keys(gameState.displayState.hpAnimations).length > 0;
    const hasPlayback = gameState.phase === PHASE.PLAYING && gameState.battleFlow.mode === "playback";
    if (!hasHpAnimations && !hasPlayback) return;
    updateHpAnimations(now);
    if (hasPlayback) updateBattlePlayback(now);
    render();
  };

  const loop = (now) => {
    update(now);
    requestAnimationFrame(loop);
  };

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const a = target.dataset.action;
    if (a === "reset") dispatch({ type: "RESET" });
    if (a === "mode-fight") dispatch({ type: "MODE", mode: "fight" });
    if (a === "mode-switch") dispatch({ type: "MODE", mode: "switch" });
    if (a === "pick-move") dispatch({ type: "MOVE", moveId: target.dataset.moveId });
    if (a === "target-cell") dispatch({ type: "TARGET", x: Number(target.dataset.x), y: Number(target.dataset.y) });
    if (a === "pick-reserve") dispatch({ type: "RESERVE", reserveIndex: Number(target.dataset.reserveIndex) });
    if (a === "pick-destination") dispatch({ type: "DEST", toSlot: Number(target.dataset.toSlot) });
    if (a === "cancel-selection") dispatch({ type: "CANCEL" });
    if (a === "undo-command") dispatch({ type: "UNDO" });
    if (a === "fast-forward") dispatch({ type: "FAST_FORWARD" });
  });

  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && isPlaybackBusy()) {
      event.preventDefault();
      dispatch({ type: "FAST_FORWARD" });
    }
  });

  initializePlanningTurn();
  render();
  requestAnimationFrame(loop);
})();
