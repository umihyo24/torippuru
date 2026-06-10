export const CONFIG = {
  SAVE_KEY: "torippuru-island-save-v2",
  CANVAS: { width: 1344, height: 864, tile: 48 },
  MAP: { cols: 28, rows: 18 },
  TIME: { monthWeeks: 4, monthsPerYear: 12, weekMs: 2200 },
  UI: { bottomPanelMaxHeight: 280 },
  KNOWNNESS_THRESHOLDS: [100, 200, 300, 400, 500],
  SPEEDS: [0, 1, 2, 4],
  BUILD_TOOLS: {
    road: { id: "road", label: "道路", category: "road", cost: 5, size: [1, 1], color: "#bda77a" },
    inn: { id: "inn", label: "宿屋", category: "facility", cost: 80, size: [2, 2], color: "#8fc7ff" },
    restaurant: { id: "restaurant", label: "食堂", category: "facility", cost: 70, size: [2, 2], color: "#ffb36b" },
    blacksmith: { id: "blacksmith", label: "鍛冶屋", category: "facility", cost: 95, size: [2, 2], color: "#b8b2aa" },
    flower: { id: "flower", label: "花", category: "decoration", cost: 8, size: [1, 1], color: "#ff7eb6" },
    tree: { id: "tree", label: "木", category: "decoration", cost: 12, size: [1, 1], color: "#4fac65" },
    rock: { id: "rock", label: "岩", category: "decoration", cost: 10, size: [1, 1], color: "#9da5ad" },
    clearing: { id: "clearing", label: "開拓", category: "utility", cost: 15, size: [1, 1], color: "#d7c28a" },
    delete: { id: "delete", label: "撤去", category: "utility", cost: 0, size: [1, 1], color: "#ff6f6f" }
  },
  BUILD_CATEGORIES: [
    { id: "road", label: "道路" },
    { id: "facility", label: "施設" },
    { id: "decoration", label: "装飾" },
    { id: "utility", label: "管理" }
  ],
  VISITOR_UNLOCKS: [
    { threshold: 100, id: "mio", name: "ミオ" },
    { threshold: 200, id: "ruka", name: "ルカ" },
    { threshold: 300, id: "nagi", name: "ナギ" },
    { threshold: 400, id: "sora", name: "ソラ" },
    { threshold: 500, id: "yuki", name: "ユキ" }
  ]
};
