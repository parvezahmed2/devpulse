import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { issueService } from "./issues.service";
import type { IJwtPayload } from "./issues.interface";
 
 

export const createIssue = async (req: Request,res: Response) => {
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
  


export const issuesController = {
  createIssue
}