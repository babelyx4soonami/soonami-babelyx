<script>
// usage:
/*
      <part-navilink style="width:730px;margin:0 auto;" :linkList="[
        { target: 'menu-uzone', name: wo.ll({ zhCN: '我的账户', enUS: 'My Account' }) },
        { target: 'umy-account', name: { zhCN: '我的账号', enUS: 'My Account' } },
      ]"></part-navilink>
*/
export default {
  props: {
    linkList: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {}
  },
  computed: {},
  mounted () {
    let pages = getCurrentPages()
    pages.map(page => {
      return {
        i18nPageTitle: page.$data.i18nPageTitle,

      }
    })
  },
  methods: {
    jump_to ({ target, type }) {
      type = type || wo.pagesJson.tabBar.list.map((tab) => tab.pagePath.substr(6)).includes(target) ? 'switchTab' : 'navigateTo'
      uni[type]({
        url: target,
      })
    },
  },
}
</script>

<template>
  <view id="_面包屑导航" style="display:flex;flex-flow: row wrap; margin:0 0 20px 0;" v-if="wo.envar.inPc">
    <view :key="index" v-for="(link, index) in linkList">
      <text style="margin:0 10px;">/</text>
      <text @click="jump_to(link)" class="wo-text-color-blue-default" style="font-style:italic; cursor: pointer">
        {{
        wo.ll(link.name)
        }}
      </text>
    </view>
    <view>
      <text style="margin:0 10px;">/</text>
      <text style="font-style:italic; ">{{ wo.ll(wo.tt.thisPage().i18nPageTitle) }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
</style>
