import { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [shopName, setShopName] = useState(""); // ✅ new state
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // ✅ new state for forgot password
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({}); // ✅ validation errors state

  const [showPassword, setShowPassword] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors = {};

    if (currentState === "Sign Up") {
      if (!name.trim()) newErrors.name = "Name is required.";
      if (!mobile.trim() || !/^\+?[0-9]{10,15}$/.test(mobile.replace(/\s+/g, ""))) {
        newErrors.mobile = "Enter a valid mobile number.";
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Enter a valid email address.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const onSubmitHander = async (e) => {
    e.preventDefault();

    // Prevent submission if validation fails (Sign Up only)
    if (currentState === "Sign Up" && !validateForm()) {
      return;
    }

    try {
      if (!backendUrl) {
        toast.error("Backend URL not configured");
        return;
      }

      setLoading(true);
      if (currentState === "Sign Up") {
        const res = await axios.post(`${backendUrl}/api/signup-request/create`, {
          name,
          email,
          mobile,
        });

        if (res.data.success) {
          toast.success(res.data.message || "Request submitted!");
          setCurrentState("Request Sent");
        } else {
          toast.error(res.data.message);
        }
      } else if (currentState === "Forgot Password") {
        const res = await axios.post(`${backendUrl}/api/user/request-reset-otp`, {
          email,
        });

        if (res.data.success) {
          toast.success(res.data.message);
          setCurrentState("Reset Password");
        } else {
          toast.error(res.data.message);
        }
      } else if (currentState === "Reset Password") {
        const res = await axios.post(`${backendUrl}/api/user/reset-password`, {
          email,
          otp,
          newPassword: password,
        });

        if (res.data.success) {
          toast.success(res.data.message);
          setCurrentState("Login");
          setPassword("");
          setOtp("");
        } else {
          toast.error(res.data.message);
        }
      } else {
        const res = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (res.data.success) {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);

          toast.success("Login successful", {
            autoClose: 800,
          });
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REDIRECT ================= */
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <form
      onSubmit={onSubmitHander}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* ✅ Name Field */}
      {currentState === "Sign Up" && (
        <div className="w-full relative">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-800'}`}
            placeholder="Name"
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1 absolute">{errors.name}</p>}
        </div>
      )}

      {/* ✅ Mobile Field */}
      {currentState === "Sign Up" && (
        <div className="w-full relative mt-2">
          <input
            type="tel"
            value={mobile}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9+]/g, "");
              setMobile(val);
              setErrors((prev) => ({ ...prev, mobile: "" }));
            }}
            className={`w-full px-3 py-2 border rounded-md ${errors.mobile ? 'border-red-500' : 'border-gray-800'}`}
            placeholder="Mobile Number"
            required
          />
          {errors.mobile && <p className="text-red-500 text-xs mt-1 absolute">{errors.mobile}</p>}
        </div>
      )}

      {/* Request Sent confirmation */}
      {currentState === "Request Sent" && (
        <div className="w-full text-center py-6">
          <p className="text-green-600 font-medium text-base mb-2">Your signup request has been submitted!</p>
          <p className="text-gray-500 text-sm">The admin will review your request and create your account. You will be able to log in once your account is approved.</p>
        </div>
      )}

      {/* Email */}
      {(currentState === "Login" || currentState === "Sign Up" || currentState === "Forgot Password") && (
        <div className="w-full relative mt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-800'}`}
            placeholder="E-mail"
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 absolute">{errors.email}</p>}
        </div>
      )}

      {/* Email Read-only for Reset Password */}
      {currentState === "Reset Password" && (
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-md"
          placeholder="E-mail"
        />
      )}

      {/* OTP Field */}
      {currentState === "Reset Password" && (
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800 rounded-md tracking-widest text-center text-lg"
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          required
        />
      )}

      {/* ✅ Password with Show/Hide */}
      {(currentState === "Login" || currentState === "Reset Password") && (
        <div className="w-full relative mt-2">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={`w-full px-3 py-2 border rounded-md pr-16 ${errors.password ? 'border-red-500' : 'border-gray-800'}`}
              placeholder={currentState === "Reset Password" ? "New Password" : "Password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 absolute">{errors.password}</p>}
        </div>
      )}

      <div className="w-full flex justify-between text-sm mt-3">
        {/* HIDDEN: Forgot Password – re-enable when needed */}
        {false && currentState === "Login" && (
          <p
            onClick={() => setCurrentState("Forgot Password")}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Forgot your Password?
          </p>
        )}
        {false && (currentState === "Forgot Password" || currentState === "Reset Password") && (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Back to Login
          </p>
        )}

        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Create account
          </p>
        ) : currentState === "Sign Up" || currentState === "Request Sent" ? (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Login Here
          </p>
        ) : null}
      </div>

      {currentState !== "Request Sent" && (
        <button
          disabled={loading}
          className="bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? "Please wait..." : (
            currentState === "Login" ? "Sign In" :
              currentState === "Sign Up" ? "Submit Request" :
                currentState === "Forgot Password" ? "Send OTP" : "Reset Password"
          )}
        </button>
      )}
    </form>
  );
};

export default Login;
