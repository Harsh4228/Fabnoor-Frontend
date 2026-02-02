

const WhyChooseSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-rose-50" id="why-choose">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 justify-center mb-16">
          <h2 className="text-3xl font-serif text-gray-900">WHY CHOOSE</h2>
          <span className="text-3xl font-serif text-pink-500">US</span>
          <div className="h-0.5 w-12 bg-pink-500 rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-pink-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="/src/assets/quality_icon.png" 
                  alt="Quality Assurance" 
                  className="w-10 h-10" 
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-pink-500 transition-colors duration-300">
                Quality Assurance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We meticulously select and vet each product to ensure it meets our stringent quality standards.
              </p>
            </div>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-pink-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="/src/assets/cart_icon.png" 
                  alt="Convenience" 
                  className="w-10 h-10" 
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-pink-500 transition-colors duration-300">
                Convenience
              </h3>
              <p className="text-gray-600 leading-relaxed">
                With our user-friendly interface and hassle-free ordering process, shopping has never been easier.
              </p>
            </div>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-pink-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="/src/assets/support_img.png" 
                  alt="Exceptional Customer Service" 
                  className="w-10 h-10" 
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-pink-500 transition-colors duration-300">
                Exceptional Customer Service
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;