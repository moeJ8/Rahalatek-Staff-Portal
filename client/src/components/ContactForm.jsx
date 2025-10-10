import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import TextInput from './TextInput';
import CustomButton from './CustomButton';

export default function ContactForm({ packageName = null, packageSlug = null }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: packageName ? `Inquiry about ${packageName}` : '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        name: false,
        email: false,
        subject: false,
        message: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Custom validation
        const newErrors = {
            name: !formData.name.trim(),
            email: !formData.email.trim(),
            subject: !formData.subject.trim(),
            message: !formData.message.trim()
        };
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email.trim() && !emailRegex.test(formData.email)) {
            newErrors.email = true;
            setErrors(newErrors);
            toast.error('Please enter a valid email address', {
                duration: 4000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#f44336',
                },
            });
            return;
        }
        
        // Check if there are any errors
        if (Object.values(newErrors).some(error => error)) {
            setErrors(newErrors);
            toast.error('Please fill in all required fields correctly', {
                duration: 4000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#f44336',
                },
            });
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/contact', {
                ...formData,
                packageName,
                packageSlug
            });

            toast.success('Message sent successfully! We\'ll get back to you soon.', {
                duration: 4000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#4CAF50',
                },
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: packageName ? `Inquiry about ${packageName}` : '',
                message: ''
            });
            setErrors({
                name: false,
                email: false,
                subject: false,
                message: false
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Failed to send message. Please try again.', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#f44336',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-yellow-600 dark:to-orange-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
            <div className="relative bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-slate-800">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Send Us a Message</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">Have questions? We'd love to hear from you!</p>
            
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name Field */}
                <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Your Name
                        {errors.name && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </label>
                    <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all duration-200`}
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Email Address
                        {errors.email && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all duration-200`}
                    />
                </div>

                {/* Subject Field */}
                <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Subject
                        {errors.subject && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </label>
                    <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Tour inquiry, booking request, travel consultation, etc."
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border ${errors.subject ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all duration-200`}
                    />
                </div>

                {/* Message Field */}
                <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Message
                        {errors.message && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </label>
                    <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your travel plans, tour preferences, or any questions you have about our services..."
                        rows={6}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border ${errors.message ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all duration-200 resize-none`}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <CustomButton
                        type="submit"
                        disabled={loading}
                        loading={loading}
                        variant="rippleBlueToYellow"
                        size="md"
                        icon={loading ? FaSpinner : FaPaperPlane}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </CustomButton>
                </div>
            </form>
            </div>
        </div>
    );
}

