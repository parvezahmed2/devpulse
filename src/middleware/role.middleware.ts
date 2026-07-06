import type { NextFunction, Request, Response } from "express";

 
 
export const authorize = (...roles: string[]) => { return (req: Request,res: Response,next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                 success: false,

                message: "Unauthorized"

            });
            return;

        }
        const userRole = req.user.role;

        if (!roles.includes(userRole)) {

            res.status(403).json({

                success: false,

                message: "Forbidden. You do not have permission."
            });

            return;

        }

       
        next();

    };

};