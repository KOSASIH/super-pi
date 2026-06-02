export class OpenFailedError extends Error {
  static name = 'OpenFailedError'
  static code = 'ERR_OPEN_FAILED'
  name = OpenFailedError.name
  code = OpenFailedError.code

  constructor (message = 'Open failed') {
    super(message)
  }
}

export class CloseFailedError extends Error {
  static name = 'CloseFailedError'
  static code = 'ERR_CLOSE_FAILED'
  name = CloseFailedError.name
  code = CloseFailedError.code

  constructor (message = 'Close failed') {
    super(message)
  }
}

export class PutFailedError extends Error {
  static name = 'PutFailedError'
  static code = 'ERR_PUT_FAILED'
  name = PutFailedError.name
  code = PutFailedError.code

  constructor (message = 'Put failed') {
    super(message)
  }
}

export class GetFailedError extends Error {
  static name = 'GetFailedError'
  static code = 'ERR_GET_FAILED'
  name = GetFailedError.name
  code = GetFailedError.code

  constructor (message = 'Get failed') {
    super(message)
  }
}

export class DeleteFailedError extends Error {
  static name = 'DeleteFailedError'
  static code = 'ERR_DELETE_FAILED'
  name = DeleteFailedError.name
  code = DeleteFailedError.code

  constructor (message = 'Delete failed') {
    super(message)
  }
}

export class HasFailedError extends Error {
  static name = 'HasFailedError'
  static code = 'ERR_HAS_FAILED'
  name = HasFailedError.name
  code = HasFailedError.code

  constructor (message = 'Has failed') {
    super(message)
  }
}

export class NotFoundError extends Error {
  static name = 'NotFoundError'
  static code = 'ERR_NOT_FOUND'
  name = NotFoundError.name
  code = NotFoundError.code

  constructor (message = 'Not Found') {
    super(message)
  }
}

export class AbortError extends Error {
  static name = 'AbortError'
  static code = 'ERR_ABORTED'
  name = AbortError.name
  code = AbortError.code

  constructor (message = 'Aborted') {
    super(message)
  }
}
