<script>
export default {
  data () {
    return {
      thisPagePath: this.$route?.path?.substring?.(1) // $route 在 iOS app 里 undefined, $route.xxx 会报错，但好在 app 里并没有真正用到本组件。如果用 wo.ss.pageName 则 data 和 mounted 里并未初始化。但发现在其他组件，例如 part-window-layout-ident 中，data里没有设好，mounted 里的wo.ss.pageName却是正确的
    }
  },
}
</script>

<template>
  <view
    class="part-header wo-bg-color-grey-3"
    style="
      flex: none;
      box-sizing: border-box;
      width: 100%;
      padding: 0 12px;
      position: fixed;
      top:0;
      min-height: 80px;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      color:white;
      z-index:999;
    "
    v-if="wo.envar.inPc"
  >
    <view id="_左侧菜单区" style="display:flex;">
      <div
        :style="{ backgroundImage: `url(${wo.pagesJson.appLogo})` }"
        @click="uni.navigateTo({ url: 'home-portal' })"
        id="_标志"
        style="
        flex:none;
        box-sizing: content-box;
        cursor:pointer;
        width: 60px;
        height: 60px;
        padding: 10px 0;
        background: no-repeat left center / contain;
      "
      ></div>

      <view
        id="_菜单"
        style="align-self: flex-end; flex:auto; display: flex; flex-flow: row nowrap; justify-content: flex-start; font-size:large; padding-left:40px; box-sizing: border-box;"
      >
        <!-- <text
          v-for="(tab, index) in wo.pagesJson.tabBar.list.slice(0, wo.pagesJson.tabBar.list.length - 1)"
          :key="index"
          class="stillTab"
          :class="{ activeTab: thisPagePath === tab.pagePath }"
          style="height:40px; min-width:76px; padding: 8px 20px; margin:0 20px; border-radius: 10px 10px 0 0;cursor:pointer"
          @click="() => { if (thisPagePath !== tab.pagePath) uni.switchTab({ url: tab.pagePath.substr(6) }) }">
          {{ wo.ll(tab.i18nText) }}
        </text>-->
        <button
          :key="index"
          :style="{
            backgroundColor: thisPagePath === tab.pagePath ? '#f3f4f6' : 'transparent',
            color: thisPagePath === tab.pagePath ? '#a0cfff' : 'white',
            cursor: thisPagePath === tab.pagePath ? 'initial' : 'pointer',
          }"
          @click="thisPagePath === tab.pagePath || uni.switchTab({ url: tab.pagePath.substr(6) })"
          class="wo-flex align-center"
          plain
          style="height:40px; padding: 0px 20px; margin:0; border-radius: 10px 10px 0 0;border:0 solid transparent;background-color: transparent; color: white;word-break:keep-all;white-space:nowrap;flex:none"
          v-for="(tab, index) in wo.pagesJson.tabBar.list.slice(0, wo.pagesJson.tabBar.list.length-1)"
        >
          <!-- <part-dev>luk: button 模式下各种试验都无法设置 hover 时的状态。text 模式下可以。</part-dev> -->
          {{ wo.ll(tab.i18nText) }}
        </button>
      </view>
    </view>

    <view
      @click="uni.navigateTo({ url: wo.pagesJson.tabBar.midButton.midPage })"
      class="wo-flex column center align-center wo-bg-color-grey-3"
      id="_中央控制台"
      style="position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;width:60px;height:60px; cursor:pointer;color:white;border-radius: 100%;box-shadow:0 0 5px 3px rgba(48,49,51,0.8);"
      v-show="thisPagePath !== `pages/${wo.pagesJson.tabBar.midButton.midPage}`"
    >
      <uni-icons :type="wo.pagesJson.tabBar.midButton.iconType" color="unset" id="_中央操作图标" size="32"></uni-icons>
      <text style="text-align: center;font-size:14px;">
        {{
        wo.ll(wo.pagesJson.tabBar.midButton.i18nText)
        }}
      </text>
    </view>

    <view id="_右侧账号区" style="display:flex;margin-left:auto">
      <!-- margin-left:auto 使得桌面H5窗口缩小到导航栏折叠时，右侧账号区仍然靠在窗口右侧 -->
      <template v-if="wo.ss.User.onlineUser.usid">
        <view
          @click="uni.navigateTo({ url: 'umy-collection?tagnow=CREATED' })"
          class="wo-flex column end"
          id="_我的作品"
          style="margin:0 20px; cursor:pointer;"
          v-if="wo.envar.clientInfo.appkey!=='AKAIZOIC'"
        >
          <uni-icons
            :customPrefix="wo.pageSet['umy-collection'].gotoIconPrefix"
            :style="{
            color: thisPagePath === 'pages/umy-collection' ? '#a0cfff' : 'white',
            cursor: thisPagePath === 'pages/umy-collection' ? 'initial' : 'pointer',
            background: thisPagePath === 'pages/umy-collection' ? 'white' : 'unset',
          }"
            :type="wo.pageSet['umy-collection'].gotoIconType"
            size="22"
            style="margin:0; width: 32px; height: 32px; line-height: 32px; border-radius:100%;"
          ></uni-icons>
          <text
            style="text-align: center;font-size:12px;"
          >{{(wo.ss.User.onlineUser.countAsCreator + wo.ss.User.onlineUser.countAsOwner - wo.ss.User.onlineUser.countRemoved) || 0 }}</text>
        </view>

        <view
          @click="uni.navigateTo({ url: 'umy-circle?tagnow=FOLLOWING' })"
          class="wo-flex column end"
          id="_我的圈子"
          style="margin:0 20px; cursor:pointer;"
          v-if="wo.envar.clientInfo.appkey!=='AKAIZOIC'"
        >
          <uni-icons
            :custom-prefix="wo.pageSet['umy-circle'].gotoIconPrefix"
            :style="{
            color: thisPagePath === 'pages/umy-circle' ? '#a0cfff' : 'white',
            cursor: thisPagePath === 'pages/umy-circle' ? 'initial' : 'pointer',
            background: thisPagePath === 'pages/umy-circle' ? 'white' : 'unset',
          }"
            :type="wo.pageSet['umy-circle'].gotoIconType"
            size="22"
            style="margin:0; width: 32px; height: 32px; line-height: 32px; border-radius:100%;"
          ></uni-icons>
          <text style="text-align: center;font-size:12px;">{{ parseInt(wo.ss.User.onlineUser.countFollower+wo.ss.User.onlineUser.countFollowing) || 0}}</text>
        </view>

        <view @click="uni.navigateTo({ url: 'umy-assets' })" class="wo-flex column end" id="_我的资金" style="margin:0 20px; cursor:pointer;">
          <uni-icons
            :custom-prefix="wo.pageSet['umy-assets'].gotoIconPrefix"
            :style="{
            color: thisPagePath === 'pages/umy-assets' ? '#a0cfff' : 'white',
            cursor: thisPagePath === 'pages/umy-assets' ? 'initial' : 'pointer',
            background: thisPagePath === 'pages/umy-assets' ? 'white' : 'unset',
          }"
            :type="wo.pageSet['umy-assets'].gotoIconType"
            size="22"
            style="margin:0; width: 32px; height: 32px; line-height: 32px; border-radius:100%;"
          ></uni-icons>
          <text style="text-align: center;font-size:12px;white-space: nowrap;">
            {{
            wo.tt.number_precision(wo.ss.User.onlineUser.balanceTUC,0) + wo.envar.tucSymbol
            }}
          </text>
        </view>
      </template>

      <view id="_我的账户" style="margin-left:30px;">
        <uni-icons
          :style="{
            cursor: thisPagePath === 'pages/ident-begin' ? 'initial' : 'pointer',
            color: thisPagePath === 'pages/ident-begin' ? '#a0cfff' : 'white',
            boxShadow: thisPagePath === 'pages/ident-begin' ? '0 0 15px 5px rgba(255,255,255,0.8)' : 'initial',
            backgroundColor: thisPagePath === 'pages/ident-begin' ? 'white' : 'initial',
          }"
          :type="thisPagePath === 'pages/ident-begin' ? 'person-filled' : 'person'"
          @click="uni.navigateTo({ url: 'ident-begin' })"
          id="_未登录账户图标"
          size="56"
          style="width: 60px; height: 60px; line-height: 60px; cursor:pointer; border-radius: 100%;"
          v-if="!wo.ss.User.onlineUser.usid"
        ></uni-icons>
        <view
          :style="{
            color: thisPagePath === 'pages/menu-uzone' ? '#a0cfff' : 'white',
            borderColor: thisPagePath === 'pages/menu-uzone' || wo.ss.User.onlineUser.portrait ? 'transparent' : 'white',
            cursor: thisPagePath === 'pages/menu-uzone' ? 'initial' : 'pointer',
            //opacity: thisPagePath === 'pages/menu-uzone' ? 1 : 0.7,
            boxShadow: thisPagePath === 'pages/menu-uzone' ? '0 0 15px 5px rgba(255,255,255,0.8)' : 'initial',
            backgroundColor: thisPagePath === 'pages/menu-uzone' ? 'white' : '#606266',
            backgroundImage: wo.tt.make_bgurl(wo.ss.User.onlineUser.portrait),
          }"
          @click="uni.switchTab({ url: 'menu-uzone' })"
          id="_已登录"
          style="width: 60px; height: 60px; line-height: 56px; text-align:center; box-sizing:border-box; background: no-repeat center / cover border-box; border-radius: 100%; border-width:2px; border-style:solid; font-size:26px; overflow:hidden; word-break: keep-all;"
          v-else
        >{{ wo.ss.User.onlineUser.portrait ? '' : wo.ss.User.onlineUser.nickname.substr(0, 2) }}</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
// .activeTab {
//   background-color: var(--bg);
//   color: var(--blue-matt);
//   cursor: initial;
// }

// .stillTab {
//   &:hover {
//     color: var(--blue-matt);
//   }
// }
</style>
