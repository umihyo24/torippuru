export const HANAFUDA_PROGRESS_LESSONS = [
  "defense",
  "speed",
  "status",
  "trick",
  "field",
  "damage_over_time",
  "power_wall",
  "phase_gimmick",
  "buff_debuff",
  "combo_speed",
  "control",
  "final_exam"
];

const boss = ({
  id,
  order,
  name,
  coreConcept,
  themeIdentity,
  primaryRole,
  elementalTyping,
  statTendencies,
  traits,
  signatureMoves,
  bossGimmick,
  intendedLesson,
  rewardConcept,
  trialDesignNotes,
  bossGimmickSummary,
  balanceAssumptions,
  testCases
}) => ({
  id,
  order,
  name,
  coreConcept,
  data: {
    themeIdentity,
    primaryRole,
    elementalTyping,
    statTendencies,
    traits,
    signatureMoves,
    bossGimmick,
    intendedLesson,
    rewardConcept
  },
  trialDesignNotes,
  bossGimmickSummary,
  balanceAssumptions,
  testCases
});

export const HANAFUDA_BOSSES = {
  tsurumatsu: boss({
    id: "tsurumatsu",
    order: 1,
    name: "Tsurumatsu",
    coreConcept: "Guardian pine crane that wins by patience and guard timing.",
    themeIdentity: "Pine + crane longevity motif",
    primaryRole: "Defense tutor tank",
    elementalTyping: ["earth", "light"],
    statTendencies: { hp: "high", atk: "low", mag: "low", def: "very_high", res: "high", spd: "low" },
    traits: ["First Feather Wall (auto guard on turn 1)", "Needle Counter (counter when hit while guarded)", "Slow Breathing (heals if no damage taken)"],
    signatureMoves: ["Pine Aegis", "Crane Riposte", "Evergreen Brace"],
    bossGimmick: {
      key: "guard_break_lesson",
      gameStateHooks: ["onTurnStart", "beforeDamage", "afterDamage"],
      stateInit: { guardStacks: 2, counterReady: false },
      loop: "Cycles guard -> punish weak poke -> exposed after guard is broken by heavy/typed attack."
    },
    intendedLesson: "Use guard break windows and save burst for shield down turns.",
    rewardConcept: "Trial Sigil: Iron Pine (unlocks basic guard break skill)",
    trialDesignNotes: ["Low outgoing damage to reduce early frustration.", "Telegraph guard refresh every 2 turns.", "One scripted safe opening after first counter."],
    bossGimmickSummary: "A visible 2-stack shield that teaches patience over mashing.",
    balanceAssumptions: { expectedFightLengthTurns: "6-8", playerPowerTier: "starter" },
    testCases: ["Guard stacks decrement only on qualifying break damage.", "Counter triggers once per turn max.", "Boss cannot reapply full guard the same turn it is broken."]
  }),
  umeguisu: boss({
    id: "umeguisu",
    order: 2,
    name: "Umeguisu",
    coreConcept: "Plum warbler duelist that wins by turn order control.",
    themeIdentity: "Plum blossom + songbird quickstep",
    primaryRole: "Speed check striker",
    elementalTyping: ["wind", "light"],
    statTendencies: { hp: "low", atk: "medium", mag: "medium", def: "low", res: "medium", spd: "very_high" },
    traits: ["First Note (priority +1 on opener)", "Slipstream (evasion up after acting first)", "Tempo Theft (small speed steal on crit)"],
    signatureMoves: ["Plum Flicker", "Warbler Rush", "Tempo Snatch"],
    bossGimmick: {
      key: "initiative_race",
      gameStateHooks: ["onRoundCalc", "onAct", "onCrit"],
      stateInit: { tempo: 0, hasteTurns: 2 },
      loop: "Acts first repeatedly unless player invests in speed buffs, slow, or priority tools."
    },
    intendedLesson: "Speed is a resource; action order can be planned, not guessed.",
    rewardConcept: "Feather Charm: Quick Plum (minor team haste at battle start)",
    trialDesignNotes: ["Fragile HP so correct adaptation ends fight quickly.", "Show turn order UI hint before battle.", "Avoid hard dodge RNG; use capped evasion."],
    bossGimmickSummary: "A race for first action that introduces initiative systems.",
    balanceAssumptions: { expectedFightLengthTurns: "5-7", playerPowerTier: "early" },
    testCases: ["Tempo stacks cap at defined max.", "Priority skill beats raw speed ties.", "Speed steal expires correctly after duration."]
  }),
  utagezakura: boss({
    id: "utagezakura",
    order: 3,
    name: "Utagezakura",
    coreConcept: "Festival cherry spirit that layers soft status pressure.",
    themeIdentity: "Cherry banquet intoxication",
    primaryRole: "Status spreader",
    elementalTyping: ["nature", "shadow"],
    statTendencies: { hp: "medium", atk: "low", mag: "medium", def: "medium", res: "high", spd: "medium" },
    traits: ["Petal Powder (small random ailment chance)", "Sake Mist (status accuracy up)", "Cheerful Cruelty (bonus damage vs afflicted targets)"],
    signatureMoves: ["Drunken Pollen", "Blossom Lull", "Hangover Pulse"],
    bossGimmick: {
      key: "status_triangle",
      gameStateHooks: ["beforeApplyStatus", "onTurnEnd"],
      stateInit: { activeAilmentsApplied: 0, cleanseWindow: true },
      loop: "Applies poison/sleep/weaken in rotation; player must cleanse and prioritize immunity windows."
    },
    intendedLesson: "Bring cleanse tools and learn ailment priority.",
    rewardConcept: "Petal Flask (single-use full cleanse item recipe)",
    trialDesignNotes: ["No permanent lockouts; sleep duration fixed short.", "Status icons must be explicit.", "One guaranteed cleanse pickup in pre-trial route."],
    bossGimmickSummary: "A controlled status workshop with clear cure timing.",
    balanceAssumptions: { expectedFightLengthTurns: "7-9", playerPowerTier: "early_plus" },
    testCases: ["Only one hard-CC status may exist on a target.", "Cleanse clears all tagged trial ailments.", "Cheerful Cruelty bonus applies only when ailment flag true."]
  }),
  hototofuji: boss({
    id: "hototofuji",
    order: 4,
    name: "Hototofuji",
    coreConcept: "Cuckoo wisteria trickster that baits wrong targeting.",
    themeIdentity: "Wisteria corridors and echoing bird calls",
    primaryRole: "Trick assassin",
    elementalTyping: ["shadow", "wind"],
    statTendencies: { hp: "medium_low", atk: "high", mag: "medium", def: "low", res: "medium", spd: "high" },
    traits: ["False Echo (creates decoy image)", "Backline Hook (bonus versus rear slots)", "Misdirect Step (retarget chance on single-hit skills)"],
    signatureMoves: ["Echo Clone", "Wisteria Snare", "Cuckoo Backstab"],
    bossGimmick: {
      key: "decoy_targeting",
      gameStateHooks: ["onTargetSelect", "beforeDamage", "onTurnEnd"],
      stateInit: { decoyHp: 1, decoyActive: true },
      loop: "Decoy must be removed with multi-hit/aoe or reveal skill before safe bursting the real boss."
    },
    intendedLesson: "Read target rules and counter deception tools.",
    rewardConcept: "Mirror Bell (reveals hidden/decoy targets for 2 turns)",
    trialDesignNotes: ["Decoy has deterministic behavior, no coin flip frustration.", "Tutorial tooltip teaches pattern attacks.", "Punishment damage moderate, not lethal spike."],
    bossGimmickSummary: "Targeting puzzle where the wrong hit wastes tempo.",
    balanceAssumptions: { expectedFightLengthTurns: "7-8", playerPowerTier: "mid_entry" },
    testCases: ["Single-target attacks redirect only while decoyActive true.", "AoE must hit real body regardless of decoy.", "Reveal effect suppresses decoy for exact duration."]
  }),
  yatsutsubata: boss({
    id: "yatsutsubata",
    order: 5,
    name: "Yatsutsubata",
    coreConcept: "Iris marsh keeper that weaponizes field zones.",
    themeIdentity: "Iris wetlands and reflective water lanes",
    primaryRole: "Field controller",
    elementalTyping: ["water", "nature"],
    statTendencies: { hp: "high", atk: "medium", mag: "high", def: "medium", res: "high", spd: "medium_low" },
    traits: ["Marsh Domain (starts with Wet Field)", "Iris Rooting (heals in Wet Field)", "Current Logic (push/pull movement on field ticks)"],
    signatureMoves: ["Blue Marsh", "Reed Bind", "Reflective Current"],
    bossGimmick: {
      key: "field_state_mastery",
      gameStateHooks: ["onBattleStart", "onFieldTick", "onMoveResolve"],
      stateInit: { fieldType: "wet", fieldTurns: 3 },
      loop: "Maintains wet field; player learns overwrite field, reposition, and exploit opposite terrain."
    },
    intendedLesson: "Field state affects every turn; contest terrain proactively.",
    rewardConcept: "Field Charm: Dry Wind (once per battle field overwrite)",
    trialDesignNotes: ["Field tooltip shows buffs/debuffs for both teams.", "Boss recast has cooldown to allow counterplay.", "Movement effect ignores rooted units for clarity."],
    bossGimmickSummary: "First full-field encounter; terrain is now part of core combat.",
    balanceAssumptions: { expectedFightLengthTurns: "8-10", playerPowerTier: "mid" },
    testCases: ["Field overwrite updates modifiers immediately.", "Healing from Iris Rooting checks current field only.", "Forced movement obeys blocked-slot rules."]
  }),
  botancho: boss({
    id: "botancho",
    order: 6,
    name: "Botancho",
    coreConcept: "Peony butterfly noble that wins through elegant attrition.",
    themeIdentity: "Peony garden and drifting scales",
    primaryRole: "DoT attrition mage",
    elementalTyping: ["nature", "fire"],
    statTendencies: { hp: "medium", atk: "low", mag: "high", def: "medium", res: "high", spd: "medium" },
    traits: ["Pollen Burn (burn + poison hybrid tick)", "Silk Patience (dot damage reduction to self)", "Perfume Mark (dot spreads on KO)"],
    signatureMoves: ["Peony Ember Dust", "Butterfly Oath", "Lingering Garden"],
    bossGimmick: {
      key: "dot_pressure",
      gameStateHooks: ["onTurnEnd", "onUnitDefeat", "beforeDamage"],
      stateInit: { bloomStacks: 0, spreadReady: true },
      loop: "Stacks gentle DoT early, then accelerates if player ignores cleanse/rotation."
    },
    intendedLesson: "Damage-over-time is tempo loss; cleanse and swap are valid offense.",
    rewardConcept: "Aroma Ward (party DoT resist passive unlock)",
    trialDesignNotes: ["DoT cap prevents unavoidable wipe.", "Spread on KO has internal cooldown.", "Encounter tuned around 1-2 cleanse uses."],
    bossGimmickSummary: "Sustained pressure fight that teaches long-horizon HP management.",
    balanceAssumptions: { expectedFightLengthTurns: "9-11", playerPowerTier: "mid_plus" },
    testCases: ["Hybrid DoT respects stack cap.", "Spread trigger cannot chain infinitely.", "DoT mitigation trait applies after stack calculation."]
  }),
  haginoshishi: boss({
    id: "haginoshishi",
    order: 7,
    name: "Haginoshishi",
    coreConcept: "Bush-clover lion that forms a brute-force power wall.",
    themeIdentity: "Autumn clover plains and lion guardian",
    primaryRole: "Power wall bruiser",
    elementalTyping: ["earth", "nature"],
    statTendencies: { hp: "very_high", atk: "very_high", mag: "low", def: "high", res: "medium", spd: "low" },
    traits: ["Lion Mantle (flat damage reduction)", "Rending Roar (atk up when struck)", "Clutch Hunger (lifesteal under 50% HP)"],
    signatureMoves: ["Hagi Crusher", "Clover Roar", "King's Devour"],
    bossGimmick: {
      key: "dps_gate",
      gameStateHooks: ["beforeDamage", "afterTakenDamage", "onHpThreshold"],
      stateInit: { wallActive: true, enrageAt: 0.5 },
      loop: "Requires burst planning and defense break timing; chip damage is inefficient."
    },
    intendedLesson: "Build burst windows and avoid feeding passive rage.",
    rewardConcept: "Lion Fang Emblem (unlocks armor-break technique)",
    trialDesignNotes: ["Telegraph enrage threshold clearly at 55% HP warning.", "High threat but low speed leaves reaction room.", "Flat DR excludes true damage sources for strategy diversity."],
    bossGimmickSummary: "First strict damage check with punish for unplanned chip.",
    balanceAssumptions: { expectedFightLengthTurns: "8-9", playerPowerTier: "late_mid" },
    testCases: ["Damage reduction floor never drops below minimum 1 damage.", "Rending Roar stacks decay after set turns.", "Lifesteal activates only below threshold."]
  }),
  gachirinbo: boss({
    id: "gachirinbo",
    order: 8,
    name: "Gachirinbo",
    coreConcept: "Moon wheel monk with explicit phase-script mechanics.",
    themeIdentity: "Full moon halo and ritual drums",
    primaryRole: "Phase gimmick specialist",
    elementalTyping: ["light", "shadow"],
    statTendencies: { hp: "high", atk: "medium", mag: "high", def: "medium", res: "high", spd: "medium" },
    traits: ["Waxing Rite (phase 1 support)", "Full Moon Edict (phase 2 offense)", "Waning Mercy (phase 3 desperation)"],
    signatureMoves: ["Moonrise Sutra", "Zenith Wheel", "Eclipse Vow"],
    bossGimmick: {
      key: "three_phase_script",
      gameStateHooks: ["onHpThreshold", "onTurnStart", "onPhaseEnter"],
      stateInit: { phase: 1, invulnFrames: 0, moonMarks: 0 },
      loop: "At 70% and 35% HP shifts phase with one-turn scripted action that changes move table and resistances."
    },
    intendedLesson: "Track phase transitions and hold tools for scripted turns.",
    rewardConcept: "Lunar Dial (battle UI now previews boss phase trigger ranges)",
    trialDesignNotes: ["No hidden phase change; banner + log callout.", "Transition turn never includes unavoidable lethal.", "Each phase spotlights one mechanic from prior trials."],
    bossGimmickSummary: "Mid-campaign exam: adapt loadout and timing across phases.",
    balanceAssumptions: { expectedFightLengthTurns: "10-12", playerPowerTier: "advanced" },
    testCases: ["Phase change occurs once per threshold.", "Move pool swaps correctly on phase entry.", "Invulnerability frames expire before player lockout."]
  }),
  kikusakazuki: boss({
    id: "kikusakazuki",
    order: 9,
    name: "Kikusakazuki",
    coreConcept: "Chrysanthemum cup strategist centered on stat tempo.",
    themeIdentity: "Imperial chrysanthemum banquet duel",
    primaryRole: "Buff/debuff conductor",
    elementalTyping: ["light", "water"],
    statTendencies: { hp: "medium_high", atk: "medium", mag: "high", def: "medium", res: "high", spd: "medium" },
    traits: ["Cup Etiquette (buff potency +1 tier)", "Bitter Toast (debuff duration +1)", "Refined Recovery (cleanse one debuff per 3 turns)"],
    signatureMoves: ["Golden Toast", "Sour Sake", "Banquet Verdict"],
    bossGimmick: {
      key: "stat_swing_engine",
      gameStateHooks: ["onBuffApply", "onDebuffApply", "onTurnEnd"],
      stateInit: { toastCounter: 0, cleanseCooldown: 0 },
      loop: "Alternates self-buff and enemy-debuff rhythm; player must dispel or invert tempo quickly."
    },
    intendedLesson: "Stat stages are win conditions, not side effects.",
    rewardConcept: "Kiku Seal (unlocks party-wide short dispel skill)",
    trialDesignNotes: ["Cap total stage delta to avoid runaway.", "Provide pre-trial NPC hint about dispel value.", "Boss AI prioritizes missing half of the buff/debuff pair."],
    bossGimmickSummary: "A numbers fight where stage control decides damage race.",
    balanceAssumptions: { expectedFightLengthTurns: "9-11", playerPowerTier: "advanced_plus" },
    testCases: ["Buff potency bonus respects stage cap.", "Auto-cleanse timer resets only on successful cleanse.", "Debuff extension does not affect unextendable states."]
  }),
  momijika: boss({
    id: "momijika",
    order: 10,
    name: "Momijika",
    coreConcept: "Maple deer that chains combo turns at high velocity.",
    themeIdentity: "Falling maple leaves and antler arcs",
    primaryRole: "Combo speed finisher",
    elementalTyping: ["wind", "fire"],
    statTendencies: { hp: "medium", atk: "high", mag: "medium", def: "medium_low", res: "medium", spd: "very_high" },
    traits: ["Leaf Step (gains combo point after crit)", "Antler Rhythm (extra hit at 3 combo)", "Scarlet Flow (turn refund at 5 combo)"],
    signatureMoves: ["Maple Drive", "Rust Gale", "Crimson Cascade"],
    bossGimmick: {
      key: "combo_counter",
      gameStateHooks: ["onHit", "onCrit", "onTurnEnd"],
      stateInit: { combo: 0, decayPerTurn: 2 },
      loop: "Builds combo rapidly; player interrupts with stun/guard timing to reset chain before refund turn."
    },
    intendedLesson: "Interrupt timing and combo denial are mandatory at high speed tiers.",
    rewardConcept: "Autumn Spur (grants one anti-combo interrupt action)",
    trialDesignNotes: ["Combo meter visible near boss HP.", "Hard cap prevents infinite turn loops.", "Decay allows comeback after successful stall."],
    bossGimmickSummary: "Punishes passive play with explosive extra-turn chains.",
    balanceAssumptions: { expectedFightLengthTurns: "8-10", playerPowerTier: "pre_endgame" },
    testCases: ["Combo cannot exceed hard cap.", "Turn refund can occur at most once per round.", "Interrupt effects reset combo before damage packet 2."]
  }),
  yanagaeru: boss({
    id: "yanagaeru",
    order: 11,
    name: "Yanagaeru",
    coreConcept: "Willow frog controller that denies player actions.",
    themeIdentity: "Willow marsh hypnosis and echo croaks",
    primaryRole: "Control lockdown boss",
    elementalTyping: ["water", "shadow"],
    statTendencies: { hp: "high", atk: "medium_low", mag: "high", def: "high", res: "high", spd: "medium" },
    traits: ["Croak Command (silence chance)", "Willow Grasp (root chance)", "Bog Court (cooldown increase aura)"],
    signatureMoves: ["Mute Ripple", "Willow Bind", "Puppet Tide"],
    bossGimmick: {
      key: "action_denial_grid",
      gameStateHooks: ["beforeActionCommit", "onTurnStart", "onTurnEnd"],
      stateInit: { controlGauge: 0, lockZones: [] },
      loop: "Places lock zones and action taxes; player must rotate units and preserve cleanse/immune turns."
    },
    intendedLesson: "Control can be answered through positioning, rotation, and immunity timing.",
    rewardConcept: "Willow Knot (unlocks brief control immunity team command)",
    trialDesignNotes: ["Never full-team lock in one turn.", "Control gauge telegraphed one turn ahead.", "Root and silence share diminishing returns."],
    bossGimmickSummary: "Advanced denial encounter preparing player for final multi-system pressure.",
    balanceAssumptions: { expectedFightLengthTurns: "10-12", playerPowerTier: "endgame_ready" },
    testCases: ["Lock zones expire exactly on scheduled turn.", "Diminishing return reduces repeated CC success chance.", "Action tax cannot increase cooldown above cap."]
  }),
  gotouou: boss({
    id: "gotouou",
    order: 12,
    name: "Gotouou",
    coreConcept: "Five-crowned king that reuses every prior lesson in one exam fight.",
    themeIdentity: "Royal five-light sovereign of the Hanafuda cycle",
    primaryRole: "Final exam omni-boss",
    elementalTyping: ["light", "earth"],
    statTendencies: { hp: "very_high", atk: "high", mag: "high", def: "high", res: "high", spd: "high" },
    traits: ["Crown of Trials (adapts trait set per phase)", "Royal Ledger (tracks player pattern repetition)", "Judgment Bloom (empowered punish on predictable loops)"],
    signatureMoves: ["Edict of Twelve", "Coronation Break", "Final Petal Verdict"],
    bossGimmick: {
      key: "final_exam_matrix",
      gameStateHooks: ["onPhaseEnter", "onPlayerPatternDetected", "onFieldTick", "onTurnEnd"],
      stateInit: {
        phase: 1,
        examFlags: {
          defenseChecked: false,
          speedChecked: false,
          statusChecked: false,
          trickChecked: false,
          fieldChecked: false,
          dotChecked: false,
          burstChecked: false,
          phaseChecked: false,
          statChecked: false,
          comboChecked: false,
          controlChecked: false
        },
        judgmentStacks: 0
      },
      loop: "Cycles mini-modules based on unresolved exam flags; if player repeats one strategy, Judgment Bloom punishes and pushes next module."
    },
    intendedLesson: "Mastery means flexible adaptation across all mechanics, not one dominant build.",
    rewardConcept: "Crown Relic (New Game+ modifier unlock + full trial mastery title)",
    trialDesignNotes: ["Modules are short and labeled so fight feels fair.", "Punish scales with repetition count, not random spikes.", "Hard enrage only after generous turn budget."],
    bossGimmickSummary: "Capstone encounter combining defense, speed, status, trick, field, DoT, burst, phase, stat, combo, and control checks.",
    balanceAssumptions: { expectedFightLengthTurns: "12-16", playerPowerTier: "final" },
    testCases: ["Each exam flag toggles once when lesson condition met.", "Judgment stacks reset on module transition.", "No module can soft-lock player action economy."]
  })
};

export const HANAFUDA_BOSS_ORDER = Object.values(HANAFUDA_BOSSES)
  .sort((a, b) => a.order - b.order)
  .map((bossDef) => bossDef.id);

export const HANAFUDA_BALANCE_ASSUMPTIONS = {
  baseline: {
    expectedPlayerPartySize: 3,
    expectedConsumableUsePerTrial: "1-3",
    wipeProtectionPolicy: "no unavoidable one-turn full-party KO before boss 12"
  },
  scaling: {
    hpBudgetGrowthPerTrialPct: 8,
    outgoingDamageGrowthPerTrialPct: 6,
    gimmickComplexityGrowth: "adds one new system interaction per trial"
  }
};

export const HANAFUDA_TEST_CASES = [
  "All 12 bosses define exactly 3 traits and at least 3 signature moves.",
  "Each boss has a bossGimmick.stateInit object serializable into gameState save data.",
  "Lesson order across bosses matches HANAFUDA_PROGRESS_LESSONS.",
  "No boss before trial 5 uses multi-system field + phase logic simultaneously.",
  "Final boss references all prior lesson flags in examFlags."
];
