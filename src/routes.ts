import express, { Router, Request, Response } from 'express';
import httpStatusCode from 'http-status-codes';

const router: Router = express.Router();

export const healthRoutes = (): Router => {
  router.get('/notification-health', (_req: Request, res: Response) => {
    res.status(httpStatusCode.OK).send('Notification service is available');
  });
  return router;
};
