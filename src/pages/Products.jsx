import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaPills,
    FaSyringe,
    FaBandAid,
    FaHeartbeat,
    FaArrowRight,
    FaCheck
} from 'react-icons/fa';
import './Products.css';

const productsData = [
    {
        id: 'medicines',
        title: 'Medicines',
        description: 'Comprehensive range of pharmaceutical products from certified manufacturers with complete documentation and batch verification.',
        icon: FaPills,
        color: '#C41E3A',
        features: [
            'Tablets & Capsules',
            'Injectable Solutions',
            'Syrups & Suspensions',
            'Ointments & Creams',
            'Certified Manufacturers'
        ]
    },
    {
        id: 'surgical',
        title: 'Surgical Items',
        description: 'High-quality surgical instruments and operation theatre supplies for hospitals and clinics, sourced from trusted manufacturers.',
        icon: FaSyringe,
        color: '#2E8B57',
        features: [
            'Surgical Instruments',
            'Sutures & Blades',
            'Surgical Gloves',
            'OT Supplies',
            'Sterilization Products'
        ]
    },
    {
        id: 'consumables',
        title: 'Medical Consumables',
        description: 'Essential daily-use healthcare consumables for hospitals, clinics, and nursing homes with consistent quality and supply.',
        icon: FaBandAid,
        color: '#1A1A1A',
        features: [
            'Syringes & Needles',
            'IV Sets & Catheters',
            'Bandages & Dressings',
            'Cotton & Gauze',
            'Disposable Items'
        ]
    },
    {
        id: 'supplies',
        title: 'Healthcare Supplies',
        description: 'General healthcare products and institutional care supplies to support comprehensive patient care and facility operations.',
        icon: FaHeartbeat,
        color: '#C41E3A',
        features: [
            'Sanitizers & Disinfectants',
            'Thermometers',
            'BP Monitors',
            'Diagnostic Supplies',
            'Institutional Care Items'
        ]
    }
];

function Products() {
    return (
        <div className="products-page">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>Our Product Categories</h1>
                    <p>Comprehensive range of medical products for healthcare institutions</p>
                </div>
            </section>

            {/* Products Section */}
            <section className="section products-list">
                <div className="container">
                    <div className="products-intro">
                        <p>
                            We supply a wide range of medical products to hospitals, clinics, nursing homes,
                            and healthcare institutions. All products are sourced from certified manufacturers
                            and verified suppliers with complete documentation.
                        </p>
                    </div>

                    <div className="products-grid">
                        {productsData.map((product) => {
                            const IconComponent = product.icon;
                            return (
                                <div key={product.id} className="product-card">
                                    <div className="product-header">
                                        <div
                                            className="product-icon"
                                            style={{ backgroundColor: `${product.color}15`, color: product.color }}
                                        >
                                            <IconComponent />
                                        </div>
                                        <h2>{product.title}</h2>
                                    </div>
                                    <p className="product-description">{product.description}</p>
                                    <ul className="product-features">
                                        {product.features.map((feature, index) => (
                                            <li key={index}>
                                                <FaCheck className="feature-icon" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to="/contact" className="btn btn-primary product-cta">
                                        Send Inquiry for {product.title}
                                        <FaArrowRight />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="section section-alt products-info">
                <div className="container">
                    <div className="products-info-content">
                        <div className="info-text">
                            <h2>Why Our Products?</h2>
                            <p>
                                At Medineo Enterprises, we understand that medical institutions require
                                reliable suppliers who can provide genuine products with proper documentation.
                                Every product we supply comes with:
                            </p>
                            <ul>
                                <li><FaCheck /> Authentic sourcing from certified manufacturers</li>
                                <li><FaCheck /> Complete batch documentation and verification</li>
                                <li><FaCheck /> Regulatory compliance certificates</li>
                                <li><FaCheck /> Proper storage and handling during transit</li>
                            </ul>
                        </div>
                        <div className="info-cta">
                            <h3>Looking for specific products?</h3>
                            <p>
                                Contact us with your requirements and our team will assist you
                                with product availability and supply options.
                            </p>
                            <Link to="/contact" className="btn btn-primary btn-lg">
                                Send Inquiry
                                <FaArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Products;
