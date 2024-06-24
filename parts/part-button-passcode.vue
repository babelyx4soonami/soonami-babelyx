<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    remainingSeconds: {
      type: Number,
      default: 0
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
  <button
    :disabled="disabled"
    :loading="loading"
    :style="{opacity: disabled ? 0.3 : 1}"
    @click="$emit('click')"
    class="border-radius-30px wo-text-color-white"
    plain
    style="border:0;color:white;background: #f29100"
  >
    <uni-icons color="unset" size="22" type="paperplane" v-show="!loading"></uni-icons>
    <text>{{ wo.ll({ zhCN: '获取验证码', enUS: 'Send passcode' }) }}{{ remainingSeconds ? ` ${remainingSeconds}` : '' }}</text>
  </button>
</template>

<style lang="scss" scoped>
</style>
