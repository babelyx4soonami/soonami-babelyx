import coco from 'wo-core-coco'
import coretool from 'wo-core-toolkit'
import unitool from 'wo-user-toolkit-uniapp'
import unisocket from 'wo-user-websocket-uniapp'
import assignDeep from 'assign-deep'
//import requireJSON5 from 'require-json5'; requireJSON5('@/pages.json') // require-json5 可以直接加载 *.json 但是必须用 require，无法用 import，报错 'require.extensions is not supported by webpack. Use a loader instead.'
//import json5 from 'json5'; import fs from 'fs'; json5.parse(fs.readFileSync('@/pages.json', 'utf8')) // 报错 '_fs.default.readFileSync is not a function'
import pagesJson from 'json5-loader!@/pages4loader.json5' // 20231111 发现json5-loader已经deprecated。
import store from './store'

import Vue from 'vue'
Vue.config.productionTip = false
Vue.config.devtools = process.env.NODE_ENV === 'development' // 在开发调试时为 development，打包部署时为 production，应当是 uniapp 底层自动设置的。
Vue.prototype.uni = uni // 方便在 vue 文件的 template 中直接调用 uni.xxx
Vue.prototype.getApp = getApp // 方便在 vue 文件的 template 中直接调用 getApp
Vue.prototype.getCurrentPages = getCurrentPages
Vue.prototype.window = globalThis.window
Vue.prototype.console = console
Vue.prototype.eval = eval

