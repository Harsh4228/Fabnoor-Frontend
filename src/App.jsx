// App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SearchBar from "./components/SearchBar";
import WhatsAppChat from "./components/WhatsAppChat";
import { ToastContainer } from "react-toastify";

// Pages
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Order from "./pages/Order";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import CartDrawer from "./components/CartDrawer";


// 🔥 NEW STATIC PAGES
import Delivery from "./pages/Delivery";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import Returns from "./pages/Returns";
import Terms from "./pages/Terms";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <ToastContainer />

      <Navbar />
      <CartDrawer />  

      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <SearchBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/order" element={<Order />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* 🔥 STATIC */}
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>

        <WhatsAppChat />
      </div>

      <Footer />
    </>
  );
};

export default App;
