import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import './CTABanner.css';

function CTABanner() {
    return (
        <section className="cta-banner">
            <div className="container">
                <div className="cta-banner-content">
                    <h2>Ready to Partner with Us?</h2>
                    <p>
                        Get in touch for bulk inquiries and institutional requirements.
                        Our team is ready to support your healthcare supply needs.
                    </p>
                    <Link to="/contact" className="btn btn-white btn-lg">
                        Send Inquiry Now
                        <FaArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default CTABanner;