// 挂载到全局 => 不能在<template>里使用，但能在<script>和浏览器console里使用
// 挂载到 vue 实例 => 可以在<template>里使用
Vue.prototype.wo = globalThis.wo = {
  ...coco,
  unisocket,
  pagesJson,
  pageSet: (arr => (arr.reduce((obj, item) => ({ ...obj, [item.path.substring(6)]: item }), {})))(pagesJson.pages),
  store,
  ss: store.state,
  envar: store.state, // 或者 store.state.envar 和 ss 区分开？
  color: unitool.c2t, // convert color to UI component theme name
  /*
  consts: {

  },
  */
  ll: unitool.localizeText, // 页面中需要频繁用到 localizeText({zhCN:'...',enUS:'...'}) 因此定义一个快捷名字
  pp: unitool.thisPage, // 主要为了方便开发中，在浏览器控制台里获取当前页面
  bok (_state) {
    //return 'SUCCESS' === _state || 'AUTOLOGIN_SUCCESS' === _state || 'VERIFY_SUCCESS' === _state || 'REGISTER_SUCCESS' === _state || 'LOGIN_SUCCESS' === _state || 'RESET_SUCCESS' === _state || 'BOK' === _state
    return ['BOK', 'SUCCESS', 'REGISTER_SUCCESS', 'RESET_SUCCESS', 'LOGIN_SUCCESS', 'AUTOLOGIN_SUCCESS', 'VERIFY_SUCCESS'].includes(_state)
  },
  tt: {
    ...coretool,
    ...unitool,
    assignDeep,
    async wait_autologin () {
      //      let duration = 0
      while (wo.ss.Ident.autologgingState === 'WAITING') {
        await wo.tt.sleep(500)
        //        await wo.tt.sleep((duration += 1000))
        //        if (duration >= 7000) duration = 0
      }
      return wo.ss.Ident.autologgingState === 'AUTOLOGIN_SUCCESS'
    },
    check_online ({ type = 'navigateTo' } = {}) {
      // 经测试，即使不在线而跳转了，后续的语句仍然会执行，例如 wo.tt.check_online(); alert('happened anyway'); 因此建议总是用 if (wo.tt.check_online()) {...}
      if (!wo.ss.User.onlineUser?.usid) {
        // uni.showModal({
        //   title: wo.ll({ zhCN: '请先注册登录，即可解锁功能', enUS: 'Identify Yourself to Continue' }),
        //   confirmText: wo.ll({ zhCN: '注册登录', enUS: 'Identify' }),
        //   cancelText: wo.ll({ zhCN: '取消', enUS: 'Cancel' }),
        //   showCancel: true,
        //   success: ({ confirm, cancel }) => {
        //     if (confirm) {
        //       uni.navigateTo({ url: 'ident-begin' })
        //     }
        //   },
        // })
        uni[type]({ url: 'ident-begin' })
        return false
      }
      return true
    },
    // 不会写 promise，不起作用
    // autologging: () =>
    //   new Promise((resolve, reject) => {
    //     if (['AUTOLOGIN_SUCCESS', 'AUTOLOGIN_FAIL'].includes(wo.ss.Ident.autologgingState)) {
    //       resolve(true)
    //     }
    //   }),
    // onkeypress="wo.tt.omit_space_key(event)" 不起作用，要显性 onkeypres="return wo.tt.omit_space_key(event)" 才可以
    // 20230104 发现在 app 里无效，因为在 app 里用的是软键盘，无法获取到 keyCode。
    omit_space_key (event) {
      if (event.keyCode === 32) {
        wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '不能含有空格', enUS: 'Space is disallowed' }) })
        return false
      }
      return true
    },
    async pick_lang (langCode) {
      if (wo.ss.i18n.mylang !== langCode) {
        wo.ss.i18n.mylang = langCode
        uni.setStorageSync('mylang', wo.ss.i18n.mylang)
        wo.tt.setBarTitles()
      }
      if (wo.ss.User.onlineUser.usid && wo.ss.User.onlineUser.lang !== langCode) {
        let { _state } = await wo.tt.callBase({
          apiWho: 'User',
          apiTodo: 'set_user_lang',
          apiWhat: { User: { lang: langCode } },
        })
        if (wo.bok(_state)) {
          wo.ss.User.onlineUser.lang = langCode
          wo.tt.showToast({ title: { zhCN: '您的偏好语言已更新。', enUS: 'Your favorite language is changed.' } })
        }
        else wo.tt.showToast({ type: wo.color.GREEN, title: { zhCN: '当前语言已更新。', enUS: 'The current language is changed.' } })
      }
    },
    // normalize_creation (creation) {
    //   // 如果没有设置封面，那就用内容中的第一个图片/视频
    //   if (Array.isArray(creation.pexdataUser)) {
    //     for (let section of creation.pexdataUser) {
    //       if (section.image) {
    //         creation._openImage = section.image
    //         return
    //       } else if (section.video) {
    //         creation._openVideo = section.video
    //         return
    //       }
    //     }
    //   }
    // },
    filter_story_image (story) {
      if (Array.isArray(story)) {
        for (let section of story) {
          if (section.image) return section.image
        }
      }
    },
    filter_story_video (story) {
      if (Array.isArray(story)) {
        for (let section of story) {
          if (section.video) return section.video
        }
      }
    },
    // copy_or_share ({ url, title }) {
    //   // #ifdef APP
    //   uni.shareWithSystem({
    //     summary: wo.ll(title)?.replace?.(/\s/g,''),
    //     href: wo.ll(url),
    //     imageUrl: wo.envar.inAppIos ? wo.pagesJson.appLogo : undefined
    //   })
    //   // #endif
    //   // #ifndef APP
    //   wo.tt.copy_to_clipboard(wo.ll(url) + '\n' + wo.ll(title))
    //   // #endif
    // },
    logout_account () {
      uni.$emit('LOGOUT', {})
      wo.ss.User.onlineUser = {}
      wo.store.commit('reset_all')
      uni.removeStorageSync('_passtoken')
      wo.ss.Ident.autologgingState = 'AUTOLOGIN_FAIL' // 退出后，返回入口页面，不再重新自动登录，因此要手动调整 autologgingState
      uni.reLaunch({ url: 'home-portal' })
    },
    naviback (backToPage) {
      if (getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({ url: backToPage || 'home-portal' })
      }
    },
    show_resource (target) {
      wo.ss.linkTagNow = target
      uni.navigateTo({ url: 'user-resource-detail?tagnow=' + target })
    },
    merge_model_and_owner_price (bot) { // aipp使用者的价格
      if (/^asst_/.test(bot.aicode)) {
        if (bot.profitMargin) {
          let modelPriceParts = wo.ll(wo.envar.aiModelSet[bot.aicodeModel].aiprice).split(wo.ss.tucSymbol)
          modelPriceParts[0] = wo.tt.number_precision(Number(modelPriceParts[0]) * (1 + Number(bot.profitMargin)))
          return modelPriceParts[0] + wo.ss.tucSymbol + modelPriceParts[1]
        }
        return wo.ll(wo.envar.aiModelSet[bot.aicodeModel].aiprice)
      } else {
        return wo.ll(bot.aiprice)
      }
    },
    margin_to_price (bot) { // aipp开发者的收入
      if (Number(bot.profitMargin)) {
        let modelPriceParts = wo.ll(wo.envar.aiModelSet[bot.aicodeModel].aiprice).split(wo.ss.tucSymbol)
        modelPriceParts[0] = wo.tt.number_precision(Number(modelPriceParts[0]) * Number(bot.profitMargin))
        return modelPriceParts[0] + wo.ss.tucSymbol + modelPriceParts[1]
      }
      return 0
    },
    choose_url ({ fileUrl, cid, ipfsUrl, baseUrl } = {}) {
      return wo.ss.servUrl.startsWith('http://localhost') ? (fileUrl || baseUrl || ipfsUrl || cid || '') : (cid || ipfsUrl || fileUrl || baseUrl || '')
    },
    format_number (sizeBytes) {
      return (sizeBytes).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    },
    confirm_to_delete ({ content, action }) {
      wo.tt.showModal({
        title: { zhCN: '真的要清除这个文件吗？', enUS: 'Are you sure to drop this file?' },
        content: content,
        confirmText: wo.ll({ zhCN: '清除', enUS: 'Drop' }),
        cancelText: wo.ll({ zhCN: '取消', enUS: 'Cancel' }),
        showCancel: true,
        success: ({ confirm, cancel }) => {
          if (confirm && typeof (action) === 'function') {
            action()
          }
        },
      })
    },
  },
}

///* 界面相关 */
//import uView from 'uview-ui'
//Vue.use(uView)
//wo.envar.uView = true // 在各页面中是否优先使用 uView 组件
// #ifdef WEB
// 一次性绑定浏览器窗口的尺寸。不要在各个页面/组件中重复绑定。
if (wo.envar.inPc) {
  uni.onWindowResize(({ size: { windowWidth, windowHeight } }) => {
    wo.ss.windowWidthNow = windowWidth
    wo.ss.minWidth500 = Math.min(wo.ss.windowWidthNow, 500) + 'px'
    wo.ss.maxWidth750 = Math.min(wo.ss.windowWidthNow, 750) + 'px'
    wo.ss.maxWidth600 = Math.min(wo.ss.windowWidthNow, 600) + 'px'
  })
}
// #endif

///* 启动应用 */
import App from './App.vue'
App.mpType = 'app'
const app = new Vue({
  /* 注意1: globalData can be accessed by `getApp().globalData` in pages, `this.$options.globalData` or `this.globalData` in App.vue because the app is not ready in App.vue. 注意2: 在 main.js 中定义，可以直接赋值以 wo，如果在 App.vue 中定义，无法赋值以 wo */
  globalData: wo,
  // i18n,
  // router,
  store,
  ...App,
})
app.$mount()
