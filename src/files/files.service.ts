import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { saveBase64Image } from 'src/utils';

@Injectable()
export class FilesService {
  async saveImage(base64Image: string): Promise<string> {
    const imageId = uuid();
    const folderPath = `/static/`;
    const imagePath = path.join(folderPath, imageId);

    await saveBase64Image(base64Image, imagePath);

    return imagePath;
  }
}
