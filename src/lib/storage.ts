import fs from "fs";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";

export interface StorageProvider {
  upload(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const ext = path.extname(originalName) || "";
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${hash}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    await promisify(fs.writeFile)(filepath, fileBuffer);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const filename = url.replace("/uploads/", "");
    const filepath = path.join(this.uploadDir, filename);

    if (fs.existsSync(filepath)) {
      await promisify(fs.unlink)(filepath);
    }
  }
}

// In a real production Vercel app, we'd export a VercelBlobStorageProvider based on process.env.NODE_ENV
// But for now, LocalStorage works for local development as requested.
export const storage = new LocalStorageProvider();
