const path = require('path')
const fs = require('fs')

// https://uniapp.dcloud.net.cn/collocation/vue-config.html
// 读取 manifest.json ，修改后重新写入
const manifestPath = path.join(__dirname, 'manifest.json')
let Manifest = fs.readFileSync(manifestPath, { encoding: 'utf-8' })
function replaceManifest (path, value) {
  const arr = path.split('.')
  const len = arr.length
  const lastItem = arr[len - 1]

  let i = 0
  let ManifestArr = Manifest.split(/\n/)

  for (let index = 0; index < ManifestArr.length; index++) {
    const item = ManifestArr[index]
    if (new RegExp(`"${arr[i]}"`).test(item)) ++i
    if (i === len) {
      const hasComma = /,/.test(item)
      ManifestArr[index] = item.replace(new RegExp(`"${lastItem}"[\\s\\S]*:[\\s\\S]*`), `"${lastItem}" : ${value}${hasComma ? ',' : ''}`)
      break
    }
  }

  Manifest = ManifestArr.join('\n')
}

// 注意，在调用 vue.config.js 之前，打包进程就已经读取了 manifest，因此嵌入在 vue.config.js 里更新的数据直到再下一次打包时才生效，导致被打包的 uni.getSystemInfoSync().appVersionCode 仍然为之前的版本号。
// 为了让打包的版本正确，解决方案 1）在 package.json 里提供一个定时任务，每小时更新一次，但这样仍然可能因为打包和部署发生在两个小时里而出错。
// 解决方案 2）通过命令行方式打包+部署一体自动化，即使发生在两个小时里也正确，只要不要在这期间手动或定时的额外更新。
const versionCode = new Date().toJSON().replace(/:.*/, '').replace(/[-|T]/g, '').substring(2)
replaceManifest('versionName', '"' + versionCode.slice(0, 4) + '.' + versionCode.slice(4) + '"')
replaceManifest('versionCode', parseInt(versionCode))
// 万一修改了应用的名称，则也修改 manifest：
// const callname = require('./store').state.callnames.enUS
// replaceManifest('name', `"${callname}"`)
// replaceManifest('h5.title', `"${callname}"`)

fs.writeFileSync(manifestPath, Manifest, { flag: 'w' })

//fs.writeFileSync(path.join(__dirname, 'versionCode-created.json'), versionCode, { flag: 'w' })
//console.log(new Date(), 'versionCode =', versionCode)
console.log(versionCode)

module.exports = versionCode