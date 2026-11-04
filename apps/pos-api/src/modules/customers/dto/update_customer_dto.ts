import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create_customer_dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
