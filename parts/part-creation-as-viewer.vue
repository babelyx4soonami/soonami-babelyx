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
    await wo.tt.wait_autologin()
    if (!wo.ss.Creation.myCollectionAsViewer.length && !wo.ss.Creation.myCollectionAsViewer.onceLoaded) {// 首次打开本页面时
      await this.to_get_creations_as_viewer()
      wo.ss.Creation.myCollectionAsViewer.onceLoaded = true
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_creations_as_viewer () {
      if (!wo.ss.User.onlineUser.usid) {
        return
      }
      if (this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, viewerCollection } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_creations_as_viewer',
        apiWhat: { skip: wo.ss.Creation.myCollectionAsViewer.length, limit: this.takeLimit }
      })
      wo.tt.hideLoading()

      if (wo.bok(_state)) {
        if (viewerCollection.length) {
          //viewerCollection.forEach(wo.tt.normalize_creation)
          wo.ss.Creation.myCollectionAsViewer.push(...viewerCollection)
        }
        if (viewerCollection.length < this.takeLimit) {
          this.loadMoreStatus = 'noMore'
          return
        }
      }
      this.loadMoreStatus = 'more'
    }
  },
}
</script>

<template>
  <view style="margin:auto 0" v-if="onceLoaded">
    <!-- auto: 不满屏则置中 -->
    <part-empty-list
      :aboveAction="to_get_creations_as_viewer"
      :belowAction="()=>uni.switchTab({url:'menu-creation'})"
      :belowIcon="wo.pageSet['menu-creation'].gotoIconType"
      :belowText="wo.pageSet['menu-creation'].i18nPageTitle"
      :prompt="wo.ll({zhCN: '您还没有解密任何作品', enUS: 'You have not decrypted any creation'})"
      aboveIcon="refresh"
      v-if="!wo.ss.Creation.myCollectionAsViewer.length"
    ></part-empty-list>
    <template v-else>
      <part-creation-card-list :pexList="wo.ss.Creation.myCollectionAsViewer" :twoColumnOnPhone="true"></part-creation-card-list>
      <part-load-more :loadMoreAction="to_get_creations_as_viewer" :loadMoreStatus="loadMoreStatus"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
