import fs from 'fs';
import path from 'path';

/**
 * StorageService: Handles file uploads for courses and lessons.
 * In a production environment, this should be replaced with an S3 client.
 */
export class StorageService {
  private static uploadDir = path.join(process.cwd(), 'public', 'uploads');

  /**
   * Saves a file to the local filesystem (proxy for Cloud Bucket).
   * @param file The file object from the request.
   * @param subPath The sub-path within the uploads directory.
   */
  static async saveFile(file: File, subPath: string = 'docs'): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const targetDir = path.join(this.uploadDir, subPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return the relative URL
    return `/uploads/${subPath}/${fileName}`;
  }

  /**
   * Deletes a file from the filesystem.
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const fullPath = path.join(this.uploadDir, relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  /**
   * Cleans all files associated with a course.
   */
  static async cleanCourseDirectory(courseId: string): Promise<void> {
     const courseDir = path.join(this.uploadDir, 'courses', courseId);
     if (fs.existsSync(courseDir)) {
       fs.rmSync(courseDir, { recursive: true, force: true });
     }
  }
}
