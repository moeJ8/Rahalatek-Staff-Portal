const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // Configure the email transporter
        // You'll need to set these environment variables
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail', // gmail, outlook, etc.
            host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS, // your email password or app password
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    /**
     * Generate email verification token
     */
    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Send email verification email
     */
    async sendVerificationEmail(user, verificationToken) {
        try {
            if (!user.email) {
                throw new Error('User does not have an email address');
            }

            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: 'Verify Your Email Address - Rahalatek',
                html: this.getVerificationEmailTemplate(user.username, verificationUrl),
                text: `
Hello ${user.username},

Please verify your email address by clicking the following link:
${verificationUrl}

This link will expire in 24 hours.

If you didn't request this verification, please ignore this email.

Best regards,
Rahalatek Team
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending verification email:', error);
            throw error;
        }
    }

    /**
     * Send email verification success notification
     */
    async sendVerificationSuccessEmail(user) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return;
            }

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: 'Email Verified Successfully - Rahalatek',
                html: this.getVerificationSuccessTemplate(user.username),
                text: `
Hello ${user.username},

Your email address has been successfully verified!

You will now receive email notifications for:
- Arrival and departure reminders
- System notifications
- Important updates

Thank you for verifying your email address.

Best regards,
Rahalatek Team
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending verification success email:', error);
            // Don't throw error here as this is not critical
        }
    }

    /**
     * HTML template for verification email
     */
    getVerificationEmailTemplate(username, verificationUrl) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
        }
        .verification-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: transform 0.2s ease;
        }
        .verification-button:hover {
            transform: translateY(-2px);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        .link-fallback {
            word-break: break-all;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
                Thank you for registering with Rahalatek. To complete your account setup and start receiving email notifications, please verify your email address by clicking the button below.
            </div>
            
            <div class="button-container">
                <a href="${verificationUrl}" class="verification-button">
                    Verify Email Address
                </a>
            </div>
            
            <div class="warning">
                <strong>Important:</strong> This verification link will expire in 24 hours. If you didn't request this verification, please ignore this email.
            </div>
            
            <div class="message">
                If the button doesn't work, copy and paste this link into your browser:
                <div class="link-fallback">${verificationUrl}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>Rahalatek Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * HTML template for verification success email
     */
    getVerificationSuccessTemplate(username) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified Successfully</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .success-icon {
            text-align: center;
            font-size: 60px;
            margin-bottom: 20px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
        }
        .features {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features h3 {
            color: #2c3e50;
            margin-top: 0;
        }
        .features ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .features li {
            margin: 8px 0;
            color: #555;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verified!</h1>
        </div>
        
        <div class="content">
            <div class="success-icon">✅</div>
            
            <div class="greeting">Congratulations, ${username}!</div>
            
            <div class="message">
                Your email address has been successfully verified. You're all set to receive email notifications from Rahalatek.
            </div>
            
            <div class="features">
                <h3>You will now receive notifications for:</h3>
                <ul>
                    <li>Arrival and departure reminders</li>
                    <li>Payment notifications</li>
                    <li>System announcements</li>
                    <li>Important account updates</li>
                </ul>
            </div>
            
            <div class="message">
                Thank you for verifying your email address. If you have any questions, please don't hesitate to contact your system administrator.
            </div>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>Rahalatek Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * HTML template for arrival reminder email
     */
    getArrivalReminderTemplate(username, voucher) {
        const arrivalDate = new Date(voucher.arrivalDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arrival Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .voucher-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
        }
        .voucher-info h3 {
            color: #2c3e50;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
        }
        .arrival-badge {
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛬 Arrival Reminder</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
                This is a friendly reminder that you have a client arriving tomorrow. Please ensure all preparations are ready for their arrival.
            </div>
            
            <div class="voucher-info">
                <h3>Arrival Details</h3>
                <div class="arrival-badge">Arriving Tomorrow</div>
                <div class="info-row">
                    <span class="info-label">Client Name:</span>
                    <span class="info-value">${voucher.clientName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Voucher Number:</span>
                    <span class="info-value">
                        <a href="${process.env.FRONTEND_URL}/vouchers/${voucher._id}" style="color: #4CAF50; text-decoration: none; font-weight: 600;">${voucher.voucherNumber}</a>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Arrival Date:</span>
                    <span class="info-value">${arrivalDate}</span>
                </div>
                ${voucher.arrivalTime ? `
                <div class="info-row">
                    <span class="info-label">Arrival Time:</span>
                    <span class="info-value">${voucher.arrivalTime}</span>
                </div>
                ` : ''}
                ${voucher.notes ? `
                <div class="info-row">
                    <span class="info-label">Notes:</span>
                    <span class="info-value">${voucher.notes}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="message">
                Please make sure all arrangements are in place for a smooth arrival experience.
            </div>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>Rahalatek Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * HTML template for departure reminder email
     */
    getDepartureReminderTemplate(username, voucher) {
        const departureDate = new Date(voucher.departureDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Departure Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .voucher-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #FF9800;
        }
        .voucher-info h3 {
            color: #2c3e50;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
        }
        .departure-badge {
            display: inline-block;
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛫 Departure Reminder</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
                This is a friendly reminder that you have a client departing tomorrow. Please ensure all checkout procedures are completed.
            </div>
            
            <div class="voucher-info">
                <h3>Departure Details</h3>
                <div class="departure-badge">Departing Tomorrow</div>
                <div class="info-row">
                    <span class="info-label">Client Name:</span>
                    <span class="info-value">${voucher.clientName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Voucher Number:</span>
                    <span class="info-value">
                        <a href="${process.env.FRONTEND_URL}/vouchers/${voucher._id}" style="color: #ff8c00; text-decoration: none; font-weight: 600;">${voucher.voucherNumber}</a>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Departure Date:</span>
                    <span class="info-value">${departureDate}</span>
                </div>
                ${voucher.departureTime ? `
                <div class="info-row">
                    <span class="info-label">Departure Time:</span>
                    <span class="info-value">${voucher.departureTime}</span>
                </div>
                ` : ''}
                ${voucher.notes ? `
                <div class="info-row">
                    <span class="info-label">Notes:</span>
                    <span class="info-value">${voucher.notes}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="message">
                Please ensure all checkout procedures are completed for a smooth departure experience.
            </div>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>Rahalatek Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * HTML template for custom reminder email
     */
    getCustomReminderTemplate(username, reminder, createdByUser) {
        const scheduledDate = new Date(reminder.scheduledFor).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        const isSystemWide = reminder.isSystemWide;
        const priorityColors = {
            low: { bg: '#E3F2FD', border: '#2196F3', text: '#1976D2' },
            medium: { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00' },
            high: { bg: '#FFEBEE', border: '#F44336', text: '#D32F2F' },
            urgent: { bg: '#FCE4EC', border: '#E91E63', text: '#C2185B' }
        };
        
        const priority = reminder.priority || 'medium';
        const colors = priorityColors[priority];
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .reminder-info {
            background-color: ${colors.bg};
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
            border-left: 4px solid ${colors.border};
        }
        .reminder-info h3 {
            color: #2c3e50;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .reminder-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .reminder-message {
            font-size: 16px;
            line-height: 1.7;
            color: #555;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid ${colors.border};
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #555;
        }
        .info-value {
            color: #333;
        }
        .priority-badge {
            display: inline-block;
            background-color: ${colors.border};
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .system-wide-badge {
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #eee;
        }
        .reminder-icon {
            text-align: center;
            font-size: 48px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Reminder</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
                You have received a reminder from <strong>Rahalatek</strong>.
            </div>
            
            <div class="reminder-info">
                <div class="reminder-icon">📋</div>
                <div class="priority-badge">${priority.toUpperCase()} Priority</div>
                ${isSystemWide ? '<div class="system-wide-badge">System-wide</div>' : ''}
                
                <div class="reminder-title">${reminder.title}</div>
                
                <div class="reminder-message">
                    ${reminder.message.replace(/\n/g, '<br>')}
                </div>
                
                <div class="info-row">
                    <span class="info-label">Scheduled For:</span>
                    <span class="info-value">${scheduledDate}</span>
                </div>
                
                ${createdByUser ? `
                <div class="info-row">
                    <span class="info-label">Created By:</span>
                    <span class="info-value">${createdByUser.username}</span>
                </div>
                ` : ''}
                
                ${isSystemWide ? `
                <div class="info-row">
                    <span class="info-label">Type:</span>
                    <span class="info-value">System-wide Reminder</span>
                </div>
                ` : ''}
            </div>
            
            <div class="message">
                This reminder was scheduled to be delivered at the specified time. Please take any necessary actions as required.
            </div>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>Rahalatek Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Send arrival reminder email
     */
    async sendArrivalReminderEmail(user, voucher) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return; // Skip if no email or not verified
            }

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: `Arrival Reminder - ${voucher.clientName} (${voucher.voucherNumber})`,
                html: this.getArrivalReminderTemplate(user.username, voucher),
                text: `
Hello ${user.username},

This is a reminder that ${voucher.clientName} (Voucher: ${voucher.voucherNumber}) is arriving tomorrow.

Arrival Date: ${new Date(voucher.arrivalDate).toLocaleDateString()}
${voucher.arrivalTime ? `Arrival Time: ${voucher.arrivalTime}` : ''}
${voucher.notes ? `Notes: ${voucher.notes}` : ''}

Please ensure all preparations are ready for their arrival.

Best regards,
Rahalatek Team
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending arrival reminder email:', error);
            // Don't throw error to avoid breaking the notification flow
        }
    }

    /**
     * Send departure reminder email
     */
    async sendDepartureReminderEmail(user, voucher) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return; // Skip if no email or not verified
            }

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: `Departure Reminder - ${voucher.clientName} (${voucher.voucherNumber})`,
                html: this.getDepartureReminderTemplate(user.username, voucher),
                text: `
Hello ${user.username},

This is a reminder that ${voucher.clientName} (Voucher: ${voucher.voucherNumber}) is departing tomorrow.

Departure Date: ${new Date(voucher.departureDate).toLocaleDateString()}
${voucher.departureTime ? `Departure Time: ${voucher.departureTime}` : ''}
${voucher.notes ? `Notes: ${voucher.notes}` : ''}

Please ensure all checkout procedures are completed.

Best regards,
Rahalatek Team
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending departure reminder email:', error);
            // Don't throw error to avoid breaking the notification flow
        }
    }

    /**
     * Send daily arrivals summary email
     */
    async sendArrivalSummaryEmail(user, vouchersArrivingToday) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return; // Skip if no email or not verified
            }

            const todayDate = new Date().toLocaleDateString('en-GB');
            const totalArrivals = vouchersArrivingToday.length;
            const subject = `Daily Arrivals Summary - ${todayDate} (${totalArrivals} arrival${totalArrivals > 1 ? 's' : ''})`;

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: subject,
                html: this.getArrivalSummaryTemplate(user.username, vouchersArrivingToday, todayDate),
                text: this.getArrivalSummaryTextTemplate(user.username, vouchersArrivingToday, todayDate)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending arrival summary email:', error);
            // Don't throw error to avoid breaking the notification flow
        }
    }

    /**
     * Send daily departures summary email
     */
    async sendDepartureSummaryEmail(user, vouchersDepartingToday) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return; // Skip if no email or not verified
            }

            const todayDate = new Date().toLocaleDateString('en-GB');
            const totalDepartures = vouchersDepartingToday.length;
            const subject = `Daily Departures Summary - ${todayDate} (${totalDepartures} departure${totalDepartures > 1 ? 's' : ''})`;

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: subject,
                html: this.getDepartureSummaryTemplate(user.username, vouchersDepartingToday, todayDate),
                text: this.getDepartureSummaryTextTemplate(user.username, vouchersDepartingToday, todayDate)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending departure summary email:', error);
            // Don't throw error to avoid breaking the notification flow
        }
    }

    /**
     * Send custom reminder email
     */
    async sendCustomReminderEmail(user, reminder, createdByUser) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return; // Skip if no email or not verified
            }

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: `Reminder: ${reminder.title}`,
                html: this.getCustomReminderTemplate(user.username, reminder, createdByUser),
                text: `
Hello ${user.username},

You have received a reminder from Rahalatek:

${reminder.title}

${reminder.message}

Scheduled for: ${new Date(reminder.scheduledFor).toLocaleString()}

Best regards,
Rahalatek Team
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending custom reminder email:', error);
            // Don't throw error to avoid breaking the notification flow
        }
    }

    /**
     * Test email configuration
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready to send emails');
            return true;
        } catch (error) {
            console.error('❌ Email service configuration error:', error);
            return false;
        }
    }

    /**
     * Get arrival summary email template
     */
    getArrivalSummaryTemplate(username, vouchersArrivingToday, todayDate) {
        const voucherRows = vouchersArrivingToday.map(voucher => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 500; color: #1f2937;">
                    <a href="${process.env.FRONTEND_URL}/vouchers/${voucher._id}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">#${voucher.voucherNumber}</a>
                </td>
                <td style="padding: 12px; color: #1f2937;">${voucher.clientName}</td>
                <td style="padding: 12px; color: #1f2937;">${new Date(voucher.arrivalDate).toLocaleDateString('en-GB')}</td>
                <td style="padding: 12px; color: #1f2937;">${voucher.createdBy?.username || 'N/A'}</td>
            </tr>
        `).join('');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Arrivals Summary</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
            <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📅 Daily Arrivals Summary</h1>
                    <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${todayDate}</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">
                    <p style="font-size: 16px; margin-bottom: 20px; color: #374151;">
                        Hello <strong>${username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; margin-bottom: 25px; color: #374151;">
                        Here's your daily arrivals summary for today. We have <strong>${vouchersArrivingToday.length}</strong> arrival${vouchersArrivingToday.length > 1 ? 's' : ''} scheduled.
                    </p>
                    
                    <!-- Arrivals Table -->
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">Today's Arrivals</h3>
                        <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                            <thead>
                                <tr style="background-color: #3b82f6; color: white;">
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Voucher</th>
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Client Name</th>
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Arrival Date</th>
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${voucherRows}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Footer Message -->
                    <div style="background-color: #dbeafe; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin-top: 25px;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">
                            💡 <strong>Tip:</strong> Make sure all arrival preparations are ready and teams are notified.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        <strong>Rahalatek Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get departure summary email template
     */
    getDepartureSummaryTemplate(username, vouchersDepartingToday, todayDate) {
        const voucherRows = vouchersDepartingToday.map(voucher => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-weight: 500; color: #1f2937;">
                    <a href="${process.env.FRONTEND_URL}/vouchers/${voucher._id}" style="color: #f59e0b; text-decoration: none; font-weight: 600;">#${voucher.voucherNumber}</a>
                </td>
                <td style="padding: 12px; color: #1f2937;">${voucher.clientName}</td>
                <td style="padding: 12px; color: #1f2937;">${new Date(voucher.departureDate).toLocaleDateString('en-GB')}</td>
                <td style="padding: 12px; color: #1f2937;">${voucher.createdBy?.username || 'N/A'}</td>
            </tr>
        `).join('');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Departures Summary</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
            <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🛫 Daily Departures Summary</h1>
                    <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">${todayDate}</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">
                    <p style="font-size: 16px; margin-bottom: 20px; color: #374151;">
                        Hello <strong>${username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; margin-bottom: 25px; color: #374151;">
                        Here's your daily departures summary for today. We have <strong>${vouchersDepartingToday.length}</strong> departure${vouchersDepartingToday.length > 1 ? 's' : ''} scheduled.
                    </p>
                    
                    <!-- Departures Table -->
                    <div style="background-color: #fefbf2; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">Today's Departures</h3>
                        <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                            <thead>
                                <tr style="background-color: #f59e0b; color: white;">
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Voucher</th>
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Client Name</th>
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Departure Date</th>
                                    <th style="padding: 15px; text-align: left; font-weight: 600;">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${voucherRows}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Footer Message -->
                    <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin-top: 25px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                            💡 <strong>Tip:</strong> Ensure all checkout procedures are completed and final arrangements are in place.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        Best regards,<br>
                        <strong>Rahalatek Team</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Get arrival summary text template
     */
    getArrivalSummaryTextTemplate(username, vouchersArrivingToday, todayDate) {
        const voucherList = vouchersArrivingToday.map(voucher => 
            `- ${voucher.voucherNumber}: ${voucher.clientName} (${new Date(voucher.arrivalDate).toLocaleDateString('en-GB')}) - Created by: ${voucher.createdBy?.username || 'N/A'}`
        ).join('\n');

        return `
Daily Arrivals Summary - ${todayDate}

Hello ${username},

Here's your daily arrivals summary for today. We have ${vouchersArrivingToday.length} arrival${vouchersArrivingToday.length > 1 ? 's' : ''} scheduled.

TODAY'S ARRIVALS:
${voucherList}

Make sure all arrival preparations are ready and teams are notified.

Best regards,
Rahalatek Team
        `.trim();
    }

    /**
     * Get departure summary text template
     */
    getDepartureSummaryTextTemplate(username, vouchersDepartingToday, todayDate) {
        const voucherList = vouchersDepartingToday.map(voucher => 
            `- ${voucher.voucherNumber}: ${voucher.clientName} (${new Date(voucher.departureDate).toLocaleDateString('en-GB')}) - Created by: ${voucher.createdBy?.username || 'N/A'}`
        ).join('\n');

        return `
Daily Departures Summary - ${todayDate}

Hello ${username},

Here's your daily departures summary for today. We have ${vouchersDepartingToday.length} departure${vouchersDepartingToday.length > 1 ? 's' : ''} scheduled.

TODAY'S DEPARTURES:
${voucherList}

Ensure all checkout procedures are completed and final arrangements are in place.

Best regards,
Rahalatek Team
        `.trim();
    }

    /**
     * Send upcoming events summary email
     */
    async sendUpcomingEventsEmail(user, eventsData) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return;
            }

            // Extract events data
            const { departures, arrivals, holidays } = eventsData;
            const totalEvents = departures.length + arrivals.length + holidays.length;

            if (totalEvents === 0) {
                console.log(`No upcoming events to send to ${user.email}`);
                return;
            }

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: `Upcoming Events Summary - ${totalEvents} Event${totalEvents > 1 ? 's' : ''} This Week`,
                html: this.getUpcomingEventsEmailTemplate(user, eventsData),
                text: this.getUpcomingEventsTextTemplate(user, eventsData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Upcoming events email sent to ${user.email}`);
            return result;
        } catch (error) {
            console.error('❌ Error sending upcoming events email:', error);
            throw error;
        }
    }

    /**
     * Generate upcoming events email HTML template
     */
    getUpcomingEventsEmailTemplate(user, eventsData) {
        const { departures, arrivals, holidays } = eventsData;
        const totalEvents = departures.length + arrivals.length + holidays.length;
        
        // Check if user can see profile links (admin or accountant)
        const canSeeProfiles = user.isAdmin || user.isAccountant;

        // Helper function to format date
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
            
            if (dateOnly.getTime() === todayOnly.getTime()) {
                return 'Today';
            } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
                return 'Tomorrow';
            } else {
                // Format as dd/mm/yyyy
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
        };

        const formatTime = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        };

        // Helper function to format created by with optional profile link
        const formatCreatedBy = (voucher) => {
            const username = voucher.createdBy?.username || 'N/A';
            const userId = voucher.createdBy?._id;
            
            if (canSeeProfiles && userId && username !== 'N/A') {
                return `<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/${userId}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${username}</a>`;
            } else {
                return username;
            }
        };

        // Generate departures section
        let departuresSection = '';
        if (departures.length > 0) {
            const departureRows = departures.map(voucher => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 15px; font-weight: 500; color: #1f2937; text-align: left; vertical-align: middle;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vouchers/${voucher._id}" style="color: #ea580c; text-decoration: none; font-weight: 600;">#${voucher.voucherNumber}</a>
                    </td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: left; vertical-align: middle;">${voucher.clientName}</td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: center; vertical-align: middle;">${formatDate(voucher.departureDate)}</td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: center; vertical-align: middle;">${formatTime(voucher.departureDate)}</td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: left; vertical-align: middle;">${formatCreatedBy(voucher)}</td>
                </tr>
            `).join('');

            departuresSection = `
                <div style="background-color: #fefbf2; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="color: #ea580c; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                        ✈️ Departures (${departures.length})
                    </h3>
                    <table style="width: 100%; min-width: 700px; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                        <thead>
                            <tr style="background-color: #ea580c; color: white;">
                                <th style="padding: 15px; text-align: left; font-weight: 600; width: 15%; vertical-align: middle;">Voucher</th>
                                <th style="padding: 15px; text-align: left; font-weight: 600; width: 35%; vertical-align: middle;">Client Name</th>
                                <th style="padding: 15px; text-align: center; font-weight: 600; width: 20%; vertical-align: middle;">Date</th>
                                <th style="padding: 15px; text-align: center; font-weight: 600; width: 15%; vertical-align: middle;">Time</th>
                                <th style="padding: 15px; text-align: left; font-weight: 600; width: 15%; vertical-align: middle;">Created By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${departureRows}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Generate arrivals section
        let arrivalsSection = '';
        if (arrivals.length > 0) {
            const arrivalRows = arrivals.map(voucher => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 15px; font-weight: 500; color: #1f2937; text-align: left; vertical-align: middle;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vouchers/${voucher._id}" style="color: #2563eb; text-decoration: none; font-weight: 600;">#${voucher.voucherNumber}</a>
                    </td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: left; vertical-align: middle;">${voucher.clientName}</td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: center; vertical-align: middle;">${formatDate(voucher.arrivalDate)}</td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: center; vertical-align: middle;">${formatTime(voucher.arrivalDate)}</td>
                    <td style="padding: 12px 15px; color: #1f2937; text-align: left; vertical-align: middle;">${formatCreatedBy(voucher)}</td>
                </tr>
            `).join('');

            arrivalsSection = `
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="color: #2563eb; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                        🛬 Arrivals (${arrivals.length})
                    </h3>
                    <table style="width: 100%; min-width: 700px; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                        <thead>
                            <tr style="background-color: #2563eb; color: white;">
                                <th style="padding: 15px; text-align: left; font-weight: 600; width: 15%; vertical-align: middle;">Voucher</th>
                                <th style="padding: 15px; text-align: left; font-weight: 600; width: 35%; vertical-align: middle;">Client Name</th>
                                <th style="padding: 15px; text-align: center; font-weight: 600; width: 20%; vertical-align: middle;">Date</th>
                                <th style="padding: 15px; text-align: center; font-weight: 600; width: 15%; vertical-align: middle;">Time</th>
                                <th style="padding: 15px; text-align: left; font-weight: 600; width: 15%; vertical-align: middle;">Created By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arrivalRows}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Generate holidays section
        let holidaysSection = '';
        if (holidays.length > 0) {
            const holidayRows = holidays.map(holiday => {
                const holidayDate = holiday.holidayType === 'single-day' ? holiday.date : holiday.startDate;
                const endDate = holiday.holidayType === 'multiple-day' ? holiday.endDate : null;
                
                return `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 12px 15px; font-weight: 500; color: #1f2937; text-align: left; vertical-align: middle;">
                            ${holiday.name}
                        </td>
                        <td style="padding: 12px 15px; color: #1f2937; text-align: center; vertical-align: middle;">${holiday.type || 'Holiday'}</td>
                        <td style="padding: 12px 15px; color: #1f2937; text-align: center; vertical-align: middle;">
                            ${formatDate(holidayDate)}${endDate ? ` - ${formatDate(endDate)}` : ''}
                        </td>
                        <td style="padding: 12px 15px; color: #1f2937; text-align: center; vertical-align: middle;">
                            ${holiday.holidayType === 'multiple-day' ? 'Multi-day' : 'Single-day'}
                        </td>
                    </tr>
                `;
            }).join('');

            holidaysSection = `
                <div style="background-color: #faf5ff; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="color: #7c3aed; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
                        🎉 Holidays (${holidays.length})
                    </h3>
                    <table style="width: 100%; min-width: 600px; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                        <thead>
                            <tr style="background-color: #7c3aed; color: white;">
                                <th style="padding: 15px; text-align: left; font-weight: 600; width: 40%; vertical-align: middle;">Holiday Name</th>
                                <th style="padding: 15px; text-align: center; font-weight: 600; width: 20%; vertical-align: middle;">Type</th>
                                <th style="padding: 15px; text-align: center; font-weight: 600; width: 25%; vertical-align: middle;">Date</th>
                                <th style="padding: 15px; text-align: center; font-weight: 600; width: 15%; vertical-align: middle;">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${holidayRows}
                        </tbody>
                    </table>
                </div>
            `;
        }

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upcoming Events Summary</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px; text-align: center;">
                <table role="presentation" style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                                📅 Upcoming Events Summary
                            </h1>
                            <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 16px;">
                                Your ${totalEvents} upcoming event${totalEvents > 1 ? 's' : ''} this week
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 30px 30px 10px 30px;">
                            <p style="margin: 0; font-size: 16px; color: #374151;">
                                Hello <strong>${user.username}</strong>,
                            </p>
                            <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151; line-height: 1.5;">
                                Here's your upcoming events summary for the next week. Stay organized and never miss an important event!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Events Content -->
                    <tr>
                        <td style="padding: 0 30px;">
                            ${departuresSection}
                            ${arrivalsSection}
                            ${holidaysSection}
                        </td>
                    </tr>
                    
                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vouchers" 
                               style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                                View Vouchers
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                This is an automated email from <strong>Rahalatek</strong> Tour Management System.
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                                You're receiving this because you have upcoming events in your account.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    /**
     * Generate upcoming events email text template
     */
    getUpcomingEventsTextTemplate(user, eventsData) {
        const { departures, arrivals, holidays } = eventsData;
        const totalEvents = departures.length + arrivals.length + holidays.length;

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
            
            if (dateOnly.getTime() === todayOnly.getTime()) {
                return 'Today';
            } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
                return 'Tomorrow';
            } else {
                // Format as dd/mm/yyyy
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
        };

        const formatTime = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        };

        let content = `UPCOMING EVENTS SUMMARY

Hello ${user.username},

Here's your upcoming events summary for the next week (${totalEvents} event${totalEvents > 1 ? 's' : ''}):

`;

        if (departures.length > 0) {
            content += `DEPARTURES (${departures.length}):
`;
            departures.forEach(voucher => {
                content += `• #${voucher.voucherNumber} - ${voucher.clientName}
  ${formatDate(voucher.departureDate)} • ${formatTime(voucher.departureDate)}

`;
            });
        }

        if (arrivals.length > 0) {
            content += `ARRIVALS (${arrivals.length}):
`;
            arrivals.forEach(voucher => {
                content += `• #${voucher.voucherNumber} - ${voucher.clientName}
  ${formatDate(voucher.arrivalDate)} • ${formatTime(voucher.arrivalDate)}

`;
            });
        }

        if (holidays.length > 0) {
            content += `HOLIDAYS (${holidays.length}):
`;
            holidays.forEach(holiday => {
                const holidayDate = holiday.holidayType === 'single-day' ? holiday.date : holiday.startDate;
                const endDate = holiday.holidayType === 'multiple-day' ? holiday.endDate : null;
                
                content += `• ${holiday.name}
  ${formatDate(holidayDate)}${endDate ? ` - ${formatDate(endDate)}` : ''}${holiday.holidayType === 'multiple-day' ? ' (Multi-day)' : ''}

`;
            });
        }

        content += `View your vouchers: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/vouchers

Best regards,
Rahalatek Team

---
This is an automated email from Rahalatek Tour Management System.
You're receiving this because you have upcoming events in your account.`;

        return content;
    }

    /**
     * Send daily check-in reminder email
     */
    async sendCheckinReminderEmail(user) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return; // Skip if no email or not verified
            }

            const subject = '🌅 Daily Check-In Reminder - Rahalatek';
            
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: subject,
                html: this.getCheckinReminderTemplate(user.username),
                text: this.getCheckinReminderTextTemplate(user.username)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending check-in reminder email:', error);
            // Don't throw error to avoid breaking the notification flow
        }
    }

    /**
     * Send daily check-out reminder email
     */
    async sendCheckoutReminderEmail(user, attendanceRecord) {
        try {
            if (!user.email || !user.isEmailVerified) {
                return; // Skip if no email or not verified
            }

            // Get check-in time for display
            const checkInTime = new Date(attendanceRecord.checkIn);

            const subject = '🌆 Daily Check-Out Reminder - Rahalatek';
            
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Rahalatek',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: user.email,
                subject: subject,
                html: this.getCheckoutReminderTemplate(user.username, checkInTime),
                text: this.getCheckoutReminderTextTemplate(user.username, checkInTime)
            };

            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('❌ Error sending check-out reminder email:', error);
            // Don't throw error to avoid breaking the notification flow
        }
    }

    /**
     * Get check-in reminder email template
     */
    getCheckinReminderTemplate(username) {
        const currentTime = new Date().toLocaleString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Check-In Reminder</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 0;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }
                .content {
                    padding: 40px 30px;
                }
                .greeting {
                    font-size: 18px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .message {
                    font-size: 16px;
                    color: #34495e;
                    line-height: 1.8;
                    margin-bottom: 30px;
                }
                .highlight {
                    background-color: #e8f5e8;
                    padding: 20px;
                    border-radius: 5px;
                    border-left: 4px solid #4CAF50;
                    margin: 20px 0;
                }
                .footer {
                    background-color: #ecf0f1;
                    padding: 20px 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #7f8c8d;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌅 Daily Check-In Reminder</h1>
                </div>
                <div class="content">
                    <div class="greeting">
                        Good morning, ${username}! 👋
                    </div>
                    <div class="message">
                        Hope you're having a great start to your day! This is a friendly reminder to check in for work.
                    </div>
                    <div class="highlight">
                        <strong>📱 How to Check In:</strong><br>
                        • Open the Rahalatek app or website<br>
                        • Go to the Attendance section<br>
                        • Scan the QR code to check in<br>
                        • Remember: Check-in is available from 8:00 AM to 8:00 PM
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/attendance" 
                           style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                            Go to Attendance 📲
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated reminder from Rahalatek</p>
                    <p>Sent At: ${currentTime}</p>
                </div>
            </div>
        </body>
        </html>`;
    }

    /**
     * Get check-out reminder email template
     */
    getCheckoutReminderTemplate(username, checkInTime) {
        const currentTime = new Date().toLocaleString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });

        const checkInTimeStr = checkInTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Check-Out Reminder</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 0;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }
                .content {
                    padding: 40px 30px;
                }
                .greeting {
                    font-size: 18px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .message {
                    font-size: 16px;
                    color: #34495e;
                    line-height: 1.8;
                    margin-bottom: 30px;
                }
                .work-summary {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 20px 0;
                    text-align: center;
                }
                .highlight {
                    background-color: #fff3e0;
                    padding: 20px;
                    border-radius: 5px;
                    border-left: 4px solid #FF9800;
                    margin: 20px 0;
                }
                .footer {
                    background-color: #ecf0f1;
                    padding: 20px 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #7f8c8d;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌆 Daily Check-Out Reminder</h1>
                </div>
                <div class="content">
                    <div class="greeting">
                        Great work today, ${username}! 👏
                    </div>
                    <div class="message">
                        Your workday is coming to an end. Don't forget to check out before you leave!
                    </div>
                    <div class="work-summary">
                        <h3>📊 Today's Work Summary</h3>
                        <p><strong>Check-in Time:</strong> ${checkInTimeStr}</p>
                    </div>
                    <div class="highlight">
                        <strong>📱 How to Check Out:</strong><br>
                        • Open the Rahalatek app or website<br>
                        • Go to the Attendance section<br>
                        • Scan the QR code or use manual check-out<br>
                        • Remember: Check-out is available until 8:00 PM
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/attendance" 
                           style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                            Go to Attendance 📤
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated reminder from Rahalatek</p>
                    <p>Sent At: ${currentTime}</p>
                </div>
            </div>
        </body>
        </html>`;
    }

    /**
     * Get check-in reminder text template
     */
    getCheckinReminderTextTemplate(username) {
        return `
Daily Check-In Reminder

Good morning, ${username}!

This is a friendly reminder to check in for work.

How to Check In:
• Open the Rahalatek app or website
• Go to the Attendance section
• Scan the QR code to check in
• Remember: Check-in is available from 8:00 AM to 8:00 PM

Go to Attendance: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/attendance

---
This is an automated reminder from Rahalatek.
Sent At: ${new Date().toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
})}`;
    }

    /**
     * Get check-out reminder text template
     */
    getCheckoutReminderTextTemplate(username, checkInTime) {
        const checkInTimeStr = checkInTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });

        const currentTime = new Date().toLocaleString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });

        return `
Daily Check-Out Reminder

Great work today, ${username}!

Your workday is coming to an end. Don't forget to check out before you leave!

Today's Work Summary:
• Check-in Time: ${checkInTimeStr}

How to Check Out:
• Open the Rahalatek app or website
• Go to the Attendance section
• Scan the QR code or use manual check-out
• Remember: Check-out is available until 8:00 PM

Go to Attendance: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/attendance

---
This is an automated reminder from Rahalatek.
Sent At: ${currentTime}`;
    }

}

module.exports = new EmailService();
