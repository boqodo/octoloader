const Provider = require('./Provider')
const BilibiliProvider = require('./BilibiliProvider')
const IQiyiProvider = require('./IQiyiProvider')
const CCTVProvider = require('./CCTVProvider')
const LizhifmProvider = require('./LizhifmProvider')

const PROVIDERS = [BilibiliProvider, IQiyiProvider, CCTVProvider, LizhifmProvider]
/**
 *
 * 根据url匹配可用的服务提供者
 * @param {string} url
 * @returns {Provider} 服务提供者
 */
function matchProvider (url) {
  return PROVIDERS.find(p => p.match(url))
}

exports = module.exports = {
  getProviders: () => {
    return PROVIDERS
  },
  matchProvider: matchProvider
}
