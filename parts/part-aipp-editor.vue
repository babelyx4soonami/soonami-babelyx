<script>
export default {
  props: {
    aippNow: {
      type: Object,
      default: () => ({})
    },
    feedbackInit: {
      type: [Object, String],
      default: ''
    },
    bridgeOption: {
      type: Object,
      default: () => ({})
    },
    submit_aipp: {
      type: Function,
      default: () => { }
    },
    submitText: {
      type: [Object, String],
      default: () => ({ zhCN: '提交', enUS: 'Submit' })
    }
  },
  data () {
    return {
      myModelSet: Object.entries(wo.envar.aiModelSet).reduce((acc, [key, amodel]) => { if (amodel.AIT_AIPP_MODEL) { acc[key] = amodel } return acc }, {}),

      loadingSubmit: false,
      focusList: { 0: true, 1: false, 2: false, 3: false },
    }
  },
  computed: {
    aippBaseModel () {
      return this.myModelSet[this.aippNow?.aicodeModel] || {}
    }
  },
  methods: {
    async upload_aipp_avatar () {
      if (!wo.tt.check_online()) {
        return
      }
      const { _state, ...fileInfo } = await wo.tt.pickupFile({ baseType: wo.envar.baseTypeFile })
      if (wo.bok(_state)) {
        this.aippNow.aiavatar = wo.tt.choose_url(fileInfo)
      }
    },
    async pickup_file_to_ipfs (usage) {
      if (!wo.tt.check_online()) {
        return
      }
      const { _state, cid, size, ...rest } = await wo.tt.pickupFile({ baseType: wo.envar.baseTypeFile, mediaType: { KNOWBASE: wo.ss.aiConfig.openaiFileSearchExt, TEMPLIB: wo.ss.aiConfig.openaiCodeInterpreterExt }[usage] })
      if (wo.bok(_state)) {
        if (!size || this.aippNow.fileList.some(file => file.cid === cid && file.usage === usage)) {
          wo.tt.showToast({ type: wo.color.YELLOW, title: { zhCN: '发现重复的文件。', enUS: 'Duplicate files detected.' } })
        } else {
          this.aippNow.fileList.push({ usage, cid, size, ...rest })
        }
      }
    },
    async to_submit_aipp () {
      if (!wo.tt.check_online()) {
        return
      }
      this.$refs.form.validate()
        .then(async (formData) => {
          this.loadingSubmit = true
          await this.submit_aipp()
          this.loadingSubmit = false
        })
    }
  }
}
</script>

