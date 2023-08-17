import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

export async function saveBase64Image(base64Image: string, imagePath: string) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const dataBuffer = Buffer.from(base64Data, 'base64');
  const fullPath = path.join(__dirname, '..', '..', imagePath);

  try {
    await writeFileAsync(fullPath, dataBuffer);
  } catch (err) {
    throw err;
  }
}
