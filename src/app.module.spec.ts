import 'reflect-metadata'
import { ConfigService } from '@nestjs/config'
import { MODULE_METADATA } from '@nestjs/common/constants'
import { AppModule } from './app.module'

type DynamicModuleMetadata = {
  imports?: DynamicModuleMetadata[]
  module?: { name?: string }
  providers?: Array<{
    provide: string
    useFactory?: (config: ConfigService) => unknown
  }>
}

const findTypeOrmOptionsFactory = () => {
  const imports = Reflect.getMetadata(
    MODULE_METADATA.IMPORTS,
    AppModule,
  ) as DynamicModuleMetadata[]
  const typeOrmModule = imports.find((metadata) => metadata.module?.name === 'TypeOrmModule')
  const typeOrmCoreModule = typeOrmModule?.imports?.[0]

  return typeOrmCoreModule?.providers?.find(
    (provider) => provider.provide === 'TypeOrmModuleOptions',
  )?.useFactory
}

describe('AppModule', () => {
  it('builds TypeORM options from configuration without connecting to the database', () => {
    const typeOrmOptionsFactory = findTypeOrmOptionsFactory()
    const config = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          DATABASE_HOST: 'localhost',
          DATABASE_PORT: '5432',
          DATABASE_USER: 'task_user',
          DATABASE_PASSWORD: 'task_password',
          DATABASE_NAME: 'task_notes',
        }

        return values[key]
      }),
    } as unknown as ConfigService

    expect(typeOrmOptionsFactory?.(config)).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'task_user',
      password: 'task_password',
      database: 'task_notes',
      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000,
    })
  })
})
