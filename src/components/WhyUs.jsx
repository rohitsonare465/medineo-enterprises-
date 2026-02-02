import React from 'react';
import { FaShieldAlt, FaHandshake, FaCogs, FaTruck } from 'react-icons/fa';
import './WhyUs.css';

const whyUsData = [
    {
        id: 1,
        title: 'Genuine Products',
        description: 'Only authentic medicines from certified manufacturers with proper documentation and batch verification.',
        icon: FaShieldAlt
    },
    {
        id: 2,
        title: 'Trusted Sourcing',
        description: 'Verified suppliers with proven track records and strict quality control at every step.',
        icon: FaHandshake
    },
    {
        id: 3,
        title: 'Professional Operations',
        description: 'Streamlined ordering, transparent communication, and organized documentation.',
        icon: FaCogs
    },
    {
        id: 4,
        title: 'Reliable Delivery',
        description: 'Timely supply with proper storage and handling because healthcare cannot wait.',
        icon: FaTruck
    }
];

function WhyUs({ showTitle = true }) {
    return (
        <section className="section why-us-section">
            <div className="container">
                {showTitle && (
                    <div className="section-header">
                        <h2>Why Hospitals Trust Medineo</h2>
                        <p>We are committed to excellence in every aspect of healthcare supply</p>
                    </div>
                )}
                <div className="why-us-grid">
                    {whyUsData.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <div key={item.id} className="why-us-card">
                                <div className="why-us-icon">
                                    <IconComponent />
                                </div>
                                <div className="why-us-content">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export { whyUsData };
export default WhyUs;
