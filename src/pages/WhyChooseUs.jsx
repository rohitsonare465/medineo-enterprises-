import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaShieldAlt,
    FaHandshake,
    FaCogs,
    FaTruck,
    FaCheck,
    FaArrowRight
} from 'react-icons/fa';
import './WhyChooseUs.css';

function WhyChooseUs() {
    const features = [
        {
            id: 1,
            icon: FaShieldAlt,
            title: 'Genuine Products',
            description: 'We source only authentic medicines and medical supplies from verified manufacturers. Every product comes with proper documentation and batch verification to ensure complete authenticity.',
            points: [
                'Products from certified manufacturers only',
                'Complete batch documentation',
                'Authenticity verification available',
                'Quality certificates on request'
            ]
        },
        {
            id: 2,
            icon: FaHandshake,
            title: 'Trusted Sourcing',
            description: 'Our supply chain includes only certified suppliers with proven track records. We maintain strict quality control at every step, from sourcing to delivery.',
            points: [
                'Verified supplier network',
                'Strict vendor qualifications',
                'Regular quality audits',
                'Transparent supply chain'
            ]
        },
        {
            id: 3,
            icon: FaCogs,
            title: 'Professional Operations',
            description: 'Streamlined ordering process, transparent communication, and organized documentation make procurement hassle-free for healthcare institutions.',
            points: [
                'Efficient order processing',
                'Clear communication channels',
                'Organized documentation',
                'Easy reordering process'
            ]
        },
        {
            id: 4,
            icon: FaTruck,
            title: 'Reliable Delivery Support',
            description: 'We understand that healthcare needs are time-sensitive. Our reliable delivery schedules and proper handling ensure uninterrupted supply to your institution.',
            points: [
                'Timely deliveries',
                'Proper storage during transit',
                'Cold chain where required',
                'Delivery tracking available'
            ]
        }
    ];

    return (
        <div className="why-choose-page">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>Why Choose Medineo Enterprises</h1>
                    <p>Your trusted partner for genuine medical supplies and reliable service</p>
                </div>
            </section>

            {/* Features Section */}
            <section className="section why-features">
                <div className="container">
                    <div className="features-list">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            const isEven = index % 2 === 1;

                            return (
                                <div
                                    key={feature.id}
                                    className={`feature-block ${isEven ? 'feature-reverse' : ''}`}
                                >
                                    <div className="feature-content">
                                        <div className="feature-header">
                                            <div className="feature-icon">
                                                <IconComponent />
                                            </div>
                                            <h2>{feature.title}</h2>
                                        </div>
                                        <p className="feature-description">{feature.description}</p>
                                        <ul className="feature-points">
                                            {feature.points.map((point, idx) => (
                                                <li key={idx}>
                                                    <FaCheck className="point-icon" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="feature-visual">
                                        <div className="visual-placeholder">
                                            <IconComponent className="visual-icon" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section section-alt why-cta">
                <div className="container">
                    <div className="why-cta-content">
                        <h2>Experience the Medineo Difference</h2>
                        <p>
                            Join the growing list of hospitals, clinics, and healthcare institutions
                            that trust Medineo Enterprises for their medical supply needs.
                        </p>
                        <Link to="/contact" className="btn btn-primary btn-lg">
                            Send Inquiry
                            <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default WhyChooseUs;
