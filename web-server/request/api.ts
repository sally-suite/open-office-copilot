/**
 * 接口url
 * login ---- 业务调用的具体的请求方法名
 * GET ---- 传递给axios的method
 * /auth/login  ----- 接口url
 * method和url中间强制空格一个，在http中会统一解析
 *
 * 支持在url中定义动态参数，然后在业务中根据实际场景给请求方法传递参数，赋值给动态参数
 * eg  /auth/:userId/login
 *     userId为动态参数
 *     参数赋值： login({userId: 1})
 */
const api = {
  getOrders: 'GET /order/get_orders',
  addOrder: 'POST /order/add_order',
  cancelOrder: 'POST /order/cancel_order',
  getOrder: 'POST /order/get_order',
  createStripeSession: 'POST /stripe/create_session',
  checkTransaction: 'POST /order/check_transaction',
  getUsers: 'GET /user/get_users',
  getConversations: 'GET /message/get_conversations',
  getMessages: 'GET /message/get_messages',
  getUserPointList: 'GET /user/get_point_list',
  getUserTokenUsage: 'POST /user/get_token_usage',
  getSubscription: 'POST /subscription/get_subscription',
  cancelSubscription: 'POST /subscription/cancel_subscription',
  getSubscriptions: 'GET /subscription/get_subscriptions',
  addSubscription: 'POST /subscription/add_subscription',
  removeSubscription: 'POST /subscription/remove_subscription',
  checkTrialCode: 'POST /trial_code/check',
  getTrialCodes: 'GET /trial_code/get_trialcodes',
  addTrialCodes: 'POST /trial_code/add_trialcodes',
  checkPromoCode: 'POST /promo_code/check',
  resetUserPoint: 'POST /user/reset_point',
  updatePoint: 'POST /user/update_point',
  getTokenUsageList: 'GET /user/get_token_usage_list',
  addBlacklist: 'POST /blacklist/add_blacklist',
  removeBlacklist: 'POST /blacklist/remove_blacklist',
  getBlacklist: 'GET /blacklist/get_blacklist',
  getModels: 'POST /models/get_models',
  addModel: 'POST /models/add_model',
  removeModel: 'POST /models/remove_model',
  // admin
  getAdminModels: 'POST /admin/models/get_models',
  addAdminModel: 'POST /admin/models/add_model',
  removeAdminModel: 'POST /admin/models/remove_model',

  getAdminAgents: 'POST /admin/agents/get_agents',
  addAdminAgent: 'POST /admin/agents/add_agent',
  removeAdminAgent: 'POST /admin/agents/remove_agent',
  updateAdminAgent: 'POST /admin/agents/update_agent',

  addAdminConfig: 'POST /admin/config',
  getAdminConfig: 'GET /admin/config',

  iniDatabase: 'POST /admin/initialize',
  isInitialized: 'GET /admin/initialize',
};

export default api;
