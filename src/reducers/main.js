/**
 * Created by zaranengap on 2017/7/4.
 */
import {combineReducers} from 'redux';
import {SET_CURRENT_PAGE, SET_LANGUAGE, SET_TENANT_MODE} from 'actions/main'
import {cr} from 'share/utils'

import zh from 'share/i18n/zh_CN'

export default combineReducers({
  currentPage: cr([{name: 'Dashboard', key:'dashboard', url:'/main'}], {
    [SET_CURRENT_PAGE](state, {currentPage}){return currentPage}
  }),
  language: cr({locale:'zh', messages: zh}, {
    [SET_LANGUAGE](state, {language}){return language}
  }),
  tenantMode: cr(false, {
    [SET_TENANT_MODE](state, {tenantMode}){return tenantMode}
  })
})
