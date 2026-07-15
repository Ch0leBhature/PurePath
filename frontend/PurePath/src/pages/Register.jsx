import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import theme from "../utils/theme";

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
      setFormError(
        err?.response?.data?.message || error || "Unable to register.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div
        className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border shadow-2xl lg:grid-cols-[0.95fr_1.05fr] animate-in fade-in zoom-in-95 duration-300"
        style={{
          borderColor: theme.card,
          background: "rgba(16, 22, 26, 0.84)",
        }}
      >
        <section className="p-6 sm:p-8 md:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p
                className="text-sm uppercase tracking-[0.2em]"
                style={{ color: theme.primary }}
              >
                Create account
              </p>
              <h2
                className="mt-3 text-3xl font-bold"
                style={{ color: theme.text }}
              >
                Start building your cleaner route library
              </h2>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: theme.muted }}
              >
                Register to save ranked routes and revisit the best commuting
                options any time.
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
                  Username
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 w-full rounded-3xl px-4 py-3.5 outline-none transition duration-200 focus:scale-[1.01]"
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.card}`,
                    color: theme.text,
                  }}
                  placeholder="Choose a username"
                />
              </label>

              <label className="block">
                <span className="text-sm" style={{ color: theme.text }}>
                  Email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-3xl px-4 py-3.5 outline-none transition duration-200 focus:scale-[1.01]"
                  style={{
                    background: theme.surface,
                    border: `1px solid ${theme.card}`,
                    color: theme.text,
                  }}
                  placeholder="Enter your email"
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
                  placeholder="Create a password"
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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p
              className="mt-6 text-center text-sm"
              style={{ color: theme.muted }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium transition hover:opacity-80"
                style={{ color: theme.primary }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section
          className="hidden flex-col justify-between p-10 lg:flex"
          style={{
            background:
              "linear-gradient(145deg, rgba(127,187,179,0.16), rgba(16,22,26,0.92))",
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
              Preset-based routing
            </span>
            <h1
              className="mt-6 text-5xl font-bold leading-tight"
              style={{ color: theme.text }}
            >
              Build a personalized route experience.
            </h1>
            <p
              className="mt-5 max-w-md text-base leading-7"
              style={{ color: theme.muted }}
            >
              Save your best routes, revisit previous route analysis, and keep
              your preferred travel trade-offs in one place.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              "Compare ranked route options instantly",
              "Save cleaner or faster routes you trust",
              "Return to previous journeys from any device",
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
      </div>
    </div>
  );
};

export default Register;
