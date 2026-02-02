import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import './Hero.css';

function Hero() {
    return (
        <section className="hero">
            <div className="hero-background"></div>
            <div className="container hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Your Trusted Partner in{' '}
                        <span className="hero-highlight">Healthcare Supply</span>
                    </h1>
                    <p className="hero-subtitle">
                        Medineo Enterprises delivers quality medicines and medical supplies
                        to hospitals, clinics, and healthcare institutions. Partner with us
                        for genuine products, regulatory compliance, and reliable delivery.
                    </p>
                    <div className="hero-actions">
                        <Link to="/contact" className="btn btn-primary btn-lg">
                            Send Inquiry
                            <FaArrowRight />
                        </Link>
                        <Link to="/about" className="btn btn-secondary btn-lg">
                            Learn More
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-image-wrapper">
                        <div className="hero-image-placeholder">
                            <div className="hero-image-icon">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span>Healthcare Supply Solutions</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
