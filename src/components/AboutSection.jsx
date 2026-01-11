import React from "react";

const AboutSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-pink-50/20 to-white" id="about">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              {/* Decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-200 to-pink-200 rounded-2xl opacity-30 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
              
              <img
                src="/src/assets/about_img.png"
                alt="Fashion items layout"
                className="relative rounded-2xl shadow-2xl w-full object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Title */}
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900">ABOUT</h2>
              <span className="text-3xl md:text-4xl font-serif text-rose-500">US</span>
              <div className="h-0.5 w-12 md:w-16 bg-gradient-to-r from-rose-400 to-pink-300" />
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              Forever was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide range of products from the comfort of their homes.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. From fashion and beauty to electronics and home essentials, we offer an extensive collection sourced from trusted brands and suppliers.
            </p>

            {/* Mission */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl md:rounded-2xl p-6 md:p-8 mt-6 md:mt-8 border border-pink-100">
              <h3 className="text-xl md:text-2xl font-serif text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-rose-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Our mission at Forever is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.
              </p>
            </div>

            {/* Stats (Optional - can be added if needed) */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-serif text-rose-500">10K+</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-serif text-rose-500">500+</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-serif text-rose-500">100%</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Authentic</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;