import React from 'react';
import { assets } from '../assets/assets';

const OurPolicy = () => {
  const policies = [
    { icon: assets.exchange_icon, title: "Easy Exchange Policy", desc: "We offer an easy exchange policy for our customers." },
    { icon: assets.shipping_icon, title: "Free Shipping", desc: "Enjoy quick delivery at no extra cost." },
      { icon: assets.support_img, title: "24/7 Customer Support", desc: "We're here to assist you anytime, anywhere." },
    {icon: assets.quality_icon, title: "Quality Assured", desc: "We guarantee the quality of our products." },
  ];

    return (
        <>
            
          <div className='space'></div>  
         <div className="flex flex-col sm:flex-row justify-center gap-12 sm:gap-16 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">
      {policies.map((policy, index) => (
        <div key={index} className="flex flex-col items-center w-60">
          <div className="flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full">
            <img src={policy.icon} className="w-10" alt={policy.title} />
          </div>
          <p className="font-semibold text-lg mt-3">{policy.title}</p>
          <p className="text-gray-500 mt-2">{policy.desc}</p>
        </div>
      ))}
    </div>
        </>
   
  );
};

export default OurPolicy;
