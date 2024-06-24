<script>
export default {
  props: {
    prompt: {
      type: [String, Object],
      default: ''
    },
    aboveText: {
      type: [String, Object],
      default: ''
    },
    aboveIcon: {
      type: String,
      default: ''
    },
    aboveAction: {
      type: Function,
      default: null
    },
    belowText: {
      type: [String, Object],
      default: ''
    },
    belowIcon: {
      type: String,
      default: ''
    },
    belowAction: {
      type: Function,
      default: null
    }
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
    <text style="padding: 20px; font-size: large; font-weight:bold; text-align: center; line-height:2em">{{ wo.ll(prompt) }}</text>
    <view @click="aboveAction" class="wo-flex column" style="margin:0 20px 20px;cursor:pointer" v-if="aboveAction">
      <uni-icons :type="aboveIcon || 'refresh'" color="unset" size="26"></uni-icons>
      <text style="flex:none;font-size:12px;">{{wo.ll(aboveText || {zhCN:'刷新',enUS:'Reload'})}}</text>
    </view>
    <button @click="belowAction" class="wo-bg-color-main wo-text-color-fg" style="margin:20px; padding: 0 30px; border-radius: 30px" v-if="belowAction">
      <uni-icons :type="belowIcon" color="unset" size="22"></uni-icons>
      {{ wo.ll(belowText || wo.envar.callnames) }}
    </button>
  </view>
</template>

<style lang="scss" scoped>
</style>
