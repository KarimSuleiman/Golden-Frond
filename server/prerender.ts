import { db } from "./db";
import { listings } from "@shared/schema";
import { eq } from "drizzle-orm";

interface RouteMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

const SITE_NAME = "السعفة الذهبية";
const DEFAULT_OG_IMAGE = "/og-image.png";
const BASE_URL = process.env.REPL_SLUG
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : "";

async function getRouteMeta(pathname: string): Promise<RouteMeta | null> {
  if (pathname === "/" || pathname === "") {
    return {
      title: `${SITE_NAME} - منصة تداول السيارات في الأردن`,
      description:
        "السعفة الذهبية شركة رائدة في تجارة السيارات واستيرادها منذ 2004. تتبع شحناتك وتصفح أحدث السيارات المستوردة من أمريكا وأوروبا وكوريا.",
      ogImage: DEFAULT_OG_IMAGE,
    };
  }

  if (pathname === "/cars-for-sale") {
    return {
      title: `سيارات للبيع - ${SITE_NAME} | سوق السيارات في الأردن`,
      description:
        "تصفح مئات السيارات المعروضة للبيع في السعفة الذهبية. سيارات مستوردة بأسعار تنافسية مع خيارات تصفية متقدمة للبحث عن سيارتك المثالية.",
      ogImage: DEFAULT_OG_IMAGE,
    };
  }

  if (pathname === "/incoming-cars") {
    return {
      title: `سيارات قيد التحميل - ${SITE_NAME} | وصول قريب`,
      description:
        "تعرف على آخر السيارات القادمة من المزادات الأمريكية والأوروبية. شاهد السيارات التي ستصل قريباً إلى معرض السعفة الذهبية في الأردن.",
      ogImage: DEFAULT_OG_IMAGE,
    };
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
    return {
      title: `سيارة للبيع - ${SITE_NAME}`,
      description: "سيارة مستوردة معروضة للبيع في السعفة الذهبية - الأردن.",
      ogImage: DEFAULT_OG_IMAGE,
    };
  }

  return null;
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

export async function injectRouteMetadata(
  html: string,
  pathname: string,
): Promise<string> {
  const meta = await getRouteMeta(pathname);
  if (!meta) return html;
  return injectMeta(html, meta);
}
