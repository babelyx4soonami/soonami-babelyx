<script>
export default {
  props: {
    showCode: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      thisLangList: Object.entries(wo.ss.i18n.langSet).map(([code, native]) => ({ code, langCode: code.substring(0, 2), landCode: code.substring(2), native })),

      // 手机浏览器，未登录状态下，先进入 menu-uzone，如果用 wo.ss.pageName，正确显示了语言栏。但是然后进入比如 resource 页面，再返回到 menu-uzone，语言栏就消失了。判断认为，part-window 的 mounted 只在页面初创时调用，返回进入该页面时，wo.ss.pageName 并未更新，于是就出错了。因此用 $route.path 来判断。
      marginBottom: (wo.envar.inWeb && !wo.envar.inPc && /menu-/.test(this.$route.path)) ? '52px' : '0' // npc web && menu-* 页面需要让开底部的菜单栏。如果在 app 里无法访问 $route，但反正已经被 inWeb 过滤掉了
    }
  },
  computed: {

  },
  mounted () { },
  methods: {
  },
}
</script>

<template>
  <view
    :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
    @click="$refs.dialogLang.open()"
    class="wo-select-forbidden wo-text-color-grey"
    style="cursor:pointer; box-sizing: border-box; text-align: right; height: 32px; line-height: 32px; font-size: 14px; border-radius: 20px; padding: 0 10px; border: 1px solid lightgrey; position: fixed; bottom: 12px; right: 10px;"
  >
    <view style="display: flex; flex-flow: row nowrap">
      <text style="margin: 0 8px 0 4px;">{{ showCode ? wo.ss.i18n.mylang.substring(0,2) : wo.ss.i18n.langSet[wo.ss.i18n.mylang] }}</text>
      <uni-icons color="unset" type="bottom"></uni-icons>
    </view>

    <uni-popup :type="wo.envar.inPc?'center':'bottom'" background-color="white" ref="dialogLang" style="z-index:999;">
      <view :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth600, marginBottom: marginBottom }" class="wo-flex column" style="max-height:75vh">
        <uni-table style="flex:none;overflow:visible;">
          <!-- <part-dev>luk: uni-table有排序和搜索功能,但无法点击选择某一行,并且表头无法固定不动.因此和uni-list联合起来使用</part-dev> -->
          <uni-tr>
            <uni-th
              @sort-change="({ order }) => {
                if (order === 'ascending') {
                  thisLangList.sort((x, y) => x.langCode < y.langCode ? -1 : 1)
                } else if (order === 'descending') {
                  thisLangList.sort((x, y) => x.langCode < y.langCode ? 1 : -1)
                }
              }"
              align="left"
              sortable
              style="cursor:pointer;padding-left:10px"
              width="25%"
            >{{ wo.ll({ zhCN: '代号', enUS: 'Code' }) }}</uni-th>

            <uni-th
              @sort-change="({ order }) => {
                if (order === 'ascending') {
                  thisLangList.sort((x, y) => x.native.localeCompare(y.native, wo.ss.i18n.mylang.substring(0, 2)))
                } else if (order === 'descending') {
                  thisLangList.sort((x, y) => y.native.localeCompare(x.native, wo.ss.i18n.mylang.substring(0, 2)))
                }
              }"
              align="center"
              sortable
              style="cursor:pointer; padding-right:10px"
              width="50%"
            >{{ wo.ll({ zhCN: '语言', enUS: 'Language' }) }}</uni-th>

            <uni-th
              @sort-change="({ order }) => {
                if (order === 'ascending') {
                  thisLangList.sort((x, y) => x.landCode < y.landCode ? -1 : 1)
                } else if (order === 'descending') {
                  thisLangList.sort((x, y) => x.landCode < y.landCode ? 1 : -1)
                }
              }"
              align="right"
              sortable
              style="cursor:pointer; padding-right:10px"
              width="25%"
            >{{ wo.ll({ zhCN: '地区', enUS: 'Location' }) }}</uni-th>
          </uni-tr>
          <uni-tr></uni-tr>
        </uni-table>
        <view class="listContainer" style="flex:auto;overflow-y:auto;color:black">
          <uni-list>
            <uni-list-item
              :border="false"
              :customStyle="{ padding: '', backgroundColor: lang.code === wo.ss.i18n.mylang ? '#f3f4f6' : 'unset' }"
              :key="index"
              @click="wo.tt.pick_lang(lang.code); $refs.dialogLang.close()"
              clickable
              v-for="(lang, key, index) of thisLangList"
            >
              <view slot="header" style="flex:none;display: flex;flex-flow:row nowrap;align-items: center;">{{ lang.langCode }}</view>
              <view class="text-ellipsis" slot="body" style="flex:auto; text-align:center;">{{ wo.ll(lang.native) }}</view>
              <view slot="footer" style="flex:none;text-align:right">{{lang.landCode}}</view>
            </uni-list-item>
          </uni-list>
          <uni-load-more :contentText="{ contentnomore: '----' }" status="noMore"></uni-load-more>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss" scoped>
//.listContainer::-webkit-scrollbar{width:0 !important}
</style>
