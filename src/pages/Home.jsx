import React from 'react';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import CategoryCards from '../components/CategoryCards';
import WhyUs from '../components/WhyUs';
import CTABanner from '../components/CTABanner';

function Home() {
    return (
        <>
            <Hero />
            <TrustBar />
            <CategoryCards />
            <WhyUs />
            <CTABanner />
        </>
    );
}

export default Home;
