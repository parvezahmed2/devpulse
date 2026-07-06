import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { issueService } from "./issues.service";
import type { IJwtPayload, RUser } from "./issues.interface";
 
 

 const createIssue = async (req: Request,res: Response) => {
    try {
      const result = await  issueService.createIssue(req.body, req.user  as IJwtPayload);
  
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Issue created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  };
  

const getAllIssues = async (req: Request,res: Response) => {
    try {
      const result = await issueService.getAllIssues(req.body);
  
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Issues retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        errors: error,
      });
    }
  };



 
  const getSingleIssue = async (req: Request,res: Response) => {

    try {
        const issueId = Number(req.params.id);
 
        const result = await issueService.getSingleIssue(issueId);
 

        res.status(StatusCodes.OK).json({

            success: true,
            message: "Issue retrieved successfully",
            data: result

        });

    } catch (error: any) {
        
        if (error.message === "Issue not found") {
            return res.status(StatusCodes.NOT_FOUND).json({
             success: false,
             message: error.message

            });

        }

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({

            success: false,

            message: error.message

        });

    }

};
 

 



export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue
  
}