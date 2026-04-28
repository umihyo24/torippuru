export const ASSETS = {
  backgrounds: { battle: "assets/backgrounds/background_battle.png" },
  icons: {
    physical: "assets/icons/icon_physical.png",
    special: "assets/icons/icon_special.png",
    status: "assets/icons/icon_status.png"
  },
  portraits: {
    emberlynx: "assets/portraits/emberlynx.png",
    hittokage: "assets/portraits/hittokage.png",
    maguma: "assets/portraits/maguma.png",
    mossblob: "assets/portraits/mossblob.png",
    frostfang: "assets/portraits/frostfang.png",
    sandko: "assets/portraits/sandko.png",
    stormimp: "assets/portraits/stormimp.png",
    ironboar: "assets/portraits/ironboar.png",
    wyvern: "assets/portraits/wyvern.png",
    golem: "assets/portraits/golem.png",
    shinju: "assets/portraits/shinju.png",
    venomtoad: "assets/portraits/venomtoad.png",
    duskmoth: "assets/portraits/duskmoth.png",
    inoshissi: "assets/portraits/inoshissi.png",
    tododon: "assets/portraits/tododon.png",
  }
};

export const getAssetPath = (type, key) => {
  const table = ASSETS?.[type];
  if (!table || typeof table !== "object") return "";
  const normalizedKey = typeof key === "string" ? key.trim() : "";
  if (!normalizedKey) return "";
  const mapped = table[normalizedKey];
  if (typeof mapped !== "string") return "";
  return mapped.replace(/\\/g, "/");
};
