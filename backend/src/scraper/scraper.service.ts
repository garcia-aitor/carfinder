import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import * as cheerio from "cheerio";
import { env } from "../config/env";
import {
  cleanText,
  extractModelFromTitle,
  normalizePhotoUrl,
  parseEngineCc,
  parseMileageKm,
  parsePriceYen,
  parseYear,
  toAbsoluteUrl,
} from "./normalizers";
import { CarRecord } from "./types";

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly fallbackTotalPages = env.scrapeFallbackTotalPages;

  async discoverTotalPages(): Promise<number> {
    try {
      const html = await this.fetchPageHtml(1);
      const discovered = this.extractLastPageFromHtml(html);
      if (discovered > 0) {
        return discovered;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to discover total pages";
      this.logger.warn(
        `${message}. Falling back to ${this.fallbackTotalPages}.`,
      );
    }

    return this.fallbackTotalPages;
  }

  async scrapePage(page: number): Promise<CarRecord[]> {
    const html = await this.fetchPageHtml(page);
    const $ = cheerio.load(html);
    const cards = $(".cassetteMain").toArray();
    const results: CarRecord[] = [];

    for (const cardEl of cards) {
      const card = $(cardEl);
      const parent = card.parent();

      const id =
        cleanText(card.attr("id")) ?? cleanText(parent.attr("id")) ?? null;
      const brand = cleanText(
        card.find(".cassetteMain__carInfoContainer > p").first().text(),
      );
      const fullTitle = cleanText(
        card.find(".cassetteMain__title .cassetteMain__link").first().text(),
      );
      const listingUrl = toAbsoluteUrl(
        cleanText(
          card
            .find(".cassetteMain__title .cassetteMain__link")
            .first()
            .attr("href"),
        ),
      );

      const rawYear = this.extractSpecValue(card, "年式");
      const rawMileage = this.extractSpecValue(card, "走行距離");
      const rawEngine = this.extractSpecValue(card, "排気量");
      const rawPrice = cleanText(
        card.find(".totalPrice__mainPriceNum").first().text(),
      );

      const mainPhotoUrl = this.extractBestImageUrl(
        card.find(".cassetteMain__mainImg").first(),
      );
      const photoUrls = card
        .find(".cassetteMain__subImgBox .cassetteMain__subImg")
        .map((_, el) => {
          const block = card.find(el);
          return this.extractBestImageUrl(block);
        })
        .get()
        .filter((v): v is string => Boolean(v));

      results.push({
        id,
        brand,
        fullTitle,
        model: extractModelFromTitle(fullTitle),
        year: parseYear(rawYear),
        color: cleanText(
          parent
            .find(".carBodyInfoList__item")
            .eq(1)
            .contents()
            .first()
            .text()
            .trim(),
        ),
        mileageKm: parseMileageKm(rawMileage),
        priceYen: parsePriceYen(rawPrice),
        engineCc: parseEngineCc(rawEngine),
        sellerName: cleanText(
          parent.find(".cassetteSub__shop a").first().text(),
        ),
        sellerUrl: toAbsoluteUrl(
          cleanText(parent.find(".cassetteSub__shop a").first().attr("href")),
        ),
        listingUrl,
        mainPhotoUrl,
        photoUrls,
        raw: {
          year: rawYear,
          mileage: rawMileage,
          price: rawPrice,
          engine: rawEngine,
        },
      });
    }

    this.logger.debug(`Parsed ${results.length} cars from page ${page}.`);
    return results;
  }

  async scrapeOnePage(): Promise<CarRecord[]> {
    return this.scrapePage(1);
  }

  private async fetchPageHtml(page: number): Promise<string> {
    const response = await axios.get<string>(this.buildPageUrl(page), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      timeout: env.httpTimeoutMs,
    });
    return response.data;
  }

  private buildPageUrl(page: number): string {
    return `https://www.carsensor.net/usedcar/index${page}.html?SORT=19`;
  }

  private extractLastPageFromHtml(html: string): number {
    const $ = cheerio.load(html);
    const pagerLinks = $(
      ".pager__text a.js-carListTopPagerBtn[href]",
    ).toArray();
    const legacyPagerLinks = $(
      ".pager_text a.js-carListTopPagerBtn[href]",
    ).toArray();
    const links = pagerLinks.length > 0 ? pagerLinks : legacyPagerLinks;

    let lastHref: string | null = null;
    for (const linkEl of links) {
      const link = $(linkEl);
      const text = cleanText(link.text());
      if (text?.includes("最後")) {
        lastHref = cleanText(link.attr("href"));
        break;
      }
    }

    if (!lastHref && links.length > 0) {
      lastHref = cleanText($(links[links.length - 1]).attr("href"));
    }

    if (!lastHref) {
      return this.fallbackTotalPages;
    }

    const match = lastHref.match(/index(\d+)\.html/i);
    if (!match) {
      return this.fallbackTotalPages;
    }

    return Number(match[1]);
  }

  private extractSpecValue(
    card: cheerio.Cheerio<any>,
    label: string,
  ): string | null {
    const detailBoxes = card.find(".specList__detailBox").toArray();
    for (const boxEl of detailBoxes) {
      const box = card.find(boxEl);
      const texts = box
        .find("*")
        .map((_, el) => cleanText(card.find(el).text()))
        .get()
        .filter(Boolean) as string[];

      if (texts.includes(label)) {
        const dataText = cleanText(box.find(".specList__data").first().text());
        if (dataText) {
          return dataText;
        }

        for (const item of texts) {
          if (item !== label) {
            return item;
          }
        }
      }
    }

    return null;
  }

  private extractBestImageUrl(scope: cheerio.Cheerio<any>): string | null {
    const candidates: Array<string | null> = [];
    const imgs = scope.find("img").toArray();

    for (const imgEl of imgs) {
      const img = scope.find(imgEl);
      candidates.push(cleanText(img.attr("data-original")));
      candidates.push(cleanText(img.attr("data-src")));
      candidates.push(cleanText(img.attr("src")));
    }

    // Some blocks include lazy image URLs inside `document.write(...)` script text.
    const scriptText = scope
      .find("script")
      .map((_, el) => scope.find(el).html())
      .get()
      .join(" ");
    const scriptDataOriginalMatches = scriptText.match(
      /(data-original|data-src)\s*=\s*["']([^"']+)["']/gi,
    );
    if (scriptDataOriginalMatches) {
      for (const match of scriptDataOriginalMatches) {
        const urlMatch = match.match(/["']([^"']+)["']/);
        candidates.push(cleanText(urlMatch?.[1]));
      }
    }

    const scriptImgSrcMatches = scriptText.match(
      /<img[^>]+src=["']([^"']+)["']/gi,
    );
    if (scriptImgSrcMatches) {
      for (const match of scriptImgSrcMatches) {
        const urlMatch = match.match(/src=["']([^"']+)["']/i);
        candidates.push(cleanText(urlMatch?.[1]));
      }
    }

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      // Ignore loading placeholder gifs and keep the first real image.
      if (/\/static\/cmn\/img\/loading\/.+\.gif$/i.test(candidate)) {
        continue;
      }

      const normalized = normalizePhotoUrl(candidate);
      if (normalized) {
        return normalized;
      }
    }

    return null;
  }
}
