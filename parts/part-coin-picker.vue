<script>
// usage: 
// <part-coin-picker :coinList="Object.values(wo.ss.i18n.cryptocoinSet)" :coinInit="Object.keys(wo.ss.i18n.cryptocoinSet).indexOf(wo.envar.chainCoin)" :coinFixed="true" @change="(coin)=>coinOwnerPact=coin"></part-coin-picker>
export default {
  props: {
    coinList: {
      type: Array,
      default: []
    },
    coinInit: {
      type: Number,
      default: 0
    },
    coinFixed: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      cryptocoinNow: this.coinList[this.coinInit]
    }
  },
  computed: {},
  mounted () { },
  methods: {
  },
}
</script>

<template>
  <picker @change="(e) => { cryptocoinNow = coinList[e.target.value]; $emit('coinPicked', cryptocoinNow) }"
    :disabled="!!coinFixed" :value="coinInit" :range="coinList" range-key="coinCode" style="
        height: 46px;
        box-sizing: border-box;
        border-width: 1px;
        border-style: solid;
        border-radius: 4px;
        padding: 0 5px;
        line-height: 44px;
      " :class="{
        'wo-bg-color-fg': !coinFixed,
        'wo-border-color-border': !coinFixed,
        'wo-border-color-transparent': !!coinFixed
      }">
    <text>{{ cryptocoinNow.coinCode }}</text>
    <template v-if="!coinFixed">
      <uni-icons type="bottom" style="margin-left: 10px"></uni-icons>
    </template>
  </picker>
</template>

<style lang="scss" scoped></style>
