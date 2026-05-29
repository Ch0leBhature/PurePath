import { registerUser,loginUser } from "../controllers/user.controller.js";
import router from "./route.Routes.js";

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);
export default router
