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
    if (!wo.ss.Creation.myCollectionAsHolder.length && !wo.ss.Creation.myCollectionAsHolder.onceLoaded) { // 首次打开本页面时
      await this.to_get_creations_as_holder()
      wo.ss.Creation.myCollectionAsHolder.onceLoaded = true
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_creations_as_holder () {
      if (!wo.ss.User.onlineUser.usid) {
        return
      }
      if (this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, holderCollection } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_creations_as_holder',
        apiWhat: { skip: wo.ss.Creation.myCollectionAsHolder.length, limit: this.takeLimit }
      })
      wo.tt.hideLoading()

      if (wo.bok(_state)) {
        if (holderCollection.length) {
          //holderCollection.forEach(wo.tt.normalize_creation)
          wo.ss.Creation.myCollectionAsHolder.push(...holderCollection)
        }
        if (holderCollection.length < this.takeLimit) {
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
      :aboveAction="to_get_creations_as_holder"
      :belowAction="()=>uni.switchTab({url:'menu-creation'})"
      :belowIcon="wo.pageSet['menu-creation'].gotoIconType"
      :belowText="wo.pageSet['menu-creation'].i18nPageTitle"
      :prompt="wo.ll({zhCN: '您还没有持有任何作品', enUS: 'You are not holder of any creation'})"
      aboveIcon="refresh"
      v-if="!wo.ss.Creation.myCollectionAsHolder.length"
    ></part-empty-list>
    <template v-else>
      <part-creation-card-list :pexList="wo.ss.Creation.myCollectionAsHolder" :twoColumnOnPhone="true"></part-creation-card-list>
      <part-load-more :loadMoreAction="to_get_creations_as_holder" :loadMoreStatus="loadMoreStatus"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
