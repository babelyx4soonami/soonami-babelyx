<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    backToPage: {
      type: String,
      default: ''
    },
    leftText: {
      type: [String, Object],
      default: ''
    },
    leftIcon: {
      type: String,
      default: ''
    },
    leftPrefix: {
      type: String,
      default: ''
    },
    leftAction: {
      type: Function,
      default: null
    },
    rightText: {
      type: [String, Object],
      default: ''
    },
    rightIcon: {
      type: String,
      default: ''
    },
    rightPrefix: {
      type: String,
      default: ''
    },
    rightAction: {
      type: Function,
      default: null
    }
  },
  data () {
    return {}
  },
  computed: {},
  mounted () { },
  methods: {},
}
</script>

<template>
  <view id="_PC导航栏" v-if="wo.envar.inPc">
    <view
      :style="{ top: wo.envar.inPc ? '80px' : 'unset' }"
      class="wo-bg-color-grey-f wo-flex column align-center wo-headbar-shadow"
      style="z-index:850;left:0;right:0;margin:0; padding-top:10px; position:fixed"
    >
      <part-navibar-pc
        :backToPage="backToPage"
        :leftAction="leftAction"
        :leftIcon="leftIcon"
        :leftPrefix="leftPrefix"
        :leftText="leftText"
        :rightAction="rightAction"
        :rightIcon="rightIcon"
        :rightPrefix="rightPrefix"
        :rightText="rightText"
        :title="title"
      ></part-navibar-pc>
    </view>
    <view style="height:60px"></view>
  </view>
</template>

<style lang="scss" scoped>
</style>
