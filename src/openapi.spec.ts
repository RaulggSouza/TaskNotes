import { SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import {
  apiReferencePath,
  openApiJsonPath,
  setupOpenApiDocumentation,
} from './openapi'

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger')

  return {
    ...actual,
    SwaggerModule: {
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
  }
})

jest.mock('@scalar/nestjs-api-reference', () => ({
  apiReference: jest.fn(),
}))

describe('setupOpenApiDocumentation', () => {
  const swaggerModule = SwaggerModule as jest.Mocked<typeof SwaggerModule>
  const apiReferenceMock = apiReference as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates an OpenAPI document and exposes the raw JSON document', () => {
    const app = { use: jest.fn() }
    const document = { openapi: '3.0.0', paths: {} }

    swaggerModule.createDocument.mockReturnValue(document as never)
    apiReferenceMock.mockReturnValue('scalar-middleware')

    setupOpenApiDocumentation(app as never)

    const swaggerConfig = swaggerModule.createDocument.mock.calls[0][1]
    expect(swaggerConfig.info).toMatchObject({
      title: 'TaskNotes API',
      version: '1.0.0',
    })
    expect(swaggerModule.setup).toHaveBeenCalledWith('openapi', app, document, {
      ui: false,
      raw: ['json'],
      jsonDocumentUrl: openApiJsonPath,
    })
  })

  it('mounts Scalar reference using the OpenAPI JSON URL', () => {
    const app = { use: jest.fn() }
    const document = { openapi: '3.0.0', paths: {} }

    swaggerModule.createDocument.mockReturnValue(document as never)
    apiReferenceMock.mockReturnValue('scalar-middleware')

    setupOpenApiDocumentation(app as never)

    expect(apiReferenceMock).toHaveBeenCalledWith({
      theme: 'default',
      url: `/${openApiJsonPath}`,
    })
    expect(app.use).toHaveBeenCalledWith(apiReferencePath, 'scalar-middleware')
  })
})
