import type {NextFunction,Request,Response,} from "express";
import { StatusCodes } from "http-status-codes";
  
  export const globalErrorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
  
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  
    /*
    ------------------------------------------
    Custom Error Message অনুযায়ী Status Code
    ------------------------------------------
    */
  
    switch (error.message) {
  
      case "Issue not found":
        statusCode = StatusCodes.NOT_FOUND;
        break;
  
      case "Reporter not found":
        statusCode = StatusCodes.NOT_FOUND;
        break;
  
      case "User not found":
        statusCode = StatusCodes.NOT_FOUND;
        break;
  
      case "Forbidden":
        statusCode = StatusCodes.FORBIDDEN;
        break;
  
      case "Only open issues can be updated":
        statusCode = StatusCodes.CONFLICT;
        break;
  
      case "Email already exists":
        statusCode = StatusCodes.CONFLICT;
        break;
  
      case "Invalid password":
        statusCode = StatusCodes.UNAUTHORIZED;
        break;
  
      case "Invalid credentials":
        statusCode = StatusCodes.UNAUTHORIZED;
        break;
  
      case "Invalid token":
        statusCode = StatusCodes.UNAUTHORIZED;
        break;
  
      case "Token expired":
        statusCode = StatusCodes.UNAUTHORIZED;
        break;
  
      default:
        statusCode = StatusCodes.BAD_REQUEST;
    }
  
    res.status(statusCode).json({
  
      success: false,
  
      message: error.message,
  
      errors: error
  
    });
  
  };