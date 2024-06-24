<script>
export default {
  // globalData: {},

  async onLaunch () {
    // 本方法会被异步执行，调用后立刻进入当前所打开的页面进行onLoad/onShow，然后才执行这里的异步功能。
    wo.cclog(`Launching to baseType=${wo.envar.baseTypeDefault}`)

    /* 解析 querystring，加载语言、地区等基础设置。在连接后台之前执行一次，可以提前准确的显示界面语言等 */
    // #ifdef WEB
    // 如果用户使用了邀请码注册链接 (必须放在 autologin 之前，因为如果登录失败，跳转到新页面了就不是原始的链接了)
    wo.ss.Ident.inviterHaid = this.$route?.query?.inhaid || this.$route?.query?.inviterHaid || wo.ss.Ident.inviterHaid
    // #endif
    // web服务器所在的国家（由 cloudflare 根据来访者的 geoip.country 来跳转到该国的Web服务器）
    wo.ss.i18n.weblandCode =
      globalThis.window?.location?.hostname === 'localhost' ? 'local' : globalThis.window?.location?.hostname?.split('.')?.[1]?.toUpperCase?.() || wo.ss.i18n.weblandCode // .reverse?.()?.[2]
    // 来访用户IP所在的国家
    wo.ss.i18n.userlandCode =
      // cloudflare 如果无法判断，会送来 'XX' 作为 geoip country，如果要过滤掉，就 userlandCode = i18n.landSet[userlandCode]?.iso2 || 'US'
      globalThis.window?.location?.pathname?.match?.(/\buipl([A-Z][A-Z])\b/)?.[1] || // 如果 cloudflare 在 path 里传来 hostname/uiplXX/...
      globalThis.$route?.query?.uipl || // 如果 cloudflare 在 query 里传来 hostname/#/?uipl=XX 并且 写在 App.vue 里就可以用 $route
      uni.getStorageSync('userlandCode') || // 如果用户手动访问已经具有 webland 的域名，那就不会被添加 uipl 了，因此保存下来
      wo.ss.i18n.weblandCode
    uni.setStorageSync('userlandCode', wo.ss.i18n.userlandCode)
    wo.ss.i18n.mylang = uni.getStorageSync('mylang') || wo.ss.i18n.land2lang[wo.ss.i18n.userlandCode] || wo.ss.i18n.mylang
    // 如果当前路径不存在，就进入欢迎页. 发现效果等同于 onPageNotFound 因此取消掉了
    // 在 App.vue 时，还无法 getCurrentPages() ，但可以 this.$route。
    // this.$route.path==='/' || wo.pagesJson?.pages.find((page)=>page.path===this.$route.path.substr(1)) || uni.reLaunch({ url: 'home-portal' })

    uni.onTabBarMidButtonTap(() => {
      uni.navigateTo({ url: wo.pagesJson.tabBar.midButton.midPage })
    })

    // 获取系统配置参数
    let connPrompt = wo.ll({ zhCN: '连接中... ', enUS: 'Connecting... ' })
    let connTimeout = 5000
    let connCounter = 1
    let waiting = wo.tt.showLoading({ title: connPrompt, mask: true })
    let envarBase
    while (true) {
      // 在开发环境，如果能连上本地后台，说明当前开发者设置了自己的后台服务，不需要用统一设置的后台
      if (process.env.NODE_ENV === 'development' && wo.envar.baseTypeDefault === 'SERVER' && !/\blocalhost\b/.test(wo.envar.servUrl)) {
        let localServUrl = `http://localhost:${wo.tt.keyname_to_apiport(wo.envar.idname)}`
        let [error, { statusCode, header, errMsg, data } = {}] = await uni.request({
          method: 'POST',
          url: localServUrl + '/api/System/get_remote_envar',
          data: { _clientInfo: wo.envar.clientInfo }
        })
        if (!error && 200 === statusCode && wo.bok(data._state)) {
          wo.ccinfo('发现本地后台正在运行，优先切换到本地后台！')
          envarBase = data
          envarBase.servUrl = localServUrl
        }
      }
      if (!wo.bok(envarBase?._state)) {
        if (connTimeout >= 15000) connTimeout = 2000
        envarBase = await wo.tt.callBase({ apiWho: 'System', apiTodo: 'get_remote_envar', timeout: connTimeout += 1000 })
      }
      if (wo.bok(envarBase?._state)) {
        wo.tt.assignDeep(wo.envar, envarBase)
        if (wo.envar.baseTypeDefault === 'SERVER') {
          wo.unisocket.initSocket(wo.envar.servUrl) // 放在完全创建 wo 后，否则 wo.envar 还没有生效
          // [20220613] 注意到，websocket无法连接到测试后台 ws://域名:端口，但能够连到本地后台 ws://localhost:端口。是否uni.connectSocket只能连接 wss://域名 和 ws://localhost？
          wo.ccinfo(`baseType = SERVER, ServerURL = ${wo.envar.servUrl}`)
        } else {
          wo.ccinfo(`baseType = ${wo.envar.baseTypeDefault}`)
        }
        break
      } else {
        wo.ccerror(
          `Failed connecting to baseType=${wo.envar.baseTypeDefault} ${wo.envar.baseTypeDefault === 'SERVER' ? wo.envar.servUrl : ''
          }! Go to sleep for a while...`
        )
        process.env.NODE_ENV !== 'production' && await wo.tt.sleep(2000)
        // #ifdef APP
        waiting.setTitle(connPrompt + connCounter++)
        // #endif
        // #ifndef APP
        uni.showLoading({ title: connPrompt + connCounter++, mask: true })
        // #endif
      }
    }
    wo.tt.hideLoading()

    if (wo.envar._uipl) { // 后台返回的 _uipl 具有更高优先级。在手机App里也只能使用后台返回的 _uipl
      wo.ss.i18n.userlandCode = wo.envar._uipl
      uni.setStorageSync('userlandCode', wo.ss.i18n.userlandCode)
      wo.ss.i18n.mylang = uni.getStorageSync('mylang') || wo.ss.i18n.land2lang[wo.ss.i18n.userlandCode] || wo.ss.i18n.mylang
    }
    // 中国地区特定的调整
    // 2024328 发现，在pc web端如果打开的首页不是 home-portal，或者在phone web端打开首页为user-resource，那么这里对 comms.subtags 的修改，并不能自动生效，要等下次点击切换页面后，才生效。因此，需要在 part-footer, user-resource, user-resource-detail 里，显性调用一次 $forceUpdate()；或者引入 hiddenLink 字段，但这在 user-resource-detail 中的处理困难。
    if (wo.ss.i18n.userlandCode === 'CN') {
      //delete wo.ss.linkTree.comms.subtags.youtube
      Object.values(wo.ss.linkTree.comms.subtags).forEach((link) => {
        if (link.notIn?.includes('CN')) {
          delete wo.ss.linkTree.comms.subtags[link.linkkey]
        }
      })
      //wo.ss.linkTree.comms.subtags.youtube.hiddenLink = true

      //   // 20240225 把文心一言调整到AI列表第一个。在启动前就这样设置，才能确保 wo.ss.AI.aicodeNow 在 part-aichat 里被正确初始化成 Object.keys(wo.ss.aiModelSet)[0]
      //   // 20240226 用前后台共享的 aicodeDefault 变量 来替换这里的强行调整
      //   let { cnwenxin, cnwenxint } = wo.envar.aiModelSet
      //   delete wo.envar.aiModelSet.cnwenxin
      //   delete wo.envar.aiModelSet.cnwenxint
      //   wo.envar.aiModelSet = Object.assign({}, cnwenxint ? { cnwenxint } : undefined, cnwenxin ? { cnwenxin } : undefined, wo.envar.aiModelSet)
    } else {
      // delete wo.ss.linkTree.comms.subtags.bilibili
      Object.values(wo.ss.linkTree.comms.subtags).forEach((link) => {
        if (link.notIn?.includes('ABC')) {
          delete wo.ss.linkTree.comms.subtags[link.linkkey]
        }
      })
      // wo.ss.linkTree.comms.subtags.bilibili.hiddenLink = true
    }
    wo.ss.i18n.phonelandNow = wo.ss.i18n.landSet[wo.ss.i18n.userlandCode] || wo.ss.i18n.phonelandNow
    wo.ss.i18n.bankcoinNow = wo.ss.i18n.land2bankcoin[wo.ss.i18n.userlandCode] || wo.ss.i18n.bankcoinNow
    wo.ss.i18n.depositCoinNow = wo.ss.i18n.land2depositcoin[wo.ss.i18n.userlandCode] || wo.ss.i18n.depositCoinNow
    if (wo.envar.landSet) wo.tt.assignDeep(wo.ss.i18n.landSet, wo.envar.landSet) // 如果后台提供了新的地区信息（例如手机号规则表达式）
    // #ifdef WEB
    if (!wo.envar.inProd) wo.envar.webUrlRoot = globalThis.location?.origin // 开发状态下，例如从局域网内其他设备上发起测试，优先使用当前访问地址
    // #endif

    // #ifdef APP
    let myAppNews = wo.envar.appNews?.android?.appMarket?.[wo.envar.clientInfo.appFrom] || wo.envar.appNews?.[wo.envar.clientInfo.osName]
    if (myAppNews?.appVersionCode > wo.envar.clientInfo.appVersionCode) {
      uni.showModal({
        title: wo.ll({ zhCN: '新版本已上架！', enUS: 'New version is available!' }),
        content: wo.envar.modalPrefix + wo.ll({ zhCN: '本机版本 ', enUS: 'Local Version ' }) + wo.envar.clientInfo.appVersionCode + '\n' + wo.ll({ zhCN: '最新版本 ', enUS: 'Newest Version ' }) + myAppNews.appVersionCode + '\n\n' + wo.ll(myAppNews.appUpdateMessage || wo.envar.newsline),
        showCancel: (process.env.NODE_ENV === 'production' && myAppNews.appUpdateLevel === 'must') ? false : true,
        confirmText: wo.ll({ zhCN: '去升级', enUS: 'Upgrade' }),
        cancelText: wo.ll({ zhCN: '以后再说', enUS: 'Skip' }),
        success: ({ confirm, cancel }) => {
          if (confirm) {
            if (wo.envar.inAppAndroid && wo.envar.clientInfo.appFrom) {
              wo.tt.open_url({ url: wo.ll(wo.envar?.linkTree?.apps?.subtags?.android?.appMarket?.[wo.envar.clientInfo.appFrom]?.linkUrl) })
            } else {
              wo.tt.open_url({ url: wo.ll(wo.envar?.linkTree?.apps?.subtags?.[wo.envar.clientInfo.osName]?.linkUrl) })
            }
            /* 似乎是为了下载，所以不能在 webview 里打开
            wo.ss.linkTagNow = wo.envar.clientInfo.osName
            uni.navigateTo({ url: 'user-resource-detail' })
            */
          }
        },
      })
    }
    // #endif
    wo.ccinfo('autologging.........')
    if (uni.getStorageSync('_passtoken')) {
      wo.tt.showLoading({ title: wo.ll({ zhCN: '自动登录...', enUS: 'Auto login...' }), mask: true })
      let { _state, onlineUser = {}, _passtoken, uni_id_token } = (await wo.tt.callBase({ apiWho: 'User', apiTodo: 'autologin_user' })) || {}
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        wo.ccinfo('autologin success: sending socket message')
        wo.unisocket.sendObject({ skevent: 'SOCKET_OWNER', _passtoken: _passtoken })
        uni.setStorageSync('_passtoken', _passtoken)
        uni.setStorageSync('uni_id_token', uni_id_token)
        wo.ss.User.onlineUser = onlineUser // todo 这条语句后，导致在桌面+发行版上，在console里出现一条访问 http://主机/null 的错误。改成 Object.assign也没用，反而导致页面相应的更新不及时。
        if (onlineUser.lang) {
          wo.ss.i18n.mylang = onlineUser.lang
          uni.setStorageSync('mylang', wo.ss.i18n.mylang)
        }
        uni.$emit('AUTOLOGIN_SUCCESS', {})
        wo.ss.Ident.autologgingState = 'AUTOLOGIN_SUCCESS'
      } else {
        wo.cclog('autologin failed')
        uni.removeStorageSync('_passtoken')
        uni.$emit('AUTOLOGIN_FAIL', {})
        wo.ss.Ident.autologgingState = 'AUTOLOGIN_FAIL'
      }
    } else {
      wo.cclog('_passtoken not exist')
      uni.$emit('AUTOLOGIN_FAIL', {})
      wo.ss.Ident.autologgingState = 'AUTOLOGIN_FAIL'
    }
    wo.ccinfo(wo.ss.Ident.autologgingState)
  },
  onShow () {
    wo.cclog('App Show')
  },
  onHide () {
    wo.cclog('App Hide')
  },
  onPageNotFound () {
    // #ifdef WEB
    wo.ccerror('Page Not Found')
    let [path, qs] = window.location.href.split('?')
    uni.reLaunch({ url: qs ? `/?${qs}` : '/' }) // 注意，reLaunch({url:'/'}) 只对 Web 有效。在 App 里不存在 / 路径
    // #endif
  },
}
</script>

