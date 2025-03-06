import React from 'react';

const NewsletterBox = () => {
  return (
    <div className="text-center py-12 px-6">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900">
        Subscribe now & get 20% off
      </h2>
      
      {/* Subtitle */}
      <p className="text-gray-500 mt-2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      </p>

      {/* Form */}
      <form className="mt-6 flex justify-center">
        <div className="flex w-full sm:w-[450px] border border-gray-300  overflow-hidden">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full px-4 py-3 text-gray-600 outline-none placeholder-gray-400"
            required 
          />
          <button 
            type="submit" 
            className="bg-black text-white font-medium px-6 py-3 whitespace-nowrap hover:bg-gray-800 transition"
          >
            SUBSCRIBE
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewsletterBox;
