<script>
// https://www.cssscript.com/expanding-spiral-menu/
export default {
  props: {
    actions: {
      type: Object,
      default: () => {
        return {
          copy: { icon: 'trash-filled', action: 'drop', i18T: { zhCN: '删除', enUS: 'Drop' }, color: '#ff2972' },
          mint: { icon: 'fire-filled', action: 'mint', i18T: { zhCN: '铸造', enUS: 'Mint' }, color: '#fee800' },
          // more: { icon: 'more-filled', action: 'more', i18T: 'More', color: '#04fc43' },
          // drop: { icon: 'trash-filled', action: 'drop', i18T: 'Delete', color: '#fe00f1' },
          // edit: { icon: 'edit-filled', action: 'edit', i18T: 'Edit', color: '#00b0fe' },
          // add: { icon: 'wallet-filled', action: 'add', i18T: 'Add', color: '#fea600' },
          // add: { icon: 'more-filled', action: 'add', i18T: 'Add', color: '#a529ff' },
          // add: { icon: 'wallet-filled', action: 'add', i18T: 'Add', color: '#01bdab' },
        }
      }
    },
    fixed: { type: Boolean, default: false },
    showKey: { type: Boolean, default: false }
  },
  data () {
    return {
      bloomed: false,
      actionsNow: this.actions
    }
  },
  computed: {
  },
  methods: {
    toggleMenu (event) {
      this.bloomed = !this.bloomed

      if (!this.fixed && this.bloomed) {
        const menu = this.$refs.menu
        // const rect = menu.getBoundingClientRect() // the size of the rect is toggling between two sizes. You shouldn't rely on it.
        const x = event.detail.x - 120 // - rect.width/2
        const y = event.detail.y + (wo.envar.inProd ? -30 : 10) // - rect.height/2 // 20240328 本来是 -30，但在 dev + web 上发现会向上偏移了几十像素，猜测是因为这几天我提高了输入框的高度以及相应的整个对话窗口的 margin-bottom。在 app 上，不管怎么改都是在屏幕正中。
        // move to the new position
        // #ifdef APP
        //// 20230515 在 app 里，menu.style 不存在！所以自己添加，但即使这样，仍然无法定位准确，不知为何
        menu.style = menu.style || {}
        // #endif
        menu.style.left = `${x}px`
        menu.style.top = `${y}px`
      }

      return true
    },

    setActions (actions) {
      this.actionsNow = actions
    }
  },
}

</script>

<template>
  <view
    :style="{ pointerEvents: bloomed ? 'auto' : 'none', background: bloomed ? 'rgba(0, 0, 0, 0.6)' : 'unset' }"
    @click="bloomed = false"
    ref="container"
    style="position:fixed;z-index:999;width:100%;height:100%;top:0;bottom:0;right:0;left:0;"
  >
    <!--  @click="toggleMenu" -->

    <ul
      :style="{ '--many': Object.keys(actionsNow).length, bottom: `${uni.getSystemInfoSync().screenHeight / 2}px`, left: `${uni.getSystemInfoSync().screenWidth / 2 - 140}px` }"
      class="menu"
      ref="menu"
      style="position:absolute;padding:0;"
    >
      <!-- <part-dev>luk: 这个默认位置是给app-plus的</part-dev> -->

      <div @click="toggleMenu" class="toggleKey" style="position:absolute;" v-if="showKey">
        <uni-icons color="unset" size="36" type="fire"></uni-icons>
      </div>

      <li
        :key="key"
        :style="{
        '--i': index, '--clr': item.color,
        opacity: bloomed ? 1 : 0, transform: bloomed ? 'rotate(calc(360deg / var(--many) * var(--i))) translateX(0px)' : 'rotate(0deg) translateX(90px)'
      }"
        v-for="(item, key, index) in actionsNow"
      >
        <view @click="$emit('clickMenuitem', item.action)" class="menuitem" style="display:flex;flex-direction: column;align-items: center;">
          <uni-icons :custom-prefix="item.customPrefix" :type="item.icon" color="unset" size="36"></uni-icons>
          <text style="font-size:small;padding-bottom:5px;">{{ wo.ll(item.i18T) }}</text>
        </view>
      </li>
    </ul>
  </view>
</template>

<style scoped lang="scss">
/* Menu Items */
.menu li {
  position: absolute;
  list-style: none;
  transition: all 0.3s;
  //transition-delay: calc(0.1s * var(--i));
  transform-origin: 120px; // transform-origin 和 transform translateX 这两个数据保持相差30px就会保持在一个圆心。没有这句，菜单项的弹出/收回落点就不在圆心，而是在圆环上。相差不是30px,落点就会偏移圆心。
  //transform: rotate(0deg) translateX(90px);
  //opacity: 0;

  .menuitem {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    background: var(--clr);
    color: white;
    border: 2px solid var(--clr);
    border-radius: 50%;
    font-size: 1.5em;
    transform: rotate(calc(-360deg / var(--many) * var(--i))); // -8或-360 会保持菜单项目本身不旋转，- 8 就会旋转。猜测是因为被解析 减 8，而不是 负8
    text-decoration: none;
    //filter: grayscale(20%);

    &:hover {
      cursor: pointer;
      // background: var(--clr);
      // color: white;
      box-shadow: 0 0 10px var(--clr), 0 0 20px var(--clr), 0 0 30px var(--clr);
      //filter:unset;
    }
  }
}

.menu .toggleKey {
  position: relative;
  width: 60px;
  height: 60px;
  border: 2px solid green;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  text-align: center;
  z-index: 10000;
  font-size: 2rem;
  transition: transform 2.25s;

  &:hover {
    filter: grayscale(50%);
    box-shadow: 0 0 10px #fff;
  }
}
</style>

