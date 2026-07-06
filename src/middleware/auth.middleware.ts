import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
 

 
 

export const authenticate = (req: Request,res: Response,next: NextFunction): void => {

    try { 
        const authHeader = req.headers.authorization;
        
 
        if (!authHeader) {
             res.status(401).json({
                success: false,
                message: "Authorization token is required"

            });

            return;

        }
        
        const token = authHeader.split(" ")[0];
        
        if (!token) {

            res.status(401).json({

                success: false,

                message: "Invalid Token"

            });

            return;

        }

         

        const decoded = verifyToken(token);

         

        req.user = decoded;

        next();

    }

    catch (error) {

        res.status(401).json({

            success: false,

            message: "Token is invalid or expired"

        });

    }

};