const Blog = require('../models/Blog');
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Package = require('../models/Package');

// Treat strings with only HTML wrappers or nbsp as empty
const isMeaningfulString = (value) => {
  if (typeof value !== 'string') return false;
  const stripped = value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|\u00A0/gi, ' ')
    .trim();
  return stripped.length > 0;
};

// Build absolute URL helper for blog
const buildBlogUrl = (baseUrl, lang, slug) => {
  if (lang === 'ar' || lang === 'fr') return `${baseUrl}/${lang}/blog/${slug}`;
  return `${baseUrl}/blog/${slug}`;
};

// Build absolute URL helper for dynamic pages
const buildUrl = (baseUrl, lang, path) => {
  if (lang === 'ar' || lang === 'fr') return `${baseUrl}/${lang}${path}`;
  return `${baseUrl}${path}`;
};

// Helper to encode URLs properly
const encodeUri = (str) => {
  return encodeURIComponent(str).replace(/%20/g, '%20');
};

exports.getBlogSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

    const blogs = await Blog.find({ status: 'published' })
      .select('slug originalLanguage translations updatedAt publishedAt');

    res.set('Content-Type', 'application/xml');

    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
    const footer = '</urlset>';

    // Add main blog list pages with hreflang alternates
    const blogListPages = [
      { lang: 'en', path: '/blog' },
      { lang: 'ar', path: '/ar/blog' },
      { lang: 'fr', path: '/fr/blog' }
    ];

    const blogListEntries = blogListPages.map((page) => {
      const loc = `${baseUrl}${page.path}`;
      const lastmod = new Date().toISOString(); // Use current date for list pages
      let block = `<url>\n  <loc>${loc}</loc>\n  <lastmod>${lastmod}</lastmod>`;
      
      // Add hreflang alternates for all language versions
      blogListPages.forEach((alt) => {
        block += `\n  <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${baseUrl}${alt.path}" />`;
      });
      
      // Add x-default pointing to English
      block += `\n  <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/blog" />`;
      block += '\n</url>';
      return block;
    }).join('\n');

    // Individual blog posts
    const blogUrls = blogs.map((b) => {
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

      const loc = buildBlogUrl(baseUrl, orig, b.slug);
      let block = `<url>\n  <loc>${loc}</loc>\n  <lastmod>${lastmod}</lastmod>`;
      // xhtml:link alternates
      for (const l of available) {
        const href = buildBlogUrl(baseUrl, l, b.slug);
        block += `\n  <xhtml:link rel="alternate" hreflang="${l}" href="${href}" />`;
      }
      // x-default to original
      block += `\n  <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`;
      block += '\n</url>';
      return block;
    }).join('\n');

    // Combine blog list pages and individual blog posts
    const allUrls = [blogListEntries, blogUrls].filter(Boolean).join('\n');

    return res.send(`${header}\n${allUrls}\n${footer}`);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    return res.status(500).send('');
  }
};

