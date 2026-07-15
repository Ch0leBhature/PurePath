import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import { configDotenv } from "dotenv"
configDotenv({
  path: new URL("../.env", import.meta.url).pathname,
})
const app=express()
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.get("/",(req,res)=>{
  res.json({message:"backend running"})
})

//router
import routeRouter from "./routes/route.Routes.js"
import savedRouteRouter from "./routes/savedRoute.Routes.js"
import userRouter from "./routes/user.routes.js"
import aqiRouter from "./routes/aqi.routes.js"
import analyticsRouter from "./routes/analytics.routes.js"
app.use("/api/route", routeRouter)
app.use("/api/saved", savedRouteRouter)
app.use("/api/users",userRouter)
app.use('/api/aqi', aqiRouter)
app.use('/api/analytics', analyticsRouter)
export {app}
