import React from 'react';
import Hero from '../components/Hero';
import LatestCollection from '../components/LatestCollection';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';

const Home = () => {
  return (
    <div>
      <Hero />
      <div className='space'></div>
        <LatestCollection />
      <div className='space'></div>
      <BestSeller />
      <div className='space'></div>
      <OurPolicy />
    </div>
  );
}

export default Home;
