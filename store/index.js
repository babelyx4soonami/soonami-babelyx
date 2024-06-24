import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import i18n from './i18n.js'
import AI from './AI.js'
import Creation from './Creation.js'
import Creator from './Creator.js'
import Ident from './Ident.js'
import Market from './Market.js'
import User from './User.js'

import assignDeep from 'assign-deep'
import unitool from 'wo-user-toolkit-uniapp'

import fenv from '@/fenv.json'
import envar from '../../pex-server-torm/envar/envar-base-dynamic.js'

assignDeep(envar, envar[fenv.appkey])

const linkAKAIZOIC = {
  linkkey: 'AKAIZOIC',
  i18nName: envar.AKAIZOIC.callnames,
  i18nPageTitle: envar.AKAIZOIC.fullnames,
  infoTitle: envar.AKAIZOIC.slogans,
  img: '/static/logo-aippia.png',
  linkUrl: `https://u.${envar.AKAIZOIC.webDomain}`,
}
const linkAKBABELY = {
  linkkey: 'AKBABELY',
  i18nName: envar.AKBABELY.callnames,
  i18nPageTitle: envar.AKBABELY.fullnames,
  infoTitle: envar.AKBABELY.slogans,
  img: '/static/logo-babely.png',
  linkUrl: `https://u.${envar.AKBABELY.webDomain}`,
}
delete envar.AKAIZOIC
delete envar.AKBABELY
delete envar.AKAIMINT

const { uniPlatform, deviceType, osName, browserName, appVersionCode, statusBarHeight, windowWidth } = uni.getSystemInfoSync()

