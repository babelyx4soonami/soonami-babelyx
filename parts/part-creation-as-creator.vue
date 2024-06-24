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
    if (!wo.ss.Creation.myCollectionAsCreator.length && !wo.ss.Creation.myCollectionAsCreator.onceLoaded) { // 首次打开本页面时
      await this.to_get_creations_as_creator()
      wo.ss.Creation.myCollectionAsCreator.onceLoaded = true
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_creations_as_creator () {
      if (!wo.ss.User.onlineUser.usid) {
        return
      }
      if (this.loadMoreStatus === 'loading') {
        return
      }

      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, creatorCollection } = await wo.tt.callBase({
        apiWho: 'Creation',
        apiTodo: 'get_creations_as_creator',
        apiWhat: { skip: wo.ss.Creation.myCollectionAsCreator.length, limit: this.takeLimit }
      })
      wo.tt.hideLoading()

      if (wo.bok(_state)) {
        if (creatorCollection.length) {
          //creatorCollection.forEach(wo.tt.normalize_creation)
          wo.ss.Creation.myCollectionAsCreator.push(...creatorCollection)
        }
        if (creatorCollection.length < this.takeLimit) {
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
      :aboveAction="to_get_creations_as_creator"
      :prompt="wo.ll({ zhCN: '您还没有创造任何可能', enUS: 'You have not created any possibility' })"
      aboveIcon="refresh"
      v-if="!wo.ss.Creation.myCollectionAsCreator.length"
    ></part-empty-list>
    <template v-else>
      <part-creation-card-list :hideAvatar="true" :pexList="wo.ss.Creation.myCollectionAsCreator" :twoColumnOnPhone="true"></part-creation-card-list>
      <part-load-more :loadMoreAction="to_get_creations_as_creator" :loadMoreStatus="loadMoreStatus"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
