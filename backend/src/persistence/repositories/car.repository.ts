import { Injectable } from "@nestjs/common";
import { Car, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CarRecord } from "../../scraper/types";
import {
  CarsSortBy,
  QueryCarsDto,
  SortOrder,
} from "../../cars/dto/query-cars.dto";

const BRAND_SEARCH_GROUPS = [
  ["toyota", "トヨタ", "米国トヨタ", "us toyota"],
  ["nissan", "日産", "ニッサン", "米国日産", "us nissan"],
  ["honda", "ホンダ", "米国ホンダ", "us honda"],
  ["mazda", "マツダ", "米国マツダ", "us mazda"],
  ["subaru", "スバル", "米国スバル", "us subaru"],
  ["mitsubishi", "三菱", "ミツビシ", "米国三菱", "us mitsubishi"],
  ["suzuki", "スズキ", "米国スズキ", "us suzuki"],
  ["daihatsu", "ダイハツ"],
  ["lexus", "レクサス", "米国レクサス", "us lexus"],
  ["isuzu", "いすゞ", "イスズ"],
  ["hino", "日野", "日野自動車"],
  ["mitsubishi fuso", "fuso", "三菱ふそう"],
  ["ud trucks", "ud", "ＵＤトラックス"],
  [
    "mercedes-benz",
    "mercedes benz",
    "mercedes",
    "benz",
    "ベンツ",
    "メルセデス ベンツ",
    "メルセデス・ベンツ",
  ],
  ["mercedes-amg", "amg", "メルセデスＡＭＧ", "ＡＭＧ"],
  ["mercedes-maybach", "maybach", "メルセデス・マイバッハ", "マイバッハ"],
  ["bmw", "ＢＭＷ", "ビーエムダブリュー"],
  ["alpina", "bmw alpina", "ＢＭＷアルピナ", "アルピナ"],
  ["mini", "ミニ"],
  ["audi", "アウディ"],
  ["volkswagen", "vw", "フォルクスワーゲン"],
  ["porsche", "ポルシェ"],
  ["volvo", "ボルボ"],
  ["jaguar", "ジャガー"],
  ["land rover", "ランドローバー"],
  ["rover", "ローバー"],
  ["jeep", "ジープ", "amc jeep", "AMCジープ"],
  ["gmc", "ＧＭＣ"],
  ["cadillac", "キャデラック"],
  ["chevrolet", "シボレー"],
  ["ford", "フォード"],
  ["lincoln", "リンカーン"],
  ["dodge", "ダッジ"],
  ["chrysler", "クライスラー"],
  ["hummer", "ハマー"],
  ["buick", "ビュイック"],
  ["mercury", "マーキュリー"],
  ["pontiac", "ポンテアック"],
  ["oldsmobile", "オールズモビル"],
  ["saturn", "サターン"],
  ["tesla", "テスラ"],
  ["byd", "ＢＹＤ"],
  ["infiniti", "インフィニティ", "米国インフィニティ", "us infiniti"],
  ["acura", "アキュラ", "米国アキュラ", "us acura"],
  ["hyundai", "ヒョンデ"],
  ["mg", "ＭＧ"],
  ["opel", "オペル"],
  ["vauxhall", "ボクスホール"],
  ["saab", "サーブ"],
  ["renault", "ルノー"],
  ["peugeot", "プジョー"],
  ["citroen", "シトロエン"],
  ["ds automobiles", "ds", "ＤＳオートモビル"],
  ["fiat", "フィアット"],
  ["abarth", "アバルト"],
  ["alfa romeo", "alfa", "アルファ ロメオ"],
  ["ferrari", "フェラーリ"],
  ["lamborghini", "ランボルギーニ"],
  ["maserati", "マセラティ"],
  ["lancia", "ランチア"],
  ["bugatti", "ブガッティ"],
  ["aston martin", "アストンマーティン"],
  ["bentley", "ベントレー"],
  ["rolls-royce", "rolls royce", "ロールスロイス"],
  ["mclaren", "マクラーレン"],
  ["lotus", "ロータス"],
  ["caterham", "ケータハム"],
  ["morgan", "モーガン"],
  ["triumph", "トライアンフ"],
  ["de tomaso", "detomaso", "デトマソ"],
  ["koenigsegg", "ケーニッグゼグ"],
  ["ktm", "ＫＴＭ"],
  ["dacia", "ダチア"],
  ["lada", "ラーダ"],
  ["smart", "スマート"],
  ["daimler", "デイムラー"],
  ["austin", "オースチン"],
  ["morris", "モーリス"],
  ["riley", "ライレー"],
  ["healey", "ヒーレー"],
  ["birkin", "バーキン"],
  ["ginetta", "ジネッタ"],
  ["brabus", "ブラバス"],
  ["tommykaira", "トミーカイラ"],
  ["autobianchi", "アウトビアンキ"],
  ["westfield", "ウエストフィールド"],
  ["winnebago", "ウィネベーゴ"],
  ["scania", "スカニア"],
  ["plymouth", "プリムス"],
  ["dmc", "DMC"],
  ["amc", "ＡＭＣ"],
  ["td", "ＴＤ"],
  ["bl", "ＢＬ"],
  ["yes", "イエス"],
  ["mvs", "MVS"],
  ["vanden plas", "バンデンプラ"],
  ["moke", "モーク"],
  ["artega", "アルテガ"],
  ["hurtan", "フータン"],
  ["panhard", "パンサー"],
  ["wolseley", "ウーズレイ"],
  ["waz", "ワズ"],
  ["london taxi", "ロンドンタクシー"],
  ["other domestic", "国産車その他"],
  ["other import", "輸入車その他"],
] as const;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[・･·]/g, " ")
    .replace(/[-‐‑‒–—―]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function toFullWidthAscii(value: string): string {
  return value.replace(/[!-~]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0xfee0),
  );
}

