(() => {
  "use strict";

  // ------------------------------------------------------------
  // 1) config / constants
  // ------------------------------------------------------------
  const CONFIG = {
    BOARD_COLS: 3,
    BOARD_ROWS: 2,
    MAX_LOG_LINES: 120,
    MAX_TURNS: 60,
    POISON_RATIO: 0.1,
    BARRIER_RATIO: 0.5,
    ATK_UP_RATIO: 0.25,
    DEF_UP_RATIO: 0.25,
    LEVEL: 50,
    TIEBREAKER_TEAM_ORDER: ["ally", "enemy"]
  };

  const TEAM = {
    ALLY: "ally",
    ENEMY: "enemy"
  };

  const PHASE = {
    START: "start",
    PLAYING: "playing",
    GAMEOVER: "gameover"
  };

  // ------------------------------------------------------------
  // 2) assets
  // ------------------------------------------------------------
  const ASSETS = {
    backgrounds: {
      battle: "/assets/backgrounds/background_battle.jpg"
    },
    icons: {
      attack: "/assets/icons/icon_attack.png",
      status: "/assets/icons/icon_status.png"
    },
    portraits: {
      emberlynx: "/assets/portraits/ally_emberlynx.png",
      mossblob: "/assets/portraits/ally_mossblob.png",
      frostfang: "/assets/portraits/ally_frostfang.png",
      stormimp: "/assets/portraits/ally_stormimp.png",
      ironboar: "/assets/portraits/ally_ironboar.png",
      wyvern: "/assets/portraits/enemy_wyvern.png",
      golem: "/assets/portraits/enemy_golem.png",
      thunderroc: "/assets/portraits/enemy_thunderroc.png",
      venomtoad: "/assets/portraits/enemy_venomtoad.png",
      duskmoth: "/assets/portraits/enemy_duskmoth.png"
    }
  };

  const getAssetPath = (type, key) => {
    if (!ASSETS[type]) return "";
    return ASSETS[type][key] || "";
  };

  // ------------------------------------------------------------
  // 3) game data definitions
  // ------------------------------------------------------------
  const patterns = {
    front: [{ x: 0, y: -1 }],
    front3: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
    adjacentEnemy: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
    allyLine: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
    self: [{ x: 0, y: 0 }],
    all: [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }
    ]
  };

  const MOVES = {
    clawStrike: {
      id: "clawStrike", name: "Claw Strike", category: "attack", type: "fire", power: 32,
      patternId: "adjacentEnemy", targetRule: "enemy", targetMode: "single",
      beforeDamage: [], afterDamage: []
    },
    drainBite: {
      id: "drainBite", name: "Drain Bite", category: "attack", type: "nature", power: 28,
      patternId: "front", targetRule: "enemy", targetMode: "single",
      beforeDamage: [], afterDamage: [{ type: "drain", ratio: 0.5 }]
    },
    quakeWave: {
      id: "quakeWave", name: "Quake Wave", category: "attack", type: "earth", power: 24,
      patternId: "front3", targetRule: "enemy", targetMode: "allPattern",
      beforeDamage: [], afterDamage: []
    },
    frostLance: {
      id: "frostLance", name: "Frost Lance", category: "attack", type: "water", power: 34,
      patternId: "adjacentEnemy", targetRule: "enemy", targetMode: "single",
      beforeDamage: [], afterDamage: []
    },
    toxicSpit: {
      id: "toxicSpit", name: "Toxic Spit", category: "attack", type: "shadow", power: 18,
      patternId: "adjacentEnemy", targetRule: "enemy", targetMode: "single",
      beforeDamage: [], afterDamage: []
    },
    ironGuard: {
      id: "ironGuard", name: "Iron Guard", category: "status", type: "earth", power: 0,
      patternId: "self", targetRule: "ally", targetMode: "single",
      beforeDamage: [{ type: "applyStatus", status: "barrier", duration: 2 }],
      afterDamage: []
    },
    rallyHowl: {
      id: "rallyHowl", name: "Rally Howl", category: "status", type: "light", power: 0,
      patternId: "allyLine", targetRule: "ally", targetMode: "allPattern",
      beforeDamage: [{ type: "applyStatus", status: "atkUp", duration: 2 }],
      afterDamage: []
    },
    shellStance: {
      id: "shellStance", name: "Shell Stance", category: "status", type: "water", power: 0,
      patternId: "self", targetRule: "ally", targetMode: "single",
      beforeDamage: [{ type: "applyStatus", status: "defUp", duration: 2 }],
      afterDamage: []
    },
    venomBless: {
      id: "venomBless", name: "Venom Bless", category: "status", type: "shadow", power: 0,
      patternId: "self", targetRule: "ally", targetMode: "single",
      beforeDamage: [{ type: "applyStatus", status: "atkUp", duration: 2 }],
      afterDamage: []
    }
  };

  const STATUSES = {
    poison: { kind: "poison", category: "dot", duration: 3, tags: ["poison"] },
    barrier: { kind: "barrier", category: "barrier", duration: 2, tags: ["barrier"] },
    atkUp: { kind: "atkUp", category: "buffAtk", duration: 2, tags: ["buff", "atk"] },
    defUp: { kind: "defUp", category: "buffDef", duration: 2, tags: ["buff", "def"] }
  };

  const ABILITIES = {
    venomTouch: {
      id: "venomTouch",
      onAfterDamage: [{ type: "applyStatus", status: "poison", duration: 2 }]
    },
    guardianPulse: {
      id: "guardianPulse",
      onTurnStart: [{ type: "applyStatus", status: "barrier", duration: 1, target: "self" }]
    }
  };

  const UNIT_LIBRARY = {
    emberlynx: { id: "emberlynx", name: "Ember Lynx", portrait: "emberlynx", hp: 88, atk: 38, def: 22, spd: 35, abilityId: "venomTouch", moves: ["clawStrike", "drainBite", "rallyHowl", "shellStance"] },
    mossblob: { id: "mossblob", name: "Moss Blob", portrait: "mossblob", hp: 96, atk: 28, def: 30, spd: 18, abilityId: "guardianPulse", moves: ["quakeWave", "drainBite", "ironGuard", "shellStance"] },
    frostfang: { id: "frostfang", name: "Frost Fang", portrait: "frostfang", hp: 82, atk: 34, def: 24, spd: 37, abilityId: null, moves: ["frostLance", "clawStrike", "rallyHowl", "shellStance"] },
    stormimp: { id: "stormimp", name: "Storm Imp", portrait: "stormimp", hp: 70, atk: 30, def: 18, spd: 42, abilityId: null, moves: ["toxicSpit", "clawStrike", "venomBless", "ironGuard"] },
    ironboar: { id: "ironboar", name: "Iron Boar", portrait: "ironboar", hp: 108, atk: 36, def: 34, spd: 15, abilityId: "guardianPulse", moves: ["quakeWave", "clawStrike", "ironGuard", "rallyHowl"] },
    wyvern: { id: "wyvern", name: "Blue Wyvern", portrait: "wyvern", hp: 90, atk: 37, def: 23, spd: 33, abilityId: null, moves: ["clawStrike", "drainBite", "rallyHowl", "shellStance"] },
    golem: { id: "golem", name: "Rock Golem", portrait: "golem", hp: 110, atk: 35, def: 36, spd: 12, abilityId: "guardianPulse", moves: ["quakeWave", "ironGuard", "shellStance", "clawStrike"] },
    thunderroc: { id: "thunderroc", name: "Thunder Roc", portrait: "thunderroc", hp: 85, atk: 34, def: 21, spd: 39, abilityId: null, moves: ["frostLance", "clawStrike", "toxicSpit", "venomBless"] },
    venomtoad: { id: "venomtoad", name: "Venom Toad", portrait: "venomtoad", hp: 92, atk: 29, def: 27, spd: 20, abilityId: "venomTouch", moves: ["toxicSpit", "drainBite", "ironGuard", "rallyHowl"] },
    duskmoth: { id: "duskmoth", name: "Dusk Moth", portrait: "duskmoth", hp: 74, atk: 32, def: 19, spd: 41, abilityId: null, moves: ["toxicSpit", "frostLance", "venomBless", "shellStance"] }
  };

  // ------------------------------------------------------------
  // 4) state creation / reset
  // ------------------------------------------------------------
  let UID_COUNTER = 1;

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
      statuses: []
    };
  };

  const createInitialState = () => ({
    phase: PHASE.START,
    turn: 1,
    winner: null,
    battlefield: {
      background: getAssetPath("backgrounds", "battle"),
      grid: { cols: CONFIG.BOARD_COLS, rows: CONFIG.BOARD_ROWS }
    },
    teams: {
      ally: {
        key: TEAM.ALLY,
        active: [createUnit("emberlynx", TEAM.ALLY, 0), createUnit("mossblob", TEAM.ALLY, 1), createUnit("frostfang", TEAM.ALLY, 2)],
        reserve: [createUnit("stormimp", TEAM.ALLY, "r0"), createUnit("ironboar", TEAM.ALLY, "r1")],
        statuses: []
      },
      enemy: {
        key: TEAM.ENEMY,
        active: [createUnit("wyvern", TEAM.ENEMY, 0), createUnit("golem", TEAM.ENEMY, 1), createUnit("thunderroc", TEAM.ENEMY, 2)],
        reserve: [createUnit("venomtoad", TEAM.ENEMY, "r0"), createUnit("duskmoth", TEAM.ENEMY, "r1")],
        statuses: []
      }
    },
    globalStatuses: [],
    plannedActions: {},
    enemyPlannedActions: {},
    ui: {
      selectedAllySlot: 0,
      commandMode: "fight",
      selectedMoveId: null,
      selectedReserveIndex: null,
      selectedSwitchDestination: null,
      targetCandidates: [],
      selectedTargetPos: null
    },
    log: ["バトル準備完了。味方3体の行動を決めてください。"],
    temp: {
      renderCells: []
    }
  });

  let gameState = createInitialState();

  // ------------------------------------------------------------
  // 5) pure utility functions
  // ------------------------------------------------------------
  const byTeamOrder = (team) => CONFIG.TIEBREAKER_TEAM_ORDER.indexOf(team);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const isAlive = (unit) => !!unit && unit.hp > 0;

  const getTeamState = (team) => gameState.teams[team];

  const toBoardPos = (team, slot) => ({ x: slot, y: team === TEAM.ENEMY ? 0 : 1 });
  const inBounds = (pos) => pos.x >= 0 && pos.x < CONFIG.BOARD_COLS && pos.y >= 0 && pos.y < CONFIG.BOARD_ROWS;

  const getUnitAt = (pos) => {
    if (!inBounds(pos)) return null;
    const team = pos.y === 0 ? TEAM.ENEMY : TEAM.ALLY;
    return gameState.teams[team].active[pos.x] || null;
  };

  const removeExpiredStatuses = (statuses) => statuses.filter((s) => s.duration > 0);

  const cloneStatus = (kind, durationOverride) => {
    const base = STATUSES[kind];
    return {
      kind: base.kind,
      category: base.category,
      duration: durationOverride ?? base.duration,
      tags: [...base.tags]
    };
  };

  const addStatusToContainer = (container, status) => {
    const idx = container.findIndex((s) => s.category === status.category);
    if (idx >= 0) container[idx] = status;
    else container.push(status);
  };

  const getStatusByKind = (unit, kind) => unit.statuses.find((s) => s.kind === kind);

  const getEffectiveStat = (unit, statKey) => {
    let value = unit[statKey];
    if (statKey === "atk" && getStatusByKind(unit, "atkUp")) value = Math.floor(value * (1 + CONFIG.ATK_UP_RATIO));
    if (statKey === "def" && getStatusByKind(unit, "defUp")) value = Math.floor(value * (1 + CONFIG.DEF_UP_RATIO));
    return value;
  };

  const calcDamage = (attacker, defender, move) => {
    const atk = getEffectiveStat(attacker, "atk") + Math.floor(move.power / 10);
    const def = getEffectiveStat(defender, "def");
    let dmg = Math.max(1, atk - def);
    if (getStatusByKind(defender, "barrier")) dmg = Math.max(1, Math.floor(dmg * CONFIG.BARRIER_RATIO));
    return Math.min(dmg, defender.hp);
  };

  const healUnit = (unit, amount) => {
    const before = unit.hp;
    unit.hp = clamp(unit.hp + amount, 0, unit.maxHp);
    return unit.hp - before;
  };

  const setHp = (unit, hpValue) => {
    unit.hp = clamp(hpValue, 0, unit.maxHp);
  };

  const pushLog = (text) => {
    gameState.log.push(text);
    if (gameState.log.length > CONFIG.MAX_LOG_LINES) {
      gameState.log.splice(0, gameState.log.length - CONFIG.MAX_LOG_LINES);
    }
  };

  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const createImageWithFallback = ({ src, alt, mirror = false }) => {
    const wrap = createEl("div", `portrait-wrap${mirror ? " mirror" : ""}`);
    const img = document.createElement("img");
    const placeholder = createEl("div", "img-placeholder", "イメージ準備中");
    img.alt = alt;
    img.src = src;
    img.loading = "lazy";
    img.onerror = () => {
      img.style.display = "none";
      placeholder.style.display = "flex";
    };
    wrap.append(img, placeholder);
    return wrap;
  };

  const clearTempArrays = () => {
    gameState.temp.renderCells.length = 0;
    gameState.ui.targetCandidates.length = 0;
  };

  // ------------------------------------------------------------
  // 6) battle logic
  // ------------------------------------------------------------
  const getValidTargetsForMove = (actor, move) => {
    const actorPos = toBoardPos(actor.team, actor.slot);
    const orientation = actor.team === TEAM.ALLY ? -1 : 1;
    const offsets = patterns[move.patternId] || [];

    return offsets
      .map((offset) => ({ x: actorPos.x + offset.x, y: actorPos.y + (offset.y * orientation) }))
      .filter(inBounds)
      .map((pos) => ({ pos, unit: getUnitAt(pos) }))
      .filter(({ unit }) => {
        if (!unit) return false;
        if (!isAlive(unit)) return false;
        if (move.targetRule === "enemy") return unit.team !== actor.team;
        if (move.targetRule === "ally") return unit.team === actor.team;
        if (move.targetRule === "self") return unit.uid === actor.uid;
        if (move.targetRule === "any") return true;
        return false;
      })
      .map(({ pos, unit }) => ({ x: pos.x, y: pos.y, uid: unit.uid }));
  };

  const applyStatusToUnit = (unit, statusKind, duration) => {
    const status = cloneStatus(statusKind, duration);
    addStatusToContainer(unit.statuses, status);
    pushLog(`${unit.name} に ${status.kind}（${status.duration}T）付与。`);
  };

  const runEffect = ({ actor, target, effect }) => {
    if (effect.type === "applyStatus" && target) {
      applyStatusToUnit(target, effect.status, effect.duration);
    }
    if (effect.type === "drain" && target) {
      const healed = healUnit(actor, Math.max(1, Math.floor((effect.lastDamage || 0) * effect.ratio)));
      pushLog(`${actor.name} はHPを ${healed} 回復。`);
    }
  };

  const triggerAbilityHook = (unit, hookName, context) => {
    if (!unit || !unit.abilityId) return;
    const ability = ABILITIES[unit.abilityId];
    if (!ability || !ability[hookName]) return;

    ability[hookName].forEach((effect) => {
      if (effect.type === "applyStatus") {
        const target = effect.target === "self" ? unit : context?.target;
        if (target && isAlive(target)) {
          applyStatusToUnit(target, effect.status, effect.duration);
          pushLog(`${unit.name} の特性 ${ability.id} が発動。`);
        }
      }
    });
  };

  const executeFightAction = (actor, action) => {
    const move = MOVES[action.moveId];
    if (!move) return;

    const candidates = getValidTargetsForMove(actor, move);
    if (candidates.length === 0) {
      pushLog(`${actor.name} の ${move.name} は有効対象なし。`);
      return;
    }

    const targets = move.targetMode === "single"
      ? candidates.filter((c) => c.x === action.targetPos?.x && c.y === action.targetPos?.y)
      : candidates;

    if (targets.length === 0) {
      pushLog(`${actor.name} の ${move.name} は不発（対象不正）。`);
      return;
    }

    pushLog(`${actor.name} の ${move.name}！`);

    targets.forEach((targetCell) => {
      const target = getUnitAt({ x: targetCell.x, y: targetCell.y });
      if (!target || !isAlive(target)) return;

      move.beforeDamage.forEach((effect) => runEffect({ actor, target, effect }));

      let dealt = 0;
      if (move.category === "attack") {
        dealt = calcDamage(actor, target, move);
        setHp(target, target.hp - dealt);
        pushLog(`- ${target.name} に ${dealt} ダメージ（${target.hp}/${target.maxHp}）。`);
      }

      move.afterDamage.forEach((effectTemplate) => {
        const effect = { ...effectTemplate, lastDamage: dealt };
        runEffect({ actor, target, effect });
      });

      triggerAbilityHook(actor, "onAfterDamage", { target });
      if (!isAlive(target)) pushLog(`☠ ${target.name} はたおれた。`);
    });
  };

  const executeSwitchAction = (actor, action) => {
    const teamState = getTeamState(actor.team);
    const reserve = teamState.reserve[action.reserveIndex];
    const toSlot = action.toSlot;

    if (!reserve || toSlot === null || toSlot === undefined) {
      pushLog(`${actor.name} のこうたいは失敗。`);
      return;
    }

    const outgoing = teamState.active[toSlot] || null;
    teamState.active[toSlot] = reserve;
    reserve.slot = toSlot;
    teamState.reserve[action.reserveIndex] = outgoing;
    if (outgoing) outgoing.slot = `r${action.reserveIndex}`;

    pushLog(`${actor.name} がこうたい：${reserve.name} がスロット${toSlot + 1}へ。`);
  };

  const executeAction = (action) => {
    const teamState = getTeamState(action.team);
    const actor = teamState.active[action.slot];
    if (!actor || !isAlive(actor)) return;

    if (action.type === "fight") executeFightAction(actor, action);
    if (action.type === "switch") executeSwitchAction(actor, action);
  };

  const applyEndTurnEffects = () => {
    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      const teamState = getTeamState(team);

      teamState.active.forEach((unit) => {
        if (!unit || !isAlive(unit)) return;

        if (getStatusByKind(unit, "poison")) {
          const poisonDmg = Math.max(1, Math.floor(unit.maxHp * CONFIG.POISON_RATIO));
          setHp(unit, unit.hp - poisonDmg);
          pushLog(`${unit.name} はどくで ${poisonDmg} ダメージ。`);
          if (!isAlive(unit)) pushLog(`☠ ${unit.name} はどくでたおれた。`);
        }

        unit.statuses.forEach((s) => { s.duration -= 1; });
        unit.statuses = removeExpiredStatuses(unit.statuses);
      });

      teamState.statuses.forEach((s) => { s.duration -= 1; });
      teamState.statuses = removeExpiredStatuses(teamState.statuses);
    });

    gameState.globalStatuses.forEach((s) => { s.duration -= 1; });
    gameState.globalStatuses = removeExpiredStatuses(gameState.globalStatuses);
  };

  const checkWinLose = () => {
    const allyAlive = gameState.teams.ally.active.some(isAlive);
    const enemyAlive = gameState.teams.enemy.active.some(isAlive);

    if (!allyAlive && !enemyAlive) {
      gameState.phase = PHASE.GAMEOVER;
      gameState.winner = "draw";
      pushLog("結果：引き分け。");
    } else if (!enemyAlive) {
      gameState.phase = PHASE.GAMEOVER;
      gameState.winner = TEAM.ALLY;
      pushLog("勝利！敵を全滅させた。");
    } else if (!allyAlive) {
      gameState.phase = PHASE.GAMEOVER;
      gameState.winner = TEAM.ENEMY;
      pushLog("敗北…味方が全滅した。");
    }
  };

  const resolveTurn = () => {
    const queue = [];

    Object.values(gameState.plannedActions).forEach((action) => queue.push(action));
    Object.values(gameState.enemyPlannedActions).forEach((action) => queue.push(action));

    [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
      gameState.teams[team].active.forEach((unit) => triggerAbilityHook(unit, "onTurnStart", {}));
    });

    queue.sort((a, b) => {
      const unitA = getTeamState(a.team).active[a.slot];
      const unitB = getTeamState(b.team).active[b.slot];
      const spdA = unitA ? unitA.spd : -1;
      const spdB = unitB ? unitB.spd : -1;
      if (spdA !== spdB) return spdB - spdA;
      if (a.team !== b.team) return byTeamOrder(a.team) - byTeamOrder(b.team);
      return a.slot - b.slot;
    });

    queue.forEach(executeAction);
    applyEndTurnEffects();
    checkWinLose();

    gameState.turn += 1;
    gameState.plannedActions = {};
    gameState.enemyPlannedActions = {};

    gameState.ui.selectedMoveId = null;
    gameState.ui.selectedTargetPos = null;
    gameState.ui.selectedReserveIndex = null;
    gameState.ui.selectedSwitchDestination = null;

    if (gameState.turn > CONFIG.MAX_TURNS && gameState.phase !== PHASE.GAMEOVER) {
      gameState.phase = PHASE.GAMEOVER;
      gameState.winner = "draw";
      pushLog(`${CONFIG.MAX_TURNS}ターン到達。強制引き分け。`);
    }
  };

  // ------------------------------------------------------------
  // 7) AI logic (deterministic)
  // ------------------------------------------------------------
  const scoreAction = ({ actor, move, target }) => {
    if (!target) return { score: -1, koValue: 0, damage: 0 };
    if (move.category !== "attack") return { score: 1, koValue: 0, damage: 0 };
    const dmg = calcDamage(actor, target, move);
    const koValue = dmg >= target.hp ? target.maxHp + target.spd : 0;
    const score = koValue > 0 ? 10000 + koValue : dmg;
    return { score, koValue, damage: dmg };
  };

  const chooseEnemyAction = (slot) => {
    const actor = gameState.teams.enemy.active[slot];
    if (!actor || !isAlive(actor)) return null;

    let best = null;

    actor.moveIds.forEach((moveId) => {
      const move = MOVES[moveId];
      const candidates = getValidTargetsForMove(actor, move);

      if (move.targetMode === "single") {
        candidates.forEach((c) => {
          const target = getUnitAt({ x: c.x, y: c.y });
          const s = scoreAction({ actor, move, target });
          const candidate = {
            type: "fight", team: TEAM.ENEMY, slot, moveId,
            targetPos: { x: c.x, y: c.y },
            score: s.score,
            koValue: s.koValue,
            damage: s.damage,
            isAttack: move.category === "attack"
          };
          if (!best || candidate.score > best.score ||
              (candidate.score === best.score && candidate.koValue > best.koValue) ||
              (candidate.score === best.score && candidate.damage > best.damage) ||
              (candidate.score === best.score && candidate.damage === best.damage && moveId < best.moveId)) {
            best = candidate;
          }
        });
      } else {
        const totalDamage = candidates
          .map((c) => getUnitAt({ x: c.x, y: c.y }))
          .filter(Boolean)
          .reduce((sum, target) => sum + (move.category === "attack" ? calcDamage(actor, target, move) : 0), 0);
        const candidate = {
          type: "fight", team: TEAM.ENEMY, slot, moveId,
          targetPos: null,
          score: move.category === "attack" ? totalDamage : 2,
          koValue: 0,
          damage: totalDamage,
          isAttack: move.category === "attack"
        };
        if (!best || candidate.score > best.score ||
            (candidate.score === best.score && moveId < best.moveId)) {
          best = candidate;
        }
      }
    });

    if (!best) {
      return { type: "fight", team: TEAM.ENEMY, slot, moveId: actor.moveIds[0], targetPos: null };
    }

    return {
      type: "fight",
      team: TEAM.ENEMY,
      slot,
      moveId: best.moveId,
      targetPos: best.targetPos
    };
  };

  const buildEnemyPlans = () => {
    const plans = {};
    for (let slot = 0; slot < CONFIG.BOARD_COLS; slot += 1) {
      const action = chooseEnemyAction(slot);
      if (action) plans[slot] = action;
    }
    return plans;
  };

  // ------------------------------------------------------------
  // 8) input / dispatch logic
  // ------------------------------------------------------------
  const allLivingAlliesPlanned = () => {
    const livingSlots = gameState.teams.ally.active
      .map((unit, idx) => (isAlive(unit) ? idx : null))
      .filter((v) => v !== null);
    return livingSlots.every((slot) => !!gameState.plannedActions[slot]);
  };

  const autoAdvanceTurnIfReady = () => {
    if (gameState.phase !== PHASE.PLAYING) return;
    if (!allLivingAlliesPlanned()) return;

    gameState.enemyPlannedActions = buildEnemyPlans();
    pushLog(`--- ターン${gameState.turn} 解決 ---`);
    resolveTurn();
  };

  const selectAlly = (slot) => {
    const actor = gameState.teams.ally.active[slot];
    if (!actor || !isAlive(actor) || gameState.phase !== PHASE.PLAYING) return;
    gameState.ui.selectedAllySlot = slot;
    gameState.ui.selectedMoveId = null;
    gameState.ui.selectedTargetPos = null;
    gameState.ui.selectedReserveIndex = null;
    gameState.ui.selectedSwitchDestination = null;
  };

  const chooseMode = (mode) => {
    gameState.ui.commandMode = mode;
    gameState.ui.selectedMoveId = null;
    gameState.ui.selectedTargetPos = null;
    gameState.ui.selectedReserveIndex = null;
    gameState.ui.selectedSwitchDestination = null;
  };

  const setFightMove = (moveId) => {
    const slot = gameState.ui.selectedAllySlot;
    const actor = gameState.teams.ally.active[slot];
    if (!actor || !isAlive(actor)) return;

    const move = MOVES[moveId];
    const candidates = getValidTargetsForMove(actor, move);
    gameState.ui.selectedMoveId = moveId;
    gameState.ui.targetCandidates = candidates;

    if (move.targetMode === "allPattern") {
      gameState.plannedActions[slot] = {
        type: "fight",
        team: TEAM.ALLY,
        slot,
        moveId,
        targetPos: null
      };
      pushLog(`${actor.name}：${move.name}（範囲）を選択。`);
      autoAdvanceTurnIfReady();
    } else if (candidates.length === 1) {
      gameState.plannedActions[slot] = {
        type: "fight",
        team: TEAM.ALLY,
        slot,
        moveId,
        targetPos: { x: candidates[0].x, y: candidates[0].y }
      };
      gameState.ui.selectedTargetPos = { x: candidates[0].x, y: candidates[0].y };
      pushLog(`${actor.name}：${move.name} の対象を確定。`);
      autoAdvanceTurnIfReady();
    }
  };

  const chooseFightTarget = (x, y) => {
    const slot = gameState.ui.selectedAllySlot;
    const move = MOVES[gameState.ui.selectedMoveId];
    if (!move || move.targetMode !== "single") return;

    const match = gameState.ui.targetCandidates.find((c) => c.x === x && c.y === y);
    if (!match) return;

    gameState.ui.selectedTargetPos = { x, y };
    gameState.plannedActions[slot] = {
      type: "fight",
      team: TEAM.ALLY,
      slot,
      moveId: move.id,
      targetPos: { x, y }
    };

    const actor = gameState.teams.ally.active[slot];
    pushLog(`${actor.name}：${move.name} → マス(${x + 1},${y + 1})。`);
    autoAdvanceTurnIfReady();
  };

  const chooseReserve = (reserveIndex) => {
    const reserve = gameState.teams.ally.reserve[reserveIndex];
    if (!reserve) return;
    gameState.ui.selectedReserveIndex = reserveIndex;
  };

  const chooseSwitchDestination = (toSlot) => {
    gameState.ui.selectedSwitchDestination = toSlot;
    const slot = gameState.ui.selectedAllySlot;
    const actor = gameState.teams.ally.active[slot];
    if (!actor || !isAlive(actor)) return;
    if (gameState.ui.selectedReserveIndex === null) return;

    gameState.plannedActions[slot] = {
      type: "switch",
      team: TEAM.ALLY,
      slot,
      reserveIndex: gameState.ui.selectedReserveIndex,
      toSlot
    };
    const reserve = gameState.teams.ally.reserve[gameState.ui.selectedReserveIndex];
    pushLog(`${actor.name}：こうたい ${reserve.name} → スロット${toSlot + 1}。`);
    autoAdvanceTurnIfReady();
  };

  const startBattle = () => {
    gameState.phase = PHASE.PLAYING;
    pushLog("バトル開始。");
  };

  const resetBattle = () => {
    gameState = createInitialState();
    gameState.phase = PHASE.PLAYING;
  };

  const dispatch = (action) => {
    switch (action.type) {
      case "START": startBattle(); break;
      case "RESET": resetBattle(); break;
      case "SELECT_ALLY": selectAlly(action.slot); break;
      case "MODE": chooseMode(action.mode); break;
      case "MOVE": setFightMove(action.moveId); break;
      case "TARGET": chooseFightTarget(action.x, action.y); break;
      case "RESERVE": chooseReserve(action.reserveIndex); break;
      case "DEST": chooseSwitchDestination(action.toSlot); break;
      default: break;
    }
    render();
  };

  // ------------------------------------------------------------
  // 9) rendering
  // ------------------------------------------------------------
  const moveTypeClass = (move) => `type-${move.type}`;
  const MOVE_CATEGORY_LABEL = { attack: "こうげき", status: "へんか" };
  const TYPE_LABEL = {
    fire: "ほのお",
    water: "みず",
    earth: "だいち",
    nature: "しぜん",
    light: "ひかり",
    shadow: "かげ"
  };

  const formatEnemyHpPercent = (unit) => `${Math.round((unit.hp / unit.maxHp) * 100)}%`;
  const formatAllyHp = (unit) => `${unit.hp} / ${unit.maxHp}`;
  const formatHpByTeam = (unit) => unit.team === TEAM.ENEMY ? formatEnemyHpPercent(unit) : formatAllyHp(unit);
  const statusText = (status) => `${status.kind}:${status.duration}`;
  const toJaMoveName = (move) => move.name;

  const renderStatusChips = (statuses) => {
    const frag = document.createDocumentFragment();
    statuses.forEach((s) => {
      const chip = createEl("span", "status-chip", statusText(s));
      frag.appendChild(chip);
    });
    return frag;
  };

  const renderMoveBadge = (move) => {
    const icon = move.category === "attack" ? "⚔" : "✦";
    const badge = createEl("span", "move-icon-badge", icon);
    badge.title = MOVE_CATEGORY_LABEL[move.category] || move.category;
    return badge;
  };

  const renderMiniBattleUnit = (unit, mirror = false) => {
    const miniWrap = createImageWithFallback({
      src: getAssetPath("portraits", unit.portrait),
      alt: unit.name,
      mirror
    });
    miniWrap.classList.add("mini-portrait");
    return miniWrap;
  };

  const renderReserveCard = (unit, idx) => {
    const btn = createEl("button", `reserve-card${gameState.ui.selectedReserveIndex === idx ? " active" : ""}`);
    btn.dataset.action = "pick-reserve";
    btn.dataset.reserveIndex = String(idx);
    if (!unit) {
      btn.disabled = true;
      btn.textContent = "空き";
      return btn;
    }
    btn.appendChild(renderMiniBattleUnit(unit, true));
    const info = createEl("div");
    info.appendChild(createEl("div", "name", unit.name));
    info.appendChild(createEl("div", "stats", `HP ${formatAllyHp(unit)}`));
    btn.appendChild(info);
    return btn;
  };

  const renderUnitPanel = ({ unit, team, slot, selected }) => {
    const panel = createEl("div", `panel ${team}${selected ? " selected" : ""}${!isAlive(unit) ? " dead" : ""}`);
    panel.dataset.action = "select-ally";
    panel.dataset.slot = String(slot);

    panel.appendChild(createEl("div", "name", unit ? unit.name : "空き"));
    panel.appendChild(createEl("div", "stats", `Lv.${CONFIG.LEVEL}  SPD ${unit.spd}`));

    panel.appendChild(createImageWithFallback({
      src: getAssetPath("portraits", unit.portrait),
      alt: unit.name,
      mirror: team === TEAM.ALLY
    }));

    const hpRow = createEl("div");
    const hpText = team === TEAM.ALLY ? formatAllyHp(unit) : formatEnemyHpPercent(unit);
    hpRow.appendChild(createEl("div", "stats", `HP ${hpText}`));
    const bar = createEl("div", "hpbar");
    const fill = createEl("span");
    fill.style.width = `${Math.round((unit.hp / unit.maxHp) * 100)}%`;
    bar.appendChild(fill);
    hpRow.appendChild(bar);
    panel.appendChild(hpRow);

    const statusWrap = createEl("div");
    statusWrap.appendChild(renderStatusChips(unit.statuses));
    panel.appendChild(statusWrap);
    return panel;
  };

  const renderBoardCell = (x, y) => {
    const cell = createEl("div", "cell");
    const unit = getUnitAt({ x, y });
    const isCandidate = gameState.ui.targetCandidates.some((c) => c.x === x && c.y === y);
    const selectedTarget = gameState.ui.selectedTargetPos;

    if (isCandidate) {
      cell.classList.add(y === 0 ? "valid-enemy" : "valid-ally");
    }
    if (selectedTarget && selectedTarget.x === x && selectedTarget.y === y) {
      cell.classList.add("targeted");
    }

    cell.dataset.action = "target-cell";
    cell.dataset.x = String(x);
    cell.dataset.y = String(y);

    if (unit) {
      const mirror = unit.team === TEAM.ALLY;
      cell.appendChild(renderMiniBattleUnit(unit, mirror));
      const main = createEl("div", "cell-unit-main");
      main.appendChild(createEl("div", "cell-name", unit.name));
      main.appendChild(createEl("div", "cell-hp", `HP ${formatHpByTeam(unit)}`));
      const statLine = createEl("div", "mini", unit.statuses.map((s) => `${s.kind}(${s.duration})`).join(" ") || "状態なし");
      main.appendChild(statLine);
      cell.appendChild(main);
    } else {
      cell.classList.add("empty");
      cell.appendChild(createEl("div", "mini", "—"));
      cell.appendChild(createEl("div", "mini", "待機マス"));
    }

    gameState.temp.renderCells.push(cell);
    return cell;
  };

  const renderCommandArea = () => {
    const wrap = createEl("div", "command");
    const actor = gameState.teams.ally.active[gameState.ui.selectedAllySlot];

    wrap.appendChild(createEl("h3", "", `コマンド：${actor ? actor.name : "-"}（スロット${gameState.ui.selectedAllySlot + 1}）`));

    const actions = createEl("div", "actions");
    const fightBtn = createEl("button", `action-btn${gameState.ui.commandMode === "fight" ? " active" : ""}`, "たたかう");
    fightBtn.dataset.action = "mode-fight";
    const switchBtn = createEl("button", `action-btn${gameState.ui.commandMode === "switch" ? " active" : ""}`, "こうたい");
    switchBtn.dataset.action = "mode-switch";
    actions.append(fightBtn, switchBtn);
    wrap.appendChild(actions);

    if (gameState.ui.commandMode === "fight") {
      const movesWrap = createEl("div", "moves");
      actor.moveIds.forEach((moveId) => {
        const move = MOVES[moveId];
        const btn = createEl("button", `move ${move.category} ${moveTypeClass(move)}`);
        const info = createEl("div");
        info.appendChild(createEl("div", "move-name", toJaMoveName(move)));
        info.appendChild(createEl("div", "move-meta", `${MOVE_CATEGORY_LABEL[move.category]} / ${TYPE_LABEL[move.type] || move.type}`));
        btn.appendChild(renderMoveBadge(move));
        btn.appendChild(info);
        btn.dataset.action = "pick-move";
        btn.dataset.moveId = moveId;
        if (gameState.plannedActions[gameState.ui.selectedAllySlot]?.moveId === moveId) {
          btn.classList.add("active");
        }
        movesWrap.appendChild(btn);
      });
      wrap.appendChild(movesWrap);

      const selectedMove = MOVES[gameState.ui.selectedMoveId];
      if (selectedMove && selectedMove.targetMode === "single") {
        wrap.appendChild(createEl("div", "stats", "ハイライトされた対象マスを選んでください。"));
      } else if (selectedMove) {
        wrap.appendChild(createEl("div", "stats", "範囲わざを確定しました。"));
      }
    }

    if (gameState.ui.commandMode === "switch") {
      const switches = createEl("div", "switches");
      gameState.teams.ally.reserve.forEach((unit, idx) => {
        switches.appendChild(renderReserveCard(unit, idx));
      });
      wrap.appendChild(createEl("div", "section-title", "1) こうたい先（控え）を選択"));
      wrap.appendChild(switches);

      const dests = createEl("div", "destinations");
      for (let i = 0; i < CONFIG.BOARD_COLS; i += 1) {
        const unit = gameState.teams.ally.active[i];
        const btn = createEl("button", `dest-btn${gameState.ui.selectedSwitchDestination === i ? " active" : ""}`, `スロット${i + 1} ← ${unit ? unit.name : "空き"}`);
        btn.dataset.action = "pick-destination";
        btn.dataset.toSlot = String(i);
        dests.appendChild(btn);
      }
      wrap.appendChild(createEl("div", "section-title", "2) 入れ替える味方スロットを選択"));
      wrap.appendChild(dests);
    }

    return wrap;
  };

  const renderPlanSummary = () => {
    const plans = createEl("div", "plans");
    for (let i = 0; i < CONFIG.BOARD_COLS; i += 1) {
      const box = createEl("div", "plan-box");
      const unit = gameState.teams.ally.active[i];
      const action = gameState.plannedActions[i];
      let text = "未選択";
      if (!unit || !isAlive(unit)) text = "行動不能";
      else if (action?.type === "fight") text = `たたかう: ${toJaMoveName(MOVES[action.moveId])}`;
      else if (action?.type === "switch") {
        const reserve = gameState.teams.ally.reserve[action.reserveIndex];
        text = `こうたい: ${reserve ? reserve.name : "?"} → ${action.toSlot + 1}`;
      }
      box.textContent = `味方${i + 1}: ${text}`;
      plans.appendChild(box);
    }
    return plans;
  };

  const renderSidebar = () => {
    const side = createEl("div", "sidebar");
    side.appendChild(createEl("div", "stats", `ターン ${gameState.turn} | フェーズ: ${gameState.phase}`));

    const footer = createEl("div", "footer");
    if (gameState.phase === PHASE.START) {
      const start = createEl("button", "", "バトル開始");
      start.dataset.action = "start";
      footer.appendChild(start);
    }
    if (gameState.phase === PHASE.GAMEOVER) {
      const reset = createEl("button", "", "もう一度");
      reset.dataset.action = "reset";
      footer.appendChild(reset);
      footer.appendChild(createEl("div", "stats", `勝者: ${gameState.winner}`));
    }
    side.appendChild(footer);

    const log = createEl("div", "log");
    log.textContent = gameState.log.slice().reverse().join("\n");
    side.appendChild(log);

    return side;
  };

  const render = () => {
    clearTempArrays();
    const app = document.getElementById("app");
    app.innerHTML = "";

    const main = createEl("div", "main");

    const enemyRow = createEl("div", "unit-row");
    gameState.teams.enemy.active.forEach((unit, slot) => {
      enemyRow.appendChild(renderUnitPanel({
        unit,
        team: TEAM.ENEMY,
        slot,
        selected: false
      }));
    });
    main.appendChild(enemyRow);

    const board = createEl("div", "board");
    board.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.2)), url('${gameState.battlefield.background}')`;
    board.style.backgroundSize = "cover";
    board.style.backgroundPosition = "center";

    for (let y = 0; y < CONFIG.BOARD_ROWS; y += 1) {
      for (let x = 0; x < CONFIG.BOARD_COLS; x += 1) {
        board.appendChild(renderBoardCell(x, y));
      }
    }
    main.appendChild(board);

    const allyRow = createEl("div", "unit-row");
    gameState.teams.ally.active.forEach((unit, slot) => {
      allyRow.appendChild(renderUnitPanel({
        unit,
        team: TEAM.ALLY,
        slot,
        selected: slot === gameState.ui.selectedAllySlot
      }));
    });
    main.appendChild(allyRow);

    if (gameState.phase !== PHASE.GAMEOVER) {
      main.appendChild(renderCommandArea());
      main.appendChild(renderPlanSummary());
    }

    app.appendChild(main);
    app.appendChild(renderSidebar());
  };

  // ------------------------------------------------------------
  // 10) boot / init
  // ------------------------------------------------------------
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;
    if (action === "start") dispatch({ type: "START" });
    if (action === "reset") dispatch({ type: "RESET" });
    if (action === "select-ally") dispatch({ type: "SELECT_ALLY", slot: Number(target.dataset.slot) });
    if (action === "mode-fight") dispatch({ type: "MODE", mode: "fight" });
    if (action === "mode-switch") dispatch({ type: "MODE", mode: "switch" });
    if (action === "pick-move") dispatch({ type: "MOVE", moveId: target.dataset.moveId });
    if (action === "target-cell") dispatch({ type: "TARGET", x: Number(target.dataset.x), y: Number(target.dataset.y) });
    if (action === "pick-reserve") dispatch({ type: "RESERVE", reserveIndex: Number(target.dataset.reserveIndex) });
    if (action === "pick-destination") dispatch({ type: "DEST", toSlot: Number(target.dataset.toSlot) });
  });

  gameState.phase = PHASE.PLAYING;
  pushLog("戦闘フェーズ開始。生存中の味方全員の行動を選択してください。");
  render();
})();
