<script>
export default {
  data () {
    return {
      loadMoreStatus: '',
      takeLimit: 10,
      onceLoaded: false
    }
  },
  computed: {
  },
  async mounted () {
    await wo.tt.wait_autologin()
    if (!wo.ss.Creator.myFollowerList.length && !wo.ss.Creator.myFollowerList.onceLoaded) { // 首次打开本页面时
      await this.to_get_my_followers()
      wo.ss.Creator.myFollowerList.onceLoaded = true
    }
    this.onceLoaded = true
  },
  methods: {
    async to_get_my_followers () {
      if (!wo.ss.User.onlineUser.usid || this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, followerList } = await wo.tt.callBase({
        apiWho: 'User',
        apiTodo: 'get_my_followers',
        apiWhat: { skip: wo.ss.Creator.myFollowerList.length, take: this.takeLimit }
      })
      wo.tt.hideLoading()
      if (wo.bok(_state)) {
        if (followerList?.length) {
          wo.ss.Creator.myFollowerList.push(...followerList)
        }
        if (followerList?.length < this.takeLimit) {
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
  <view style="margin:auto" v-if="onceLoaded">
    <!-- margin:auto 使得数量为0或不够铺满屏幕时，显示在屏幕正中。如果 margin:0 就会显示在页面上方 -->
    <part-empty-list
      :aboveAction="to_get_my_followers"
      :belowAction="()=>uni.switchTab({url:'menu-creator'})"
      :belowIcon="wo.pageSet['menu-creator'].gotoIconType"
      :belowText="wo.pageSet['menu-creator'].i18nPageTitle"
      :prompt="wo.ll({zhCN: '您还没有被任何人关注\n请加油哦',enUS:'You have not followed by anyone'})"
      aboveIcon="refresh"
      v-if="!wo.ss.Creator.myFollowerList.length"
    ></part-empty-list>
    <template v-else>
      <part-creator-card-list :creatorList="wo.ss.Creator.myFollowerList"></part-creator-card-list>
      <part-load-more :loadMoreAction="to_get_my_followers" :loadMoreStatus="loadMoreStatus" style="flex:auto"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
