<script>
export default {
  data () {
    return {
      i18nPageTitle: { zhCN: '出发', enUS: 'Start' },
    }
  },
  computed: {
  },
  async onLoad () {
  },
  async onShow () {
  },
  methods: {
  },
}
</script>

<template>
  <part-window :style="{ backgroundImage: wo.tt.make_bgurl(wo.envar.portalImage) }" style="background: var(--grey-f) no-repeat center / cover;border-top:0">
    <view class="window-page-900" style="height: 100%; display: flex; flex-flow: column nowrap; justify-content: flex-start">
      <view
        style="flex:none;display: flex; flex-flow: column nowrap; justify-content: between; position:fixed; top:0; left:0;right:0; background:var(--grey-f); z-index:999;"
      >
        <view class="wo-flex column nowrap">
          <view
            :style="{ backgroundImage: `url(${wo.pagesJson.appLogo})`, backgroundColor:wo.envar.clientInfo.appkey==='AKBABELY'?'white':'transparent', marginTop:`${wo.envar.statusBarHeight+20}px` }"
            class="wo-logo-ident wo-select-forbidden"
          ></view>
        </view>
      </view>

      <part-mint style="margin-top:100px"></part-mint>

      <part-show-loading v-if="wo.ss.Ident.autologgingState === 'WAITING'">
        <!-- <part-dev>luk: 1. 等待自动登录结束； 2. 避免在电脑屏幕上 header 和 footer 碰到一起</part-dev> -->
      </part-show-loading>
      <part-creation-all></part-creation-all>

      <view :style="{bottom:wo.envar.inPc?'20px':'16px'}" class="wo-flex end align-center wo-text-color-grey-c" id="_底栏" style="position:fixed;right:0;left:0;">
        <part-lang-table class="wo-bg-color-grey-c" style="position:unset; color:var(--grey-6); border:0; margin:0 10px;"></part-lang-table>
      </view>
    </view>
  </part-window>
</template>

<style lang="scss" scoped>
.lo-appIcon {
  cursor: pointer;
  margin: 0 10px;
  text-shadow: 1px 1px 1px black;
}

.lo-submit-button {
  box-shadow: 3px 3px 10px 0px rgba(0, 0, 0, 0.6);
}
.lo-hover-submit-button:hover {
  box-shadow: 0px 0px 10px 5px var(--main-dark);
}

.lo-hover-aicard:hover {
  box-shadow: 0px 0px 15px 10px rgba(black, 0.6);
}
</style>
