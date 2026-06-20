# SEO Strategy

## In scope
- Public landing page (`/`)
- Public cars marketplace (`/cars-for-sale`)
- Public listing detail pages (`/listing/:id`)
- Public incoming cars page (`/incoming-cars`)
- Public incoming-car detail pages (`/incoming-cars/:id`)

## Out of scope
- Authentication utility pages (`/login`, `/register`, `/forgot-password`)
- Authenticated dashboard routes (`/dashboard`, `/my-cars`, `/car/:id`)
- Admin pages (`/admin`)
- API routes (`/api/**`)

## Target audience
- Arabic-speaking car buyers and import/shipping customers in Jordan and nearby markets.

## Primary keywords
- سيارات للبيع في الأردن
- استيراد السيارات في الأردن
- تتبع شحن السيارات
- سيارات قيد التحميل

## Technical notes
- Production serves a Vite React SPA through Express.
- `server/prerender.ts` injects route-specific head metadata for some public routes, but the public page body is still client-rendered.

## Dismissed categories
- (None yet)
