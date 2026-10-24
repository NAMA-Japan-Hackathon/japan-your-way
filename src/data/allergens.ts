export const allergenConfig = {
  version: "CAA · 1 April 2026",
  checkedOn: "2026-10-24",
  sourceUrl:
    "https://www.caa.go.jp/policies/policy/food_labeling/food_sanitation/allergy/assets/food_labeling_cms204_260401_01.pdf",
  mandatory: [
    "egg",
    "milk",
    "wheat",
    "buckwheat",
    "peanut",
    "shrimp",
    "crab",
    "walnut",
    "cashew",
  ],
  recommended: [
    "almond",
    "abalone",
    "squid",
    "salmon-roe",
    "orange",
    "kiwi",
    "beef",
    "sesame",
    "salmon",
    "mackerel",
    "soy",
    "chicken",
    "banana",
    "pistachio",
    "pork",
    "macadamia",
    "peach",
    "yam",
    "apple",
    "gelatin",
  ],
  markers: ["pork", "beef", "chicken", "gelatin", "alcohol", "fish-stock"],
  note: "Japan’s packaged processed-food labeling list is a reference, not a restaurant safety certification. Confirm ingredients and cross-contact directly with the restaurant.",
};
export const ingredientLabels: Record<string, string> = {
  "fish-stock": "Fish stock / dashi",
  "salmon-roe": "Salmon roe",
  squid: "Squid",
  macadamia: "Macadamia nut",
};
export const ingredientName = (key: string) =>
  ingredientLabels[key] ||
  key.replaceAll("-", " ").replace(/^./, (s) => s.toUpperCase());
