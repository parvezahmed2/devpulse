import { Router} from "express";
import { issuesController } from "./issue.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router()
router.post("/",authenticate,authorize("contributor","maintainer"), issuesController.createIssue)
router.get("/",authenticate, issuesController.getAllIssues)
router.get("/:id",authenticate, issuesController.getSingleIssue)
router.patch("/:id",authenticate,authorize("contributor","maintainer"), issuesController.updateIssueController)
router.delete("/:id",authenticate, authorize("maintainer"), issuesController.deleteIssueController)

export const issuesRouter = router 