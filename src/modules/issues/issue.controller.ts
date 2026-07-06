import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { issueService } from "./issues.service";
import type { IJwtPayload, RUser } from "./issues.interface";
import { sendResponse } from "../../utils/sendResponse";
 
 

 const createIssue = async (req: Request,res: Response,next: NextFunction) => {
    try {
      const result = await  issueService.createIssue(req.body, req.user  as IJwtPayload);
  
      sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Issue created successfully",
        data : result
      })

    } catch (error) {
      next(error)
    }
  };
  

const getAllIssues = async (req: Request,res: Response, next: NextFunction) => {
    try {
      const result = await issueService.getAllIssues(req.body);

      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success:true,
        message: "Issues retrieved successfully",
        data : result
      })
  
    } catch (error) {
      next(error);
    }
  };

const getSingleIssue = async (req: Request,res: Response, next: NextFunction) => {

    try {
        const issueId = Number(req.params.id);
 
        const result = await issueService.getSingleIssue(issueId);
      

        sendResponse(res, {
          statusCode: StatusCodes.OK,
          success:true,
          message: "Issues retrieved successfully",
          data : result
        })

    } catch (error) {
       next(error)

    }
};
 

 
const updateIssueController = async (req: Request,res: Response,next: NextFunction): Promise<void> => {


  try {
      const issueId = Number(req.params.id);
 
 
      if (isNaN(issueId)) {
         res.status(400).json({
              success: false,
              message: "Invalid Issue ID"});
          return;
      }
 
 
      const updateData = {
          title: req.body.title,
          description: req.body.description,
          type: req.body.type
 
      };
 
      const user = req.user as {id: number;role: string; };
      const updatedIssue = await issueService.updateIssue( issueId, updateData, user );
    

      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success:true,
        message: "Issue updated successfully",
        data : updatedIssue
      })
      
  }
  catch (error) {
      next(error);

  }};
 
 
 
 
const deleteIssueController = async ( req: Request,res: Response,next: NextFunction): Promise<void> => {
  try {
      const issueId = Number(req.params.id);
      if (isNaN(issueId)) {
             sendResponse(res, {
              statusCode: StatusCodes.BAD_REQUEST ,
              success:true,
              message: "Invalid Issue ID"
            })
              return;
             }
     
      const user = req.user as  RUser
      await issueService.deleteIssue(  issueId, user );
      
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success:true,
        message:"Issue deleted successfully"
      }) 
  }
  catch (error) {
      next(error);
  }
};




 


export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssueController,
  deleteIssueController
  
}