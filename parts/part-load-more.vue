<script>
export default {
  props: {
    loadMoreAction: {
      type: Function,
      default: () => { }
    },
    loadMoreStatus: {
      type: String,
      default: '' // more, loading, noMore。初始值不能设为 loading，否则可能阻止掉所有加载了。也建议不要初始设为 more/noMore，就可以通过 !== more/noMore 来判断是否已完成第一次加载。
    },
    loadMoreText: {
      type: Object,
      default: () => {
        return {}
      }
    },
    bridgeOption: {
      type: Object,
      default: () => ({ loadMoreStatus: '' })
    }
  },
  data () {
    return {
      contentText: Object.assign({
        contentdown: wo.ll({ zhCN: '加载更多', enUS: 'Load more' }),
        contentrefresh: wo.ll({ zhCN: '加载中...', enUS: 'Loading...' }),
        contentnomore: wo.ll({ zhCN: '-- 没有更多了 --', enUS: '-- No more --' })
      }, this.loadMoreText)
    }
  },
  computed: {},
  mounted () { },
  methods: {},
}
</script>

<template>
  <uni-load-more
    :color="['loading','frozen'].includes(loadMoreStatus || bridgeOption.loadMoreStatus) ? 'unset' : 'var(--blue-default)'"
    :content-text="contentText"
    :status="loadMoreStatus || bridgeOption.loadMoreStatus"
    :style="{ cursor: ['loading','frozen'].includes(loadMoreStatus || bridgeOption.loadMoreStatus) ? 'unset' : 'pointer' }"
    @clickLoadMore="['loading','frozen'].includes(loadMoreStatus || bridgeOption.loadMoreStatus) || loadMoreAction()"
    style="margin:10px 0"
  ></uni-load-more>
  <!-- 考虑在底部添加一个按钮，状态分别为 加载，loading, 刷新 -->
</template>

<style lang="scss" scoped></style>
