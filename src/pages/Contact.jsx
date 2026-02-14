
import Title from "../components/Title";
import Newsletter from "../components/Newsletter";
import { assets } from "../assets/assets";

// ============= Contact.jsx =============
const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Title text1={"CONTACT"} text2={"US"} />
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          {/* IMAGE */}
          <div className="w-full md:w-1/2">
            <img
              className="w-full rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
              src={assets.contact_img}
              alt="Contact Us"
            />
          </div>

          {/* CONTENT */}
          <div className="flex flex-col gap-8 md:w-1/2">
            {/* STORE */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p className="font-bold text-2xl text-pink-500 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Our Store
              </p>
              <p className="text-gray-600 leading-relaxed">
                841239, PuneGam, Surat
                <br />
                Gujarat, India
              </p>
            </div>

            {/* CONTACT INFO */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p className="font-bold text-2xl text-pink-500 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact Information
              </p>
              <p className="text-gray-600">
                Tel: (+91) 9274703338 / +91 9274713338
                <br />
                E-mail: support@fabnoor.com
              </p>
            </div>

            {/* CAREER */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl shadow-lg p-6 border border-pink-100">
              <p className="font-bold text-2xl text-pink-500 mb-3">
                Careers at Fabnoor
              </p>
              <p className="text-gray-600 mb-4">
                Learn more about our teams and job openings.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg">
                Explore Jobs
              </button>
            </div>
          </div>
        </div>

        <Newsletter />
      </div>
    </div>
  );
};

export default Contact;
