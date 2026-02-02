import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaPills,
    FaSyringe,
    FaBandAid,
    FaHeartbeat,
    FaArrowRight
} from 'react-icons/fa';
import './CategoryCard.css';

const categoryData = [
    {
        id: 'medicines',
        title: 'Medicines',
        description: 'Pharmaceutical products including tablets, capsules, injectables, and syrups from certified manufacturers.',
        icon: FaPills,
        color: '#C41E3A'
    },
    {
        id: 'surgical',
        title: 'Surgical Items',
        description: 'Surgical instruments, sutures, blades, gloves, and operation theatre supplies for healthcare facilities.',
        icon: FaSyringe,
        color: '#2E8B57'
    },
    {
        id: 'consumables',
        title: 'Medical Consumables',
        description: 'Syringes, IV sets, catheters, bandages, cotton, and daily-use healthcare consumable products.',
        icon: FaBandAid,
        color: '#1A1A1A'
    },
    {
        id: 'supplies',
        title: 'Healthcare Supplies',
        description: 'General healthcare products including sanitizers, thermometers, BP monitors, and institutional supplies.',
        icon: FaHeartbeat,
        color: '#C41E3A'
    }
];

function CategoryCards() {
    return (
        <section className="section categories-section">
            <div className="container">
                <div className="section-header">
                    <h2>What We Supply</h2>
                    <p>Comprehensive range of medical products for healthcare institutions</p>
                </div>
                <div className="categories-grid">
                    {categoryData.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <div key={category.id} className="category-card">
                                <div
                                    className="category-icon"
                                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                                >
                                    <IconComponent />
                                </div>
                                <h3 className="category-title">{category.title}</h3>
                                <p className="category-description">{category.description}</p>
                                <Link to="/contact" className="category-link">
                                    Send Inquiry
                                    <FaArrowRight />
                                </Link>
                            </div>
                        );
                    })}
                </div>
                <div className="categories-action">
                    <Link to="/products" className="btn btn-secondary">
                        View All Categories
                    </Link>
                </div>
            </div>
        </section>
    );
}

export { categoryData };
export default CategoryCards;
