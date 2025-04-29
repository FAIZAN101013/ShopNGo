import React, { useState } from 'react';

const NewsletterBox = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // 'success' or 'error'

    const onSubmitHandler = (e) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus(''), 3000); // Clear status after 3 seconds
        } else {
            setStatus('error');
        }
    };

    return (
        <div className="!py-24 !px-4 !bg-gray-50">
            <div className="!max-w-6xl !mx-auto">
                <div className="!grid !md:grid-cols-2 !gap-12 !items-center">
                    {/* Left Content */}
                    <div className="!text-left !space-y-6">
                        <h2 className="!text-4xl !md:text-5xl !font-bold !leading-tight !text-gray-900">
                            Get
                            <span className="!text-orange-500 !mx-2">20% off</span>
                            on your first order
                        </h2>

                        <p className="!text-gray-600 !text-lg !leading-relaxed">
                            Join our newsletter and discover new collections and exclusive offers before anyone else.
                        </p>

                        {/* Benefits */}
                        <div className="!space-y-4 !pt-4">
                            {[
                                'Exclusive deals and discounts',
                                'New arrivals notifications',
                                'Seasonal updates and style tips',
                                'Early access to sales'
                            ].map((benefit, index) => (
                                <div key={index} className="!flex !items-center !gap-3">
                                    <div className="!w-5 !h-5 !rounded-full !bg-green-100 !flex !items-center !justify-center">
                                        <svg
                                            className="!w-3 !h-3 !text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="!text-gray-600">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="!space-y-8">
                        <div className="!bg-white !p-8 !rounded-2xl !shadow-lg !border !border-gray-100">
                            <h3 className="!text-gray-900 !text-2xl !font-bold !mb-6">
                                Subscribe to Newsletter
                            </h3>

                            <div className="!space-y-6">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="!block !text-gray-700 !text-sm !font-medium !mb-2"
                                    >
                                        Email Address
                                    </label>
                                    <div className="!relative">
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className={`
                                                !w-full !px-4 !py-3 !pl-12 !rounded-lg !border
                                                !text-gray-800 !placeholder-gray-400
                                                !focus:outline-none !focus:ring-2 !focus:ring-orange-500
                                                ${status === 'error' ? '!border-red-500' : '!border-gray-200'}
                                            `}
                                        />
                                        <div className="!absolute !left-4 !top-1/2 !transform !-translate-y-1/2">
                                            <svg
                                                className="!w-5 !h-5 !text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onSubmitHandler}
                                    className="!w-full !bg-orange-500 !text-white !font-medium !py-3 !rounded-lg
                                             !hover:bg-orange-600 !transition-colors !duration-300 !shadow-md"
                                >
                                    Subscribe Now
                                </button>

                                {/* Status Messages */}
                                {status === 'success' && (
                                    <div className="!flex !items-center !gap-2 !text-green-600 !text-sm !bg-green-50 !p-3 !rounded-lg">
                                        <svg
                                            className="!w-4 !h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>Successfully subscribed!</span>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="!flex !items-center !gap-2 !text-red-500 !text-sm !mt-2 !bg-red-50 !p-3 !rounded-lg">
                                        <svg
                                            className="!w-4 !h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span>Please enter a valid email</span>
                                    </div>
                                )}
                            </div>

                            {/* Privacy Notice */}
                            <p className="!text-gray-500 !text-xs !text-center !mt-6">
                                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                            </p>
                        </div>

                        {/* Trust Badges */}
                        <div className="!flex !justify-center !gap-6">
                            {['Secure', 'Trusted', 'No Spam'].map((badge, index) => (
                                <div
                                    key={index}
                                    className="!flex !items-center !gap-2 !bg-gray-800 !px-4 !py-2 !rounded-full !shadow-md"
                                >
                                    <svg
                                        className="!w-4 !h-4 !text-yellow-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                    <span className="!text-sm !text-white">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterBox;