// ============= FAQ.jsx =============
 const FAQ = () => {
  const faqs = [
    {
      question: "How can I place an order?",
      answer: "Browse products → Add to cart → Checkout."
    },
    {
      question: "What payment methods are accepted?",
      answer: "UPI, Cards, Net Banking, COD."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-7 business days."
    },
    {
      question: "Can I return a product?",
      answer: "Yes, products can be returned within 7 days of delivery."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">Frequently Asked Questions</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-semibold text-sm">
                  {index + 1}
                </span>
                {faq.question}
              </h3>
              <p className="text-gray-600 ml-10">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FAQ;