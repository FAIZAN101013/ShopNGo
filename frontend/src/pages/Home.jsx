// Desc: Home page component

import React from 'react';
import Hero from '../components/Hero';
import LatestCollection from '../components/LatestCollection';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';

const Home = () => {
  return (
    <div>
      <br />
      <Hero />
      <div className='space'></div>
        <LatestCollection />
      <div className='space'></div>
      <BestSeller />
       
      <div className='space'></div>
      <OurPolicy />

     
      <NewsletterBox />
       
    </div>
  );
}

export default Home;
