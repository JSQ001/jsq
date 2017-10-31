import ValueList from 'containers/setting/value-list/value-list'
import NewValueList from 'containers/setting/value-list/new-value-list'
import SecuritySetting from 'containers/setting/security-setting/security-setting'
import CallbackSetting from  'containers/setting/callback-setting/callback-setting'
import CodingRule from 'containers/setting/coding-rule/coding-rule'
import NewCodingRule from 'containers/setting/coding-rule/new-coding-rule'

//新建值列表
const newValueList = {
  key:'new-value-list',
  url:'/main/setting/value-list/new-value-list',
  components: NewValueList,
  parent: 'value-list'
};

//值列表
const valueList = {
  key:'value-list',
  url:'/main/setting/value-list',
  components: ValueList,
  parent: 'setting',
  children: {
    newValueList
  }
};

//安全配置
const securitySetting = {
  key:'security-setting',
  url:'/main/setting/security-setting',
  components: SecuritySetting,
  parent: 'setting',
  children:{}
};

//回调设置
const callbackSetting = {
  key:'callback-setting',
  url:'/main/setting/callback-setting',
  components:CallbackSetting,
  parent: 'setting',
  children:{}
};

const newCodingRule = {
  key:'new-coding-rule',
  url:'/main/setting/coding-rule/new-coding-rule',
  components: NewCodingRule,
  parent: 'coding-rule'
};

//编码规则定义
const codingRule = {
  key:'coding-rule',
  url:'/main/setting/coding-rule',
  components:CodingRule,
  parent: 'setting',
  children:{
    newCodingRule
  }
};

//设置
const setting = {
  key:'setting',
  subMenu: [valueList, securitySetting, callbackSetting, codingRule],
  icon: 'setting',
  admin: true
};

export default setting