<style lang="scss">
/* 每个页面可共享的公共css */

@import '@/static/icont-platform/icont-platform.css';
@import '@/static/icont-basic/icont-basic.css';
//@import 'uview-ui/index.scss';

page {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif; // "Arial","Microsoft YaHei";
  font-size: medium;
  -webkit-user-select: text; // 用 uniapp 开发的PC站 所有的内容都无法选择复制，因为uniapp做了限制。还可以定义给 * 或 .text
  user-select: text;
}

.wo-select-forbidden {
  -ms-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

uni-page-body {
  height: 100%;
}

uni-modal .uni-modal {
  max-width: 420px;

  .uni-modal__hd {
    padding: 40px 20px 20px;

    .uni-modal__title {
      word-break: break-word;
    }
  }

  .uni-modal__bd {
    word-break: break-word;
  }
}

.uni-label-pointer {
  cursor: unset;
}

uni-button {
  height: 50px;

  uni-text.uni-icons {
    margin-right: 4px;
  }
}

* {
  transition: all 0.3s; // ease-in-out
}

button {
  display: flex;
  justify-content: center;
  align-items: center;
  // not allow select
  -ms-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.uni-tooltip {
  white-space: nowrap;
}

.wo-button {
  -ms-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wo-logo-ident {
  width: 60px;
  height: 60px;
  background: no-repeat center center / contain; // white?
  margin: 20px auto;
  border-radius: 100%;
  //box-shadow: 2px 2px 15px 2px rgba(255, 255, 255, 0.5);
}

.letter-spacing-12px {
  letter-spacing: 5px;
}

.border-radius-20px {
  border-radius: 20px;
}

.border-radius-30px {
  border-radius: 30px;
}

.wo-border-none {
  border: 0;
}

/* #ifdef WEB */
// 显示 topWindow 时，隐藏掉 navbar. 换用在 setBarTitles 里的新方案来长期隐藏后，不再需要本设置。
// .uni-app--showtopwindow uni-page-head {
//   display: none;
// }
/* #endif */

.window-page-full {
  flex: auto;
  width: 100%;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
}

.window-page-1200 {
  flex: auto;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
}

.window-page-1024 {
  flex: auto;
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
}

.window-page-900 {
  flex: auto;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
}

.window-page-750 {
  flex: auto;
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box; // 如果header作为组件而不是topWindow引入，page 就需要设置padding-top，就需要 box-sizing
  display: flex;
  flex-flow: column nowrap;
}

.window-page-ident {
  // 必须在 App.vue 里定义才能影响到 uni-easyinput，放在具体页面里无效。
  uni-input {
    height: 50px;

    .uni-input-input {
      font-size: 20px;
      //text-align:center;
    }
  }
}

.list-header-color {
  color: #888;
}

.list-footer-color {
  color: black;
}

uni-input {
  height: 44px;

  .uni-input-input {
    font-size: 18px;
  }
}

.formitem-feedback {
  height: 22px;
  line-height: 22px;
  font-size: 12px;

  &.at-center {
    text-align: center;
    width: 100%;
  }

  &.bad-message {
    color: var(--red-dark);
  }

  &.good-message {
    color: var(--green-default);
  }
}

.wo-headbar-shadow {
  box-shadow: 0 10px 10px -5px rgba(243, 244, 246, 1);
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wo-clickable {
  cursor: pointer;
}

.wo-bg-linear-transcolor {
  background: linear-gradient(90deg, var(--main-light), var(--main-dark));
}
.wo-bg-linear-maincolor {
  background: linear-gradient(90deg, var(--main), var(--main));
}

.wo-flex {
  display: flex;

  &.row {
    flex-flow: row nowrap;
  }

  &.column {
    flex-flow: column nowrap;
  }

  &.wrap {
    flex-wrap: wrap;
  }

  &.start {
    justify-content: flex-start;
  }

  &.end {
    justify-content: flex-end;
  }

  &.center {
    justify-content: center;
  }

  &.between {
    justify-content: space-between;
  }

  &.around {
    justify-content: space-around;
  }

  &.evenly {
    justify-content: space-evenly;
  }

  &.align-center {
    align-items: center;
  }

  &.align-start {
    align-items: flex-start;
  }

  &.align-end {
    align-items: flex-end;
  }
}

.right-most-quick-link {
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  padding: 0 5px;
}
</style>
