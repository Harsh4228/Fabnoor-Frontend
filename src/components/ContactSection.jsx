import React from "react";

const ContactSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-pink-50/20 to-white" id="contact">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Title */}
        <div className="flex items-center gap-3 md:gap-4 justify-center mb-12 md:mb-16">
          <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-rose-300" />
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900">CONTACT</h2>
          <span className="text-3xl md:text-4xl font-serif text-rose-500">US</span>
          <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-rose-300" />
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              {/* Decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-200 to-pink-200 rounded-2xl opacity-30 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
              
              <img
                src="/src/assets/contact_img.png"
                alt="Workspace setup"
                className="relative rounded-2xl shadow-2xl w-full object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="w-full lg:w-1/2 space-y-8 md:space-y-10">
            {/* Store Location */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-pink-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-gray-900">Our Store</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">54709 Willms Station</p>
              <p className="text-gray-600 leading-relaxed">Suite 350, Washington, USA</p>
            </div>

            {/* Contact Details */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-pink-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-gray-900">Get in Touch</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-rose-500">📞</span>
                  Tel: (415) 555-0132
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-rose-500">✉️</span>
                  Email: admin@forever.com
                </p>
              </div>
            </div>

            {/* Careers */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-pink-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-gray-900">Careers at Forever</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Learn more about our teams and job openings.
              </p>
              <button
                onClick={() => (window.location.href = "#careers")}
                className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Explore Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;