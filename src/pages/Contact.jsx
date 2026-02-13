import React, { useState } from 'react';
import {
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaCheck,
    FaPaperPlane
} from 'react-icons/fa';
import api from '../services/api';
import emailjs from '@emailjs/browser';
import './Contact.css';

function Contact() {
    const [formData, setFormData] = useState({
        organization_name: '',
        contact_person: '',
        phone: '',
        email: '',
        city: '',
        requirement_message: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.organization_name || formData.organization_name.length < 3) {
            newErrors.organization_name = 'Organization name must be at least 3 characters';
        }

        if (!formData.contact_person || formData.contact_person.length < 2) {
            newErrors.contact_person = 'Contact person name must be at least 2 characters';
        }

        if (!formData.phone || !/^[+]?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.city || formData.city.length < 2) {
            newErrors.city = 'City must be at least 2 characters';
        }

        if (!formData.requirement_message || formData.requirement_message.length < 20) {
            newErrors.requirement_message = 'Please provide more details (at least 20 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
        const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

        const templateParams = {
            from_name: formData.contact_person,
            from_email: formData.email,
            organization_name: formData.organization_name,
            phone: formData.phone,
            city: formData.city,
            message: formData.requirement_message,
        };

        try {
            // 1. Send to Backend API (Database)
            const apiPromise = api.post('/inquiries', {
                name: formData.contact_person,
                company: formData.organization_name,
                phone: formData.phone,
                email: formData.email,
                city: formData.city,
                message: formData.requirement_message,
                source: 'website'
            });

            // 2. Send to EmailJS (Gmail)
            // Only attempt if keys are present to avoid errors during development if not set
            let emailPromise = Promise.resolve();
            if (serviceId && templateId && publicKey) {
                emailPromise = emailjs.send(serviceId, templateId, templateParams, publicKey);
            } else {
                console.warn('EmailJS keys are missing in .env. Email will not be sent.');
            }

            // Wait for both
            await Promise.all([apiPromise, emailPromise]);

            setSubmitStatus('success');
            setFormData({
                organization_name: '',
                contact_person: '',
                phone: '',
                email: '',
                city: '',
                requirement_message: ''
            });
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>Send an Inquiry</h1>
                    <p>Get in touch with us for your medical supply requirements</p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section contact-section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-wrapper">
                            <div className="form-header">
                                <h2>Inquiry Form</h2>
                                <p>Our team will respond within 24 business hours</p>
                            </div>

                            {submitStatus === 'success' && (
                                <div className="alert alert-success">
                                    <FaCheck />
                                    <div>
                                        <strong>Inquiry Sent Successfully!</strong>
                                        <p>Thank you for reaching out. Our team will contact you shortly.</p>
                                    </div>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="alert alert-error">
                                    <strong>Something went wrong</strong>
                                    <p>Please try again later or contact us directly.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="organization_name">
                                            Hospital / Clinic Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="organization_name"
                                            name="organization_name"
                                            value={formData.organization_name}
                                            onChange={handleChange}
                                            placeholder="Enter organization name"
                                            className={errors.organization_name ? 'error' : ''}
                                        />
                                        {errors.organization_name && (
                                            <span className="error-message">{errors.organization_name}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="contact_person">
                                            Contact Person Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="contact_person"
                                            name="contact_person"
                                            value={formData.contact_person}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            className={errors.contact_person ? 'error' : ''}
                                        />
                                        {errors.contact_person && (
                                            <span className="error-message">{errors.contact_person}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">
                                            Phone Number <span className="required">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                            className={errors.phone ? 'error' : ''}
                                        />
                                        {errors.phone && (
                                            <span className="error-message">{errors.phone}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">
                                            Email Address <span className="required">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="email@example.com"
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && (
                                            <span className="error-message">{errors.email}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="city">
                                        City <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter your city"
                                        className={errors.city ? 'error' : ''}
                                    />
                                    {errors.city && (
                                        <span className="error-message">{errors.city}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="requirement_message">
                                        Requirement Message <span className="required">*</span>
                                    </label>
                                    <textarea
                                        id="requirement_message"
                                        name="requirement_message"
                                        value={formData.requirement_message}
                                        onChange={handleChange}
                                        placeholder="Please describe your medical supply requirements..."
                                        rows="5"
                                        className={errors.requirement_message ? 'error' : ''}
                                    />
                                    {errors.requirement_message && (
                                        <span className="error-message">{errors.requirement_message}</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            Submit Inquiry
                                            <FaPaperPlane />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="contact-info">
                            <div className="info-card">
                                <h3>Contact Information</h3>
                                <p>Reach out to us directly or visit our office</p>

                                <ul className="info-list">
                                    <li>
                                        <div className="info-icon">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="info-content">
                                            <strong>Address</strong>
                                            <span>Purvasa Nagar, Hoshangabad Road</span>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="info-icon">
                                            <FaPhone />
                                        </div>
                                        <div className="info-content">
                                            <strong>Phone</strong>
                                            <span>+91 7693818387</span>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="info-icon">
                                            <FaEnvelope />
                                        </div>
                                        <div className="info-content">
                                            <strong>Email</strong>
                                            <span>medineoenterprises@gmail.com</span>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="info-icon">
                                            <FaClock />
                                        </div>
                                        <div className="info-content">
                                            <strong>Business Hours</strong>
                                            <span>Monday - Saturday</span>
                                            <span>9:00 AM - 6:00 PM</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="trust-card">
                                <h4>Why Contact Us?</h4>
                                <ul>
                                    <li><FaCheck /> Quick response within 24 hours</li>
                                    <li><FaCheck /> Dedicated support team</li>
                                    <li><FaCheck /> Bulk order assistance</li>
                                    <li><FaCheck /> Custom requirement handling</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Contact;
