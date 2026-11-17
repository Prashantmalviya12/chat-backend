import { NextFunction,Request,Response } from "express";

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

export const asyncHandler = (requestHandler: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};