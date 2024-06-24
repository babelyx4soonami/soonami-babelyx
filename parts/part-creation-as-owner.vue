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
    if (!wo.ss.Creation.myCollectionAsOwner.length && !wo.ss.Creation.myCollectionAsOwner.onceLoaded) { // 首次打开本页面时
      await this.to_get_creations_as_owner()
      wo.ss.Creation.myCollectionAsOwner.onceLoaded = true
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_creations_as_owner () {
      if (!wo.ss.User.onlineUser.usid) {
        return
      }
      if (this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, ownerCollection } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_creations_as_owner',
        apiWhat: { skip: wo.ss.Creation.myCollectionAsOwner.length, limit: this.takeLimit }
      })
      wo.tt.hideLoading()

      if (wo.bok(_state)) {
        if (ownerCollection.length) {
          //ownerCollection.forEach(wo.tt.normalize_creation)
          wo.ss.Creation.myCollectionAsOwner.push(...ownerCollection)
        }
        if (ownerCollection.length < this.takeLimit) {
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
      :aboveAction="to_get_creations_as_owner"
      :belowAction="()=>uni.switchTab({url:'menu-creation'})"
      :belowIcon="wo.pageSet['menu-creation'].gotoIconType"
      :belowText="wo.pageSet['menu-creation'].i18nPageTitle"
      :prompt="wo.ll({zhCN: '您还没有买断任何作品', enUS: 'You haven\'t poccessed any creation'})"
      aboveIcon="refresh"
      v-if="!wo.ss.Creation.myCollectionAsOwner.length"
    ></part-empty-list>
    <template v-else>
      <part-creation-card-list :pexList="wo.ss.Creation.myCollectionAsOwner" :twoColumnOnPhone="true"></part-creation-card-list>
      <part-load-more :loadMoreAction="to_get_creations_as_owner" :loadMoreStatus="loadMoreStatus"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
