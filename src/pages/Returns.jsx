// ============= Returns.jsx =============
  const Returns = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl font-serif text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Return & Refund Policy
          </h1>
          
          <p className="text-gray-600 mb-6 text-lg">
            Products can be returned within 7 days of delivery.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
              <svg className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-700">Item must be unused and in original condition</p>
            </div>

            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
              <svg className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-700">Original packaging required</p>
            </div>

            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
              <svg className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-700">Refund processed within 5–7 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;