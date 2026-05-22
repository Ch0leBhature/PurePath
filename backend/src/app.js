import express from "express"
import cors from "cors"
const app=express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json())

app.get("/",(req,res)=>{
  res.json({message:"backend running"})
})

//router
import routeRouter from "./routes/route.Routes.js"
import savedRouteRouter from "./routes/savedRoute.Routes.js"
app.use("/api/route", routeRouter)
app.use("/api/saved", savedRouteRouter)

export {app}
