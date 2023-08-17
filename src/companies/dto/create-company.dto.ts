import { CompanyDto } from './company.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCompanyDto extends PartialType(CompanyDto) {}
