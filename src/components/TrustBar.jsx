import React from 'react';
import { FaCheck } from 'react-icons/fa';
import './TrustBar.css';

function TrustBar() {
    const trustItems = [
        'Genuine Products',
        'Trusted by 100+ Institutions',
        'Timely Delivery',
        'Regulatory Compliance'
    ];

    return (
        <section className="trust-bar">
            <div className="container">
                <div className="trust-bar-content">
                    {trustItems.map((item, index) => (
                        <div key={index} className="trust-item">
                            <FaCheck className="trust-icon" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default TrustBar;
