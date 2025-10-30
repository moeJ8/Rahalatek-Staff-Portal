const Blog = require('../models/Blog');

// Treat strings with only HTML wrappers or nbsp as empty
const isMeaningfulString = (value) => {
  if (typeof value !== 'string') return false;
  const stripped = value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|\u00A0/gi, ' ')
    .trim();
  return stripped.length > 0;
};

// Build absolute URL helper
const buildUrl = (baseUrl, lang, slug) => {
  if (lang === 'ar' || lang === 'fr') return `${baseUrl}/${lang}/blog/${slug}`;
  return `${baseUrl}/blog/${slug}`;
};

exports.getBlogSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

    const blogs = await Blog.find({ status: 'published' })
      .select('slug originalLanguage translations updatedAt publishedAt');

    res.set('Content-Type', 'application/xml');

    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
    const footer = '</urlset>';

    const urls = blogs.map((b) => {
      const orig = b.originalLanguage || 'ar';
      const langs = ['en', 'ar', 'fr'];

      // Determine which alternates are actually meaningful
      const available = new Set([orig]);
      langs.filter((l) => l !== orig).forEach((l) => {
        const t = b.translations || {};
        const title = t.title instanceof Map ? t.title.get(l) : t.title?.[l];
        const excerpt = t.excerpt instanceof Map ? t.excerpt.get(l) : t.excerpt?.[l];
        const content = t.content instanceof Map ? t.content.get(l) : t.content?.[l];
        const meta = t.metaDescription instanceof Map ? t.metaDescription.get(l) : t.metaDescription?.[l];
        if ([title, excerpt, content, meta].some(isMeaningfulString)) available.add(l);
      });

      const lastmod = (b.updatedAt || b.publishedAt || new Date()).toISOString();

      const loc = buildUrl(baseUrl, orig, b.slug);
      let block = `<url>\n  <loc>${loc}</loc>\n  <lastmod>${lastmod}</lastmod>`;
      // xhtml:link alternates
      for (const l of available) {
        const href = buildUrl(baseUrl, l, b.slug);
        block += `\n  <xhtml:link rel="alternate" hreflang="${l}" href="${href}" />`;
      }
      // x-default to original
      block += `\n  <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`;
      block += '\n</url>';
      return block;
    }).join('\n');

    return res.send(`${header}\n${urls}\n${footer}`);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    return res.status(500).send('');
  }
};


