import { Router} from "express";
import { issuesController } from "./issue.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router()
router.post("/",authenticate, issuesController.createIssue)
router.get("/",authenticate, issuesController.getAllIssues)
router.get("/:id",authenticate, issuesController.getSingleIssue)
router.patch("/:id",authenticate, issuesController.updateIssueController)
router.delete("/:id",authenticate, issuesController.deleteIssueController)

export const issuesRouter = router 