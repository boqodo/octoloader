// https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS
const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  let allowOrigin = opts ? opts.allowOrigin : '*'
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.headers.origin) {
      reply.header('Access-Control-Allow-Origin', allowOriginHandler(allowOrigin, request))
    }
  })
  next()
}, '>=1.0.0-rc.2')

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
