import baseConfig from './base';

const config = {
  appEnv: 'dev',
  budgetUrl: 'http://rjfin.haasgz.hand-china.com:30496',
  uatUrl: 'https://apiuat.huilianyi.com',
  baseUrl: 'http://139.224.2.45:11011',
  //baseUrl: 'http://apiuat.huilianyi.com',
  payUrl: 'http://rjfin.haasgz.hand-china.com:30498/payment',
  contractUrl: 'http://rjfin.haasgz.hand-china.com:30498',
  prePaymentUrl: "http://rjfin.haasgz.hand-china.com:30498/prepayment",
  cdcUrl:'http://192.168.1.72:8072'
};

export default Object.freeze(Object.assign({}, baseConfig, config));
