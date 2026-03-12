import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaHeartbeat,
    FaArrowRight,
    FaArrowLeft,
    FaSearch,
    FaPaperPlane
} from 'react-icons/fa';
import './CardiacProducts.css';

const cardiacProducts = [
    {
        category: 'Drape Sheets',
        items: [
            { name: 'Drape Sheet Cardiac 3×3', spec: 'Size: 3×3' },
            { name: 'Drape Sheet Cardiac 3×5', spec: 'Size: 3×5' },
            { name: 'Drape Sheet 2×1 Blue Cardiac', spec: 'Size: 2×1 | Color: Blue' },
        ]
    },
    {
        category: 'Trays',
        items: [
            { name: 'Kidney Tray Medium', spec: 'Medium Size' },
            { name: 'Steel Tray 15×12', spec: 'Size: 15×12' },
        ]
    },
    {
        category: 'Sheaths',
        items: [
            { name: 'Radial Sheath 5FR', spec: '5FR' },
            { name: 'Radial Sheath 6F', spec: '6F' },
            { name: 'Introducer Sheath 6F', spec: '6F' },
            { name: 'Introducer Sheath 7F', spec: '7F' },
            { name: 'Introducer Sheath 8F', spec: '8F' },
            { name: 'Introducer Sheath 11F', spec: '11F' },
        ]
    },
    {
        category: 'Guide Wires',
        items: [
            { name: 'BMW Guide Wire 14×190 (Abbott)', spec: '14×190 | Abbott' },
            { name: 'PTCA Runthrough NS Floppy', spec: 'NS Floppy' },
            { name: 'PTCA Versaturn F 190 WW', spec: 'F 190 WW' },
        ]
    },
    {
        category: 'Diagnostic Catheters',
        items: [
            { name: 'Tiger Catheter 5FR', spec: '5FR' },
            { name: 'Diagnostic Catheter 6F JR 3.5', spec: '6F | JR 3.5' },
            { name: 'Diagnostic Catheter 6F JL 3.5', spec: '6F | JL 3.5' },
        ]
    },
    {
        category: 'Guiding Catheters',
        items: [
            { name: 'Guiding Catheter 7F EBU 3.5', spec: '7F | EBU 3.5' },
            { name: 'Guiding Catheter 7F EBU 4.0', spec: '7F | EBU 4.0' },
            { name: 'Guiding Catheter 7F JR 4.0', spec: '7F | JR 4.0' },
            { name: 'Guiding Catheter 7F JL 4', spec: '7F | JL 4' },
            { name: 'Guiding Catheter 6F EBU 3.5', spec: '6F | EBU 3.5' },
            { name: 'Guiding Catheter 6F EBU 4.0', spec: '6F | EBU 4.0' },
            { name: 'Guiding Catheter 6F JL 4.0', spec: '6F | JL 4.0' },
            { name: 'Guiding Catheter 6F JR 3.5', spec: '6F | JR 3.5' },
            { name: 'Guiding Catheter 5F EBU 3.5', spec: '5F | EBU 3.5' },
            { name: 'Guiding Catheter 5F JL 3.5', spec: '5F | JL 3.5' },
        ]
    },
    {
        category: 'PTCA Balloons',
        items: [
            { name: 'Balloon PTCA SC 2.0×10', spec: 'Semi-Compliant | 2.0×10' },
            { name: 'Balloon PTCA SC 1.5×10', spec: 'Semi-Compliant | 1.5×10' },
            { name: 'Balloon PTCA NC 2.75×15', spec: 'Non-Compliant | 2.75×15' },
            { name: 'Balloon PTCA NC 2.75×8', spec: 'Non-Compliant | 2.75×8' },
            { name: 'Balloon PTCA NC 2.5×8', spec: 'Non-Compliant | 2.5×8' },
            { name: 'Balloon PTCA NC 4.5×8', spec: 'Non-Compliant | 4.5×8' },
            { name: 'Balloon PTCA NC 3.5×8', spec: 'Non-Compliant | 3.5×8' },
            { name: 'Balloon Sapphire 1.25×05', spec: 'Sapphire | 1.25×05' },
            { name: 'Balloon Sapphire NC 2.0×08', spec: 'Sapphire NC | 2.0×08' },
        ]
    },
    {
        category: 'Accessories',
        items: [
            { name: 'TR Band', spec: 'Radial Compression Band' },
            { name: 'Inj. Fentanyl 2ML', spec: '2ML' },
        ]
    }
];

function CardiacProducts() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = cardiacProducts
        .map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.spec.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }))
        .filter(group => group.items.length > 0);

    const totalProducts = cardiacProducts.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="cardiac-page">
            {/* Page Header */}
            <section className="cardiac-header">
                <div className="container">
                    <Link to="/products" className="back-link">
                        <FaArrowLeft /> Back to All Products
                    </Link>
                    <div className="cardiac-header-content">
                        <div className="cardiac-icon-wrapper">
                            <FaHeartbeat />
                        </div>
                        <div>
                            <h1>Cardiac Products</h1>
                            <p>Comprehensive range of cardiac catheterization & intervention supplies for hospitals</p>
                        </div>
                    </div>
                    <div className="cardiac-stats">
                        <span>{totalProducts} Products</span>
                        <span>{cardiacProducts.length} Categories</span>
                    </div>
                </div>
            </section>

            {/* Search Bar */}
            <section className="cardiac-search-section">
                <div className="container">
                    <div className="cardiac-search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search cardiac products... (e.g., Guiding Catheter, Balloon, Sheath)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Product Listing */}
            <section className="section cardiac-listing">
                <div className="container">
                    {filteredProducts.length === 0 ? (
                        <div className="no-results">
                            <p>No products found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        filteredProducts.map((group) => (
                            <div key={group.category} className="product-group">
                                <h2 className="group-title">{group.category}</h2>
                                <div className="product-items-grid">
                                    {group.items.map((item, index) => (
                                        <div key={index} className="cardiac-product-card">
                                            <div className="cardiac-product-info">
                                                <h3>{item.name}</h3>
                                                <span className="cardiac-product-spec">{item.spec}</span>
                                            </div>
                                            <Link
                                                to={`/contact?product=${encodeURIComponent(item.name)}`}
                                                className="inquiry-btn"
                                            >
                                                <FaPaperPlane />
                                                Send Inquiry
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="section section-alt cardiac-cta">
                <div className="container">
                    <div className="cardiac-cta-content">
                        <h2>Need a product not listed here?</h2>
                        <p>We can source additional cardiac products from our trusted manufacturer network. Contact us with your requirements.</p>
                        <Link to="/contact" className="btn btn-primary btn-lg">
                            Send Custom Inquiry
                            <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default CardiacProducts;
