import { langSet, landSet, bankcoinSet, cryptocoinSet, i18tool } from 'wo-core-i18n'

export default {
  state: {
    i18tool,

    langSet: { enUS: langSet.enUS.native, zhCN: langSet.zhCN.native },
    mylang: 'enUS', // 界面显示语言。默认为国际版用户的语言。这是全局性的，整个应用仅维护一个 mylang

    landSet: landSet, // { US: landSet.US, CN: landSet.CN, SG: landSet.SG, DE: landSet.DE, FR: landSet.FR, JP: landSet.JP, KR: landSet.KR, IT: landSet.IT, },
    // 注意有多种不同的国家：
    // phoneland: 电话区号国家。最初根据 userland 设定，然后可以被用户修改。
    // citizenland: 国籍国家。最初根据 userland 设定，然后可以被用户修改。
    // userland: 来访者IP所在国家。根据 weblandCode || geoip 来设置，如果不存在或无效，就随便选一个做默认的国际版用户的国家。
    // webland: 前端服务器所在国家。根据 hostname 里的国家字段来设置，默认为 undefined 即国际版服务器。
    // userland/webland 这两个都是应用启动后就不变的。所以其实可以放到 wo.envar 里，不用实时跟踪。注意，可能有这种情况：weblandCode 代表一个大洲，例如欧洲/非洲，则对应了多个 userlands。
    weblandCode: 'earth', // earth, local, XX
    userlandCode: 'earth', // earth, XX
    phonelandNow: landSet.US, // XX

    bankcoinSet: {
      USD: bankcoinSet.USD,
      CNY: bankcoinSet.CNY,
      EUR: bankcoinSet.EUR,
    },
    bankcoinNow: bankcoinSet.USD,

    cryptocoinSet: {
      TUC: cryptocoinSet.TUC,
      BTC: cryptocoinSet.BTC,
      ETH: cryptocoinSet.ETH,
      USDT: cryptocoinSet.USDT,
    },
    cryptocoinNow: cryptocoinSet.TUC,

    depositCoinSet: {
      //      TUC: cryptocoinSet.TUC,
      //      ETH: cryptocoinSet.ETH,
      USDT: cryptocoinSet.USDT,
      //      USD: bankcoinSet.USD,
      CNY: bankcoinSet.CNY,
    },
    depositCoinNow: cryptocoinSet.USDT,

    // webland2serverland: {
    //   CN: 'cn',
    //   DE: 'eu',
    //   FR: 'eu',
    //   IT: 'eu',
    // },
    land2bankcoin: {
      CN: bankcoinSet.CNY,
      earth: cryptocoinSet.USD,
    },
    land2depositcoin: {
      CN: bankcoinSet.CNY,
      earth: cryptocoinSet.USDT,
    },
    land2lang: {
      CN: 'zhCN',
      earth: 'enUS',
    },
  },
}
