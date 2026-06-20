import { db } from "./db";
import { listings, incomingCars } from "@shared/schema";
import { eq } from "drizzle-orm";

interface RouteMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

type JsonLdObject = Record<string, unknown>;

const SITE_NAME = "السعفة الذهبية";
const DEFAULT_OG_IMAGE = "/og-image.png";
const BASE_URL = "https://golden-palm.replit.app";

const NOT_FOUND = Symbol("NOT_FOUND");

async function getRouteMeta(
  pathname: string,
): Promise<RouteMeta | typeof NOT_FOUND | null> {
  if (pathname === "/" || pathname === "") {
    return {
      title: `${SITE_NAME} - منصة تداول السيارات في الأردن`,
      description:
        "السعفة الذهبية شركة رائدة في تجارة السيارات واستيرادها منذ 2004. تتبع شحناتك وتصفح أحدث السيارات المستوردة من أمريكا وأوروبا وكوريا.",
      ogImage: DEFAULT_OG_IMAGE,
      canonical: `${BASE_URL}/`,
    };
  }

  if (pathname === "/cars-for-sale") {
    return {
      title: `سيارات للبيع - ${SITE_NAME} | سوق السيارات في الأردن`,
      description:
        "تصفح مئات السيارات المعروضة للبيع في السعفة الذهبية. سيارات مستوردة بأسعار تنافسية مع خيارات تصفية متقدمة للبحث عن سيارتك المثالية.",
      ogImage: DEFAULT_OG_IMAGE,
      canonical: `${BASE_URL}/cars-for-sale`,
    };
  }

  if (pathname === "/incoming-cars") {
    return {
      title: `سيارات قيد التحميل - ${SITE_NAME} | وصول قريب`,
      description:
        "تعرف على آخر السيارات القادمة من المزادات الأمريكية والأوروبية. شاهد السيارات التي ستصل قريباً إلى معرض السعفة الذهبية في الأردن.",
      ogImage: DEFAULT_OG_IMAGE,
      canonical: `${BASE_URL}/incoming-cars`,
    };
  }

  const incomingCarMatch = pathname.match(/^\/incoming-cars\/(\d+)$/);
  if (incomingCarMatch) {
    const id = parseInt(incomingCarMatch[1], 10);
    try {
      const [car] = await db
        .select()
        .from(incomingCars)
        .where(eq(incomingCars.id, id))
        .limit(1);

      if (car) {
        const nameParts = [car.make, car.model, car.year]
          .filter(Boolean)
          .join(" ");
        const descBase = car.details
          ? car.details.slice(0, 140)
          : `سيارة ${nameParts} قادمة قريباً إلى معرض السعفة الذهبية`;
        return {
          title: `${nameParts} - قيد الشحن | ${SITE_NAME}`,
          description: descBase,
          ogImage: car.imageUrl || DEFAULT_OG_IMAGE,
          canonical: `${BASE_URL}/incoming-cars/${id}`,
        };
      }
    } catch {
    }
    return NOT_FOUND;
  }

  const listingMatch = pathname.match(/^\/listing\/(\d+)$/);
  if (listingMatch) {
    const id = parseInt(listingMatch[1], 10);
    try {
      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, id))
        .limit(1);

      if (listing) {
        const nameParts = [listing.make, listing.model, listing.year]
          .filter(Boolean)
          .join(" ");
        const priceStr = listing.price
          ? `${listing.price.toLocaleString("ar-JO")} دينار`
          : "يُحدد عند التواصل";
        const descBase = listing.description
          ? listing.description.slice(0, 140)
          : `سيارة ${nameParts} مستوردة معروضة للبيع`;
        return {
          title: `${nameParts} للبيع - ${SITE_NAME}`,
          description: `${nameParts} بسعر ${priceStr}. ${descBase}`,
          ogImage: listing.imageUrl || DEFAULT_OG_IMAGE,
          canonical: `${BASE_URL}/listing/${id}`,
        };
      }
    } catch {
    }
    return NOT_FOUND;
  }

  return null;
}

