<script>
export default {
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  async mounted () {
    await wo.tt.wait_autologin()
    if (wo.ss.User.onlineUser.usid) {
      uni.reLaunch({ url: 'home-portal' })
    } else if (wo.envar.inProd && !wo.ss.Ident.commid && getCurrentPages().pop().pageName !== 'ident-begin') {
      uni.redirectTo({ url: 'ident-begin' })
    }
  },
  methods: {
  },
}
</script>

<template>
  <part-window>
    <view
      :style="{ padding: wo.envar.inPc ? '80px 0 0' : '0' }"
      id="_layout-ident"
      style="min-height:100%; display: flex; flex-flow: column nowrap; box-sizing: border-box;"
    >
      <part-header></part-header>

      <template v-if="['AUTOLOGIN_SUCCESS', 'AUTOLOGIN_FAIL'].includes(wo.ss.Ident.autologgingState)">
        <view class="window-page-900 window-page-ident">
          <part-navibar-pc-fixed></part-navibar-pc-fixed>

          <view :style="{backgroundImage:`url(${wo.pagesJson.appLogo})`}" class="wo-logo-ident" v-if="!wo.envar.inPc"></view>
          <view style="height:40px" v-else></view>

          <slot v-if="!wo.ss.User.onlineUser.usid"></slot>
        </view>

        <view class="wo-flex end align-center" id="_底栏" style="color:lightgrey; position:fixed;bottom:12px;right:0;left:0;" v-if="!wo.envar.inPc">
          <view class="wo-flex start align-center">
            <!-- #ifdef WEB -->
            <view :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}" @click="wo.tt.show_resource('ios')" class="lo-appIcon">
              <uni-icons :custom-prefix="wo.ss.linkTree.apps.subtags.ios.iconPrefix" :type="wo.ss.linkTree.apps.subtags.ios.iconType" color="unset" size="30"></uni-icons>
            </view>
            <view :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}" @click="wo.tt.show_resource('android')" class="lo-appIcon">
              <uni-icons
                :custom-prefix="wo.ss.linkTree.apps.subtags.android.iconPrefix"
                :type="wo.ss.linkTree.apps.subtags.android.iconType"
                color="unset"
                size="30"
              ></uni-icons>
            </view>
            <!-- #endif -->
            <!-- #ifdef APP -->
            <!-- <view @click="wo.tt.show_resource('webapp')" class="lo-appIcon" :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}">
            <uni-icons
              :custom-prefix="wo.ss.linkTree.apps.subtags.webapp.iconPrefix"
              :type="wo.ss.linkTree.apps.subtags.webapp.iconType"
              color="unset"
              size="30"
            ></uni-icons>
            </view>-->
            <!-- #endif -->
            <view :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}" @click="uni.navigateTo({url:'umy-contact'})" class="lo-appIcon">
              <uni-icons :custom-prefix="wo.pageSet['umy-contact'].gotoIconPrefix" :type="wo.pageSet['umy-contact'].gotoIconType" color="unset" size="30"></uni-icons>
            </view>
            <view :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}" @click="uni.navigateTo({url:'user-resource'})" class="lo-appIcon">
              <uni-icons color="unset" size="28" type="more-filled"></uni-icons>
            </view>
          </view>
          <part-lang-table style="position:unset;margin:0 10px;"></part-lang-table>
        </view>
      </template>

      <part-show-loading v-else>
        <!-- <part-dev>luk: 1. 等待自动登录结束； 2. 避免在电脑屏幕上 header 和 footer 碰到一起</part-dev> -->
      </part-show-loading>

      <part-footer></part-footer>
    </view>
  </part-window>
</template>

<style lang="scss" scoped>
.lo-appIcon {
  cursor: pointer;
  margin: 0 10px;
}
</style>
