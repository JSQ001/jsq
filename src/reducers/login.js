/**
 * Created by zaranengap on 2017/7/3.
 */
import {combineReducers} from 'redux';
import {cr} from 'share/utils'
import {SET_USER, SET_PROFILE, SET_COMPANY, SET_ORGANIZATION, SET_COMPANY_CONFIGURATION} from 'actions/login'

export default combineReducers({
  user: cr({}, {
    [SET_USER](state, {user}){return user}
  }),
  profile: cr({}, {
    [SET_PROFILE](state, {profile}){return profile}
  }),
  company: cr({}, {
    [SET_COMPANY](state, {company}){return company}
  }),
  organization: cr({}, {
    [SET_ORGANIZATION](state, {organization}){return organization}
  }),
  companyConfiguration: cr({}, {
    [SET_COMPANY_CONFIGURATION](state, {companyConfiguration}){return companyConfiguration}
  }),
})
