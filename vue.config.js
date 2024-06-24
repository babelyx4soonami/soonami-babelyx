// const CopyPlugin = require('copy-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin') // ['https://limeii.github.io/2018/09/issues-webpack-file-management/', 'https://www.npmjs.com/package/filemanager-webpack-plugin']
const path = require('path')

module.exports = {
  configureWebpack: {
    plugins: [
      // new CopyWebpackPlugin([
      //     {
      //         from: path.join(__dirname, 'root'),
      //         to: path.join(__dirname, 'unpackage/dist/', process.env.NODE_ENV === 'production' ? 'build' : 'dev', process.env.UNI_PLATFORM)
      //     }
      // ]),
      new FileManagerPlugin({
        events: {
          // onStart/onEnd: { move: [], copy: [], delete: [], mkdir: [], archive: [] },
          onEnd: [
            {
              copy: [
                {
                  source: path.join(__dirname, 'root'),
                  destination: path.join(__dirname, 'unpackage/dist/', process.env.NODE_ENV === 'production' ? 'build' : 'dev', (process.env.UNI_PLATFORM || '').replace('h5', 'web')), // 20240329 HBuilderX 4.06 起，打包web会存放在 unpackage/dist/build/web 里，而不是 h5 里。uni.getSystemInfoSync().uniPlatform 也是 'web'，但是 process.env.UNI_PLATFORM 仍然是 'h5'，因此这里需要手动设 'web'
                },
              ],
            },
          ],
        },
      }),
    ],
  },
}
