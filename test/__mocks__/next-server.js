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

class MockNextRequest extends Request {}

module.exports = {
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest
}
