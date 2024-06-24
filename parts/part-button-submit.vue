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
  <!-- plain 配合 style=border:0 才能够消掉按钮左右两侧微小的一点边框痕迹。但 plain 导致字体一直是黑色，不论是否 disabled，并且 plain 时背景色、字体色都必须通过 style 来调整，不能通过 class，除非用 linear-gradient 的 class -->

  <!-- 禁用时为主色 -->
  <!-- <button
   :disabled="disabled"
    @click="$emit('click')"
    class="border-radius-30px wo-bg-linear-maincolor wo-text-color-white"
    plain
    :style="{color:disabled?'rgba(0,0,0,0.3)':'white'}"
    style="border:0;"
  >-->

  <!-- 禁用时为灰色。缺点是，disabled 改变时，linear的按钮背景不能渐入变化，即使设置 transition -->
  <!--  <button
   :disabled="disabled"
    @click="$emit('click')"
    class="border-radius-30px wo-text-color-white"
    plain
    :class="{'wo-bg-linear-maincolor':!disabled}"
    :style="{backgroundColor:disabled?'#ddd':'none'}"
    style="border:0;color:white;"
  >-->

  <!-- 缺点是要 linear 的背景无法渐入 -->
  <button
    :disabled="disabled"
    :loading="loading"
    :style="{opacity:loading?0.5:disabled?0.2:1}"
    @click="$emit('click')"
    class="wo-bg-linear-maincolor border-radius-30px wo-text-color-white"
    plain
    style="border:0; color:white;"
  >
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
</style>
