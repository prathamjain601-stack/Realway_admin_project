import { Request, Response } from 'express';
import { SystemMetric } from '../models';

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await SystemMetric.findAll({
      order: [['timestamp', 'DESC']],
      limit: 100
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
