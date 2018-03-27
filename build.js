const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const client = "client-webpack-vue";
const clinet_dist = "dist";
const server = "server-node-fastify";
const server_dist = "src/asserts";

const n = spawn("node", [`./${client}/build/build.js`], {
  cwd: __dirname,
  windowsHide: true
});
console.log("----开始构建------");

n.stdout.on("data", data => {
  console.log(`stdout: ${data}`);
});

n.stderr.on("data", data => {
  console.error(`stderr: ${data}`);
});

n.on("close", code => {
  if (code === 0) {
    let fromPath = path.resolve(`./${client}/${clinet_dist}`);
    let targetPath = path.resolve(`./${server}/${server_dist}`);
    deepDelete(targetPath);
    // 创建软连接没有权限，通过复制处理
    deepCopy(fromPath, targetPath);

    console.log("----构建完成------");
  } else {
    console.error(`构建代码失败！${code}`);
  }
});

function deepDelete(dir) {
  if(fs.existsSync(dir)){
    if (fs.statSync(dir).isDirectory()) {

      let files = fs.readdirSync(dir)
      files.forEach(f => {
        let fpath = path.join(dir, f);
        if (fs.statSync(fpath).isDirectory()) {
          deepDelete(fpath);
        } else {
          fs.unlinkSync(fpath);
        }
      });
      fs.rmdirSync(dir);
    } else {
      fs.unlinkSync(dir);
    }
  }
}

function deepCopy(from, target) {
  fs.readdir(from, (err, files) => {
    if (err) console.error(err);

    if (!fs.existsSync(target)) {
      fs.mkdirSync(target);
    }
    files.forEach(f => {
      let fpath = path.join(from, f);
      let tpath = path.join(target, f);
      if (fs.statSync(fpath).isDirectory()) {
        deepCopy(fpath, tpath);
        console.log(`创建文件夹：${tpath}`);
      } else {
        let r = fs.createReadStream(fpath);
        let w = fs.createWriteStream(tpath);
        r.pipe(w);
        console.log(`拷贝文件：${fpath}->${tpath}`);
      }
    });
  });
}
