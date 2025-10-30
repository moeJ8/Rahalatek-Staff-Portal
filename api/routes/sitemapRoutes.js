const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

// Blog sitemap with hreflang alternates
router.get('/sitemap-blog.xml', sitemapController.getBlogSitemap);

module.exports = router;


