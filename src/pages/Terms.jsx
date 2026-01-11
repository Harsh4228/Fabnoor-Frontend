// ============= Terms.jsx =============
 const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl font-serif text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Terms & Conditions
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-gray-600">
              By using our website, you agree to our terms and conditions.
            </p>
            
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6">
              <p className="text-gray-700 font-medium">
                Prices, offers, and policies are subject to change without notice.
              </p>
            </div>

            <h3 className="text-xl font-bold text-gray-900">Use of Website</h3>
            <p className="text-gray-600">
              You agree to use this website only for lawful purposes and in accordance with these terms.
            </p>

            <h3 className="text-xl font-bold text-gray-900">Product Information</h3>
            <p className="text-gray-600">
              We strive to provide accurate product information, but we do not warrant that descriptions or other content is error-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Terms;