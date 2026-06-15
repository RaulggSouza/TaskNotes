import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

export const openApiJsonPath = 'openapi.json'
export const apiReferencePath = '/reference'

export const setupOpenApiDocumentation = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('TaskNotes API')
    .setDescription('API para gerenciar tarefas simples com PostgreSQL e Redis.')
    .setVersion('1.0.0')
    .addTag('app', 'Informações gerais da API')
    .addTag('tasks', 'Gerenciamento de tarefas')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('openapi', app, document, {
    ui: false,
    raw: ['json'],
    jsonDocumentUrl: openApiJsonPath,
  })

  app.use(
    apiReferencePath,
    apiReference({
      theme: 'default',
      url: `/${openApiJsonPath}`,
    }),
  )
}
