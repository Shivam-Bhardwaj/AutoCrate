const RequestCtor = typeof globalThis.Request !== 'undefined'
  ? globalThis.Request
  : class MockRequest {
      constructor(input, init = {}) {
        this.url = typeof input === 'string' ? input : input?.url ?? ''
        this.method = init.method || 'GET'
        this.headers = init.headers || {}
        this.body = init.body
      }
    }

class MockNextResponse {
  constructor(body, init = {}) {
    this.bodyValue = body
    this.status = init.status ?? 200
    this.headers = new Map(Object.entries(init.headers ?? {}))
  }

  static json(body, init = {}) {
    return new MockNextResponse(body, init)
  }

  json() {
    return Promise.resolve(this.bodyValue)
  }
}

class MockNextRequest extends RequestCtor {}

module.exports = {
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest
}
