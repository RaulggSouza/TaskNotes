import 'reflect-metadata'
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

export type DtoClass<T extends object> = new () => T

export const validateDto = async <T extends object>(
  dtoClass: DtoClass<T>,
  payload: Record<string, unknown>,
) => {
  const instance = plainToInstance(dtoClass, payload)
  return validate(instance)
}

export const createConfiguredValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })

export const bodyMetadata = <T extends object>(
  dtoClass: DtoClass<T>,
): ArgumentMetadata => ({
  type: 'body',
  metatype: dtoClass,
  data: '',
})
