const RouteCards = ({ routes }) => {
  return (
    <div className="flex flex-col gap-4">

      {routes.map((route, index) => (
        <div
          key={index}
          className="bg-[#1b2225] border border-[#2d3437] rounded-2xl p-4 md:p-6"
        >

          <div
            className="w-[14px] h-[14px] rounded-full mb-4"
            style={{
              background: route.color,
            }}
          ></div>

          <h3 className="text-lg md:text-xl font-semibold mb-4">
            {route.name}
          </h3>

          <p className="text-gray-400 mb-2 text-sm md:text-base">
            AQI: {route.aqi}
          </p>

          <p className="text-gray-400 mb-2 text-sm md:text-base">
            ETA: {route.eta}
          </p>

          <span className="text-gray-300 text-sm md:text-base">
            Exposure: {route.exposure}
          </span>

        </div>
      ))}

    </div>
  )
}

export default RouteCards
