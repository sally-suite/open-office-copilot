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
  login: 'POST /auth/login', //token
  getMessages: 'GET /message/get_messages',
  sentMessage: 'POST /message/sent_message',
  chat: 'POST /chat_proxy',
  chatStreamLine: 'STREAMLINE /chat_proxy',
  embeddings: 'POST /embeddings',
  completions: 'POST /completions',
  speechToText: 'POST /speech_to_text',
  setUserProperty: 'POST /user/set_property',
  getUserProperty: 'POST /user/get_property',
  checkUser: 'POST /user/check_state',
  getAgent: 'POST /agent/get_agent',
  getAgents: 'POST /agent/get_agents',
  addAgent: 'POST /agent/add_agent',
  updateAgent: 'POST /agent/update_agent',
  getPoints: "POST /user/get_points",
  search: 'POST /search/web_pages',
  searchImages: 'POST /search/images',
  generateImages: 'POST /images/generations',
  getModels: 'POST /models/get_models',
  addModel: 'POST /models/add_model',
  removeModel: 'POST /models/remove_model',
  addPlan: 'POST /plans/add_plan',
  getPlan: 'POST /plans/get_plan',
  getPlanList: 'POST /plans/get_plans',
  removePlan: 'POST /plans/remove_plan',
  imageProxy: 'PROXY /images/proxy',
  addBookmark: 'POST /bookmark/add_bookmark',
  getBookmarkList: 'POST /bookmark/get_bookmarks',
  removeBookmark: 'POST /bookmark/remove_bookmark',
  searchPapers: 'POST /search/scholar/search_papers',
  searchScholar: 'POST /search/scholar/search_scholar',
  getCitation: 'POST /search/scholar/get_citation',
  getProviderModels: 'POST /models/get_provider_models',
  getUserPrompts: 'POST /prompts/get_prompts',
  addUserPrompt: 'POST /prompts/add_prompt',
  removeUserPrompt: 'POST /prompts/remove_prompt',

};

export default api;
