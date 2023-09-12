import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.v2.config({
      cloud_name: 'dwkvw91pm',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(image: string, userId: string): Promise<string> {
    try {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: 'sparx',
        public_id: `user_${userId}`,
      });

      return result.secure_url;
    } catch (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }
}
