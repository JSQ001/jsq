import baseConfig from './base';

const config = {
  appEnv: 'dev',
  baseUrl: 'http://apiuat.huilianyi.com',
  budgetUrl: 'http://rjfin.haasgz.hand-china.com:30496',
  companyUrl: 'http://139.224.220.217:11013'
};

export default Object.freeze(Object.assign({}, baseConfig, config));
