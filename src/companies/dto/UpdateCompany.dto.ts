import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './CreateCompany.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
