const _ = require('lodash/fp')

const configInit = _.defaultsDeep({
  allowCredentials: 'true',
  allowHeaders: 'application/json, Content-type',
  allowMethods: 'GET, POST',
  allowOrigin: '*',
})

module.exports = _.curry((config, response) => {
  if (!_.isPlainObject(config)) return response
  const corsConfig = configInit(config)
  response.headers.set('Access-Control-Allow-Credentials', corsConfig.allowCredentials)
  response.headers.set('Access-Control-Allow-Headers', corsConfig.allowHeaders)
  response.headers.set('Access-Control-Allow-Methods', corsConfig.allowMethods)
  response.headers.set('Access-Control-Allow-Origin', corsConfig.allowOrigin)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
})
