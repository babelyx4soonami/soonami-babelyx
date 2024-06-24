<script>
export default {
  props: {
  },
  data () {
    return {
      langCode: ''
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
  <!-- <part-dev>data-select不适合用于 language，因为本应用里 language selector 经常位于页面最底部，而 data-select 总是向下展开，导致看不见选项</part-dev> -->
  <uni-data-select
    :clear="false"
    :localdata="Object.entries(wo.ss.i18n.langSet).map(([code, native]) => ( { value: code, text: native } ))"
    :styleListed="{fontSize:'14px',color:'var(--grey-6)'}"
    :stylePicked="{fontSize:'16px',color:'black'}"
    class="wo-select-forbidden"
    style="box-sizing: border-box; text-align: right; height: 30px; line-height: 30px; color: white; border-radius: 20px; padding: 0 10px; font-size: small; border: 1px solid var(--grey-e); position: absolute; bottom: 10px; right: 10px;"
    v-model="langCode"
  ></uni-data-select>
</template>

<style lang="scss" scoped>
</style>
