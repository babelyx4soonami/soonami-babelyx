<script>
export default {
  props: {
  },
  data () {
    return {}
  },
  computed: {},
  mounted () { },
  methods: {
  },
}
</script>

<template>
  <view class="wo-flex column center align-center" style="flex:auto">
    <button :loading="true" plain style="background:transparent;border:0;"></button>
    <text class="wo-text-color-grey">{{wo.ll({zhCN:'加载中...',enUS:'Loading...'})}}</text>
  </view>
</template>

<style lang="scss" scoped>
</style>
