import { Router } from "express";
import {addTask,deleteTask,updateTask ,getAllTasks} from "../controllers/task.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"


const router = Router()


router.route("/add").post(verifyJWT,addTask)
router.route("/delete/:id").delete(verifyJWT,deleteTask)
router.route("/update/:id").patch(verifyJWT,updateTask)
router.route("/getAllTasks").get(getAllTasks)




export default router