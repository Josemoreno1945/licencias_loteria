import { Router } from "express";

import {} from "../controllers/comercializadores.controllers";

//import { verifyToken } from "../middlewares/auth.js";
//import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/comercializadores");

router.get("/comercializadores/:id");

router.post("/comercializadores");

router.delete("/comercializadores/:id");

router.put("/comercializadores/:id");

export default router;
