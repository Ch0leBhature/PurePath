import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const { user, register, error, loading, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      setFormError("All fields are required.");
      return;
    }

    try {
      setError(null);
      await register({ username, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err?.response?.data?.message || error || "Unable to register.");
    }
  };

  return (
    <div className="min-h-screen bg-[#141b1e] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#2d3437] bg-[#1b2225] p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-gray-400 mb-6">Register now to save your routes and access protected features.</p>

        {(formError || error) && (
          <div className="mb-5 rounded-2xl bg-[#3a3f44] px-4 py-3 text-sm text-red-300">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-300">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2d3437] bg-[#232a2d] px-4 py-3 text-white outline-none"
              placeholder="Choose a username"
            />
          </label>

          <label className="block">
            <span className="text-gray-300">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2d3437] bg-[#232a2d] px-4 py-3 text-white outline-none"
              placeholder="Enter your email"
            />
          </label>

          <label className="block">
            <span className="text-gray-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2d3437] bg-[#232a2d] px-4 py-3 text-white outline-none"
              placeholder="Create a password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#8ccf7e] px-5 py-3 text-black font-semibold transition hover:bg-[#7bc56d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account? <Link to="/login" className="text-[#8ccf7e] hover:text-[#a2d99a]">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
