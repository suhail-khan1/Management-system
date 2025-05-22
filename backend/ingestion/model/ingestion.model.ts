import mongoose, { Document, Schema } from 'mongoose';

export interface IIngestion extends Document {
  sourceType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt?: Date;
  logs?: string[];
}

const IngestionSchema = new Schema<IIngestion>({
  sourceType: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending',
  },
  createdAt: { type: Date },
  logs: { type: [String], default: [] },
});

export const Ingestion = mongoose.model<IIngestion>('Ingestion', IngestionSchema);