async function getRouteJsonLd(pathname: string): Promise<JsonLdObject | null> {
  if (pathname === "/" || pathname === "") {
    return {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "name": "السعفة الذهبية",
      "alternateName": "Golden Palm Car Trading",
      "description": "شركة رائدة في تجارة واستيراد السيارات في الأردن. نستورد السيارات من المزادات الأمريكية والأوروبية وكوريا.",
      "url": BASE_URL,
      "telephone": "+962796796108",
      "email": "muhanad_gf@yahoo.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "عمان",
        "addressCountry": "JO",
      },
      "areaServed": { "@type": "Country", "name": "Jordan" },
      "sameAs": [
        "https://www.facebook.com/golden.frond.gallery",
        "https://wa.me/962796796108",
      ],
    };
  }

  if (pathname === "/cars-for-sale") {
    try {
      const rows = await db
        .select({
          id: listings.id,
          make: listings.make,
          model: listings.model,
          year: listings.year,
          color: listings.color,
          price: listings.price,
          imageUrl: listings.imageUrl,
        })
        .from(listings);

      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "سيارات للبيع - السعفة الذهبية",
        "description": "تصفح السيارات المعروضة للبيع في معرض السعفة الذهبية في الأردن",
        "url": `${BASE_URL}/cars-for-sale`,
        "numberOfItems": rows.length,
        "itemListElement": rows.slice(0, 50).map((l, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${BASE_URL}/listing/${l.id}`,
          "name": [l.make, l.model, l.year].filter(Boolean).join(" "),
          "item": {
            "@type": "Vehicle",
            "name": [l.make, l.model, l.year].filter(Boolean).join(" "),
            "brand": l.make ? { "@type": "Brand", "name": l.make } : undefined,
            "model": l.model ?? undefined,
            "modelDate": l.year ? String(l.year) : undefined,
            "color": l.color ?? undefined,
            "image": l.imageUrl.startsWith("http") ? l.imageUrl : `${BASE_URL}${l.imageUrl}`,
            "url": `${BASE_URL}/listing/${l.id}`,
            "offers": l.price ? {
              "@type": "Offer",
              "priceCurrency": "JOD",
              "price": l.price,
              "availability": "https://schema.org/InStock",
            } : undefined,
          },
        })),
      };
    } catch {
      return null;
    }
  }

  if (pathname === "/incoming-cars") {
    try {
      const rows = await db
        .select({
          id: incomingCars.id,
          make: incomingCars.make,
          model: incomingCars.model,
          year: incomingCars.year,
          color: incomingCars.color,
          imageUrl: incomingCars.imageUrl,
        })
        .from(incomingCars);

      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "سيارات قيد التحميل - السعفة الذهبية",
        "description": "سيارات قادمة من المزادات الأمريكية والأوروبية إلى معرض السعفة الذهبية في الأردن",
        "url": `${BASE_URL}/incoming-cars`,
        "numberOfItems": rows.length,
        "itemListElement": rows.map((c, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${BASE_URL}/incoming-cars/${c.id}`,
          "name": [c.make, c.model, c.year].filter(Boolean).join(" "),
          "item": {
            "@type": "Vehicle",
            "name": [c.make, c.model, c.year].filter(Boolean).join(" "),
            "brand": c.make ? { "@type": "Brand", "name": c.make } : undefined,
            "model": c.model,
            "modelDate": c.year ? String(c.year) : undefined,
            "color": c.color ?? undefined,
            "image": c.imageUrl.startsWith("http") ? c.imageUrl : `${BASE_URL}${c.imageUrl}`,
            "url": `${BASE_URL}/incoming-cars/${c.id}`,
          },
        })),
      };
    } catch {
      return null;
    }
  }

  const incomingCarMatch = pathname.match(/^\/incoming-cars\/(\d+)$/);
  if (incomingCarMatch) {
    const id = parseInt(incomingCarMatch[1], 10);
    try {
      const [car] = await db.select().from(incomingCars).where(eq(incomingCars.id, id)).limit(1);
      if (!car) return null;
      const carName = [car.make, car.model, car.year].filter(Boolean).join(" ");
      const allImages: string[] = [];
      if (car.imageUrl) allImages.push(car.imageUrl.startsWith("http") ? car.imageUrl : `${BASE_URL}${car.imageUrl}`);
      if (car.images) {
        for (const img of car.images) {
          allImages.push(img.startsWith("http") ? img : `${BASE_URL}${img}`);
        }
      }
      return {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "name": carName,
        "brand": car.make ? { "@type": "Brand", "name": car.make } : undefined,
        "model": car.model,
        "modelDate": car.year ? String(car.year) : undefined,
        "color": car.color ?? undefined,
        "image": allImages.length === 1 ? allImages[0] : allImages.length > 1 ? allImages : undefined,
        "description": car.details ?? undefined,
        "url": `${BASE_URL}/incoming-cars/${car.id}`,
      };
    } catch {
      return null;
    }
  }

  const listingMatch = pathname.match(/^\/listing\/(\d+)$/);
  if (listingMatch) {
    const id = parseInt(listingMatch[1], 10);
    try {
      const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
      if (!listing) return null;
      const listingName = [listing.make, listing.model, listing.year].filter(Boolean).join(" ");
      const allImages: string[] = [];
      if (listing.imageUrl) allImages.push(listing.imageUrl.startsWith("http") ? listing.imageUrl : `${BASE_URL}${listing.imageUrl}`);
      if (listing.images) {
        for (const img of listing.images) {
          allImages.push(img.startsWith("http") ? img : `${BASE_URL}${img}`);
        }
      }
      return {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "name": listingName,
        "brand": listing.make ? { "@type": "Brand", "name": listing.make } : undefined,
        "model": listing.model ?? undefined,
        "modelDate": listing.year ? String(listing.year) : undefined,
        "color": listing.color ?? undefined,
        "image": allImages.length === 1 ? allImages[0] : allImages.length > 1 ? allImages : undefined,
        "description": listing.description ?? undefined,
        "vehicleTransmission": listing.transmission ?? undefined,
        "fuelType": listing.fuelType ?? undefined,
        "mileageFromOdometer": listing.mileage ? {
          "@type": "QuantitativeValue",
          "value": listing.mileage,
          "unitCode": "SMI",
        } : undefined,
        "vehicleSeatingCapacity": listing.seats ?? undefined,
        "bodyType": listing.bodyType ?? undefined,
        "url": `${BASE_URL}/listing/${listing.id}`,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "JOD",
          "price": listing.price ?? undefined,
          "availability": listing.status === "active"
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
          "seller": { "@type": "Organization", "name": "السعفة الذهبية" },
        },
      };
    } catch {
      return null;
    }
  }

  return null;
}

