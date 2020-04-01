const handleRequest = require('./handlers')
const cache = require('./kv-cache')
const {
  cdcTests, press, statesDaily, statesInfo, usCurrent, usDaily,
} = require('./datasources/sheets')
const { grade, states } = require('./datasources/states')
const urls = require('./datasources/urls')
const { statesPop } = require('./datasources/census')

const StateAPI = require('./datasources/state')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const screenshots = require('./datasources/screenshots')

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

const sheets = {
  app: 'sheets',
  worksheetId: '18oVRrHj3c183mHmq3m89_163yuYltLNlOmPerQ18E8w',
  key: global.GOOGLE_API_KEY,
}

// ROUTER

const redirectMap = new Map([
  ['/', 'https://covidtracking.com/about/api'],
  ['/cdc/daily', cdcTests],
  ['/github', 'https://github.com/COVID19Tracking/covid-tracking-api'],
  ['/press', press],
  ['/states', states],
  ['/states/daily', statesDaily],
  ['/states/info', statesInfo],
  ['/states/grade', grade],
  ['/states/population', statesPop],
  ['/us', usCurrent],
  ['/us/daily', usDaily],
  ['/counties', { ...sheets, sheetName: 'Counties' }],
  ['/urls', urls],
  ['/screenshots', screenshots],
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
