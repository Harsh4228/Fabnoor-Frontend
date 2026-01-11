// ============= Delivery.jsx =============
const Delivery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl font-serif text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Delivery Information
          </h1>
          
          <p className="text-gray-600 mb-6 text-lg">
            We offer fast and reliable delivery across India.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
              <svg className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Order processing time</p>
                <p className="text-gray-600">24–48 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
              <svg className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Delivery time</p>
                <p className="text-gray-600">3–7 business days</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
              <svg className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Tracking</p>
                <p className="text-gray-600">Tracking details will be shared via SMS/email</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
