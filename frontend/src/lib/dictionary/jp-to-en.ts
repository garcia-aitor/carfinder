const BRAND_MAP: Record<string, string> = {
  トヨタ: "Toyota",
  日産: "Nissan",
  ホンダ: "Honda",
  マツダ: "Mazda",
  スバル: "Subaru",
  三菱: "Mitsubishi",
  スズキ: "Suzuki",
  ダイハツ: "Daihatsu",
  レクサス: "Lexus",
  いすゞ: "Isuzu",
  光岡: "Mitsuoka",
  "メルセデス・ベンツ": "Mercedes-Benz",
  "ＢＭＷ": "BMW",
};

const COLOR_MAP: Record<string, string> = {
  白: "White",
  黒: "Black",
  銀: "Silver",
  灰: "Gray",
  赤: "Red",
  青: "Blue",
  緑: "Green",
  黄: "Yellow",
  真珠: "Pearl",
  紺: "Navy",
  茶: "Brown",
  紫: "Purple",
};

const CAR_TERM_MAP: Record<string, string> = {
  ハイブリッド: "Hybrid",
  "４ＷＤ": "4WD",
  "2WD": "2WD",
  "ＦＦ": "FWD",
  "ＦＲ": "RWD",
  MT: "Manual",
  AT: "Automatic",
  CVT: "CVT",
  ディーゼル: "Diesel",
  ガソリン: "Petrol",
  電気: "Electric",
  修復歴なし: "No accident history",
  ワンオーナー: "One owner",
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function translateWithMap(value: string | null | undefined, map: Record<string, string>): string {
  const text = normalizeText(value);
  if (!text) {
    return "N/A";
  }

  if (map[text]) {
    return map[text];
  }

  for (const [jp, en] of Object.entries(map)) {
    if (text.includes(jp)) {
      return en;
    }
  }

  return text;
}

export function normalizeBrand(value: string | null | undefined): string {
  return translateWithMap(value, BRAND_MAP);
}

export function normalizeColor(value: string | null | undefined): string {
  return translateWithMap(value, COLOR_MAP);
}

export function normalizeCarTerm(value: string | null | undefined): string {
  return translateWithMap(value, CAR_TERM_MAP);
}

export function normalizeTextOrFallback(value: string | null | undefined): string {
  const text = normalizeText(value);
  return text || "N/A";
}
