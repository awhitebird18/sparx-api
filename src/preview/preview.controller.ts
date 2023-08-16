import { Controller, Get } from '@nestjs/common';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Public } from 'src/common/decorators/isPublic.decorator';

@Controller('preview')
export class PreviewController {
  @Public()
  @Get()
  renderPreview() {
    // Sample data
    const data = {
      url: 'http://localhost:5173/auth/login',
    };

    // Resolve the path to the template
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'verification.hbs',
    );
    const source = readFileSync(templatePath, 'utf8');

    const template = handlebars.compile(source);
    const result = template(data);
    return result;
  }
}
