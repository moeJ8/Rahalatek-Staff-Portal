const EmailService = require('../services/emailService');

// Handle contact form submission
exports.sendContactForm = async (req, res) => {
    try {
        const { name, email, subject, message, packageName, packageSlug } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Send email using EmailService
        await EmailService.sendContactFormEmail({
            name,
            email,
            subject: subject || 'Contact Form Inquiry',
            message,
            packageName,
            packageSlug
        });

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!'
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
};

