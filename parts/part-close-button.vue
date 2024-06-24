<script>
export default {
  props: {
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  },
}
</script>

<template>
  <view :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}" class="wo-text-color-grey-a">
    <uni-icons
      @click="()=>{$emit('closeMe')}"
      color="unset"
      size="40"
      style="cursor:pointer;position:absolute; top:0px;right:0px;border-radius:100%;"
      type="close"
    ></uni-icons>
  </view>
</template>

<style lang="scss" scoped>
</style>
