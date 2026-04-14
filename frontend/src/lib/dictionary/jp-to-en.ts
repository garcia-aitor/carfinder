function normalizeBrandKey(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[・･·]/g, " ")
    .replace(/[-‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

const BRAND_ALIASES: Array<[string, string]> = [
  ["トヨタ", "Toyota"],
  ["TOYOTA", "Toyota"],
  ["日産", "Nissan"],
  ["ニッサン", "Nissan"],
  ["NISSAN", "Nissan"],
  ["ホンダ", "Honda"],
  ["HONDA", "Honda"],
  ["マツダ", "Mazda"],
  ["MAZDA", "Mazda"],
  ["スバル", "Subaru"],
  ["SUBARU", "Subaru"],
  ["三菱", "Mitsubishi"],
  ["ミツビシ", "Mitsubishi"],
  ["MITSUBISHI", "Mitsubishi"],
  ["スズキ", "Suzuki"],
  ["SUZUKI", "Suzuki"],
  ["ダイハツ", "Daihatsu"],
  ["DAIHATSU", "Daihatsu"],
  ["レクサス", "Lexus"],
  ["LEXUS", "Lexus"],
  ["いすゞ", "Isuzu"],
  ["イスズ", "Isuzu"],
  ["ISUZU", "Isuzu"],
  ["光岡", "Mitsuoka"],
  ["ミツオカ", "Mitsuoka"],
  ["MITSUOKA", "Mitsuoka"],
  ["アキュラ", "Acura"],
  ["ACURA", "Acura"],
  ["インフィニティ", "Infiniti"],
  ["INFINITI", "Infiniti"],
  ["ヒュンダイ", "Hyundai"],
  ["現代", "Hyundai"],
  ["HYUNDAI", "Hyundai"],
  ["起亜", "Kia"],
  ["キア", "Kia"],
  ["KIA", "Kia"],
  ["ジェネシス", "Genesis"],
  ["GENESIS", "Genesis"],
  ["メルセデス ベンツ", "Mercedes-Benz"],
  ["メルセデス・ベンツ", "Mercedes-Benz"],
  ["ベンツ", "Mercedes-Benz"],
  ["MERCEDES", "Mercedes-Benz"],
  ["MERCEDES-BENZ", "Mercedes-Benz"],
  ["BMW", "BMW"],
  ["ビーエムダブリュー", "BMW"],
  ["アウディ", "Audi"],
  ["AUDI", "Audi"],
  ["フォルクスワーゲン", "Volkswagen"],
  ["VW", "Volkswagen"],
  ["VOLKSWAGEN", "Volkswagen"],
  ["ポルシェ", "Porsche"],
  ["PORSCHE", "Porsche"],
  ["オペル", "Opel"],
  ["OPEL", "Opel"],
  ["スマート", "Smart"],
  ["SMART", "Smart"],
  ["マイバッハ", "Maybach"],
  ["MAYBACH", "Maybach"],
  ["アルピナ", "Alpina"],
  ["ALPINA", "Alpina"],
  ["フォード", "Ford"],
  ["FORD", "Ford"],
  ["リンカーン", "Lincoln"],
  ["LINCOLN", "Lincoln"],
  ["マーキュリー", "Mercury"],
  ["MERCURY", "Mercury"],
  ["シボレー", "Chevrolet"],
  ["CHEVROLET", "Chevrolet"],
  ["キャデラック", "Cadillac"],
  ["CADILLAC", "Cadillac"],
  ["GMC", "GMC"],
  ["ビュイック", "Buick"],
  ["BUICK", "Buick"],
  ["クライスラー", "Chrysler"],
  ["CHRYSLER", "Chrysler"],
  ["ジープ", "Jeep"],
  ["JEEP", "Jeep"],
  ["ダッジ", "Dodge"],
  ["DODGE", "Dodge"],
  ["ラム", "Ram"],
  ["RAM", "Ram"],
  ["テスラ", "Tesla"],
  ["TESLA", "Tesla"],
  ["リヴィアン", "Rivian"],
  ["RIVIAN", "Rivian"],
  ["ルシード", "Lucid"],
  ["LUCID", "Lucid"],
  ["ハマー", "Hummer"],
  ["HUMMER", "Hummer"],
  ["サターン", "Saturn"],
  ["SATURN", "Saturn"],
  ["ジャガー", "Jaguar"],
  ["JAGUAR", "Jaguar"],
  ["ランドローバー", "Land Rover"],
  ["レンジローバー", "Land Rover"],
  ["LAND ROVER", "Land Rover"],
  ["ローバー", "Rover"],
  ["ROVER", "Rover"],
  ["ミニ", "MINI"],
  ["MINI", "MINI"],
  ["ベントレー", "Bentley"],
  ["BENTLEY", "Bentley"],
  ["ロールス ロイス", "Rolls-Royce"],
  ["ロールス・ロイス", "Rolls-Royce"],
  ["ROLLS ROYCE", "Rolls-Royce"],
  ["ROLLS-ROYCE", "Rolls-Royce"],
  ["アストンマーティン", "Aston Martin"],
  ["ASTON MARTIN", "Aston Martin"],
  ["マクラーレン", "McLaren"],
  ["MCLAREN", "McLaren"],
  ["ロータス", "Lotus"],
  ["LOTUS", "Lotus"],
  ["MG", "MG"],
  ["MORRIS GARAGES", "MG"],
  ["フェラーリ", "Ferrari"],
  ["FERRARI", "Ferrari"],
  ["ランボルギーニ", "Lamborghini"],
  ["LAMBORGHINI", "Lamborghini"],
  ["マセラティ", "Maserati"],
  ["MASERATI", "Maserati"],
  ["アルファロメオ", "Alfa Romeo"],
  ["ALFA ROMEO", "Alfa Romeo"],
  ["フィアット", "Fiat"],
  ["FIAT", "Fiat"],
  ["アバルト", "Abarth"],
  ["ABARTH", "Abarth"],
  ["ランチア", "Lancia"],
  ["LANCIA", "Lancia"],
  ["パガーニ", "Pagani"],
  ["PAGANI", "Pagani"],
  ["プジョー", "Peugeot"],
  ["PEUGEOT", "Peugeot"],
  ["ルノー", "Renault"],
  ["RENAULT", "Renault"],
  ["シトロエン", "Citroen"],
  ["CITROEN", "Citroen"],
  ["DS", "DS Automobiles"],
  ["DS AUTOMOBILES", "DS Automobiles"],
  ["ブガッティ", "Bugatti"],
  ["BUGATTI", "Bugatti"],
  ["ボルボ", "Volvo"],
  ["VOLVO", "Volvo"],
  ["サーブ", "Saab"],
  ["SAAB", "Saab"],
  ["ポールスター", "Polestar"],
  ["POLESTAR", "Polestar"],
  ["ケーニグセグ", "Koenigsegg"],
  ["KOENIGSEGG", "Koenigsegg"],
  ["セアト", "SEAT"],
  ["SEAT", "SEAT"],
  ["クプラ", "Cupra"],
  ["CUPRA", "Cupra"],
  ["シュコダ", "Skoda"],
  ["SKODA", "Skoda"],
  ["ダチア", "Dacia"],
  ["DACIA", "Dacia"],
  ["ラーダ", "Lada"],
  ["LADA", "Lada"],
  ["BYD", "BYD"],
  ["比亜迪", "BYD"],
  ["吉利", "Geely"],
  ["GEELY", "Geely"],
  ["長城", "Great Wall"],
  ["GREAT WALL", "Great Wall"],
  ["哈弗", "Haval"],
  ["HAVAL", "Haval"],
  ["奇瑞", "Chery"],
  ["CHERY", "Chery"],
  ["紅旗", "Hongqi"],
  ["HONGQI", "Hongqi"],
  ["NIO", "NIO"],
  ["小鵬", "XPeng"],
  ["XPENG", "XPeng"],
  ["理想", "Li Auto"],
  ["LI AUTO", "Li Auto"],
  ["LYNK & CO", "Lynk & Co"],
  ["LYNK&CO", "Lynk & Co"],
  ["TATA", "Tata"],
  ["タタ", "Tata"],
  ["MAHINDRA", "Mahindra"],
  ["マヒンドラ", "Mahindra"],
  ["MARUTI SUZUKI", "Maruti Suzuki"],
];

const BRAND_MAP = Object.fromEntries(
  BRAND_ALIASES.map(([alias, brand]) => [normalizeBrandKey(alias), brand]),
);

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
  const text = normalizeText(value);
  if (!text) {
    return "N/A";
  }

  const normalizedText = normalizeBrandKey(text);
  if (BRAND_MAP[normalizedText]) {
    return BRAND_MAP[normalizedText];
  }

  for (const [alias, brand] of Object.entries(BRAND_MAP)) {
    if (normalizedText.includes(alias)) {
      return brand;
    }
  }

  return text;
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
