<script>
export default {
  props: {
    content: {
      type: [Object, String],
      default: ''
    }
  },
  data () {
    return {
    }
  },
  computed: {},
  mounted () { },
  methods: {},
}
</script>

<template>
  <view>
    <!-- #ifdef WEB -->
    <uni-tooltip :content="wo.ll(content)" v-if="wo.envar.inPc">
      <slot></slot>
    </uni-tooltip>
    <template v-else>
      <slot></slot>
    </template>
    <!-- #endif -->
    <!-- #ifndef WEB -->
    <slot></slot>
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped></style>
