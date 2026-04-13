import { IsOptional, IsInt, Min, Max, IsString, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator, ValidationOptions } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'optionalDateString', async: false })
export class OptionalDateStringConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (!value || value === '') return true;
    return !isNaN(Date.parse(value));
  }
  defaultMessage() {
    return 'Must be a valid ISO 8601 date string';
  }
}

function IsOptionalDateString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: OptionalDateStringConstraint,
    });
  };
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsOptionalDateString()
  startDate?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsOptionalDateString()
  endDate?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
