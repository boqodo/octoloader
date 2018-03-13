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

function icon (name) {
  return name
}

async function loadInitTree () {
  return [
    { label: '桌面', id: idGenerater(), icon: icon('Desktop'), path: desktop, isSelected: false },
    { label: '此电脑', id: idGenerater(), icon: icon('Computer'), children: await loadDevices() },
    {
      label: '库',
      id: idGenerater(),
      icon: icon('Library'),
      children: [
        { label: '文档', id: idGenerater(), icon: icon('Documents'), path: documents, children: [], isSelected: false},
        { label: '图片', id: idGenerater(), icon: icon('Pictures'), path: pictures, children: [], isSelected: false},
        { label: '视频', id: idGenerater(), icon: icon('Videos'), path: videos, children: [] , isSelected: false},
        { label: '下载', id: idGenerater(), icon: icon('Downloads'), path: downloads, children: [], isSelected: false},
        { label: '音乐', id: idGenerater(), icon: icon('Music'), path: music, children: [], isSelected: false }
      ]
    }
  ]
}
async function loadDevices () {
  let devs = await si.blockDevices()
  return devs.filter(d => d.label).map(d => {
    return {label: `${d.label || '本地磁盘'}(${d.mount})`, id: idGenerater(), icon: icon('Device'), path: `${d.mount}/`, children: []}
  })
}

exports = module.exports = {
  initTree: loadInitTree()
}
