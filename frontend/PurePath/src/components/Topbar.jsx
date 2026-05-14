const Topbar = ({ onMenuClick }) => {
  return (
    <div className="mb-6 md:mb-8">
      {/* Mobile Menu Button */}
      <div className="flex justify-between items-center mb-4 md:hidden">
        <button onClick={onMenuClick} className="text-white text-2xl">
          ☰
        </button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-8">

        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Pollution Aware Routing
          </h1>

          <p className="text-gray-400 mt-2 md:mt-3 text-base md:text-lg">
            Find cleaner and safer travel routes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

          <input
            type="text"
            placeholder="Source"
            className="bg-[#232a2d] border border-[#2d3437] text-white px-4 py-3 rounded-xl outline-none w-full sm:w-[220px] lg:w-[220px]"
          />

          <input
            type="text"
            placeholder="Destination"
            className="bg-[#232a2d] border border-[#2d3437] text-white px-4 py-3 rounded-xl outline-none w-full sm:w-[220px] lg:w-[220px]"
          />

          <button className="bg-[#8ccf7e] hover:bg-[#7bc56d] text-black font-semibold px-6 py-3 rounded-xl transition w-full sm:w-auto">
            Analyze Route
          </button>

        </div>

      </div>
    </div>
  )
}

export default Topbar
