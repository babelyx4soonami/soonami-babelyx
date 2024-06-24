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
    if (!wo.ss.Creator.creatorListAll.length) { // 首次打开本页面时。由于是 creatorList，应当不断尝试获取，不需要检测 onceLoaded
      await this.to_get_creator_list()
      wo.ss.Creator.creatorListAll.onceLoaded = true
    }
    this.onceLoaded = wo.ss.Creator.creatorListAll.onceLoaded
  },
  methods: {
    async to_get_creator_list () {
      if (this.loadMoreStatus === 'loading') {
        return
      }
      this.loadMoreStatus = 'loading'
      wo.tt.showLoading()
      let { _state, creatorList } = await wo.tt.callBase({
        apiWho: 'User',
        apiTodo: 'get_creator_list',
        apiWhat: { skip: wo.ss.Creator.creatorListAll.length, limit: this.takeLimit }
      })
      wo.tt.hideLoading()

      if (wo.bok(_state)) {
        if (creatorList?.length) {
          wo.ss.Creator.creatorListAll.push(...creatorList)
        }
        if (creatorList.length < this.takeLimit) {
          this.loadMoreStatus = 'noMore'
        } else {
          this.loadMoreStatus = 'more'
        }
      } else {
        this.loadMoreStatus = 'noMore'
        // wo.tt.showToast({ type: wo.color.RED, title: wo.ll({ zhCN: '加载失败，请稍后再试', enUS: 'Loading failed. Try again later.' }) })
      }
    },
  },
}
</script>

<template>
  <view style="margin:auto 0" v-if="onceLoaded">
    <!-- margin:auto 使得数量为0或不够铺满屏幕时，显示在屏幕正中。如果 margin:0 就会显示在页面上方 -->
    <part-empty-list
      :aboveAction="to_get_creator_list"
      :prompt="wo.ll({ zhCN: '暂时没有找到，请稍候再试', enUS: 'Found nothing yet. Try again later please.' })"
      aboveIcon="refresh"
      v-if="!wo.ss.Creator.creatorListAll.length"
    ></part-empty-list>
    <template v-else>
      <part-creator-card-list :creatorList="wo.ss.Creator.creatorListAll"></part-creator-card-list>
      <part-load-more :loadMoreAction="to_get_creator_list" :loadMoreStatus="loadMoreStatus" style="flex:auto"></part-load-more>
    </template>
  </view>
  <part-show-loading v-else></part-show-loading>
</template>

<style scoped lang="scss"></style>
