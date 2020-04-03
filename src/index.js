const _ = require('lodash/fp')
const { copy } = require('prairie')
const handleRequest = require('./handlers')
const cache = require('./kv-cache')

// const urls = require('./datasources/urls')
const { statesPop } = require('./datasources/census')

const StateAPI = require('./datasources/state')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const dataSources = () => ({
  stateAPI: new StateAPI(),
})

const graphQLOptions = {
  dataSources,
  typeDefs,
  resolvers,
  baseEndpoint: '/graphql',
  playgroundEndpoint: '/playground',
  app: 'apollo',
  kvCache: false,
}
const baseUrl = 'https://covidtracking.com/api/v1/'
const getUrl = (path, ext) => `${baseUrl}${path}.${ext || 'json'}`
const proxy = (path) => ({ app: 'json', url: getUrl(path) })

const compatibility = _.map(copy('totalTestResults', 'posNeg'))
const redirectMap = new Map([
  ['/', 'https://covidtracking.com/api'],
  ['/github', 'https://github.com/COVID19Tracking/covid-tracking-api'],
  ['/cdc/daily', proxy('cdc/daily')],
  ['/press', proxy('press')],
  ['/states', proxy('states/current')],
  ['/states/daily', proxy('states/daily')],
  ['/states/info', proxy('states/info')],
  ['/states/grade', proxy('states/grades')],
  ['/states/population', statesPop],
  ['/us', { ...proxy('us/current'), fixItems: compatibility }],
  ['/us/daily', { ...proxy('us/daily'), fixItems: compatibility }],
  ['/counties', proxy('counties')],
  ['/urls', proxy('urls')],
  ['/screenshots', {
    ...proxy('states/screenshots'),
    finalPrep: (args, values) => (_.isArray(values) ? _.groupBy('state', values) : values),
  }],
  [graphQLOptions.baseEndpoint, graphQLOptions],
  // Playground.
  [graphQLOptions.playgroundEndpoint, { baseEndpoint: '/api/graphql', app: 'playground' }],
])

const options = {
  debug: true,
  forwardUnmatchedRequestsToOrigin: false,
}

function handler(event) {
  try {
    return handleRequest(redirectMap, event, cache)
  } catch (err) {
    console.error(err)
    // Return the error stack as the response
    const result = options.debug ? (err.stack || err) : 'Error. Something went wrong.'
    return new Response(result, { status: 500 })
  }
}
addEventListener('fetch', (event) => {
  event.respondWith(handler(event))
})
