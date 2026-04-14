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

function normalizeModelKey(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[・･·]/g, " ")
    .replace(/[-‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

const MODEL_ALIASES: Array<[string, string]> = [
  ["ランドクルーザー", "Land Cruiser"],
  ["ランドクルーザープラド", "Land Cruiser Prado"],
  ["プラド", "Prado"],
  ["アルファード", "Alphard"],
  ["ヴェルファイア", "Vellfire"],
  ["ハリアー", "Harrier"],
  ["ヤリス", "Yaris"],
  ["ヤリスクロス", "Yaris Cross"],
  ["アクア", "Aqua"],
  ["プリウス", "Prius"],
  ["カローラ", "Corolla"],
  ["カローラクロス", "Corolla Cross"],
  ["クラウン", "Crown"],
  ["クラウンスポーツ", "Crown Sport"],
  ["ノア", "Noah"],
  ["ヴォクシー", "Voxy"],
  ["シエンタ", "Sienta"],
  ["ルーミー", "Roomy"],
  ["RAV4", "RAV4"],
  ["CH-R", "C-HR"],
  ["C-HR", "C-HR"],
  ["セレナ", "Serena"],
  ["ノート", "Note"],
  ["エクストレイル", "X-Trail"],
  ["スカイライン", "Skyline"],
  ["フェアレディZ", "Fairlady Z"],
  ["デイズ", "Dayz"],
  ["キックス", "Kicks"],
  ["ルークス", "Roox"],
  ["シビック", "Civic"],
  ["フィット", "Fit"],
  ["ヴェゼル", "Vezel"],
  ["フリード", "Freed"],
  ["ステップワゴン", "Stepwgn"],
  ["オデッセイ", "Odyssey"],
  ["N-BOX", "N-BOX"],
  ["N-WGN", "N-WGN"],
  ["N-ONE", "N-ONE"],
  ["デミオ", "Demio"],
  ["アクセラ", "Axela"],
  ["アテンザ", "Atenza"],
  ["ロードスター", "Roadster"],
  ["CX-3", "CX-3"],
  ["CX-5", "CX-5"],
  ["CX-8", "CX-8"],
  ["CX-30", "CX-30"],
  ["フォレスター", "Forester"],
  ["インプレッサ", "Impreza"],
  ["レヴォーグ", "Levorg"],
  ["レガシィ", "Legacy"],
  ["アウトバック", "Outback"],
  ["XV", "XV"],
  ["WRX", "WRX"],
  ["ジムニー", "Jimny"],
  ["スイフト", "Swift"],
  ["ハスラー", "Hustler"],
  ["スペーシア", "Spacia"],
  ["ワゴンR", "Wagon R"],
  ["タント", "Tanto"],
  ["ムーヴ", "Move"],
  ["ミライース", "Mira e:S"],
  ["ロッキー", "Rocky"],
  ["タフト", "Taft"],
  ["RX", "RX"],
  ["NX", "NX"],
  ["UX", "UX"],
  ["LX", "LX"],
  ["LS", "LS"],
  ["ES", "ES"],
  ["IS", "IS"],
  ["CT", "CT"],
  ["MODEL S", "Model S"],
  ["MODEL 3", "Model 3"],
  ["MODEL X", "Model X"],
  ["MODEL Y", "Model Y"],
  ["QASHQAI", "Qashqai"],
  ["MERCEDES-BENZ C-CLASS", "C-Class"],
  ["MERCEDES-BENZ E-CLASS", "E-Class"],
  ["MERCEDES-BENZ S-CLASS", "S-Class"],
  ["3 SERIES", "3 Series"],
  ["5 SERIES", "5 Series"],
  ["7 SERIES", "7 Series"],
  ["A3", "A3"],
  ["A4", "A4"],
  ["A6", "A6"],
  ["GOLF", "Golf"],
  ["PASSAT", "Passat"],
  ["POLO", "Polo"],
];

const MODEL_MAP = Object.fromEntries(
  MODEL_ALIASES.map(([alias, model]) => [normalizeModelKey(alias), model]),
);

const KANA_ROMAJI_MAP: Record<string, string> = {
  キャ: "kya",
  キュ: "kyu",
  キョ: "kyo",
  シャ: "sha",
  シュ: "shu",
  ショ: "sho",
  チャ: "cha",
  チュ: "chu",
  チョ: "cho",
  ニャ: "nya",
  ニュ: "nyu",
  ニョ: "nyo",
  ヒャ: "hya",
  ヒュ: "hyu",
  ヒョ: "hyo",
  ミャ: "mya",
  ミュ: "myu",
  ミョ: "myo",
  リャ: "rya",
  リュ: "ryu",
  リョ: "ryo",
  ギャ: "gya",
  ギュ: "gyu",
  ギョ: "gyo",
  ジャ: "ja",
  ジュ: "ju",
  ジョ: "jo",
  ビャ: "bya",
  ビュ: "byu",
  ビョ: "byo",
  ピャ: "pya",
  ピュ: "pyu",
  ピョ: "pyo",
  ティ: "ti",
  ディ: "di",
  トゥ: "tu",
  ドゥ: "du",
  ツァ: "tsa",
  ツィ: "tsi",
  ツェ: "tse",
  ツォ: "tso",
  ファ: "fa",
  フィ: "fi",
  フェ: "fe",
  フォ: "fo",
  ウィ: "wi",
  ウェ: "we",
  ウォ: "wo",
  ヴァ: "va",
  ヴィ: "vi",
  ヴ: "vu",
  ヴェ: "ve",
  ヴォ: "vo",
  ア: "a",
  イ: "i",
  ウ: "u",
  エ: "e",
  オ: "o",
  カ: "ka",
  キ: "ki",
  ク: "ku",
  ケ: "ke",
  コ: "ko",
  サ: "sa",
  シ: "shi",
  ス: "su",
  セ: "se",
  ソ: "so",
  タ: "ta",
  チ: "chi",
  ツ: "tsu",
  テ: "te",
  ト: "to",
  ナ: "na",
  ニ: "ni",
  ヌ: "nu",
  ネ: "ne",
  ノ: "no",
  ハ: "ha",
  ヒ: "hi",
  フ: "fu",
  ヘ: "he",
  ホ: "ho",
  マ: "ma",
  ミ: "mi",
  ム: "mu",
  メ: "me",
  モ: "mo",
  ヤ: "ya",
  ユ: "yu",
  ヨ: "yo",
  ラ: "ra",
  リ: "ri",
  ル: "ru",
  レ: "re",
  ロ: "ro",
  ワ: "wa",
  ヲ: "wo",
  ン: "n",
  ガ: "ga",
  ギ: "gi",
  グ: "gu",
  ゲ: "ge",
  ゴ: "go",
  ザ: "za",
  ジ: "ji",
  ズ: "zu",
  ゼ: "ze",
  ゾ: "zo",
  ダ: "da",
  ヂ: "ji",
  ヅ: "zu",
  デ: "de",
  ド: "do",
  バ: "ba",
  ビ: "bi",
  ブ: "bu",
  ベ: "be",
  ボ: "bo",
  パ: "pa",
  ピ: "pi",
  プ: "pu",
  ペ: "pe",
  ポ: "po",
};

const ALL_CAP_MODEL_TOKENS = new Set([
  "GT",
  "GTR",
  "GR",
  "RS",
  "ST",
  "STI",
  "TYPE",
  "R",
  "EV",
  "HEV",
  "PHEV",
  "HV",
  "SUV",
  "XV",
  "RX",
  "NX",
  "UX",
  "LX",
  "LS",
  "ES",
  "IS",
  "CT",
  "ZX",
  "ZXI",
  "AWD",
  "4WD",
  "2WD",
]);

function toKatakana(char: string): string {
  const code = char.charCodeAt(0);
  if (code >= 0x3041 && code <= 0x3096) {
    return String.fromCharCode(code + 0x60);
  }
  return char;
}

function titleCaseModelToken(token: string): string {
  if (!token) {
    return token;
  }

  const upper = token.toUpperCase();
  if (
    ALL_CAP_MODEL_TOKENS.has(upper) ||
    /[0-9]/.test(token) ||
    token.includes("-")
  ) {
    return upper;
  }
  return upper[0] + upper.slice(1).toLowerCase();
}

function prettifyRomanizedModel(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((token) => titleCaseModelToken(token))
    .join(" ");
}

function getLastVowel(value: string): string {
  const matches = value.match(/[aeiou](?!.*[aeiou])/);
  return matches ? matches[0] : "";
}

function transliterateKanaToRomaji(value: string): string {
  const chars = Array.from(value).map((char) => toKatakana(char));
  let result = "";
  let geminate = false;

  for (let index = 0; index < chars.length; index += 1) {
    const current = chars[index] ?? "";
    const next = chars[index + 1] ?? "";

    if (current === "ッ") {
      geminate = true;
      continue;
    }

    if (current === "ー") {
      const vowel = getLastVowel(result);
      if (vowel) {
        result += vowel;
      }
      continue;
    }

    const pair = `${current}${next}`;
    let romaji = "";
    if (KANA_ROMAJI_MAP[pair]) {
      romaji = KANA_ROMAJI_MAP[pair];
      index += 1;
    } else if (KANA_ROMAJI_MAP[current]) {
      romaji = KANA_ROMAJI_MAP[current];
    } else {
      romaji = current;
    }

    if (geminate && /^[a-z]/.test(romaji)) {
      result += romaji[0];
      geminate = false;
    } else {
      geminate = false;
    }

    result += romaji;
  }

  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

export function normalizeModel(
  value: string | null | undefined,
  brand?: string | null,
): string {
  const text = normalizeText(value);
  if (!text) {
    return "N/A";
  }

  const normalizedModel = normalizeModelKey(text);
  if (MODEL_MAP[normalizedModel]) {
    return MODEL_MAP[normalizedModel];
  }

  const sortedAliases = Object.entries(MODEL_MAP).sort(
    (entryA, entryB) => entryB[0].length - entryA[0].length,
  );
  for (const [alias, translation] of sortedAliases) {
    if (normalizedModel.includes(alias)) {
      return translation;
    }
  }

  let strippedModelText = text;
  if (brand) {
    const normalizedBrand = normalizeBrand(brand);
    strippedModelText = strippedModelText
      .replace(new RegExp(`^${escapeRegExp(normalizedBrand)}\\s+`, "i"), "")
      .replace(new RegExp(`^${escapeRegExp(brand)}\\s+`, "i"), "");
  }

  const transliterated = transliterateKanaToRomaji(
    strippedModelText.normalize("NFKC"),
  );
  return prettifyRomanizedModel(transliterated || strippedModelText);
}

export function normalizeTextOrFallback(value: string | null | undefined): string {
  const text = normalizeText(value);
  return text || "N/A";
}
