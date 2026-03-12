import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaSyringe,
    FaArrowRight,
    FaArrowLeft,
    FaSearch,
    FaPaperPlane
} from 'react-icons/fa';
import './SurgicalProducts.css';

const surgicalProducts = [
    {
        category: 'Cutting Instruments',
        description: 'Used for cutting tissues or making incisions',
        items: [
            { name: 'Scalpel Handle', spec: 'Reusable Handle' },
            { name: 'Surgical Blade No. 10', spec: 'Blade No. 10' },
            { name: 'Surgical Blade No. 11', spec: 'Blade No. 11' },
            { name: 'Surgical Blade No. 15', spec: 'Blade No. 15' },
            { name: 'Mayo Scissors', spec: 'Heavy Duty' },
            { name: 'Metzenbaum Scissors', spec: 'Fine Dissection' },
            { name: 'Iris Scissors', spec: 'Precision Cutting' },
            { name: 'Stitch Scissors', spec: 'Suture Removal' },
            { name: 'Bone Cutter', spec: 'Orthopedic' },
            { name: 'Surgical Saw', spec: 'Bone Cutting' },
        ]
    },
    {
        category: 'Grasping / Holding Instruments',
        description: 'Hold tissues, organs, or surgical materials during procedures',
        items: [
            { name: 'Tissue Forceps', spec: 'General Purpose' },
            { name: 'Dressing Forceps', spec: 'Wound Care' },
            { name: 'Allis Forceps', spec: 'Tissue Grasping' },
            { name: 'Babcock Forceps', spec: 'Atraumatic Grasping' },
            { name: 'Adson Forceps', spec: 'Fine Tip' },
            { name: 'Debakey Forceps', spec: 'Vascular' },
            { name: 'Sponge Holding Forceps', spec: 'Sponge Holder' },
            { name: 'Towel Clamp', spec: 'Drape Securing' },
        ]
    },
    {
        category: 'Hemostatic Instruments',
        description: 'Stop bleeding by clamping blood vessels',
        items: [
            { name: 'Mosquito Forceps', spec: 'Small Vessel Clamp' },
            { name: 'Kelly Clamp', spec: 'Medium Vessel' },
            { name: 'Crile Clamp', spec: 'Hemostatic' },
            { name: 'Kocher Clamp', spec: 'Heavy Duty' },
            { name: 'Artery Forceps', spec: 'Vessel Clamping' },
        ]
    },
    {
        category: 'Retractors',
        description: 'Used to hold wounds open and expose organs during surgery',
        items: [
            { name: 'Army Navy Retractor', spec: 'Double-Ended' },
            { name: 'Deaver Retractor', spec: 'Deep Cavity' },
            { name: 'Richardson Retractor', spec: 'Abdominal' },
            { name: 'Langenbeck Retractor', spec: 'Handheld' },
            { name: 'Weitlaner Retractor', spec: 'Self-Retaining' },
            { name: 'Gelpi Retractor', spec: 'Self-Retaining' },
        ]
    },
    {
        category: 'Suturing Instruments',
        description: 'Used for closing wounds',
        items: [
            { name: 'Needle Holder', spec: 'General Purpose' },
            { name: 'Mayo-Hegar Needle Holder', spec: 'Heavy Duty' },
            { name: 'Sutures', spec: 'Various Types' },
            { name: 'Surgical Needles', spec: 'Assorted Sizes' },
            { name: 'Skin Stapler', spec: 'Wound Closure' },
            { name: 'Clip Applier', spec: 'Clip Application' },
        ]
    },
    {
        category: 'Suction & Irrigation',
        description: 'Used for fluid removal and wound irrigation',
        items: [
            { name: 'Yankauer Suction', spec: 'Rigid Tip' },
            { name: 'Poole Suction', spec: 'Abdominal' },
            { name: 'Suction Tube', spec: 'Flexible' },
            { name: 'Irrigation Syringe', spec: 'Wound Irrigation' },
        ]
    },
    {
        category: 'Electrosurgical Equipment',
        description: 'Electrical devices for cutting and coagulation',
        items: [
            { name: 'Electrocautery Machine', spec: 'Main Unit' },
            { name: 'Bipolar Cautery', spec: 'Precision Coagulation' },
            { name: 'Monopolar Cautery', spec: 'Cutting & Coagulation' },
        ]
    },
    {
        category: 'Basic Surgical Consumables',
        description: 'Essential disposable materials for surgical procedures',
        items: [
            { name: 'Surgical Drapes', spec: 'Sterile Draping' },
            { name: 'Surgical Gloves', spec: 'Latex / Nitrile' },
            { name: 'Gauze', spec: 'Wound Packing' },
            { name: 'Cotton Swabs', spec: 'Cleaning & Prep' },
            { name: 'Surgical Tape', spec: 'Adhesive' },
            { name: 'Bandages', spec: 'Various Sizes' },
            { name: 'Surgical Sponges', spec: 'Absorbent' },
        ]
    },
    {
        category: 'Specialized — Cardiology',
        description: 'Cardiac catheterization and intervention tools',
        items: [
            { name: 'Catheters', spec: 'Diagnostic & Guiding' },
            { name: 'Guide Wires', spec: 'Various Sizes' },
            { name: 'Balloon PTCA', spec: 'Angioplasty' },
            { name: 'Sheaths', spec: 'Introducer & Radial' },
        ]
    },
    {
        category: 'Specialized — Orthopedic',
        description: 'Bone and joint surgery instruments',
        items: [
            { name: 'Bone Drill', spec: 'Powered' },
            { name: 'Bone Saw', spec: 'Oscillating' },
            { name: 'Bone Plates', spec: 'Fixation' },
            { name: 'Screws', spec: 'Orthopedic Fixation' },
        ]
    },
    {
        category: 'Specialized — Neurosurgery',
        description: 'Instruments for brain and nervous system surgery',
        items: [
            { name: 'Cranial Drill', spec: 'Powered' },
            { name: 'Microsurgical Forceps', spec: 'Fine Tip' },
        ]
    },
    {
        category: 'Specialized — Laparoscopic Surgery',
        description: 'Minimally invasive surgical instruments',
        items: [
            { name: 'Trocar', spec: 'Port Access' },
            { name: 'Laparoscopic Camera', spec: 'HD Visualization' },
            { name: 'Laparoscopic Scissors', spec: 'MIS Cutting' },
            { name: 'Graspers', spec: 'Laparoscopic Grasping' },
        ]
    },
];

