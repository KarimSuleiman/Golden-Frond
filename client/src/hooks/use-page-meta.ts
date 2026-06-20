import { useEffect } from "react";

interface PageMeta {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const DEFAULT_TITLE = "السعفة الذهبية - منصة تداول السيارات في الأردن";
const DEFAULT_DESCRIPTION =
  "منصة السعفة الذهبية لتداول وتتبع السيارات في الأردن. سيارات مستوردة من أمريكا وأوروبا وكوريا مع خدمة تتبع الشحنات.";

function setMeta(property: string, content: string, useProperty = false) {
  const attr = useProperty ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const title = meta.title ?? DEFAULT_TITLE;
    const description = meta.description ?? DEFAULT_DESCRIPTION;
    const ogTitle = meta.ogTitle ?? title;
    const ogDescription = meta.ogDescription ?? description;
    const ogImage = meta.ogImage ?? "/og-image.png";

    document.title = title;
    setMeta("description", description);
    setMeta("og:title", ogTitle, true);
    setMeta("og:description", ogDescription, true);
    setMeta("og:image", ogImage, true);
    setMeta("twitter:title", ogTitle);
    setMeta("twitter:description", ogDescription);
    setMeta("twitter:image", ogImage);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta("description", DEFAULT_DESCRIPTION);
      setMeta("og:title", DEFAULT_TITLE, true);
      setMeta("og:description", DEFAULT_DESCRIPTION, true);
      setMeta("og:image", "/og-image.png", true);
      setMeta("twitter:title", DEFAULT_TITLE);
      setMeta("twitter:description", DEFAULT_DESCRIPTION);
      setMeta("twitter:image", "/og-image.png");
    };
  }, [meta.title, meta.description, meta.ogTitle, meta.ogDescription, meta.ogImage]);
}
