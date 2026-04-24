export const TRAITS = {
  venomTouch: { key: "venomTouch", name: "ベノムタッチ", description: "攻撃を当てた後、相手をどくにする。", traitKey: "venom_touch", onAfterDamage: [{ type: "applyStatus", status: "poison", duration: 2 }] },
  battleRhythm: { key: "battleRhythm", name: "バトルリズム", description: "ターン開始時、こうげき段階が1上がる。", traitKey: "battle_rhythm", onTurnStart: [{ type: "addAtkStage", amount: 1, target: "self" }] },
  openingSurge: { key: "openingSurge", name: "オープニングサージ", description: "登場時、こうげき段階が2上がる。", traitKey: "opening_surge", onSwitchIn: [{ type: "addAtkStage", amount: 2, target: "self" }] },
  gyakkyo_maru: { key: "gyakkyo_maru", name: "ぎゃっきょう○", description: "ターン開始時、こうげき段階が1上がる。", traitKey: "battle_rhythm", onTurnStart: [{ type: "addAtkStage", amount: 1, target: "self" }] },
  intimidate: { key: "intimidate", name: "いあつかん", description: "登場時、正面の相手のこうげきを1段階さげる", traitKey: "intimidate" },
  wonder_guard: { key: "wonder_guard", name: "ふしぎなまもり", description: "弱点以外の攻撃を受けない", traitKey: "wonder_guard" },
  koukakudahou: { key: "koukakudahou", name: "こうかくだほう", description: "自分以外のタイプのわざも一致威力になる", traitKey: "none" },
  no_guard: { key: "no_guard", name: "ノーガード", description: "お互いのすべての技が必中になる", traitKey: "no_guard" },
  ino_ichiban: { key: "ino_ichiban", name: "いのいちばん", description: "1ターン目だけ先制しやすくなる", traitKey: "first_turn_priority" },
  innocence: { key: "innocence", name: "イノセンス", description: "能力低下を受けない", traitKey: "ignore_stat_down" },
  innovation: { key: "innovation", name: "イノベーション", description: "攻撃後に攻撃↑防御↓", traitKey: "atk_up_def_down" }
};
