import * as fs from 'fs';
import * as path from 'path';

export function saveBase64Image(base64Image: string, imagePath: string) {
  // Remove header from base64 image
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  // Convert to binary
  const dataBuffer = Buffer.from(base64Data, 'base64');

  // Create full path
  const fullPath = path.join(__dirname, '..', '..', imagePath);

  // Make sure the directory exists
  // fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  // Write to file
  fs.writeFile(fullPath, dataBuffer, function (err) {
    if (err) {
      throw err;
    }
  });
}
