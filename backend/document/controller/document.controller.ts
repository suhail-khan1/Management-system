// Document CRUD logic
import { Request, Response } from 'express';
import { DocumentModel } from '../model/document.model';
import path from 'path';
import fs from 'fs';

export class DocumentController {
  static async getAllDocuments(req: Request, res: Response) {
    try {
      const documents = await DocumentModel.find().populate('uploadedBy', 'name email role');
      res.json(documents);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDocumentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await DocumentModel.findById(id).populate('uploadedBy', 'name email role');
      if (!document) return res.status(404).json({ error: 'Document not found' });
      res.json(document);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createDocument(req: any, res: Response) {
    try {
      const { title, description } = req.body;
      if (!req.file) {
        return res.status(400).json({ error: 'Document file is required' });
      }
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const uploadedBy = req.user?.id; // from auth middleware

      const newDocument = new DocumentModel({
        title,
        description,
        filePath: req.file.path,
        uploadedBy,
      });

      await newDocument.save();
      res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateDocument(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const document = await DocumentModel.findById(id);
      if (!document) return res.status(404).json({ error: 'Document not found' });

      if (title) document.title = title;
      if (description) document.description = description;

      // Replace file if new file uploaded
      if (req.file) {
        // Delete old file
        if (document.filePath && fs.existsSync(document.filePath)) {
          fs.unlinkSync(document.filePath);
        }
        document.filePath = req.file.path;
      }

      await document.save();
      res.json({ message: 'Document updated successfully', document });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await DocumentModel.findByIdAndDelete(id);
      if (!document) return res.status(404).json({ error: 'Document not found' });

      // Delete file
      if (document.filePath && fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      res.json({ message: 'Document deleted successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}