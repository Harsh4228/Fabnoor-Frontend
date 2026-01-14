import React from 'react';

const Newsletter = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };

  return (
    
    <section className="my-16 md:my-20 py-16 md:py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50 relative overflow-hidden">
      {/* Decorative Elements */}
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-lg mb-6 md:mb-8">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 mb-4">
            Join the <span className="text-rose-500">Princess Club</span>
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3">
            Subscribe now & get 20% off your first order
          </p>

          {/* Description */}
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto">
            Be the first to know about exclusive launches, special offers, styling tips, and more. 
            Join thousands of fashion-forward women who trust Fabnoor for their wardrobe.
          </p>

          {/* Form */}
          <form 
            onSubmit={onSubmitHandler} 
            className="w-full max-w-xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-full shadow-lg p-2 border border-pink-100">
              <input 
                className="flex-1 px-4 md:px-6 py-3 md:py-4 outline-none text-sm md:text-base rounded-full bg-transparent" 
                type="email" 
                placeholder="Enter your email address" 
                required
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white text-sm md:text-base font-medium px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </div>
          </form>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-8 md:mt-10">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Exclusive Offers
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              New Arrivals First
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Style Tips
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-400 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default Newsletter;  