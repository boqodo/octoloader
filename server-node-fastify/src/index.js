// Require the framework and instantiate it
const fastify = require('fastify')()
const providers = require('./provider')
const fs = require('fs')

fastify.register(require('fastify-ws'), {
  library: 'uws' // Use the uws library instead of the default ws library
})

fastify.ready(err => {
  if (err) throw err

  fastify.ws.on('connection', socket => {
    console.log('Client connected.')

    socket.on('message', msg => socket.send(msg)) // Creates an echo server

    socket.on('close', () => console.log('Client disconnected.'))
  })
})

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})
fastify.get('/api/medias', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  let url = request.query.url
  let p = providers.matchProvider(url)
  let res = await p.getSeasons(url)
  return res
})

fastify.get('/api/images', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  let url = request.query.url
  let coverUrl = request.query.cover
  let p = providers.matchProvider(url)
  let file = await p.downloadCover(coverUrl)
  reply.send(fs.createReadStream(file))
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
