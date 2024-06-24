<script>
export default {
  data () {
    return {
    }
  },
  async mounted(){
    await wo.tt.wait_autologin()
    this.$forceUpdate()
  },
  computed: {},
  methods: {
  },
}
</script>

<template>
  <view class="part-footer" style="flex: none; width: 100%; flex-flow: column nowrap" v-if="wo.envar.inPc">
    <view id="_信息栏" class="wo-flex between align-center wo-bg-color-grey-3"
      style="flex-flow: row wrap; padding: 0 20px; color: white; box-sizing: border-box">
      <view id="_联系客服" class="wo-flex column" style="margin: 10px; flex: auto">
        <uni-list-item :customStyle="{ padding: '5px 0' }" to="umy-contact" :border="false">
          <view slot="body" class="wo-hover-textcolor-blue-matt wo-flex align-center" style="flex:auto;font-size:16px">
            <uni-icons color="unset" size="22" :custom-prefix="wo.pageSet['umy-contact'].gotoIconPrefix" :type="wo.pageSet['umy-contact'].gotoIconType" style="margin-right:5px"></uni-icons>
            {{ wo.ll(wo.pageSet['umy-contact'].i18nPageTitle) }}
          </view>
        </uni-list-item>  
      </view>

      <view id="_资源区" class="wo-flex column" style="font-size: small; margin: 10px auto">

        <view style="margin: 5px" class="wo-flex align-center">
          <text style="margin-right: 10px; flex: none">{{ wo.ll(wo.ss.linkTree.webs.iName) }}</text>
          <uni-tooltip v-for="(tag, key) in wo.ss.linkTree.webs.subtags" :key="key" :content="wo.envar.inPc?wo.ll(tag.i18nName):''" v-show="!tag.hiddenLink">
            <view class="wo-flex column center align-center lo-resource-item" @click="wo.tt.show_resource(key)">
              <uni-icons v-if="tag.iconType" :custom-prefix="tag.iconPrefix" :type="tag.iconType" color="unset"
                size="22"></uni-icons>
              <image v-else-if="tag.img" :src="tag.img" mode="aspectFit"></image>
            </view>
          </uni-tooltip>
        </view>
        <view style="margin: 5px" class="wo-flex align-center">
          <text style="margin-right: 10px; flex: none">{{ wo.ll(wo.ss.linkTree.apps.iName) }}</text>
          <uni-tooltip v-for="(tag, key) in wo.ss.linkTree.apps.subtags" :key="key" :content="wo.envar.inPc?wo.ll(tag.i18nName):''" v-show="!tag.hiddenLink">
            <view class="wo-flex column center align-center lo-resource-item" @click="wo.tt.show_resource(key)">
              <uni-icons :custom-prefix="tag.iconPrefix" :type="tag.iconType" color="unset" size="22"></uni-icons>
            </view>
          </uni-tooltip>
        </view>
        <view style="margin: 5px" class="wo-flex align-center">
          <text style="margin-right: 10px; flex: none">{{ wo.ll(wo.ss.linkTree.comms.iName) }}</text>
          <uni-tooltip v-for="(tag, key) in wo.ss.linkTree.comms.subtags" :key="key" :content="wo.envar.inPc?wo.ll(tag.i18nName):''" v-show="!tag.hiddenLink">
            <view class="wo-flex column center align-center lo-resource-item" @click="wo.tt.show_resource(key)">
              <uni-icons :custom-prefix="tag.iconPrefix" :type="tag.iconType" color="unset" size="22"></uni-icons>
            </view>
          </uni-tooltip>
        </view>

      </view>

      <view style="flex: auto; display: flex; flex-flow: row-nowrap">
        <part-lang-table style="position:unset; margin: 10px 10px 10px auto;
        color: white; padding: 0 20px; height: 40px; line-height: 40px; font-size:16px;"></part-lang-table>
      </view>
    </view>

    <view id="_状态栏" class="wo-border-color-main wo-bg-color-grey-3" style="
      border-top-width: 4px;
      border-top-style: solid;
      box-sizing: border-box;
      height: 40px;
      display: flex;
      justify-content:space-between;
      align-items: center;
      color: white;
      font-size: small;
      padding: 0 20px;
    ">
      <text style="float:left"></text>
      <view>
        <text style="cursor:pointer;text-align:center; margin:0 20px;" class="wo-hover-textcolor-blue-matt"
          @click="uni.navigateTo({ url: 'user-resource' })">&copy; {{
            wo.ll(wo.envar.callnames) }}</text>
      </view>
      <text style="float:right"></text>
    </view>
    <!-- #ifdef WEB -->
    <!-- <view v-if="wo.envar.clientInfo.deviceType !== 'phone' && wo.ss.i18n.weblandCode === 'CN' && wo.ss.i18n.userlandCode === 'CN' &&  /\baizoi\.cc$/.test(wo.tt.read_varchain('location.hostname', globalThis))" class="wo-bg-color-grey-3"
      style="display:flex;justify-content: center;padding-bottom:2px">
      <a target="_blank" href="https://beian.miit.gov.cn"
        style="text-decoration: none; color: #aaa; font-size: x-small;margin-right:10px">苏ICP备2021054423号-5</a> -->

    <!-- <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=32021402002242"
        style="text-decoration: none; color: #aaa; font-size: x-small;margin-left:10px; display:flex; flex-flow:row nowrap; align-items:center;">
        <img src="/static/gonganbeian.png" style="float:left;" width="12"/>
        <p style="margin: 0px 0px 0px 5px; color:#939393;">苏公安网备 32021402002242号</p>
      </a> -->
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped>
.lo-resource-item {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 100%;
  width: 44px;
  height: 44px;
  margin: 0 5px;
  overflow: hidden;

  &:hover {
    //color: var(--blue-matt);
    background: var(--blue-matt);
  }
}
</style>
