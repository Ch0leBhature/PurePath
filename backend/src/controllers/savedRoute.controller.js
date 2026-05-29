import Route from "../models/route.model.js";

const saveRoute = async (req, res) => {
  try {
    const { source, destination, aqi, exposure, eta, distance } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ message: "source and destination are required" });
    }

    const route = await Route.create({
      user:req.user._id,
      source,
      destination,
      aqi,
      exposure,
      eta,
      distance,
    });

    return res.status(201).json(route);
  } catch (error) {
    console.error("saveRoute error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getRoutes = async (req, res) => {
  try {
    console.log("helo");
    const routes = await Route.find({
      user:req.user._id,
    }).sort({
      _id: -1 
    });
    return res.status(200).json(routes);
  } catch (error) {
    console.error("getRoutes error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Route id is required" });
    }

    const deleted = await Route.findByIdAndDelete({
      _id:id,
      user:req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Route not found" });
    }

    return res.status(200).json({ message: "Route deleted successfully", route: deleted });
  } catch (error) {
    console.error("deleteRoute error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { saveRoute, getRoutes, deleteRoute };
