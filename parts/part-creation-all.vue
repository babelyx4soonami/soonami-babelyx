<script>
export default {
  data () {
    return {
      loadMoreStatus: '',
      takeLimit: 12,
      onceLoaded: false,
    }
  },
  computed: {
  },
  async mounted () {
    // 如果直接打开本页面作为首页，onLoad/onShow都有可能在 app.vue 的后台切换到本地之前就被调用，
    // 然后就会导致得不到 creationListAll，因此在这里等待一下，然后再调用获取后台数据
    await wo.tt.wait_autologin()
    if (!wo.ss.Creation.creationListAll.length) { // 首次打开本页面时。由于是 creationListAll，应当不断尝试获取，不需要检测 onceLoaded
      await this.to_get_creation_list()
      wo.ss.Creation.creationListAll.onceLoaded = true
    }
    this.onceLoaded = wo.ss.Creation.creationListAll.onceLoaded
  },
  methods: {
    async to_get_creation_list () {
      if (this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, creationList } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_creation_list',
        apiWhat: { skip: wo.ss.Creation.creationListAll.length, limit: this.takeLimit }
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (creationList?.length) {
          //creationList.forEach(wo.tt.normalize_creation)
          wo.ss.Creation.creationListAll.push(...creationList)
        }
        if (creationList.length < this.takeLimit) {
          this.loadMoreStatus = 'noMore'
          return
        }
      }
      this.loadMoreStatus = 'more'
    },
  },
}
</script>

<template>
  <view style="margin:auto 0" v-if="onceLoaded">
    <!-- 上下auto 使得数量为0或不够铺满屏幕时，显示在屏幕正中。左右0 避免在探索页面，如果pex card宽度为100%会撑破屏幕。 -->
    <part-empty-list
      :aboveAction="to_get_creation_list"
      :belowAction="() => {
        if (wo.envar.clientInfo.appkey === 'AKAIMINT') {
          wo.ss.midTagNow = 'SEAL'
          uni.navigateTo({ url: wo.pagesJson.tabBar.midButton.midPage + '?tagnow=SEAL' })
        } else {
          uni.navigateTo({ url: wo.pagesJson.tabBar.midButton.midPage })
        }
      }"
      :belowText="wo.pageSet[wo.pagesJson.tabBar.midButton.midPage].i18nPageTitle"
      :prompt="wo.ll({ zhCN: '暂时没有找到，请稍候再试', enUS: 'Found nothing yet. Try again later please.' })"
      aboveIcon="refresh"
      v-if="!wo.ss.Creation.creationListAll.length"
    ></part-empty-list>
    <template v-else>
      <part-creation-card-list :pexList="wo.ss.Creation.creationListAll" :twoColumnOnPhone="true"></part-creation-card-list>
      <part-load-more :loadMoreAction="to_get_creation_list" :loadMoreStatus="loadMoreStatus"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
