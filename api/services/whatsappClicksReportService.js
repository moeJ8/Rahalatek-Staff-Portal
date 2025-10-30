const Blog = require('../models/Blog');
const User = require('../models/User');
const NotificationService = require('./notificationService');
const PDFService = require('./pdfService');

class WhatsappClicksReportService {
    static getCurrentWeekRange() {
        const now = new Date();
        const day = now.getDay(); // 0 Sunday
        const diffToMonday = (day + 6) % 7; // Monday as start
        const start = new Date(now);
        start.setDate(now.getDate() - diffToMonday);
        start.setHours(0,0,0,0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        return { start, end };
    }

    static formatDate(d) {
        return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    }

    static sumWeeklyClicks(clicksByDate, start, end) {
        if (!clicksByDate) return 0;
        const entries = clicksByDate instanceof Map ? Array.from(clicksByDate.entries()) : Object.entries(clicksByDate);
        return entries.reduce((sum, [dateStr, count]) => {
            const dt = new Date(dateStr);
            return (dt >= start && dt <= end) ? sum + (parseInt(count) || 0) : sum;
        }, 0);
    }

    static async buildAuthorReportData(authorId) {
        const author = await User.findById(authorId).select('_id username email isEmailVerified');
        if (!author) return null;
        const postsRaw = await Blog.find({ author: author._id }).select('title slug status whatsappClicks createdAt updatedAt clicksByDate');
        const week = this.getCurrentWeekRange();
        const weeklyPosts = postsRaw.map(p => ({
            _id: p._id,
            title: p.title,
            slug: p.slug,
            status: p.status,
            whatsappClicks: p.whatsappClicks || 0,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            weeklyClicks: this.sumWeeklyClicks(p.clicksByDate, week.start, week.end)
        })).filter(p => p.weeklyClicks > 0)
          .sort((a,b) => b.weeklyClicks - a.weeklyClicks);

        // Top 10 all-time across system (not author-only)
        const top10AllTime = await Blog.find({})
            .select('title slug status whatsappClicks createdAt updatedAt author')
            .populate('author', 'username')
            .sort({ whatsappClicks: -1 })
            .limit(10);
        const top10 = top10AllTime.map(p => ({
            title: p.title,
            slug: p.slug,
            status: p.status,
            whatsappClicks: p.whatsappClicks || 0,
            authorName: p.author?.username || 'Unknown',
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }));

        return {
            week: { start: this.formatDate(week.start), end: this.formatDate(week.end) },
            author: { _id: author._id, username: author.username, email: author.email },
            weeklyPosts,
            top10
        };
    }

    static async generateAndNotifyForAuthor(authorId, triggeredBy = null) {
        const data = await this.buildAuthorReportData(authorId);
        if (!data) return null;
        const pdf = await PDFService.generateWeeklyWhatsappClicksPDF(data, null);
        const pdfBase64 = pdf.toString('base64');

        const notification = await NotificationService.createNotification({
            type: 'weekly_blog_whatsapp_report',
            title: `Weekly WhatsApp Clicks Report`,
            message: `Your weekly WhatsApp clicks report is ready.`,
            targetUser: authorId,
            priority: 'medium',
            metadata: {
                week: data.week,
                author: data.author,
                postCount: data.weeklyPosts.length,
                totalClicks: data.weeklyPosts.reduce((s,p)=>s+(p.weeklyClicks||0),0),
                pdfBase64,
                fileName: `whatsapp-clicks-${new Date().toISOString().substring(0,10)}.pdf`,
                triggeredBy
            }
        });
        return notification;
    }

    static async generateWeeklyForAllAuthors(triggeredBy = null) {
        const authors = await Blog.distinct('author');
        const results = [];
        for (const authorId of authors) {
            try {
                const res = await this.generateAndNotifyForAuthor(authorId, triggeredBy);
                if (res) results.push(res);
            } catch (e) {
                // continue others
            }
        }
        return results;
    }

    static async generateAndNotifyAllAuthorsCombined(triggeredBy) {
        const week = this.getCurrentWeekRange();
        const postsRaw = await Blog.find({})
            .populate('author', 'username')
            .select('title slug status whatsappClicks createdAt updatedAt author clicksByDate');

        const weeklyPosts = postsRaw.map(p => ({
            title: p.title,
            slug: p.slug,
            status: p.status,
            whatsappClicks: p.whatsappClicks || 0,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            authorName: p.author?.username || 'Unknown',
            weeklyClicks: this.sumWeeklyClicks(p.clicksByDate, week.start, week.end)
        })).filter(p => p.weeklyClicks > 0)
          .sort((a,b) => b.weeklyClicks - a.weeklyClicks);

        const top10AllTime = [...postsRaw]
            .sort((a,b) => (b.whatsappClicks||0) - (a.whatsappClicks||0))
            .slice(0,10)
            .map(p => ({
                title: p.title,
                slug: p.slug,
                status: p.status,
                whatsappClicks: p.whatsappClicks || 0,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                authorName: p.author?.username || 'Unknown'
            }));

        const data = {
            week: { start: this.formatDate(week.start), end: this.formatDate(week.end) },
            weeklyPosts,
            top10: top10AllTime
        };

        const pdf = await PDFService.generateWeeklyWhatsappClicksAllAuthorsPDF(data);
        const pdfBase64 = pdf.toString('base64');

        return await NotificationService.createNotification({
            type: 'weekly_blog_whatsapp_report',
            title: `Weekly WhatsApp Clicks Report — All Authors`,
            message: `All authors weekly WhatsApp clicks report is ready.`,
            targetUser: triggeredBy,
            priority: 'medium',
            metadata: {
                scope: 'all',
                week: data.week,
                totalClicks: weeklyPosts.reduce((s,p)=>s+(p.weeklyClicks||0),0),
                postCount: weeklyPosts.length,
                pdfBase64,
                fileName: `whatsapp-clicks-all-authors-${new Date().toISOString().substring(0,10)}.pdf`
            }
        });
    }
}

module.exports = WhatsappClicksReportService;