function expandBrandSearchTerms(brand: string): string[] {
  const normalizedInput = normalizeSearchText(brand);
  if (!normalizedInput) {
    return [];
  }

  const terms = new Set<string>();
  const addTermWithVariants = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    terms.add(trimmed);
    const nfkc = trimmed.normalize("NFKC");
    terms.add(nfkc);

    // Some sources store latin brands in full-width chars (e.g. "ＢＭＷ").
    if (/^[\x20-\x7e]+$/.test(nfkc)) {
      terms.add(toFullWidthAscii(nfkc.toUpperCase()));
    }
  };

  addTermWithVariants(brand);
  for (const group of BRAND_SEARCH_GROUPS) {
    const normalizedGroup = group.map(normalizeSearchText);
    const hasMatch = normalizedGroup.some(
      (alias) =>
        alias.includes(normalizedInput) || normalizedInput.includes(alias),
    );

    if (hasMatch) {
      group.forEach((alias) => addTermWithVariants(alias));
    }
  }

  return [...terms].filter(Boolean);
}

function buildBrandContainsFilter(term: string): Prisma.CarWhereInput {
  return {
    brand: {
      contains: term,
      mode: Prisma.QueryMode.insensitive,
    },
  };
}

@Injectable()
export class CarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyWithFilters(query: QueryCarsDto): Promise<Car[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return this.prisma.car.findMany({
      where: this.buildWhere(query),
      orderBy: this.buildOrderBy(query),
      skip,
      take: limit,
    });
  }

  countWithFilters(query: QueryCarsDto): Promise<number> {
    return this.prisma.car.count({
      where: this.buildWhere(query),
    });
  }

  findById(id: string): Promise<Car | null> {
    return this.prisma.car.findUnique({
      where: { id },
    });
  }

  async upsertMany(cars: CarRecord[], runId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction(
      cars.map((car, index) => {
        const listingUrl =
          car.listingUrl ??
          `fallback:${car.id ?? "unknown"}:${now.getTime()}:${index}`;
        return this.prisma.car.upsert({
          where: {
            listingUrl,
          },
          create: {
            listingUrl,
            externalId: car.id,
            brand: car.brand,
            fullTitle: car.fullTitle,
            model: car.model,
            year: car.year,
            color: car.color,
            mileageKm: car.mileageKm,
            priceYen: car.priceYen,
            engineCc: car.engineCc,
            sellerName: car.sellerName,
            sellerUrl: car.sellerUrl,
            mainPhotoUrl: car.mainPhotoUrl,
            photoUrls: car.photoUrls,
            raw: car.raw,
            firstSeenAt: now,
            lastSeenRunId: runId,
            isAvailable: true,
            missingRuns: 0,
            disappearedAt: null,
          },
          update: {
            externalId: car.id,
            brand: car.brand,
            fullTitle: car.fullTitle,
            model: car.model,
            year: car.year,
            color: car.color,
            mileageKm: car.mileageKm,
            priceYen: car.priceYen,
            engineCc: car.engineCc,
            sellerName: car.sellerName,
            sellerUrl: car.sellerUrl,
            mainPhotoUrl: car.mainPhotoUrl,
            photoUrls: car.photoUrls,
            raw: car.raw,
            lastSeenRunId: runId,
            isAvailable: true,
            missingRuns: 0,
            disappearedAt: null,
            lastSeenAt: now,
          },
        });
      }),
    );
  }

  async reconcileAvailabilityForCompletedRun(
    runId: string,
    missingRunsThreshold: number,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "Car"
      SET
        "missingRuns" = CASE
          WHEN "lastSeenRunId" IS DISTINCT FROM ${runId} THEN "missingRuns" + 1
          ELSE "missingRuns"
        END,
        "isAvailable" = CASE
          WHEN "lastSeenRunId" IS DISTINCT FROM ${runId}
            AND "missingRuns" + 1 >= ${missingRunsThreshold}
            THEN FALSE
          ELSE "isAvailable"
        END,
        "disappearedAt" = CASE
          WHEN "lastSeenRunId" IS DISTINCT FROM ${runId}
            AND "missingRuns" + 1 >= ${missingRunsThreshold}
            THEN NOW()
          WHEN "lastSeenRunId" = ${runId}
            THEN NULL
          ELSE "disappearedAt"
        END
      WHERE "lastSeenRunId" IS DISTINCT FROM ${runId};
    `;
  }

  private buildWhere(query: QueryCarsDto): Prisma.CarWhereInput {
    const where: Prisma.CarWhereInput = {};
    const andFilters: Prisma.CarWhereInput[] = [];

    if (query.brand) {
      const brandSearchTerms = expandBrandSearchTerms(query.brand);

      andFilters.push({
        OR: brandSearchTerms.map((term) => buildBrandContainsFilter(term)),
      });
    }
    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable;
    }

    if (query.yearFrom !== undefined || query.yearTo !== undefined) {
      where.year = {};
      if (query.yearFrom !== undefined) {
        where.year.gte = query.yearFrom;
      }
      if (query.yearTo !== undefined) {
        where.year.lte = query.yearTo;
      }
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.priceYen = {};
      if (query.priceMin !== undefined) {
        where.priceYen.gte = query.priceMin;
      }
      if (query.priceMax !== undefined) {
        where.priceYen.lte = query.priceMax;
      }
    }

    if (query.mileageMin !== undefined || query.mileageMax !== undefined) {
      where.mileageKm = {};
      if (query.mileageMin !== undefined) {
        where.mileageKm.gte = query.mileageMin;
      }
      if (query.mileageMax !== undefined) {
        where.mileageKm.lte = query.mileageMax;
      }
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    return where;
  }

  private buildOrderBy(
    query: QueryCarsDto,
  ): Prisma.CarOrderByWithRelationInput {
    const sortBy = query.sortBy ?? CarsSortBy.FIRST_SEEN_AT;
    const sortOrder: Prisma.SortOrder =
      (query.sortOrder ?? SortOrder.DESC) === SortOrder.ASC ? "asc" : "desc";

    const allowedSortFields: Record<
      CarsSortBy,
      Prisma.CarOrderByWithRelationInput
    > = {
      [CarsSortBy.PRICE_YEN]: { priceYen: sortOrder },
      [CarsSortBy.MILEAGE_KM]: { mileageKm: sortOrder },
      [CarsSortBy.YEAR]: { year: sortOrder },
      [CarsSortBy.CREATED_AT]: { createdAt: sortOrder },
      [CarsSortBy.FIRST_SEEN_AT]: { firstSeenAt: sortOrder },
    };

    return allowedSortFields[sortBy] ?? { firstSeenAt: "desc" };
  }
}
