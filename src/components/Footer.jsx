import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src={logo} alt="Medineo Enterprises" className="footer-logo-image" />
                        </div>
                        <p className="footer-tagline">
                            Your Trusted Partner in Healthcare Supply
                        </p>
                        <p className="footer-description">
                            Delivering quality medicines and medical supplies to hospitals,
                            clinics, and healthcare institutions.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/why-choose-us">Why Choose Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Products</h4>
                        <ul>
                            <li><Link to="/products">Medicines</Link></li>
                            <li><Link to="/products">Surgical Items</Link></li>
                            <li><Link to="/products">Medical Consumables</Link></li>
                            <li><Link to="/products">Healthcare Supplies</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <FaMapMarkerAlt className="footer-icon" />
                                <span>Purvasa Nagar, Hoshangabad Road</span>
                            </li>
                            <li>
                                <FaPhone className="footer-icon" />
                                <span>+91 7693818387</span>
                            </li>
                            <li>
                                <FaEnvelope className="footer-icon" />
                                <span>medineoenterprises@gmail.com</span>
                            </li>
                            <li>
                                <FaClock className="footer-icon" />
                                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Medineo Enterprises. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
