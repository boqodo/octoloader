const p = require('child_process')
const fs = require('fs')

p.exec(
  'wmic logicaldisk get Caption,Description,DeviceID,DriveType,FileSystem,FreeSpace,Name,Size,VolumeName,VolumeSerialNumber /value',
  (error, stdout) => {
    console.log(stdout.toString('UCS2'))
  }
)

let buffer = fs.readFileSync('D:\\ztest-demo\\output.txt')
console.log(buffer.toString())
