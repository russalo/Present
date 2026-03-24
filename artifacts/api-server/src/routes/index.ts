import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import worldRouter from "./world.js";
import entitiesRouter from "./entities.js";
import sessionRouter from "./session.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(worldRouter);
router.use(entitiesRouter);
router.use(sessionRouter);

export default router;
