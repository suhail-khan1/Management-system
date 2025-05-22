// Document schema
import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  description?: string;
  filePath: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema<IDocument>({
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
