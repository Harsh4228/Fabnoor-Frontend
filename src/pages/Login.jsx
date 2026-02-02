import { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState(""); // ✅ new state
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false); // ✅ show/hide password

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  /* ================= SUBMIT ================= */
  const onSubmitHander = async (e) => {
    e.preventDefault();

    try {
      if (!backendUrl) {
        toast.error("Backend URL not configured");
        return;
      }

      if (currentState === "Sign Up") {
        const res = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
          mobile, // ✅ send mobile also
        });

        if (res.data.success) {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          toast.success("Account created successfully");
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
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800 rounded-md"
          placeholder="Name"
          required
        />
      )}

      {/* ✅ Mobile Field */}
      {currentState === "Sign Up" && (
        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800 rounded-md"
          placeholder="Mobile Number"
          required
        />
      )}

      {/* Email */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800 rounded-md"
        placeholder="E-mail"
        required
      />

      {/* ✅ Password with Show/Hide */}
      <div className="w-full relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-800 rounded-md pr-16"
          placeholder="Password"
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

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer text-gray-600 hover:underline">
          Forgot your Password?
        </p>

        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Login Here
          </p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
