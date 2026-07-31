const SITE_URL = 'https://rogerbass.com';

export interface SitemapArticle {
  slug: string;
  title?: string;
  cover_image?: string;
  published_at?: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface StaticPage {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
  images?: { loc: string; title: string; caption?: string }[];
}

const STATIC_PAGES: StaticPage[] = [
  {
    loc: `${SITE_URL}/`,
    changefreq: 'weekly',
    priority: '1.0',
    images: [
      {
        loc: `${SITE_URL}/images/rogerbass2.jpeg`,
        title: 'Mukendi Kadiayi Roger Bass – Guitariste Professionnel',
        caption: 'Portrait de Roger Bass, guitariste professionnel depuis 2008',
      },
      {
        loc: `${SITE_URL}/images/rogzrbass1.jpeg`,
        title: 'Roger Bass – Guitariste basse électrique',
        caption: 'Roger Bass avec sa guitare basse électrique',
      },
    ],
  },
  { loc: `${SITE_URL}/#apropos`, changefreq: 'monthly', priority: '0.8' },
  { loc: `${SITE_URL}/#biographie`, changefreq: 'monthly', priority: '0.8' },
  { loc: `${SITE_URL}/#oeuvres`, changefreq: 'weekly', priority: '0.9' },
  { loc: `${SITE_URL}/#galerie`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${SITE_URL}/#enseignements`, changefreq: 'weekly', priority: '0.9' },
  { loc: `${SITE_URL}/#agenda`, changefreq: 'daily', priority: '0.9' },
  { loc: `${SITE_URL}/#services`, changefreq: 'monthly', priority: '0.7' },
  { loc: `${SITE_URL}/#contact`, changefreq: 'monthly', priority: '0.7' },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastmod(raw?: string | null): string {
  const fallback = new Date().toISOString().slice(0, 10);
  if (!raw || raw.startsWith('0001-')) return fallback;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString().slice(0, 10);
}

function urlEntry(
  loc: string,
  changefreq: string,
  priority: string,
  lastmod: string,
  images?: StaticPage['images'],
): string {
  let xml = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n`;
  if (images?.length) {
    for (const img of images) {
      xml += `    <image:image>\n      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
      if (img.caption) {
        xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
      }
      xml += `    </image:image>\n`;
    }
  }
  xml += `  </url>\n`;
  return xml;
}

export async function fetchPublishedArticles(apiUrl: string): Promise<SitemapArticle[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/articles`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as SitemapArticle[] | null;
    return Array.isArray(data) ? data.filter((a) => a.slug) : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildSitemapXml(apiUrl: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const articles = await fetchPublishedArticles(apiUrl);

  let body = '';

  for (const page of STATIC_PAGES) {
    body += urlEntry(page.loc, page.changefreq, page.priority, page.lastmod ?? today, page.images);
  }

  for (const article of articles) {
    const slug = article.slug?.trim();
    if (!slug) continue;

    const loc = `${SITE_URL}/enseignements/${encodeURIComponent(slug)}`;
    const lastmod = formatLastmod(article.UpdatedAt ?? article.published_at ?? article.CreatedAt);
    const images = article.cover_image?.trim()
      ? [{ loc: article.cover_image, title: article.title ?? article.slug }]
      : undefined;
    body += urlEntry(loc, 'monthly', '0.85', lastmod, images);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}</urlset>
`;
}

export function buildRobotsTxt(): string {
  return `# robots.txt — Roger Bass Portfolio
# ${SITE_URL}

User-agent: *
Allow: /
Allow: /enseignements/
Disallow: /admin
Disallow: /admin/

User-agent: Googlebot
Allow: /
Allow: /enseignements/
Disallow: /admin

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /
Disallow: /admin

User-agent: AhrefsBot
Crawl-delay: 10
Disallow: /admin

User-agent: SemrushBot
Crawl-delay: 10
Disallow: /admin

User-agent: MJ12bot
Disallow: /

User-agent: PetalBot
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
