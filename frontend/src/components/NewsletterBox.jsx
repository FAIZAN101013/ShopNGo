import React from 'react';

const NewsletterBox = () => {
  return (
    <div className="text-center bg-gray-50 py-24 px-16">
      {/* Title */}
      <h2 className="text-5xl font-bold text-gray-800 mb-16">
        Subscribe now & get 20% off
      </h2>
      
      {/* Subtitle */}
      <p className="text-gray-700 mb-16 text-xl">
        Stay updated with our latest news and offers.
      </p>
      <div className="mt-64 mb-64"></div>
      {/* Form */}
      <form className="mt-16 flex justify-center">
        <div className="flex w-full max-w-lg border border-gray-300 overflow-hidden shadow-lg">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full px-8 py-6 text-gray-800 border-none outline-none placeholder-gray-500"
            required 
          />
          <button 
            type="submit" 
            className="bg-black text-white font-semibold px-8 py-6 whitespace-nowrap hover:bg-gray-600 transition-colors duration-300"
          >
            SUBSCRIBE
          </button>
        </div>
      </form>
      {/* Extra spacing */}
      <div className="mt-64 mb-64"></div>
    </div>
  );
}

export default NewsletterBox;
