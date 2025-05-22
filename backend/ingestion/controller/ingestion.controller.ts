// Ingestion control logic
import { Request, Response } from 'express';
import { Ingestion } from '../model/ingestion.model';

export const getAllIngestions = async (req: Request, res: Response) => {
  try {
    const ingestions = await Ingestion.find().sort({ createdAt: -1 });
    res.json(ingestions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingestion jobs' });
  }
};

export const getIngestionById = async (req: Request, res: Response) => {
  try {
    const ingestion = await Ingestion.findById(req.params.id);
    if (!ingestion) return res.status(404).json({ error: 'Ingestion job not found' });
    res.json(ingestion);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ingestion job' });
  }
};

export const createIngestion = async (req: Request, res: Response) => {
  try {
    const { sourceType } = req.body;
    if (!sourceType) return res.status(400).json({ error: 'Source is required' });

    const ingestion = new Ingestion({ sourceType, status: 'pending' });
    await ingestion.save();

    res.status(201).json({ message: 'Ingestion job created', ingestion });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ingestion job' });
  }
};

export const updateIngestion = async (req: Request, res: Response) => {
  try {
    const { status, logs, createdAt } = req.body;
    const ingestion = await Ingestion.findById(req.params.id);
    if (!ingestion) return res.status(404).json({ error: 'Ingestion job not found' });

    if (status && ['pending', 'running', 'completed', 'failed'].includes(status)) {
      ingestion.status = status;
    }
    if (createdAt) ingestion.createdAt = new Date(createdAt);
    if (logs && Array.isArray(logs)) ingestion.logs.push(...logs);

    await ingestion.save();
    res.json({ message: 'Ingestion job updated', ingestion });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ingestion job' });
  }
};

export const deleteIngestion = async (req: Request, res: Response) => {
  try {
    const ingestion = await Ingestion.findByIdAndDelete(req.params.id);
    if (!ingestion) return res.status(404).json({ error: 'Ingestion job not found' });
    res.json({ message: 'Ingestion job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ingestion job' });
  }
};