// Main sitemap with all public pages
exports.getMainSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

    res.set('Content-Type', 'application/xml');

    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
    const footer = '</urlset>';

    const urls = [];
    const currentDate = new Date().toISOString();

    // Helper function to create URL entry with hreflang
    const createUrlEntry = (paths, priority = '0.8', changefreq = 'weekly') => {
      const langPaths = [
        { lang: 'en', path: paths.en },
        { lang: 'ar', path: paths.ar },
        { lang: 'fr', path: paths.fr }
      ];

      return langPaths.map(({ lang, path }) => {
        const loc = buildUrl(baseUrl, lang, path);
        let block = `<url>\n  <loc>${loc}</loc>\n  <lastmod>${currentDate}</lastmod>\n  <changefreq>${changefreq}</changefreq>\n  <priority>${priority}</priority>`;
        
        // Add hreflang alternates
        langPaths.forEach((alt) => {
          const altHref = buildUrl(baseUrl, alt.lang, alt.path);
          block += `\n  <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${altHref}" />`;
        });
        
        // Add x-default pointing to English
        block += `\n  <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(baseUrl, 'en', paths.en)}" />`;
        block += '\n</url>';
        return block;
      });
    };

    // 1. Static Pages
    const staticPages = [
      { paths: { en: '/', ar: '/ar', fr: '/fr' }, priority: '1.0', changefreq: 'daily' },
      { paths: { en: '/guest/tours', ar: '/ar/guest/tours', fr: '/fr/guest/tours' }, priority: '0.9', changefreq: 'weekly' },
      { paths: { en: '/guest/hotels', ar: '/ar/guest/hotels', fr: '/fr/guest/hotels' }, priority: '0.9', changefreq: 'weekly' },
      { paths: { en: '/packages', ar: '/ar/packages', fr: '/fr/packages' }, priority: '0.9', changefreq: 'weekly' },
      { paths: { en: '/blog', ar: '/ar/blog', fr: '/fr/blog' }, priority: '0.9', changefreq: 'daily' },
      { paths: { en: '/tourism', ar: '/ar/tourism', fr: '/fr/tourism' }, priority: '0.8', changefreq: 'monthly' },
      { paths: { en: '/hotel-booking', ar: '/ar/hotel-booking', fr: '/fr/hotel-booking' }, priority: '0.8', changefreq: 'monthly' },
      { paths: { en: '/airport-service', ar: '/ar/airport-service', fr: '/fr/airport-service' }, priority: '0.8', changefreq: 'monthly' },
      { paths: { en: '/luxury-suites', ar: '/ar/luxury-suites', fr: '/fr/luxury-suites' }, priority: '0.8', changefreq: 'monthly' },
      { paths: { en: '/about', ar: '/ar/about', fr: '/fr/about' }, priority: '0.7', changefreq: 'monthly' },
      { paths: { en: '/contact', ar: '/ar/contact', fr: '/fr/contact' }, priority: '0.7', changefreq: 'monthly' }
    ];

    staticPages.forEach(page => {
      urls.push(...createUrlEntry(page.paths, page.priority, page.changefreq));
    });

    // 2. Country Pages - Get unique countries from Tours and Hotels
    const tourCountries = await Tour.distinct('country');
    const hotelCountries = await Hotel.distinct('country');
    const allCountries = [...new Set([...tourCountries, ...hotelCountries])];

    for (const country of allCountries) {
      const encodedCountry = encodeUri(country);
      const countryPaths = {
        en: `/country/${encodedCountry}`,
        ar: `/country/${encodedCountry}`,
        fr: `/country/${encodedCountry}`
      };
      urls.push(...createUrlEntry(countryPaths, '0.8', 'weekly'));
    }

    // 3. City Pages - Get cities grouped by country
    const tourCitiesByCountry = await Tour.aggregate([
      { $group: { _id: { country: '$country', city: '$city' } } },
      { $group: { _id: '$_id.country', cities: { $push: '$_id.city' } } }
    ]);

    const hotelCitiesByCountry = await Hotel.aggregate([
      { $group: { _id: { country: '$country', city: '$city' } } },
      { $group: { _id: '$_id.country', cities: { $push: '$_id.city' } } }
    ]);

    // Merge cities by country
    const citiesByCountry = {};
    [...tourCitiesByCountry, ...hotelCitiesByCountry].forEach(item => {
      if (!citiesByCountry[item._id]) {
        citiesByCountry[item._id] = [];
      }
      item.cities.forEach(city => {
        if (!citiesByCountry[item._id].includes(city)) {
          citiesByCountry[item._id].push(city);
        }
      });
    });

    for (const [country, cities] of Object.entries(citiesByCountry)) {
      const encodedCountry = encodeUri(country);
      for (const city of cities) {
        const encodedCity = encodeUri(city);
        const cityPaths = {
          en: `/country/${encodedCountry}/city/${encodedCity}`,
          ar: `/country/${encodedCountry}/city/${encodedCity}`,
          fr: `/country/${encodedCountry}/city/${encodedCity}`
        };
        urls.push(...createUrlEntry(cityPaths, '0.7', 'weekly'));
      }
    }

    // 4. Individual Tours
    const tours = await Tour.find({}).select('slug updatedAt createdAt').lean();
    for (const tour of tours) {
      const lastmod = (tour.updatedAt || tour.createdAt || new Date()).toISOString();
      const tourPaths = {
        en: `/tours/${tour.slug}`,
        ar: `/tours/${tour.slug}`,
        fr: `/tours/${tour.slug}`
      };
      
      const langPaths = [
        { lang: 'en', path: tourPaths.en },
        { lang: 'ar', path: tourPaths.ar },
        { lang: 'fr', path: tourPaths.fr }
      ];

      langPaths.forEach(({ lang, path }) => {
        const loc = buildUrl(baseUrl, lang, path);
        let block = `<url>\n  <loc>${loc}</loc>\n  <lastmod>${lastmod}</lastmod>\n  <changefreq>weekly</changefreq>\n  <priority>0.7</priority>`;
        
        langPaths.forEach((alt) => {
          const altHref = buildUrl(baseUrl, alt.lang, alt.path);
          block += `\n  <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${altHref}" />`;
        });
        
        block += `\n  <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(baseUrl, 'en', tourPaths.en)}" />`;
        block += '\n</url>';
        urls.push(block);
      });
    }

    // 5. Individual Hotels
    const hotels = await Hotel.find({}).select('slug updatedAt createdAt').lean();
    for (const hotel of hotels) {
      const lastmod = (hotel.updatedAt || hotel.createdAt || new Date()).toISOString();
      const hotelPaths = {
        en: `/hotels/${hotel.slug}`,
        ar: `/hotels/${hotel.slug}`,
        fr: `/hotels/${hotel.slug}`
      };
      
      const langPaths = [
        { lang: 'en', path: hotelPaths.en },
        { lang: 'ar', path: hotelPaths.ar },
        { lang: 'fr', path: hotelPaths.fr }
      ];

      langPaths.forEach(({ lang, path }) => {
        const loc = buildUrl(baseUrl, lang, path);
        let block = `<url>\n  <loc>${loc}</loc>\n  <lastmod>${lastmod}</lastmod>\n  <changefreq>weekly</changefreq>\n  <priority>0.7</priority>`;
        
        langPaths.forEach((alt) => {
          const altHref = buildUrl(baseUrl, alt.lang, alt.path);
          block += `\n  <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${altHref}" />`;
        });
        
        block += `\n  <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(baseUrl, 'en', hotelPaths.en)}" />`;
        block += '\n</url>';
        urls.push(block);
      });
    }

    // 6. Individual Packages
    const packages = await Package.find({}).select('slug updatedAt createdAt').lean();
    for (const pkg of packages) {
      const lastmod = (pkg.updatedAt || pkg.createdAt || new Date()).toISOString();
      const packagePaths = {
        en: `/packages/${pkg.slug}`,
        ar: `/packages/${pkg.slug}`,
        fr: `/packages/${pkg.slug}`
      };
      
      const langPaths = [
        { lang: 'en', path: packagePaths.en },
        { lang: 'ar', path: packagePaths.ar },
        { lang: 'fr', path: packagePaths.fr }
      ];

      langPaths.forEach(({ lang, path }) => {
        const loc = buildUrl(baseUrl, lang, path);
        let block = `<url>\n  <loc>${loc}</loc>\n  <lastmod>${lastmod}</lastmod>\n  <changefreq>weekly</changefreq>\n  <priority>0.7</priority>`;
        
        langPaths.forEach((alt) => {
          const altHref = buildUrl(baseUrl, alt.lang, alt.path);
          block += `\n  <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${altHref}" />`;
        });
        
        block += `\n  <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(baseUrl, 'en', packagePaths.en)}" />`;
        block += '\n</url>';
        urls.push(block);
      });
    }

    // Combine all URLs
    const allUrls = urls.join('\n');

    return res.send(`${header}\n${allUrls}\n${footer}`);
  } catch (err) {
    console.error('Main sitemap generation error:', err);
    return res.status(500).send('');
  }
};


