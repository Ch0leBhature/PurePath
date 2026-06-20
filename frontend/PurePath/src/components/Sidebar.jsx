import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import theme from "../utils/theme";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  console.log("Sidebar render user:", user);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
  className="hidden md:flex w-[260px] min-h-screen px-6 py-8 flex-col justify-between transition-transform duration-200"
  style={{
    background: theme.background,
    borderRight: `1px solid ${theme.card}`,
  }}
>
  <div>
    <h1
      className="text-4xl font-bold mb-12"
      style={{ color: theme.primary }}
    >
      PurePath
    </h1>

    <nav className="flex flex-col gap-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
          "px-4 py-4 rounded-xl cursor-pointer transition duration-150"
        }
        style={{ color: theme.text }}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) =>
          (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
          "px-4 py-4 rounded-xl cursor-pointer transition duration-150"
        }
        style={{ color: theme.text }}
      >
        Saved Routes
      </NavLink>
    </nav>
  </div>

  {user ? (
      <button
        type="button"
        onClick={handleLogout}
        className="
          w-full
          text-left
          px-4
          py-4
          rounded-xl
          font-medium
          transition-all
          duration-200
          hover:translate-y-[-1px]
        "
        style={{
          background: "#3a2b2b",
          color: "#e67e80",
          border: "1px solid #e67e80",
        }}
      >
        Logout
      </button>
    ) : (
      <div className="flex flex-col gap-4 w-full">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
            "px-4 py-4 rounded-xl transition"
          }
          style={{ color: theme.text }}
        >
          Login
        </NavLink>

        <NavLink
          to="/register"
          className={({ isActive }) =>
            (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
            "px-4 py-4 rounded-xl transition"
          }
          style={{ color: theme.text }}
        >
          Register
        </NavLink>
      </div>
    )}
</aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
              <aside className="absolute left-0 top-0 w-[260px] min-h-screen px-6 py-8 flex flex-col justify-between transform transition-transform duration-200" style={{ background: theme.background, borderRight: `1px solid ${theme.card}` }}>
            
            <div>
              <h1 className="text-4xl font-bold mb-12" style={{ color: theme.primary }}>
                PurePath
              </h1>

              <nav className="flex flex-col gap-4">
                
                <NavLink to="/" className={({ isActive }) => (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") + "px-4 py-4 rounded-xl cursor-pointer transition"} style={({ isActive }) => ({ color: theme.text })}>
                  Dashboard
                </NavLink>

                <NavLink to="/saved" className={({ isActive }) => (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") + "px-4 py-4 rounded-xl cursor-pointer transition"} style={({ isActive }) => ({ color: theme.text })}>
                  Saved Routes
                </NavLink>

                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-4 rounded-xl font-semibold transition duration-200 hover:translate-y-[-1px]"
                    style={{ background: theme.surface, color: theme.primary, border: `1px solid ${theme.primary}` }}
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className={({ isActive }) => (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") + "px-4 py-4 rounded-xl cursor-pointer transition"}
                      style={({ isActive }) => ({ color: theme.text })}
                    >
                      Login
                    </NavLink>

                    <NavLink
                      to="/register"
                      className={({ isActive }) => (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") + "px-4 py-4 rounded-xl cursor-pointer transition"}
                      style={({ isActive }) => ({ color: theme.text })}
                    >
                      Register
                    </NavLink>
                  </>
                )}

              </nav>
            </div>

            

          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
