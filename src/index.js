const _ = require('lodash/fp')
const {
  setFieldWith,
} = require('prairie')
const handleRequest = require('./handlers')
const { handleResponse } = require('./handlers/responses')
const { runSearch, sheetVals } = require('./handlers/sheets')
const {
  totalDate,
} = require('./datasources/utils')
const { statesDaily, statesInfo, usDaily } = require('./datasources/sheets')
const urls = require('./datasources/urls')

const StateAPI = require('./datasources/state')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const screenshots = require('./datasources/screenshots')

/* globals COVID */

const cacheFunc = (name) => _.flow(
  _.partial(console.log, [name]),
  () => Promise.resolve(null),
)
const stubCache = {
  get: cacheFunc('get'),
  put: cacheFunc('put'),
  list: cacheFunc('list'),
}

const cache = typeof COVID === 'undefined' ? stubCache : COVID

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
const states = {
  ...sheets,
  sheetName: 'States current',
  fixItems: _.map(_.flow(
    setFieldWith('dateModified', 'lastUpdateEt', totalDate),
    setFieldWith('dateChecked', 'checkTimeEt', totalDate),
  )),
}
const grade = {
  ...sheets,
  worksheetId: '1_6zwoekv0Mzpp6KEp4OziZizaWxGOxMoDT2C-iBvyEg',
  sheetName: 'Sheet1',
  fixItems: _.flow(
    _.compact,
    _.map(_.omit(['timeOfLastStateUpdateEt', 'lastCheckTimeEt', 'checker', 'doubleChecker'])),
    _.keyBy('state'),
  ),
}

const redirectMap = new Map([
  ['/', 'https://covidtracking.com/api/'],
  ['/github', 'https://github.com/COVID19Tracking/covid-tracking-api'],
  ['/press', {
    ...sheets,
    sheetName: 'Sheet1',
    worksheetId: '1-lvGZ3NgVlda4EcF5t_AVFLnBqz-TOl4YZxYH_mJF_4',
    fixItems: _.orderBy(['publishDate'], ['desc']),
  }],
  ['/states', (request, args) => Promise.all([
    sheetVals(grade, {}),
    sheetVals(states, {}).then(_.keyBy('state')),
  ])
    .then(_.flow(_.mergeAll, _.values, _.filter('state')))
    .then(runSearch(args.search))
    .then(handleResponse(args)),
  ],
  ['/states/daily', statesDaily],
  ['/states/info', statesInfo],
  ['/states/grade', grade],
  ['/us', { ...sheets, sheetName: 'US current' }],
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
