import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import theme from "../utils/theme";

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
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div
        className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border shadow-2xl lg:grid-cols-[1.1fr_0.9fr] animate-in fade-in zoom-in-95 duration-300"
        style={{
          borderColor: theme.card,
          background: "rgba(16, 22, 26, 0.84)",
        }}
      >
        <section
          className="hidden flex-col justify-between p-10 lg:flex"
          style={{
            background:
              "linear-gradient(145deg, rgba(127,187,179,0.18), rgba(16,22,26,0.92))",
          }}
        >
          <div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: theme.primary,
              }}
            >
              PurePath account
            </span>
            <h1
              className="mt-6 text-5xl font-bold leading-tight"
              style={{ color: theme.text }}
            >
              Welcome back to smarter route planning.
            </h1>
            <p
              className="mt-5 max-w-md text-base leading-7"
              style={{ color: theme.muted }}
            >
              Sign in to save your preferred routes, revisit recommendations,
              and continue using preset-based route ranking.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              "Save favorite routes for later",
              "Review ranked route recommendations",
              "Keep cleaner commuting options handy",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl px-4 py-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${theme.card}`,
                }}
              >
                <span style={{ color: theme.text }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8 md:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p
                className="text-sm uppercase tracking-[0.2em]"
                style={{ color: theme.primary }}
              >
                Sign in
              </p>
              <h2
                className="mt-3 text-3xl font-bold"
                style={{ color: theme.text }}
              >
                Access your saved routes
              </h2>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: theme.muted }}
              >
                Enter your username or email and password to continue.
              </p>
            </div>

            {(formError || error) && (
              <div
                className="mb-5 rounded-3xl px-4 py-3 text-sm animate-in fade-in duration-200"
                style={{
                  background: "rgba(230,126,128,0.12)",
                  border: `1px solid ${theme.danger}`,
                  color: "#fecaca",
                }}
              >
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm" style={{ color: theme.text }}>
                  Username or email
                </span>
                <input
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="mt-2 w-full rounded-3xl px-4 py-3.5 outline-none transition duration-200 focus:scale-[1.01]"
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.card}`,
                    color: theme.text,
                  }}
                  placeholder="Enter username or email"
                />
              </label>

              <label className="block">
                <span className="text-sm" style={{ color: theme.text }}>
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-3xl px-4 py-3.5 outline-none transition duration-200 focus:scale-[1.01]"
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.card}`,
                    color: theme.text,
                  }}
                  placeholder="Enter password"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-3xl px-5 py-3.5 font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: theme.primary,
                  color: "#081012",
                  boxShadow: "0 12px 24px rgba(127,187,179,0.18)",
                }}
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                ) : null}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p
              className="mt-6 text-center text-sm"
              style={{ color: theme.muted }}
            >
              New to PurePath?{" "}
              <Link
                to="/register"
                className="font-medium transition hover:opacity-80"
                style={{ color: theme.primary }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
