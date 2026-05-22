import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] min-h-screen bg-[#1b2225] border-r border-[#2d3437] px-6 py-8 flex-col justify-between">
        
        <div>
          <h1 className="text-4xl font-bold text-[#8ccf7e] mb-12">
            PurePath
          </h1>

          <nav className="flex flex-col gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
                "px-4 py-4 rounded-xl cursor-pointer transition"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/saved"
              className={({ isActive }) =>
                (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
                "px-4 py-4 rounded-xl cursor-pointer transition"
              }
            >
              Saved Routes
            </NavLink>

            <div className="hover:bg-[#232a2d] px-4 py-4 rounded-xl cursor-pointer transition">
              Analytics
            </div>

            <div className="hover:bg-[#232a2d] px-4 py-4 rounded-xl cursor-pointer transition">
              AI Insights
            </div>

            <div className="hover:bg-[#232a2d] px-4 py-4 rounded-xl cursor-pointer transition">
              Settings
            </div>

          </nav>
        </div>

        <div className="bg-[#232a2d] rounded-2xl p-6 border border-[#2d3437]">
          <p className="text-gray-400">
            Current AQI
          </p>

          <h2 className="text-5xl font-bold text-[#8ccf7e] my-4">
            62
          </h2>

          <span className="text-gray-300">
            Healthy
          </span>
        </div>

      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
          <aside className="absolute left-0 top-0 w-[260px] min-h-screen bg-[#1b2225] border-r border-[#2d3437] px-6 py-8 flex flex-col justify-between">
            
            <div>
              <h1 className="text-4xl font-bold text-[#8ccf7e] mb-12">
                PurePath
              </h1>

              <nav className="flex flex-col gap-4">
                
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
                    "px-4 py-4 rounded-xl cursor-pointer transition"
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/saved"
                  className={({ isActive }) =>
                    (isActive ? "bg-[#232a2d] " : "hover:bg-[#232a2d] ") +
                    "px-4 py-4 rounded-xl cursor-pointer transition"
                  }
                >
                  Saved Routes
                </NavLink>

                <div className="hover:bg-[#232a2d] px-4 py-4 rounded-xl cursor-pointer transition">
                  Analytics
                </div>

                <div className="hover:bg-[#232a2d] px-4 py-4 rounded-xl cursor-pointer transition">
                  AI Insights
                </div>

                <div className="hover:bg-[#232a2d] px-4 py-4 rounded-xl cursor-pointer transition">
                  Settings
                </div>

              </nav>
            </div>

            <div className="bg-[#232a2d] rounded-2xl p-6 border border-[#2d3437]">
              <p className="text-gray-400">
                Current AQI
              </p>

              <h2 className="text-5xl font-bold text-[#8ccf7e] my-4">
                62
              </h2>

              <span className="text-gray-300">
                Healthy
              </span>
            </div>

          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