function SurgicalProducts() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = surgicalProducts
        .map(group => ({
            ...group,
            items: group.items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }))
        .filter(group => group.items.length > 0);

    const totalProducts = surgicalProducts.reduce((sum, g) => sum + g.items.length, 0);

    return (
        <div className="surgical-page">
            {/* Page Header */}
            <section className="surgical-header">
                <div className="container">
                    <Link to="/products" className="back-link">
                        <FaArrowLeft /> Back to All Products
                    </Link>
                    <div className="surgical-header-content">
                        <div className="surgical-icon-wrapper">
                            <FaSyringe />
                        </div>
                        <div>
                            <h1>Surgical Items</h1>
                            <p>Complete range of surgical instruments, consumables & specialized equipment for hospitals and OTs</p>
                        </div>
                    </div>
                    <div className="surgical-stats">
                        <span>{totalProducts} Products</span>
                        <span>{surgicalProducts.length} Categories</span>
                    </div>
                </div>
            </section>

            {/* Search Bar */}
            <section className="surgical-search-section">
                <div className="container">
                    <div className="surgical-search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search surgical items... (e.g., Scissors, Forceps, Retractor, Cautery)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Product Listing */}
            <section className="section surgical-listing">
                <div className="container">
                    {filteredProducts.length === 0 ? (
                        <div className="no-results">
                            <p>No products found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        filteredProducts.map((group) => (
                            <div key={group.category} className="surgical-product-group">
                                <div className="surgical-group-header">
                                    <h2 className="surgical-group-title">{group.category}</h2>
                                    <span className="surgical-group-desc">{group.description}</span>
                                </div>
                                <div className="surgical-items-grid">
                                    {group.items.map((item, index) => (
                                        <div key={index} className="surgical-product-card">
                                            <div className="surgical-product-info">
                                                <h3>{item.name}</h3>
                                                <span className="surgical-product-spec">{item.spec}</span>
                                            </div>
                                            <Link
                                                to={`/contact?product=${encodeURIComponent(item.name)}`}
                                                className="surgical-inquiry-btn"
                                            >
                                                <FaPaperPlane />
                                                Inquiry
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
            <section className="section section-alt surgical-cta">
                <div className="container">
                    <div className="surgical-cta-content">
                        <h2>Need a specific surgical instrument?</h2>
                        <p>We can source additional surgical products from our trusted manufacturer network. Contact us with your requirements.</p>
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

export default SurgicalProducts;
