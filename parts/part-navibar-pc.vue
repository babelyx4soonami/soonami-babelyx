<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    backToPage: {
      type: String,
      default: ''
    },
    leftText: {
      type: [String, Object],
      default: ''
    },
    leftIcon: {
      type: String,
      default: ''
    },
    leftPrefix: {
      type: String,
      default: ''
    },
    leftAction: {
      type: Function,
      default: null
    },
    rightText: {
      type: [String, Object],
      default: ''
    },
    rightIcon: {
      type: String,
      default: ''
    },
    rightPrefix: {
      type: String,
      default: ''
    },
    rightAction: {
      type: Function,
      default: null
    }
  },
  data () {
    return {}
  },
  computed: {},
  mounted () { },
  methods: {},
}
</script>

<template>
  <view
    class="wo-flex column center"
    id="_CustomNavibar"
    style="position:relative; width: 100%; height:50px; max-width:900px;margin:0 auto"
    v-if="wo.envar.inPc"
  >
    <view
      :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
      @click="()=>{if (typeof leftAction ==='function') leftAction(); else wo.tt.naviback(backToPage);}"
      style="
        position:absolute;
        left:0;
        padding: 5px 10px;
        cursor:pointer;
        border: 0;
        display: flex;
        align-items: center;
        border-radius: 30px 0 0 30px;
        white-space: nowrap;
        flex: none;
        width:100px;
        overflow:visible;
        display:flex;
        justify-content: flex-start;
        z-index:101;
      "
    >
      <uni-icons :custom-prefix="leftPrefix" :type="leftIcon || 'back'" color="unset" size="18" style="margin: 0 4px 0 0"></uni-icons>
      {{ wo.ll(leftText || { zhCN: '返回', enUS: 'Back' }) }}
    </view>
    <view
      class="text-ellipsis wo-bg-color-grey-f"
      style="padding: 0 120px; font-weight: bold; font-size: medium; text-align: center; z-index:100;"
    >{{ wo.ll(title||wo.tt.thisPage().i18nPageTitle||wo.pageSet[wo.tt.thisPage().route.substring(6)].i18nPageTitle) }}</view>
    <view
      :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
      :style="{opacity:rightAction?'1':'0',cursor:rightAction?'pointer':'unset'}"
      @click="rightAction"
      style="
        position:absolute;
        right:0;
        padding: 5px 10px;
        cursor:pointer;
        border: 0;
        display: flex;
        align-items: center;
        border-radius: 0 30px 30px 0;
        white-space: nowrap;
        flex: none;
        width:100px;
        overflow:visible;
        display:flex;
        justify-content: flex-end;
        z-index:101;
      "
    >
      {{ wo.ll(rightText) }}
      <uni-icons :custom-prefix="rightPrefix" :type="rightIcon || 'forward'" color="unset" size="18" style="margin: 0 0 0 4px"></uni-icons>
    </view>
  </view>
</template>

<style lang="scss" scoped>
</style>