<template>
  <view style="flex:auto;margin:10px 0;">
    <uni-forms
      :rules="{
          ainame: {
            rules: [
              { required: true, errorMessage: wo.ll({ zhCN: '请输入应用的名称！', enUS: 'Enter a name for your Aipp!' }) },
            ]
          },
          ainote: {
            rules: [
              { required: false, errorMessage: wo.ll({ zhCN: '请输入应用的介绍！', enUS: 'Add description for your Aipp!' }) }
            ]
          },
          instructions: {
            rules: [
              { required: true, errorMessage: wo.ll({ zhCN: '请输入系统指令！', enUS: 'Enter system instructions for your Aipp!' }) },
            ]
          },
        }"
      label-position="left"
      label-width="0"
      ref="form"
    >
      <view class="wo-flex between">
        <view class="lo-form-item-title">
          <text style="color:red; margin-right:5px">*</text>
          {{wo.ll({ zhCN: '名字', enUS: 'Name' })}}
        </view>
        <view @click="upload_aipp_avatar" class="lo-form-item-title">{{wo.ll({zhCN:'头像',enUS:'Avatar'})}}</view>
      </view>
      <view class="wo-flex between align-center">
        <uni-forms-item name="ainame" style="flex:auto">
          <uni-easyinput
            :clearable="false"
            :focus="focusList[0]"
            :maxlength="wo.envar.aiConfig.ainameMax"
            :placeholder="wo.ll({ zhCN: '起一个简单好记有特色的名字。', enUS: 'Set a good name of your Aipp.' })"
            :placeholderStyle="wo.ss.placeholderStyle"
            class="wo-bg-color-fg"
            style="font-size:13px"
            type="text"
            v-model="aippNow.ainame"
          ></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item style="flex:none;">
          <button
            :style="{ backgroundImage: wo.tt.make_bgurl(aippNow.aiavatar) }"
            @click="upload_aipp_avatar"
            style="float:right; width:46px; height:46px; box-sizing: border-box; background: white no-repeat scroll center / cover border-box; display: flex; justify-content: center; align-items: center;"
          >
            <uni-icons size="24" style="color:lightgrey; margin:0;" type="plusempty"></uni-icons>
          </button>
        </uni-forms-item>
      </view>

      <view class="lo-form-item-title">{{wo.ll({ zhCN: '介绍', enUS: 'Description' })}}</view>
      <uni-forms-item name="ainote">
        <textarea
          :auto-height="false"
          :focus="focusList[1]"
          :maxlength="wo.envar.aiConfig.ainoteMax"
          :placeholder="wo.ll({ zhCN: `向其他用户简要介绍您的 Aipp。最多${wo.envar.aiConfig.ainoteMax}字。\n👍 当用户打开您的应用时，这段介绍将作为欢迎语。`, enUS: `Introduce your Aipp to other users. At most ${wo.envar.aiConfig.ainoteMax} characters.\n👍 When users open your Aipp, this introduction will be presented as a welcome message.` })"
          :placeholder-style="wo.ss.placeholderStyle"
          class="wo-bg-color-fg wo-border-color-border"
          style="border-radius:4px;box-sizing:border-box; width: inherit; height: 5em; line-height: 1.5em; padding: 5px; border-width: 1px; border-style: solid; word-break: break-word;flex:none"
          v-model="aippNow.ainote"
        ></textarea>
      </uni-forms-item>

      <view class="lo-form-item-title">
        <text style="color:red; margin-right:5px">*</text>
        {{wo.ll({ zhCN: '系统指令', enUS: 'Instructions' })}}
      </view>
      <uni-forms-item name="instructions">
        <textarea
          :auto-height="false"
          :focus="focusList[2]"
          :maxlength="wo.envar.aiConfig.instructionsMax"
          :placeholder="wo.ll({ zhCN: `给 Aipp 编写系统指令，例如人设、规则、功能、特性。最多${wo.envar.aiConfig.instructionsMax}字。\n👍 Aipp 能够自动记住对话历史，为您提供更贴心的服务！`, enUS: `Compile system instructions for your Aipp, to setup its personality, rules, features, etc. At most ${wo.envar.aiConfig.instructionsMax} characters.\n👍 Aipps can remember chat histories automatically and thus provide personalized service for everyone!` })"
          :placeholder-style="wo.ss.placeholderStyle"
          class="wo-bg-color-fg wo-border-color-border"
          style="border-radius:4px;box-sizing:border-box; width: inherit; height: 8em;  line-height: 1.5em; padding: 5px; border-width: 1px; border-style: solid; word-break: break-word;flex:none"
          v-model="aippNow.instructions"
        ></textarea>
      </uni-forms-item>

      <view class="wo-flex between">
        <view :style="{marginBottom:aippNow.fileList.length?'5px':'0'}" class="wo-flex wrap align-center">
          <view class="lo-form-item-title" style="margin-right:10px">{{wo.ll({ zhCN: '文件', enUS: 'Files' })}}</view>
          <template v-if="wo.ss.inWeb">
            <uni-tooltip :content="wo.envar.inPc?wo.ll({zhCN:'添加文件到知识库，用于检索',enUS:'Add files to knowledge base for search'}):''">
              <view
                :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
                @click="pickup_file_to_ipfs('KNOWBASE')"
                class="wo-button border-radius-20px wo-bg-color-grey-e wo-border-color-transparent"
                style="margin-left: 0; white-space: nowrap; flex: none; padding: 2px 8px; margin-right: 10px; color: var(--blue-default)"
              >
                <uni-icons color="unset" size="16" style="margin-right:2px" type="plusempty"></uni-icons>
                <text style="font-size:13px;">{{wo.ll({zhCN:'知识库',enUS:'Knowledge'})}}</text>
              </view>
            </uni-tooltip>
            <uni-tooltip :content="wo.envar.inPc?wo.ll({zhCN:'添加文件到模版库，用于编辑',enUS:'Add files to template library for edit'}):''">
              <view
                :class="{'wo-hover-bgcolor-blue-matt':wo.envar.inPc}"
                @click="pickup_file_to_ipfs('TEMPLIB')"
                class="wo-button border-radius-20px wo-bg-color-grey-e wo-border-color-transparent"
                style="margin-left: 0; white-space: nowrap; flex: none; padding: 2px 8px; margin-right: 10px; color: var(--blue-default)"
              >
                <uni-icons color="unset" size="16" style="margin-right:2px" type="plusempty"></uni-icons>
                <text style="font-size:13px;">{{wo.ll({zhCN:'模版库',enUS:'Template'})}}</text>
              </view>
            </uni-tooltip>
          </template>
          <view class="wo-button" style="margin-left:5px;color:var(--blue-default)" v-else>
            <uni-icons color="unset" custom-prefix="icont-basic" style="margin-right:2px" type="icont-basic-hyperlink"></uni-icons>
            <uni-link
              :href="wo.ss.linkTree.apps.subtags.webapp.linkUrl+'/#/pages/menu-aipp-create'"
              :showUnderLine="false"
              :text="wo.ll({zhCN:'切换到网页应用，即可添加文件',enUS:'Switch to WebApp to add files'})"
              color="unset"
              fontSize="13"
            ></uni-link>
          </view>
        </view>
        <view
          @click="wo.tt.open_url({ 
                  inWebview:false, 
                  url: wo.envar.linkHowtoKnowbase 
                })"
          class="wo-flex align-center wo-clickable"
          style="color:var(--blue-default);font-size:13px;"
          v-if="wo.envar.linkHowtoKnowbase"
        >
          <text>{{wo.ll({zhCN:'帮助',enUS:'Help'})}}</text>
          <uni-icons color="unset" size="18" type="help"></uni-icons>
        </view>
      </view>
      <uni-forms-item style="flex:none;">
        <view style="color:var(--grey-9);font-size:13px;margin:5px 10px 0;" v-if="!aippNow.fileList.length">
          <text>{{wo.ll(wo.ss.aippKnowbaseIntro)}}</text>
        </view>
        <uni-table border ref="table" stripe v-else>
          <uni-tr>
            <!-- <uni-th align="left" width="60%">{{wo.ll({zhCN:'文件名',enUS:'File Name'})}}</uni-th>
                <uni-th align="right">{{wo.ll({ zhCN: '大小', enUS: 'Size' })}}</uni-th>
                <uni-th align="right">{{wo.ll({ zhCN: '用途', enUS: 'Usage' })}}</uni-th>
            <uni-th align="right">{{wo.ll({ zhCN: '操作', enUS: 'Action' })}}</uni-th>-->
          </uni-tr>
          <uni-tr :key="index" v-for="(file,index) in aippNow.fileList">
            <uni-td>{{ file.originalname }}</uni-td>
            <!-- <uni-td align="right">{{ wo.tt.format_number(file.size) }}</uni-td> -->
            <uni-td align="right">
              {{ wo.ll( {
              KNOWBASE : {zhCN:'知识库',enUS:'Knowledge'},
              TEMPLIB : {zhCN:'模版库',enUS:'Template'}
              }[file.usage] ) }}
            </uni-td>
            <uni-td align="right">
              <view class="wo-flex end">
                <view @click="wo.tt.confirm_to_delete({ content: file.originalname, action: ()=>{aippNow.fileList.splice(index,1)} })" class="wo-button">
                  :class="{'wo-hover-textcolor-blue-matt':wo.envar.inPc}"
                  <uni-icons color="unset" size="18" type="trash"></uni-icons>
                  <!-- <text style="font-size:12px;">{{wo.ll({zhCN:'删除',enUS:'Remove'})}}</text> -->
                </view>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
      </uni-forms-item>

      <template v-if="!wo.envar.aiConfig.modelFixed">
        <text class="lo-form-item-title">{{wo.ll({ zhCN: '基础模型', enUS: 'Base Model' })}}</text>
        <uni-forms-item>
          <uni-list>
            <uni-list-chat
              :avatar="aippBaseModel.aiavatar"
              :avatar-circle="true"
              :note="wo.ll(aippBaseModel.ainote)"
              :title="aippBaseModel.ainame"
              @click="$refs.poptoPickAimodel.open()"
              badge-positon="right"
              class="wo-clickable"
              clickable
              style="border:1px solid var(--border);border-radius:4px;"
            >
              <view class="wo-flex end align-center" style="flex:none">
                <view class="wo-flex column center align-end" style="flex:auto">
                  <text style="font-size:16px;">{{wo.ll(aippBaseModel.aiprice)}}</text>
                  <text style="font-size:12px;color:#999;margin-top:8px">{{wo.ll(aippBaseModel.aiprovider)}}</text>
                </view>
                <uni-icons color="#999" size="18" style="margin-left:10px" type="bottom"></uni-icons>
              </view>
            </uni-list-chat>
            <!-- <part-dev>uni-list-item 的 note 会完全显示出来，可能导致占据许多行。uni-list-chat 就只显示一行 note</part-dev> -->
            <!-- <uni-list-item
                  :note="wo.ll(myModelSet[aippNow.aicodeModel].ainote)"
                  :rightText="wo.ll(myModelSet[aippNow.aicodeModel].aiprice)"
                  :thumb="myModelSet[aippNow.aicodeModel].aiavatar"
                  :title="myModelSet[aippNow.aicodeModel].ainame"
                  @click="$refs.poptoPickAimodel.open()"
                  class="text-ellipsis"
                  clickable
                  id="baseModel"
                  showArrow
                  style="border:1px solid var(--border);border-radius:4px;"
                  thumb-size="lg"
                >
                  <view class="wo-flex column center align-end" slot="footer" style="flex:none">
                    <text style="font-size:16px;">{{wo.ll(myModelSet[aippNow.aicodeModel].aiprice)}}</text>
                    <text style="font-size:12px;color:#999;margin-top:8px">{{wo.ll(myModelSet[aippNow.aicodeModel].aiprovider)}}</text>
                  </view>
            </uni-list-item>-->
          </uni-list>
        </uni-forms-item>
      </template>

      <view class="wo-flex between align-center">
        <view class="wo-flex column">
          <view class="lo-form-item-title">{{wo.ll({ zhCN: '访问权限', enUS: 'Accessibility' })}}</view>
          <uni-forms-item>
            <uni-data-select
              :clear="false"
              :localdata="wo.ss.accessLevelList.map(item=>{ return {text:wo.ll(item.text),value:item.value} })"
              :styleListed="{fontSize:'14px',color:'var(--grey-6)'}"
              :stylePicked="{fontSize:'16px',color:'black'}"
              class="wo-bg-color-white"
              style="flex:none;width:auto;height:46px;border:1px solid var(--border);border-radius:4px;"
              v-model="aippNow.accessLevel"
            ></uni-data-select>
          </uni-forms-item>
        </view>
        <view class="wo-flex column">
          <view class="wo-flex between">
            <text class="lo-form-item-title">{{wo.ll({ zhCN: '收益率(收入/成本)', enUS: 'Profit Margin' })}}</text>
            <!-- <part-dev>{{ '(' + wo.envar.tucSymbol + wo.ll({zhCN:'/千字',enUS:'/KChar'}) + ')' }}</part-dev> -->
            <view
              @click="wo.tt.open_url({ 
                  inWebview:false, 
                  url: wo.envar.linkHowtoEarn 
                })"
              class="wo-flex align-center wo-clickable"
              style="color:var(--blue-default);font-size:13px;"
              v-if="wo.envar.linkHowtoEarn"
            >
              <text>{{wo.ll({zhCN:'帮助',enUS:'Help'})}}</text>
              <uni-icons color="unset" size="18" type="help"></uni-icons>
            </view>
          </view>
          <uni-forms-item>
            <uni-easyinput
              :clearable="false"
              :focus="focusList[3]"
              :placeholder="wo.ll({ zhCN: '收入/成本。默认为 0。', enUS: 'Income/Cost. Default to 0.' })"
              :placeholderStyle="wo.ss.placeholderStyle"
              class="wo-bg-color-fg"
              onkeypress="return '-' !== event.key"
              style="font-size:13px"
              type="digit"
              v-model="aippNow.profitMargin"
            ></uni-easyinput>
          </uni-forms-item>
        </view>
      </view>
      <view
        style="position:relative; top:-22px; padding: 0 10px; font-size:14px; word-break:break-all; text-align:right; color:#999"
      >{{wo.ll({zhCN:'您的收入',enUS:'Your income'})}} = {{ wo.tt.margin_to_price(aippNow) }}</view>
    </uni-forms>

    <part-button-submit
      :disabled="!aippNow.ainame || !aippNow.instructions || loadingSubmit"
      :loading="loadingSubmit"
      @click="to_submit_aipp"
      style="margin:15px 0 0;"
    >
      <uni-icons color="unset" size="20" type="plusempty"></uni-icons>
      {{ wo.ll(submitText) }}
    </part-button-submit>
    <view
      :class="{'bad-message':bridgeOption.feedbackRemote}"
      class="formitem-feedback at-center"
      v-if="true || aippNow.ainame && aippNow.ainote && aippNow.instructions"
    >{{ wo.ll(bridgeOption.feedbackRemote || feedbackInit) }}</view>

    <!-- <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_定价说明" ref="poptoEarning">
      <view :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth600 }" class="wo-flex column" style="max-height:75vh;margin:0 auto">
        <text
          style="text-align:center;margin:20px 10px; font-size:16px; font-weight:bold"
        >{{wo.ll({zhCN:'从Aipp中获得收益',enUS:'Earn Revenue from Your Aipp'})}}</text>
        <text style="margin:0 10px 20px;line-height:2em;">
          {{wo.ll({
          zhCN:`每当有用户使用您的应用，按照使用量，您可获得相应的收入。例如：
          - 基础模型原始价格为 ${wo.ll(myModelSet[aippNow.aicodeModel].aiprice)}；
          - 假设您设置的个人收益率为 0.03${wo.ss.tucSymbol}/千字；
          - 则用户的综合使用成本为以上两者之和；
          - 假设您的Aipp被用户总计使用了2000千字，则您将从中获得 20000*0.03=600${wo.ss.tucSymbol}！`,
          enUS:`Whenever a user uses your application, you can earn revenue based on the usage. For example:
          - The base model's original price is ${wo.ll(myModelSet[aippNow.aicodeModel].aiprice)}.
          - Assuming you set your revenue rate at 0.03${wo.ss.tucSymbol}/KChar.
          - Therefore, the user's total cost is the sum of the two.
          - Assuming your app is used by users for a total of 20000K chars, you will earn 2000*0.03 = 600${wo.ss.tucSymbol}!`})}}
        </text>
      </view>
    </uni-popup>-->

    <uni-popup :type="wo.envar.inPc ? 'center' : 'bottom'" background-color="white" id="_基础模型列表" ref="poptoPickAimodel">
      <view :style="{ minWidth: wo.ss.minWidth500, maxWidth: wo.ss.maxWidth600 }" class="wo-flex column" style="max-height:75vh;margin:0 auto">
        <part-close-button @closeMe="$refs.poptoPickAimodel.close()"></part-close-button>

        <text style="font-weight:bold;padding:10px 10px;text-align: center;">
          {{ wo.ll(
          { zhCN: '基础模型', enUS: 'Base Models' }) }}
        </text>
        <view style="flex:auto;overflow-y:auto">
          <uni-list :border="true">
            <uni-list-chat
              :avatar="aimodel.aiavatar"
              :avatar-circle="true"
              :key="key"
              :note="wo.ll(aimodel.ainote)"
              :style="{ backgroundColor: aimodel.aicode === aippNow.aicodeModel ? 'var(--green-light)' : 'unset', cursor: aimodel.aicode === aippNow.aicodeModel ? 'unset' : 'pointer' }"
              :title="aimodel.ainame"
              @click="aippNow.aicodeModel = key; $refs.poptoPickAimodel.close()"
              badge-positon="right"
              clickable
              v-for="(aimodel, key) in myModelSet"
            >
              <view class="wo-flex column center align-end" style="flex:auto">
                <text style="font-size:16px;">{{wo.ll(aimodel.aiprice)}}</text>
                <text style="font-size:12px;color:#999; margin-top:8px">{{wo.ll(aimodel.aiprovider)}}</text>
              </view>
            </uni-list-chat>
          </uni-list>
          <uni-load-more :contentText="{ contentnomore: '----' }" status="noMore"></uni-load-more>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss">
.lo-form-item-title {
  font-size: 14px;
  flex: none;
  padding: 2px;
  color: var(--grey-6);
  font-weight: bold;
}

// 在这里无效，要写在 App.vue 里才有效。但可以直接 <uni-list-item class="text-ellipsis"></uni-list-item>
// .uni-list-item__content-note {
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
// }

.uni-table-th {
  padding: 5px 10px;
}
.uni-table-td {
  padding: 5px 10px;
}
</style>
