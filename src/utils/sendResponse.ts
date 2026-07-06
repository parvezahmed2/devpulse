import type { Response } from "express";

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  responseData: TResponse<T>
): void => {

  res.status(responseData.statusCode).json({

    success: responseData.success,

    message: responseData.message,

    data: responseData.data,

  });

};