export default new Vuex.Store({
  state: assignDeep(
    {
      //// 只在前端使用的变量。如果需要，也可从后台发来更新，在 App.vue 里覆盖。

      // 前端固有状态，不能从后台改变。可考虑放到 main.js: wo.consts 里
      clientInfo: { // todo: maybe better named as clientNow
        appkey: fenv.appkey, // 因为要用到 fenv 所以放在 store.state 里，否则放在 main.js 里作为non-reactive更好
        appVersionCode, // 来自 uni.getSystemInfoSync() 又辗转来自 manifest.json
        uniPlatform,
        deviceType,
        osName,
        // #ifdef APP
        appFrom: fenv.appFrom,
        // #endif
        // #ifdef WEB
        // 20240108 todo 改叫 webBrowser, webUrl
        browser: browserName || unitool.parse_ua_to_browser(),
        // #endif
      },
      statusBarHeight, // https://juejin.cn/post/7096038734734295076
      inProd: process.env.NODE_ENV === 'production', // 用 'production' 测试，以防在某些场景里 NODE_ENV 未定义。,
      inPc: deviceType === 'pc', // inPcWeb: device === 'pc', inNpcWeb: deviceType !== 'pc' && uniPlatform === 'web',
      inPad: deviceType === 'pad', // inPadWeb: device === 'pad' && uniPlatform === 'web', inPadApp: device === 'pad' && uniPlatform === 'web', // 注意，iPad Mini 在我的 MacOS Safari 上测试，deviceType==='phone'！deviceModel==='iPad' 正确
      inPhone: deviceType === 'phone', // inPhoneWeb: device === 'phone' && uniPlatform === 'web', inPhoneApp: device === 'phone' && uniPlatform === 'web',
      inWeb: uniPlatform === 'web', // inWebPc: device === 'pc', inWebNpc: uniPlatform === 'web' && deviceType !== 'pc',
      inApp: uniPlatform === 'app', // inAppPad: uniPlatform === 'app' && deviceType === 'pad', inAppPhone: uniPlatform === 'app' && deviceType === 'phone',
      inAppIos: uniPlatform === 'app' && osName === 'ios',
      inAppAndroid: uniPlatform === 'app' && osName === 'android',
      inAppAndroidGplay: uniPlatform === 'app' && osName === 'android' && fenv.appFrom === 'GPLAY',
      modalPrefix: uniPlatform === 'app' ? '\n' : '',
      placeholderStyle: 'font-size:13px; color:var(--grey-6); font-weight:300',
      placeholderStyleIdent: 'font-size:18px; color:var(--grey-6); font-weight:300; letter-spacing: initial;',
      sysdown: { zhCN: '系统出错了，请稍后再试，或请向客服投诉。', enUS: 'Something went wrong. Please try again later or report to customer service.' },
      iconShare: 'redo',
      waitMask: false,

      // 可变状态
      windowWidthNow: windowWidth,
      minWidth500: deviceType === 'pc' ? Math.min(windowWidth, 500) + 'px' : 'unset',
      maxWidth600: deviceType === 'pc' ? Math.min(windowWidth, 600) + 'px' : 'unset',
      maxWidth750: deviceType === 'pc' ? Math.min(windowWidth, 750) + 'px' : 'unset',
      // 以下变量用于绑定到 part-window 组件的 uni-popup 元素上。
      pageName: '',
      popMessage: '',
      popDuration: 2000,
      popType: 'success',
      // webview
      webviewUrl: '',
      webviewTitle: '',

      //// 以下变量，暂且硬编码在前端，但随时可在后台定义更新

      midTagNow: 'CCAI',

      creationDict: {
        "ALLKINDS": { "zhCN": "探索大千世界", "enUS": "Explore Creations" }
      },
      creationTagNow: 'ALLKINDS',

      creatorDict: {
        "ALLKINDS": { "zhCN": "遇见创作者", "enUS": "Meet Creators" }
      },
      creatorTagNow: 'ALLKINDS',

      marketDict: {
        "ALLKINDS": { "zhCN": "交易市场", "enUS": "Exchange Market" }
        // SELL: {zhCN:'出售',enUS:"Sell"},
        // BUY: {zhCN:'购买',enUS:'Buy'}
      },
      marketTagNow: 'ALLKINDS',

      myCollectDict: {
        CREATED: { zhCN: '原创', enUS: 'Created', counter: 'countAsCreator', type: 'color' },
        ACQUIRED: { zhCN: '买断', enUS: 'Owned', counter: 'countAsOwner', type: 'flag' },
        HOLDEN: { zhCN: '持有', enUS: 'Holden', counter: 'countAsHolder', type: 'cart' },
        DECRYPTED: { zhCN: '解密', enUS: 'Decrypted', counter: 'countAsViewer', type: 'eye' },
      },
      myCollectTagNow: 'CREATED',

      myCircleDict: {
        "FOLLOWING": { "zhCN": "关注", "enUS": "Followings", "counter": "countFollowing", "type": "heart-filled" },
        "FOLLOWER": { "zhCN": "粉丝", "enUS": "Followers", "counter": "countFollower", "type": "icont-basic-wodefensi1", "customPrefix": "icont-basic" },
        "INVITEE": { "zhCN": "邀请", "enUS": "Invitees", "counter": "countInvitee", "type": "gift" }
      },
      myCircleTagNow: 'FOLLOWING',

      myTxDict: Object.assign({
        // ALLKINDS: { zhCN: '全部', enUS: 'All', myTxList: [] },
        TXT_RECHARGE: { zhCN: '充值', enUS: 'Recharges', myTxList: [] },
        TXT_IN_REWARD: { zhCN: '奖励', enUS: 'Rewards', myTxList: [] },
      },
        fenv.appkey === 'AKBABELY' ? {
          TXT_OUT_PEX_VIEW: { zhCN: '解密', enUS: 'Decrypt', myTxList: [] },
          TXT_OUT_PEX_HOLD: { zhCN: '持有', enUS: 'Hold', myTxList: [] },
          TXT_OUT_PEX_OWN: { zhCN: '买断', enUS: 'Own', myTxList: [] },
        } : undefined
      ),
      myTxTagNow: 'ALLKINDS',

      aippDict: {
        "MODELS": { "zhCN": "基础模型", "enUS": "Models" },
        "ALLKINDS": { "zhCN": "共享应用", "enUS": "Shared Aipps" },
        "MYCREATED": { "zhCN": "我的应用", "enUS": "My Aipps" }
      },
      aippTagNow: 'MODELS', // 默认的初始 aicodeDefault 是一个基础大模型，因此也默认初始化为 Models 列表，而不是 Aipps 列表。
      accessLevelList: [
        { text: { zhCN: '私密应用', enUS: 'Keep private' }, value: 'PRIVATE' },
        { text: { zhCN: '共享应用', enUS: 'Share with all' }, value: 'PUBLIC' },
        { text: { zhCN: '开源应用', enUS: 'Open Source' }, value: 'OPENSOURCE' },
      ],
      aippKnowbaseIntro: { zhCN: '为了打造更专属的Aipp，您可以添加一些文件到：\n🔍 专属知识库，供 Aipp 查询检索；\n✍️ 专属模版库，供 Aipp 编辑完善。\n您的文件将被严格保密，不会被用于任何其他场景！', enUS: 'To build a more specialized Aipp, you can add files into:\n🔍 Knowledge base for Aipp to search;\n✍️ Template library for Aipp to edit.\nYour files will be strictly protected and will not be used anywhere else!' },

      pactDict: {
        // decrypt - view
        // purchase - hold
        // buy out - own
        VIEWERSHIP: { zhCN: '阅览权', enUS: 'Viewership' },
        HOLDERSHIP: { zhCN: '持有权', enUS: 'Holdership' },
        OWNERSHIP: { zhCN: '所有权', enUS: 'Ownership' },
        VIEW_FORBIDDEN: { zhCN: '禁止阅览', enUS: 'Forbidden' },
        VIEW_PERMIT: { zhCN: '允许阅览', enUS: 'Permitted' },
        VIEW_FREE: { zhCN: '免费阅览', enUS: 'Free' },
        HOLD_FORBIDDEN: { zhCN: '禁止持有', enUS: 'Forbidden' },
        HOLD_PERMIT: { zhCN: '允许持有', enUS: 'Permitted' },
        HOLD_FREE: { zhCN: '免费持有', enUS: 'Free' },
        OWN_FORBIDDEN: { zhCN: '禁止接管', enUS: 'Forbidden' }, // 禁止交易/买断 Non-transferable
        OWN_PERMIT: { zhCN: '允许接管', enUS: 'Permitted' }, // 允许买断 Transferable
        OWN_FREE: { zhCN: '免费接管', enUS: 'Free' },
      },

      linkAgreement: `https://lib.${envar.webDomain}/doc/agreement`,
      linkCommunity: undefined, // `https://lib.${envar.webDomain}/doc/community`,
      linkNews: `https://lib.${envar.webDomain}/news`,
      linkHowtoAipp: `https://lib.${envar.webDomain}/howto/create-aipp`,
      linkHowtoEarn: `https://lib.${envar.webDomain}/howto/earn-money`,
      linkHowtoKnowbase: `https://lib.${envar.webDomain}/howto/filebase`,
      webUrlRoot: `https://u.${envar.webDomain}`, // `http://u.test.${envar.webDomain}:32771`,
      payServerUrl: `https://pay.tic.cc/?`, // 比 pay.${envar.webDomain} 绕弯少，更安全

      linkTagNow: '',
      linkTree: {
        webs: {
          iName: { zhCN: '网站', enUS: 'Websites' },
          subtags: { // todo: maybe rename to linkDict?
            webhome: {
              hiddenLink: false,
              linkkey: 'webhome',
              i18nName: { zhCN: '资讯', enUS: 'Library' },
              i18nPageTitle: { zhCN: '官方资讯', enUS: 'Official Library' },
              infoTitle: { zhCN: '浏览新闻、博客、视频和更多资讯', enUS: 'Browse news, blogs, videos & more' },
              iconType: 'home-filled',
              linkUrl: `https://lib.${envar.webDomain}`,
            },
            github: {
              hiddenLink: false,
              linkkey: 'github',
              i18nName: { zhCN: 'Github', enUS: 'Github' },
              i18nPageTitle: { zhCN: 'Github 仓库', enUS: 'Github Repositories' },
              infoTitle: { zhCN: '查询开发文档，提交功能请求', enUS: 'Submit bug reports & feature requests' },
              iconType: 'icont-platform-github',
              iconPrefix: 'icont-platform',
              linkUrl: `https://github.${envar.webDomain}`,
              // {
              //   AKAIZOIC: { zhCN: 'https://github.com/aippia/cn', enUS: 'https://github.com/aippia/en' },
              //   AKBABELY: { zhCN: 'https://github.com/babelyx/cn', enUS: 'https://github.com/babelyx/en' }
              // }[fenv.appkey],
            },
          },
        },
        apps: { // 建议用和 wo.envar.appNews 一样的结构
          iName: { zhCN: '应用', enUS: 'Apps' },
          subtags: Object.assign({
            webapp: {
              hiddenLink: false,
              linkkey: 'webapp',
              i18nName: { zhCN: '网页', enUS: 'Web' },
              i18nPageTitle: { zhCN: '网页应用', enUS: 'Web App' },
              infoTitle: { zhCN: '一点即开，永远最新', enUS: 'One click to open, always up-to-date' },
              iconType: 'icont-platform-web-fill',
              iconPrefix: 'icont-platform',
              linkUrl: `https://u.${envar.webDomain}`,
            }
          },
            // 虽然在footer和resource页面里，已经做了 v-show 设置，但是在 resource-detail页面里，双层标签页还要进行处理，不如一并在这里统一处理。
            (uniPlatform !== 'app' || fenv.appFrom !== 'GPLAY') ? {
              ios: {
                hiddenLink: false,
                linkkey: 'ios',
                i18nName: { zhCN: '苹果', enUS: 'iOS' },
                i18nPageTitle: { zhCN: 'iOS应用', enUS: 'iOS App' },
                infoTitle: { zhCN: '安装iOS版应用到iPhone/iPad', enUS: 'Install iOS app on iPhone/iPad' },
                iconType: 'icont-platform-ios-fill',
                iconPrefix: 'icont-platform',
                linkUrl: `https://ios.${envar.webDomain}`,
                // {
                //   AKAIZOIC: 'https://apps.apple.com/app/id6449412967',
                //   AKBABELY: 'https://apps.apple.com/app/id6472632215',
                // }[fenv.appkey] || 'https://apps.apple.com/app/id6472773285', // aiMint
              }
            } : undefined
            , (uniPlatform !== 'app' || osName !== 'ios') ? {
              android: {
                hiddenLink: false,
                linkkey: 'android',
                i18nName: { zhCN: '安卓', enUS: 'Android' },
                i18nPageTitle: { zhCN: '安卓应用', enUS: 'Android App' },
                infoTitle: { zhCN: '下载安装安卓版应用', enUS: 'Download & install app for android' },
                iconType: 'icont-platform-android-fill',
                iconPrefix: 'icont-platform',
                linkUrl: `https://apk.${envar.webDomain}`,
                appMarket: {
                  GPLAY: {
                    linkkey: 'GPLAY',
                    i18nName: { zhCN: '谷歌应用市场', enUS: 'Google Play' },
                    linkUrl: `https://gplay.${envar.webDomain}`,
                  }
                }
              },
            } : undefined
          ),
        },
        comms: {
          iName: { zhCN: '社区', enUS: 'Communities' },
          subtags: {
            twitter: {
              hiddenLink: false,
              notIn: ['CN'],
              linkkey: 'twitter',
              i18nName: { zhCN: '推特', enUS: 'Twitter' },
              i18nPageTitle: { zhCN: '推特频道', enUS: 'X (Twitter)' },
              infoTitle: { zhCN: '关注官方推特频道', enUS: 'Follow us in X (Twitter)' },
              iconType: 'icont-platform-twitter-fill',
              iconPrefix: 'icont-platform',
              linkUrl: `https://twitter.${envar.webDomain}`,
            },
            telegram: {
              hiddenLink: false,
              notIn: ['CN'],
              linkkey: 'telegram',
              i18nName: { zhCN: '电报', enUS: 'Telegram' },
              i18nPageTitle: { zhCN: '电报频道', enUS: 'Telegram Channel' },
              infoTitle: { zhCN: '加入全球电报社区，用任意语言聊天', enUS: 'Chat in any language in global community' },
              iconType: 'icont-platform-telegram-fill',
              iconPrefix: 'icont-platform',
              linkUrl: `https://telegram.${envar.webDomain}`,
              // {
              //   AKAIZOIC: 'https://t.me/...',
              //   AKBABELY: 'https://t.me/...'
              // }[fenv.appkey] || 'https://t.me/...',
            },
            youtube: {
              hiddenLink: false,
              notIn: ['CN'],
              linkkey: 'youtube',
              i18nName: { zhCN: 'Youtube', enUS: 'Youtube' },
              i18nPageTitle: { zhCN: 'Youtube Channel', enUS: 'Youtube Channel' },
              infoTitle: { zhCN: '关注并观看我们的视频', enUS: 'Follow and watch us in Youtube' },
              iconType: 'icont-platform-youtube',
              iconPrefix: 'icont-platform',
              linkUrl: `https://youtube.${envar.webDomain}`,
            },
            weixin: {
              hiddenLink: false,
              linkkey: 'weixin',
              i18nName: { zhCN: '微信', enUS: 'Wechat' },
              i18nPageTitle: { zhCN: '微信公众号', enUS: 'Wechat Channel' },
              infoTitle: { zhCN: `关注微信公众号【${envar.callnames?.zhCN}】\n从微信中直接使用${envar.callnames?.zhCN}`, enUS: 'Follow us in Wechat for local services in China' },
              iconType: 'icont-platform-weixin-fill',
              iconPrefix: 'icont-platform',
              linkUrl: { AKAIZOIC: 'http://weixin.qq.com/r/dxP07DDE3W2irXSP90Zl', AKBABELY: 'http://weixin.qq.com/r/oRE_Jr3ECeB2rflF90Sz' }[fenv.appkey], // weixin 公众号不能扫码 https://weixin.${envar.webDomain} 来跳转
            },
            douyin: {
              hiddenLink: false,
              notIn: ['ABC'], // ABC: Anywhere But China
              linkkey: 'douyin',
              i18nName: { zhCN: '抖音', enUS: 'Douyin' },
              i18nPageTitle: { zhCN: '抖音频道', enUS: 'Douyin Channel' },
              infoTitle: { zhCN: `关注抖音频道【${envar.callnames?.zhCN}】`, enUS: 'Follow us in Douyin for local services in China' },
              iconType: 'icont-platform-douyin',
              iconPrefix: 'icont-platform',
              linkUrl: `https://douyin.${envar.webDomain}`,
            },
            bilibili: {
              hiddenLink: false,
              notIn: ['ABC'],
              linkkey: 'bilibili',
              i18nName: { zhCN: '哔哩哔哩', enUS: 'Bilibili' },
              i18nPageTitle: { zhCN: '哔哩哔哩频道', enUS: 'Bilibili Channel' },
              infoTitle: { zhCN: '关注并收看我们的视频', enUS: 'Follow and watch us in Bilibili' },
              iconType: 'icont-platform-bilibili',
              iconPrefix: 'icont-platform',
              linkUrl: `https://bilibili.${envar.webDomain}`,
            },
          },
        },
        recos: {
          hiddenGroup: true,
          iName: { zhCN: '推荐', enUS: 'Portfolio' },
          subtags: Object.assign({
            chainlens: {
              linkkey: 'chainlens',
              i18nName: { zhCN: '永存链', enUS: 'Pexchain' },
              i18nPageTitle: { zhCN: '永存证区块链', enUS: 'The PEX Chain' },
              infoTitle: { zhCN: '查看永存链上的资产', enUS: 'Check assets in the PEX blockchain' },
              iconType: 'settings-filled',
              linkUrl: envar.tucGateway,
            }
          }, fenv.appkey !== 'AKAIZOIC' ? { AKAIZOIC: linkAKAIZOIC } : undefined
            , fenv.appkey !== 'AKBABELY' ? { AKBABELY: linkAKBABELY } : undefined
          )
        },
      },
    },
    envar // 和后台共用的变量。注意，这个 envar 在初始化 store 时，只是前端读取的，还不是后台发来的。
  ),
  mutations: {
    reset_all (state) {
      this.commit('AI/reset_aichat')
      this.commit('Creation/reset_pexdataRaw')
      this.commit('Creation/reset_creation_lists')
      this.commit('Creator/reset_creator_lists')
      this.commit('User/reset_online_user')
      Object.keys(state.myTxDict).forEach(key => {
        state.myTxDict[key].myTxList = []
      })
    },
    reset_all4login (state) {
      this.commit('AI/reset_aichat')
      this.commit('Creation/reset_creation_lists')
      this.commit('Creator/reset_creator_lists')
      this.commit('User/reset_online_user')
      Object.keys(state.myTxDict).forEach(key => {
        state.myTxDict[key].myTxList = []
      })
    }
  },
  actions: {},
  modules: {
    // 模块用大写开头，和顶层（本文件里）的小写变量区分开
    i18n,
    AI,
    Creation,
    Creator,
    Ident,
    Market,
    User,
  },
})
