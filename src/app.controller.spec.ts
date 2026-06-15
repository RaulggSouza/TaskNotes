import { AppController } from './app.controller'

describe('AppController', () => {
  let controller: AppController

  beforeEach(() => {
    controller = new AppController()
  })

  it('returns the API welcome message', () => {
    expect(controller.getHello()).toEqual({ message: 'Task Manager NestJS API' })
  })

  it('returns the API health status', () => {
    expect(controller.health()).toEqual({
      status: 'ok',
      message: 'API is running',
    })
  })
})
