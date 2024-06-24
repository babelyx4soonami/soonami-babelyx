<script>
export default {
  props: {
    shareTitle: { type: [String, Object], default: '' },
    shareUrl: { type: [String, Object], default: '' }
  },
  data () {
    return {}
  },
  computed: {
    urlTitle () { // url 合并 title
      let title = wo.ll(this.shareTitle)
      let urlTitle = wo.ll(this.shareUrl)
      if (title && urlTitle?.startsWith('http')) {
        urlTitle += ((/\?/.test(urlTitle) ? '&' : '?') + `_ut=\n${title}`) // 如果把 urlTitle 拷贝粘贴到浏览器地址栏，浏览器会自动把 \n 替换成一个空格 ' '
      }
      return urlTitle
    }
  },
  mounted () { },
  methods: {
  },
}
</script>

<template>
  <view style="display:flex;flex-flow:row nowrap">
    <view
      :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
      @click="$emit('closeMe'); wo.tt.copy_to_clipboard(urlTitle)"
      class="wo-flex column center align-center"
      style="margin-left:5px;cursor:pointer;width:35px;height:40px;border-radius:10px"
    >
      <uni-icons color="unset" custom-prefix="icont-basic" size="22" type="icont-basic-copy-line"></uni-icons>
      <text style="font-size:10px;line-height:10px">{{wo.ll({zhCN:'拷贝',enUS:'Copy'})}}</text>
    </view>

    <!-- #ifdef APP -->
    <view
      :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
      @click="$emit('closeMe'); uni.shareWithSystem({
        summary: (wo.ll(shareTitle)||wo.envar.slogans).replace(/\n/g,' '),
        href: wo.ll(shareUrl) || wo.envar.webUrlRoot,
        imageUrl: wo.envar.inAppIos ? wo.pagesJson.appLogo : undefined
      })"
      class="wo-flex column center align-center"
      style="margin-left:5px;cursor:pointer;width:35px;height:40px;border-radius:10px"
    >
      <uni-icons :type="wo.ss.iconShare" color="unset" size="22"></uni-icons>
      <text style="font-size:10px;line-height:10px">{{wo.ll({zhCN:'转发',enUS:'Refer'})}}</text>
    </view>
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped>
</style>
