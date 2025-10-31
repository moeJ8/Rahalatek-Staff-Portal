const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

// Main sitemap with all public pages (includes static pages, countries, cities, tours, hotels, packages)
router.get('/sitemap.xml', sitemapController.getMainSitemap);

// Blog sitemap with hreflang alternates (separate for easier management)
router.get('/sitemap-blog.xml', sitemapController.getBlogSitemap);

module.exports = router;


