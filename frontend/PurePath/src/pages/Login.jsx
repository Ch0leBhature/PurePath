import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const { user, login, error, loading, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    if (!usernameOrEmail?.trim() || !password?.trim()) {
      setFormError("Username/email and password are required.");
      return;
    }

    try {
      setError(null);
      await login({
        username: usernameOrEmail,
        email: usernameOrEmail,
        password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err?.response?.data?.message || error || "Unable to login.");
    }
  };

  return (
    <div className="min-h-screen bg-[#141b1e] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#2d3437] bg-[#1b2225] p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400 mb-6">Sign in to access saved routes and protected features.</p>

        {(formError || error) && (
          <div className="mb-5 rounded-2xl bg-[#3a3f44] px-4 py-3 text-sm text-red-300">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-300">Username or email</span>
            <input
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2d3437] bg-[#232a2d] px-4 py-3 text-white outline-none"
              placeholder="Enter username or email"
            />
          </label>

          <label className="block">
            <span className="text-gray-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2d3437] bg-[#232a2d] px-4 py-3 text-white outline-none"
              placeholder="Enter password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#8ccf7e] px-5 py-3 text-black font-semibold transition hover:bg-[#7bc56d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          New to PurePath? <Link to="/register" className="text-[#8ccf7e] hover:text-[#a2d99a]">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
