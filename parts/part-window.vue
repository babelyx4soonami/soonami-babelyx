<script>
export default {
  data () {
    return {
      pageNow: getCurrentPages().pop() // 注意到，navigateBack到之前页面时，并不会重新 mounted，导致绑定在 this 上的变量丢失，因此通过 getCurrentPages().pop() 来绑定。
    }
  },
  computed: {},
  async mounted () {
    // 但是这个方法，只在页面首次挂载时调用，再次显示该页面时不被再次调用，导致 setBarTitles 并不及时更新底部标签。
    // 为了避免此问题，应当在修改语言后，调用任意一个标签页面的 setBarTitles 来强制重载所有页面的标签栏 或 this.$forceUpdate 重载当前页面。
    wo.tt.setBarTitles()

    //this.pageNow.mytoast = this.$refs.mytoast
    this.pageNow.mypopup = this.$refs.mypopup

    // 在 App.vue 里没有 getCurrentPages()，但是有 getApp()。
    // 在其他页面里，getCurrentPages().pop().$route === getApp().$route === getApp()._route === getApp().$router.currentRoute === getApp().$options.$router.currentRoute;
    // $mp.page.route === getCurrentPages().pop().route === this.route === 'pages/...';
    // getCurrentPages().pop().$route.path === getApp().$route.path === '/pages/...' 或者 '/' 如果在首页;
    this.pageNow.pageName = this.$mp?.page?.route || this.$route?.path || getApp().$route?.path || getCurrentPages().pop().route // 注意到，在 app 里，只有 this.$mp 可用，其他 undefined; 在 web 里，this/getApp()/getCurrentPages().pop().$route 可用，其他 undefined
    // console.log('!!!!!!!!!!!!!!!!', this.pageNow.pageName)
    // console.log('this.route=', this.route) // this.route 在直接页面里才有，在组件和App.vue/getApp()里没有
    // console.log('this.$route=', this.$route) // $route 在 web 里的组件和App.vue/getApp()里也有
    // console.log('this.$mp=', this.$mp)
    // console.log('getApp().$route=', getApp().$route) // 在 app 里 undefined。可能因为是在组件里？
    // console.log('getCurrentPages().pop().$route=', getCurrentPages().pop().$route) // 在 app 里 undefined。可能因为是在组件里？

    this.pageNow.pageName = this.pageNow.pageName?.split?.('/')?.pop?.() || 'home-portal' // 有时在home-portal页但是 this.$route.path==='/'，浏览器路径显示为 /#/，（但这时的 getCurrentPages().pop().route===this.$mp.page.route==='pages/home-portal' 是完整的），这时强制设为 'home-portal'
    this.pageNow.naviStyleCustom = wo.pageSet?.[this.pageNow.pageName]?.style?.navigationStyle === 'custom'

    if (wo.envar?.inPc) {
      this.pageNow.popMarginTop = '60px' // 不明白为什么，但是设为真正的顶栏高度80px，反而导致出现空白
    } else if (wo.envar?.inApp) { // app 上的全屏页(navigationStyle:custom)，需要把popup下移status bar高度。而其他具有系统导航栏的二级子页面不需要。
      if (this.pageNow.naviStyleCustom) {
        this.pageNow.popMarginTop = wo.envar?.statusBarHeight + 'px'
      }
      // 20231227 现在在手机app上允许自制导航栏被覆盖了，不需要额外加导航栏高度。
      // if (/mid-/.test(this.pageNow.pageName) && this.pageNow.pageName.split('-').length === 2) {
      //   this.pageNow.popMarginTop = (wo.envar?.statusBarHeight + 80) + 'px'
      // }
    } // else if (/mid-/.test(this.pageNow.pageName) && this.pageNow.pageName.split('-').length === 2) { // 全屏行动页
    // 20231227 现在在手机web上允许自制导航栏被覆盖了
    // this.pageNow.popMarginTop = '80px'
    // }

    // 采用我自己的 <uni-forms-item data-checkrule="..."> 写法，需要在相应每个页面的 onReady 或统一在这个组件 mounted 里收集验证规则：
    // let rules = {}
    // let elid = 0
    // for (let el of document?.getElementsByClassName?.('uni-forms-item')) {
    //   if (el.dataset.checkrule) {
    //     rules[elid++] = { rules: eval(el.dataset.checkrule) } //  data-checkrule="[...]"
    //     //rules[elid++] = { rules: JSON.parse(el.dataset.checkrule) } // :data-checkrule="JSON.stringify([...])"
    //   }
    // }
    // if (Object.keys(rules).length) {
    //   wo.tt.thisPage().$refs.form.setRules(rules) // 似乎，通过 setRules 的会放在 form.formRules 和 form.rules，而通过 <uni-form :rules="..."> 会放在 form.rules。但是在这里合并起来也没用，只要设了 <uni-form :rules="..."> 就只会使用它。
    // }
  },
  methods: {
  },
}
</script>

<template>
  <!-- 在 PC Web 上，需要 z-index: 999; 否则会在导航页面（即 navigationStyle 不是 custom）的顶部显示一个和手机一样的导航条 uni-page-head -->
  <!-- 在 position:fixed 使得在 app 里，点按空白处下拉，包含状态条的整个页面不会下移 -->
  <view
    :style="{borderTop: pageNow.naviStyleCustom?'var(--status-bar-height) solid black':'unset', zIndex:wo.envar.inPc?'999':'unset',
    position: (wo.envar.inWeb && !wo.envar.inPc ) ? 'absolute' : 'fixed'}"
    class="window-canvas wo-bg-color-bg"
    style="position:fixed;left:0;right:0;bottom:0;top:0"
  >
    <!-- 所有页面分3类：底栏标签页，顶栏导航页，全屏页。其中 标签页+全屏页 需要设置 var(--status-bar-height) -->
    <uni-popup :style="{ marginTop: pageNow.popMarginTop || 'initial' }" ref="mypopup" style="text-align: center;margin-top:0;z-index:999" type="message">
      <!-- <part-dev>luk: 如果 header 设了 z-index，会遮掉 popup，那就需要设 marginTop。popup本身内含marginTop 20px，无法取消。</part-dev> -->
      <uni-popup-message :duration="wo.ss.popDuration" :message="wo.ss.popMessage" :type="wo.ss.popType"></uni-popup-message>
    </uni-popup>
    <!--    <ucToast ref="mytoast"></ucToast> -->
    <slot></slot>
  </view>
</template>

<style lang="scss" scoped>
.window-canvas {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.window-canvas::-webkit-scrollbar {
  width: 0 !important;
}
</style>
