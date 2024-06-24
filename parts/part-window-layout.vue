<script>
export default {
  data () {
    return {

    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
  },
}
</script>

<template>
  <part-window>
    <view
      :style="{ padding: wo.envar.inPc ? '80px 0 0' : '0' }"
      id="_layout"
      style="min-height:100%; display: flex; flex-flow: column nowrap; box-sizing: border-box;"
    >
      <part-header></part-header>
      <slot></slot>
      <part-footer></part-footer>
    </view>
  </part-window>
</template>

<style lang="scss" scoped>
</style>
