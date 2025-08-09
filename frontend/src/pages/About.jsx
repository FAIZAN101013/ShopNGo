import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="!pt-10 !pb-16">
      <div className="!mb-6">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 !gap-8 items-center">
        <div>
          <img
            src={assets.about_img}
            alt="About ShopNGo"
            className="!w-full !h-auto rounded-xl shadow-sm"
          />
        </div>

        <div className="!space-y-4">
          <h2 className="text-2xl font-medium text-gray-900">Our Story</h2>
          <p className="text-gray-600 !leading-relaxed">
            Welcome to ShopNGo — your destination for fashion that blends quality, comfort,
            and style. We curate a wide range of products for Men, Women, and Kids, ensuring
            every piece reflects craftsmanship and everyday wearability.
          </p>
          <p className="text-gray-600 !leading-relaxed">
            From timeless essentials to on-trend collections, our focus is to deliver great
            value with a smooth shopping experience. We are committed to authenticity,
            transparent pricing, and customer-first service.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 !gap-4 !mt-6">
            <div className="bg-gray-50 rounded-lg !p-4 flex items-start !gap-3">
              <img src={assets.quality_icon} alt="Quality" className="!w-6 !h-6" />
              <div>
                <p className="font-medium text-gray-900">Premium Quality</p>
                <p className="text-sm text-gray-600">Handpicked fabrics and durable construction.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg !p-4 flex items-start !gap-3">
              <img src={assets.shipping_icon} alt="Shipping" className="!w-6 !h-6" />
              <div>
                <p className="font-medium text-gray-900">Fast Shipping</p>
                <p className="text-sm text-gray-600">Reliable delivery with live order tracking.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg !p-4 flex items-start !gap-3">
              <img src={assets.exchange_icon} alt="Easy Returns" className="!w-6 !h-6" />
              <div>
                <p className="font-medium text-gray-900">Easy Returns</p>
                <p className="text-sm text-gray-600">Hassle-free returns within 7 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="!mt-12 grid grid-cols-1 md:grid-cols-3 !gap-6">
        <div className="border border-gray-200 rounded-xl !p-6">
          <h3 className="font-medium text-gray-900 !mb-2">Mission</h3>
          <p className="text-gray-600 text-sm !leading-relaxed">
            To make quality fashion accessible and delightful for everyone.
          </p>
        </div>
        <div className="border border-gray-200 rounded-xl !p-6">
          <h3 className="font-medium text-gray-900 !mb-2">Vision</h3>
          <p className="text-gray-600 text-sm !leading-relaxed">
            Build a trusted lifestyle brand powered by customer love and innovation.
          </p>
        </div>
        <div className="border border-gray-200 rounded-xl !p-6">
          <h3 className="font-medium text-gray-900 !mb-2">Values</h3>
          <p className="text-gray-600 text-sm !leading-relaxed">
            Authenticity, reliability, and thoughtful design in everything we do.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
