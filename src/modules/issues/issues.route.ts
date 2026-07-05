import { Router} from "express";
import { issuesController } from "./issue.controller";

const router = Router()
router.post("/", issuesController.createIssue)
 

export const issuesRouter = router 