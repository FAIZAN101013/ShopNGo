import React from 'react';

const NewsletterBox = () => {
    const onSubmitHandler = (e) => {
        e.preventDefault();
        alert('Subscribed successfully');
    };

    return (
      <div className="text-center py-20 px-6">
        
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Subscribe now & get 20% off</h2>
        <br />
        <p className="text-gray-700 text-lg mb-6">Stay updated with our latest news and offers.</p>
        <br />
            <form onSubmit={onSubmitHandler} className="flex justify-center mt-4">
                <div className="flex w-full max-w-lg border border-gray-300 overflow-hidden shadow-lg">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="w-full px-4 py-3 text-gray-800 border-none outline-none placeholder-gray-500"
                        required 
                    />
                    <button 
                        type="submit" 
                        className="bg-black text-white font-semibold px-6 py-3 hover:bg-gray-600 transition-colors duration-300"
                    >
                        SUBSCRIBE
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewsletterBox;