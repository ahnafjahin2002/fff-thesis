export const shops = [
  {
    id: "fruit",
    name: "ফলের দোকান",
    products: ["আম", "কলা", "আপেল", "লিচু", "কমলা"],
    locked: false,
    assetKey: "fruitShop" // matches bornoAssets.shops
  },
  {
    id: "grocery",
    name: "মুদি দোকান",
    products: ["চাল", "ডাল", "তেল", "লবণ", "চিনি"],
    locked: false,
    assetKey: "groceryShop"
  },
  {
    id: "fish",
    name: "মাছের দোকান",
    products: ["রুই", "কাতলা", "ইলিশ"],
    locked: true,
    assetKey: "fishShop"
  },
  {
    id: "book",
    name: "বইয়ের দোকান",
    products: ["বই", "খাতা", "কলম", "পেন্সিল"],
    locked: true,
    assetKey: "bookShop"
  },
  {
    id: "toy",
    name: "খেলনা ঘর",
    products: ["বল", "পুতুল", "গাড়ি", "ঘুড়ি"],
    locked: true,
    assetKey: "toyShop"
  }
];
