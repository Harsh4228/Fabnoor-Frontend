// ============= PrivacyPolicy.jsx =============
 const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl font-serif text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. We never share your personal
              information with third parties.
            </p>
            
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 font-medium">
                All transactions are secured and encrypted to ensure safety.
              </p>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Information We Collect</h3>
            <p className="text-gray-600 mb-4">
              We collect information that you provide directly to us, including your name, email address, shipping address, and payment information.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">How We Use Your Information</h3>
            <p className="text-gray-600 mb-4">
              We use the information we collect to process your orders, communicate with you, and improve our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default PrivacyPolicy;