function injectJsonLd(html: string, jsonLd: JsonLdObject): string {
  const sanitized = JSON.stringify(jsonLd).replace(/<\//g, "<\\/");
  const scriptTag = `<script type="application/ld+json">${sanitized}</script>`;
  return html.replace("</head>", `  ${scriptTag}\n  </head>`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function injectMeta(html: string, meta: RouteMeta): string {
  const titleTag = `<title>${escapeHtml(meta.title)}</title>`;
  const metaTags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage || DEFAULT_OG_IMAGE)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.ogImage || DEFAULT_OG_IMAGE)}" />`,
    meta.canonical
      ? `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  let result = html;

  result = result.replace(/<title>[^<]*<\/title>/, titleTag);

  result = result.replace(
    /<meta name="description"[^>]*\/>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );
  result = result.replace(
    /<meta property="og:title"[^>]*\/>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
  );
  result = result.replace(
    /<meta property="og:description"[^>]*\/>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  );
  result = result.replace(
    /<meta property="og:image"[^>]*\/>/,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage || DEFAULT_OG_IMAGE)}" />`,
  );
  result = result.replace(
    /<meta name="twitter:title"[^>]*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
  );
  result = result.replace(
    /<meta name="twitter:description"[^>]*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  );
  result = result.replace(
    /<meta name="twitter:image"[^>]*\/>/,
    `<meta name="twitter:image" content="${escapeHtml(meta.ogImage || DEFAULT_OG_IMAGE)}" />`,
  );

  if (meta.canonical && !result.includes('rel="canonical"')) {
    result = result.replace(
      "</head>",
      `  <link rel="canonical" href="${escapeHtml(meta.canonical)}" />\n  </head>`,
    );
  }

  return result;
}

async function buildInventoryLinkBlock(pathname: string): Promise<string> {
  if (pathname === "/cars-for-sale") {
    try {
      const rows = await db.select({ id: listings.id, make: listings.make, model: listings.model, year: listings.year }).from(listings);
      if (rows.length === 0) return "";
      const anchors = rows
        .map((l) => {
          const label = [l.make, l.model, l.year].filter(Boolean).join(" ") || `سيارة ${l.id}`;
          return `<a href="/listing/${l.id}">${escapeHtml(label)}</a>`;
        })
        .join("\n");
      return `\n<nav aria-label="inventory-links" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">\n${anchors}\n</nav>`;
    } catch {
      return "";
    }
  }

  if (pathname === "/incoming-cars") {
    try {
      const rows = await db.select({ id: incomingCars.id, make: incomingCars.make, model: incomingCars.model, year: incomingCars.year }).from(incomingCars);
      if (rows.length === 0) return "";
      const anchors = rows
        .map((c) => {
          const label = [c.make, c.model, c.year].filter(Boolean).join(" ") || `سيارة ${c.id}`;
          return `<a href="/incoming-cars/${c.id}">${escapeHtml(label)}</a>`;
        })
        .join("\n");
      return `\n<nav aria-label="inventory-links" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">\n${anchors}\n</nav>`;
    } catch {
      return "";
    }
  }

  return "";
}

export async function injectRouteMetadata(
  html: string,
  pathname: string,
): Promise<{ html: string; notFound: boolean }> {
  const [meta, linkBlock, jsonLd] = await Promise.all([
    getRouteMeta(pathname),
    buildInventoryLinkBlock(pathname),
    getRouteJsonLd(pathname),
  ]);

  if (meta === NOT_FOUND) {
    return { html, notFound: true };
  }

  let result = meta ? injectMeta(html, meta) : html;

  if (jsonLd) {
    result = injectJsonLd(result, jsonLd);
  }

  if (linkBlock) {
    result = result.replace("</body>", `${linkBlock}\n</body>`);
  }

  return { html: result, notFound: false };
}
