const os = require('os')
const fs = require('fs')
const path = require('path')
const si = require('systeminformation')

let idGenerater = (() => {
  let i = 0
  return () => i++
})()

const desktop = path.join(os.homedir(), 'Desktop')
const pictures = path.join(os.homedir(), 'Pictures')
const videos = path.join(os.homedir(), 'Videos')
const documents = path.join(os.homedir(), 'Documents')
const downloads = path.join(os.homedir(), 'Downloads')
const music = path.join(os.homedir(), 'Music')

async function loadInitTree () {
  return [
    { label: '桌面', id: idGenerater(), path: desktop },
    { label: '此电脑', id: idGenerater(), children: await loadDevices() },
    {
      label: '库',
      id: idGenerater(),
      children: [
        { label: '文档', id: idGenerater(), path: documents },
        { label: '图片', id: idGenerater(), path: pictures },
        { label: '视频', id: idGenerater(), path: videos },
        { label: '下载', id: idGenerater(), path: downloads },
        { label: '音乐', id: idGenerater(), path: music }
      ]
    }
  ]
}
async function loadDevices () {
  let devs = await si.blockDevices()
  return devs.map(d => {
    return {label: `${d.label || '本地磁盘'}(${d.mount})`, id: idGenerater(), path: `${d.mount}/`}
  })
}

exports = module.exports = {
  initTree: loadInitTree()
}
