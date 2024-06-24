<script>
export default {
  props: {
    offlineTitle: { type: String, default: '' }
  },
  data () {
    return {
      // 手机浏览器，未登录状态下，先进入 menu-uzone，如果用 wo.ss.pageName，正确显示了语言栏。但是然后进入比如 resource 页面，再返回到 menu-uzone，语言栏就消失了。判断认为，part-window 的 mounted 只在页面初创时调用，返回进入该页面时，wo.ss.pageName 并未更新，于是就出错了。因此用 $route.path 来判断。
      inMenuPage: /menu-/.test(this.$route.path) // 如果在 app 里无法访问 $route，但反正已经被 inWeb 过滤掉了
    }
  },
  computed: {
  },
  async mounted () {
  },
  methods: {
  },
}
</script>

<template>
  <view class="wo-flex column center" style="flex:auto;padding:40rpx 0;">
    <text
      style="line-height: 2em; text-align: center; font-size: x-large; font-weight: bold"
    >{{ wo.ll(offlineTitle || wo.envar.uitIdentify || wo.envar.slogans) }}</text>

    <view class="wo-flex column" style="margin: 40rpx 0">
      <text style="text-align:center;font-size:small;line-height:1.5em;margin-bottom:10px;">
        {{
        wo.ll({ zhCN: '今日注册，赠送 ', enUS: 'Register Now & Get Rewards ' })
        + String(wo.envar.registerReward + wo.envar.inviteeReward) + wo.envar.tucSymbol
        }}
      </text>
      <button
        :class="{'lo-button-identify':wo.envar.inPc}"
        @click="uni.navigateTo({ url: 'ident-begin' })"
        class="wo-bg-linear-maincolor"
        plain
        style="padding: 0 30px; border-radius: 30px;border:0;color:white"
      >
        <uni-icons color="unset" size="22" type="auth"></uni-icons>
        {{
        wo.ll({
        zhCN: '注册登录', enUS: 'Signup or Login'
        })
        }}
      </button>
    </view>

    <view style="margin:40rpx 0 0; display:flex;justify-content: center;">
      <navigator
        :class="{'lo-button-resource':wo.envar.inPc}"
        class="wo-flex column center align-center wo-text-color-blue-default"
        style="font-size:11px;width:60px;height:60px;border-radius:100%;border:1px solid;"
        url="user-resource"
      >
        <uni-icons color="unset" size="24" style="margin:0;padding:0" type="more-filled"></uni-icons>
        {{ wo.ll(wo.pageSet['user-resource'].i18nPageTitle) }}
      </navigator>
    </view>

    <button
      :class="{'lo-button-restart':wo.envar.inPc}"
      @click="uni.reLaunch({ url: 'home-portal' })"
      class="wo-text-color-grey-3"
      plain
      style="flex:none;height:40px; border-radius: 30px; border: 1px solid #ccc; font-size:14px; background: #ddd; margin-top:40px"
      v-if="!wo.envar.inPc"
    >
      <uni-icons color="unset" size="22" type="refresh"></uni-icons>
      {{
      wo.ll({ zhCN: '重启应用', enUS: 'Restart' })
      }}
    </button>

    <part-lang-table style="bottom:62px" v-if="!wo.envar.inPc"></part-lang-table>
  </view>
</template>

<style lang="scss" scoped>
/* #ifdef WEB */
.lo-button-identify:hover {
  box-shadow: 0 0 10px 5px var(--main-dark);
}
.lo-button-resource:hover {
  box-shadow: 0 0 10px 5px var(--blue-dark);
}
.lo-button-restart:hover {
  box-shadow: 0 0 10px 5px var(--green-dark);
  //color:white;
}
/* #endif */
</style>
