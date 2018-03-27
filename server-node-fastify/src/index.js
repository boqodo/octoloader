// Require the framework and instantiate it
const fastify = require('fastify')()
const providers = require('./provider')
const fs = require('fs')
const path = require('path')
const si = require('systeminformation')
const open = require('opn')
const downloadManager = require('./service/DownloadManager')
const historyOpt = require('./service/HistoryOpt')
const configOpt = require('./service/ConfigOpt')
const fileSystemOpt = require('./service/FileSystemOpt')

/*
// websocket
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
*/

fastify.register(require('fastify-static'), {
  root: path.resolve(path.join(__dirname, 'asserts')),
  prefix: '/'
})

// Server-sent events
fastify.register(require('./plugins/fastify-sse'), err => {
  if (err) {
    throw err
  }
})

fastify.register(require('./plugins/fastify-cors'), {
  allowOrigin: ['http://localhost:8080', 'http://localhost:8081']
})

// 首页

// 获取基础配置信息
fastify.get('/api/config', async (request, reply) => {
  let config = configOpt.getConfig()
  let sysenv = {
    devices: await si.fsSize()
  }
  return { config: config, sysenv: sysenv }
})
// 更新基础配置信息
fastify.post('/api/config', async (request, reply) => {
  let config = request.body
  configOpt.updateConfig(config)
  reply.send()
})

// 打开文件，使用opn
fastify.get('/api/filesystem/open', async (request, reply) => {
  let target = request.query.target
  fs.access(target, err => {
    if (err) reply.send(err)
    open(target)
    reply.send()
  })
})
// 读取文件层级结构
fastify.get('/api/filesystem/file', async (request, reply) => {
  let dir = request.query.dir
  if (!dir) {
    return fileSystemOpt.initTree
  } else {
    let isOnlyDir = request.query.isOnlyDir
    let isOnlyFile = request.query.isOnlyFile
    fs.readdir(dir, (err, files) => {
      files = files || []
      files = files.filter(
        f =>
          !f.startsWith('.') &&
					!f.startsWith('$') &&
					f !== 'System Volume Information' &&
					!f.endsWith('.tmp')
      )
      if (err) {
        reply.send(err)
      }
      let filter
      if (isOnlyDir) {
        filter = f => fs.statSync(f).isDirectory()
      } else if (isOnlyFile) {
        filter = f => fs.statSync(f).isFile()
      }
      let ffs = filter ? files.filter(f => filter(path.join(dir, f))) : files
      reply.send(
        ffs.map(f => {
          return {
            label: f,
            id: 1,
            icon: 'Dirtory',
            path: path.join(dir, f),
            children: [],
            isSelected: false
          }
        })
      )
    })
  }
})

// 获取历史搜索记录
fastify.get('/api/histories', async (request, reply) => {
  let size = request.query.size
  return historyOpt.getSearchHistories(size || {})
})

// 根据url 查询匹配的媒体信息
fastify.get('/api/medias', async (request, reply) => {
  let url = request.query.url
  let p = providers.matchProvider(url)
  let res = await p.getSeasons(url)
  historyOpt.record(url, res)
  return res
})

// 根据url 获取图片流
fastify.get('/api/images', async (request, reply) => {
  let url = request.query.url
  let coverUrl = request.query.cover
  let p = providers.matchProvider(url)
  let file = await p.downloadCover(coverUrl)
  reply.send(fs.createReadStream(file))
})

// 复杂请求跨域前的请求允许
fastify.options('/api/*', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  reply.header('Access-Control-Allow-Methods', 'POST, PUT')
  reply.send()
})

// 下载
fastify.post('/api/download', async (request, reply) => {
  let video = request.body
  let url = video.url
  let Provider = providers.matchProvider(url)
  let provider = new Provider(url)
  await provider.parseDownloadVideos(video)
  downloadManager.createDownload(provider)
  return provider.todoVideos
})

// sse 连接
fastify.get('/api/sse', async (request, reply) => {
  downloadManager.start(reply)
  reply.sse('start', {
    event: event => {
      if (event.hasOwnProperty('event')) {
        const eventName = event.event
        delete event.event
        return eventName
      }
      return 'message'
    }
  })
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
