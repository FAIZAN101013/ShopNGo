import React from 'react';
import { assets } from '../assets/assets';

const OurPolicy = () => {
  const policies = [
    {
      icon: assets.exchange_icon,
      title: "Easy Exchange Policy",
      desc: "Hassle-free returns within 7 days of delivery",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: assets.shipping_icon,
      title: "Free Shipping",
      desc: "Free delivery on orders above $100",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: assets.support_img,
      title: "24/7 Customer Support",
      desc: "Dedicated support via chat and email",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: assets.quality_icon,
      title: "Quality Assured",
      desc: "Every product passes quality checks",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
  ];

  return (
    <div className="!py-20 !px-4 bg-white">
      <div className="!max-w-7xl !mx-auto">
        {/* Title Section */}
        <div className="text-center !mb-16">
          <h2 className="text-3xl font-bold text-gray-900 !mb-4">Why Choose Us</h2>
          <p className="text-gray-600 !max-w-2xl !mx-auto">
            We're committed to providing the best shopping experience with these amazing benefits
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 !gap-8">
          {policies.map((policy, index) => (
            <div
              key={index}
              className={`${policy.bgColor} rounded-2xl !p-6 hover:shadow-lg transition-all duration-300 group`}
            >
              <div className="!mb-6">
                <div className="!w-16 !h-16 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <img src={policy.icon} className="!w-8 !h-8" alt={policy.title} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 !mb-3">
                {policy.title}
              </h3>
              <p className="text-gray-600 text-sm !leading-relaxed">
                {policy.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurPolicy;
