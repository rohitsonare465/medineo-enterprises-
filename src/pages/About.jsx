import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaHandshake, FaTruck, FaAward } from 'react-icons/fa';
import './About.css';

function About() {
    const values = [
        { icon: FaAward, title: 'Quality First', description: 'Uncompromising standards in every product we supply' },
        { icon: FaShieldAlt, title: 'Integrity', description: 'Transparent and ethical business practices always' },
        { icon: FaTruck, title: 'Reliability', description: 'Consistent and timely delivery you can count on' },
        { icon: FaHandshake, title: 'Partnership', description: 'Building long-term relationships with our clients' }
    ];

    const commitments = [
        {
            title: 'Quality Assurance',
            description: 'Every product we supply meets stringent quality standards. We source only from certified manufacturers and verified suppliers, ensuring complete authenticity and compliance with pharmaceutical regulations.'
        },
        {
            title: 'Regulatory Compliance',
            description: 'Full adherence to pharmaceutical regulations and industry standards. All products come with proper documentation, batch verification, and required certifications for institutional procurement.'
        },
        {
            title: 'Timely Supply',
            description: 'We understand that healthcare cannot wait. Our reliable delivery schedules and efficient logistics ensure uninterrupted supply to your institution, supporting continuous patient care.'
        }
    ];

    return (
        <div className="about-page">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>About Medineo Enterprises</h1>
                    <p>Your trusted partner in healthcare supply solutions</p>
                </div>
            </section>

            {/* Company Introduction */}
            <section className="section about-intro">
                <div className="container">
                    <div className="about-intro-content">
                        <div className="about-intro-text">
                            <h2>Who We Are</h2>
                            <p>
                                Medineo Enterprises is a leading medical supplier dedicated to providing
                                hospitals, clinics, nursing homes, and healthcare institutions with genuine
                                pharmaceutical products and medical supplies.
                            </p>
                            <p>
                                With a commitment to quality, compliance, and reliability, we have established
                                ourselves as a trusted partner for healthcare institutions seeking dependable
                                supply chain solutions. Our extensive network of certified manufacturers and
                                verified suppliers enables us to offer a comprehensive range of medical products
                                that meet the highest industry standards.
                            </p>
                            <p>
                                We believe that healthcare institutions deserve suppliers who understand the
                                critical nature of medical supplies. That's why we prioritize transparency,
                                timely delivery, and professional operations in every aspect of our business.
                            </p>
                        </div>
                        <div className="about-intro-visual">
                            <div className="about-visual-box">
                                <div className="about-stat">
                                    <span className="stat-number">100+</span>
                                    <span className="stat-label">Trusted Institutions</span>
                                </div>
                                <div className="about-stat">
                                    <span className="stat-number">1000+</span>
                                    <span className="stat-label">Products Supplied</span>
                                </div>
                                <div className="about-stat">
                                    <span className="stat-number">99%</span>
                                    <span className="stat-label">On-Time Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="section section-alt about-values">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Values</h2>
                        <p>The principles that guide everything we do</p>
                    </div>
                    <div className="values-grid">
                        {values.map((value, index) => {
                            const IconComponent = value.icon;
                            return (
                                <div key={index} className="value-card">
                                    <div className="value-icon">
                                        <IconComponent />
                                    </div>
                                    <h3>{value.title}</h3>
                                    <p>{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Commitment Section */}
            <section className="section about-commitment">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Commitment</h2>
                        <p>What you can expect when you partner with us</p>
                    </div>
                    <div className="commitment-list">
                        {commitments.map((item, index) => (
                            <div key={index} className="commitment-item">
                                <div className="commitment-number">{String(index + 1).padStart(2, '0')}</div>
                                <div className="commitment-content">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section about-cta">
                <div className="container">
                    <div className="about-cta-content">
                        <h2>Partner with Medineo Enterprises</h2>
                        <p>Experience the difference of working with a trusted medical supplier</p>
                        <Link to="/contact" className="btn btn-primary btn-lg">Send Inquiry</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;
