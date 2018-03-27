// https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS

// express 跨越插件 https://github.com/expressjs/cors
const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  let allowOrigin = opts ? opts.allowOrigin : '*'
  fastify.addHook('preHandler', async (request, reply) => {
    if (isControl(request.headers)) {
      reply.header('Access-Control-Allow-Origin', allowOriginHandler(allowOrigin, request))
    }
  })
  next()
}, '>=1.0.0-rc.2')

function isControl (headers) {
  if (headers.origin) {
    let referer = headers.referer
    if (referer && referer.startsWith(headers.origin) > -1) {

    } else {
      return true
    }
  }
  return false
}

function allowOriginHandler (allowOrigin, request) {
  if (typeof allowOrigin === 'string') {
    return allowOrigin
  }
  if (Array.isArray(allowOrigin)) {
    return allowOrigin.find(o => o === request.headers.origin)
  }
  if (typeof allowOrigin === 'function') {
    return allowOrigin(request)
  }
}
