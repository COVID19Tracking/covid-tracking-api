const _ = require('lodash/fp')
const {
  mergeFieldsWith, move, propDo, setField, setFieldWith,
} = require('prairie')
const { isGt } = require('understory')
const handleRequest = require('./handlers')
const { handleResponse } = require('./handlers/responses')
const { runSearch, sheetVals } = require('./handlers/sheets')
const {
  addName, dailyDate, screenshotDate, totalDate,
} = require('./datasources/utils')

const StateAPI = require('./datasources/state')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')

const cache = global.COVID || { get: _.noop, set: _.noop }

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
  key: global.GOOGLE_API_KEY || _.get('process.env.GOOGLE_API_KEY', global),
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
  ['/', 'https://covidtracking.com'],
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
  ['/states/daily', {
    ...sheets,
    fixItems: _.map(setFieldWith('dateChecked', 'date', dailyDate)),
    sheetName: 'States daily 4 pm ET',
  }],
  ['/states/info', {
    ...sheets,
    fixItems: _.map(addName),
    sheetName: 'States',
  }],
  ['/states/grade', grade],
  ['/us', { ...sheets, sheetName: 'US current' }],
  ['/us/daily', {
    ...sheets,
    sheetName: 'US daily 4 pm ET',
  }],
  ['/counties', { ...sheets, sheetName: 'Counties' }],
  ['/urls', {
    app: 'yaml',
    url: 'https://raw.githubusercontent.com/COVID19Tracking/covid-tracking/master/urls.yaml',
    multi: true,
    args: { json: true }, // Duplicate keys will override values rather than throwing an error.
  }],
  ['/screenshots', {
    app: 'xml',
    url: 'https://covid-data-archive.s3.us-east-2.amazonaws.com/',
    handleResult: _.flow(
      _.get('ListBucketResult.Contents'),
      _.filter(_.overEvery([
        propDo('Key', _.startsWith('state_screenshots/')),
        propDo('Key', _.negate(_.includes('public'))),
        propDo('Size', isGt(0)),
      ])),
      _.map(_.flow(
        mergeFieldsWith(
          'Key',
          _.flow(
            _.split('/'),
            _.tail,
            _.zipObject(['state', 'filename']),
            setField(
              'url',
              ({ state, filename }) => `https://covidtracking.com/screenshots/${state}/${filename}`,
            ),
            setFieldWith('dateChecked', 'filename', _.flow(
              _.split('-'), // state-date-time.png
              (x) => screenshotDate((x[1] + x[2]).split('.')[0]),
            )),
          ),
        ),
        _.omit(['StorageClass', 'Key', 'LastModified']),
        move('Size', 'size'),
      )),
      _.groupBy('state'),
    ),
  }],
  [graphQLOptions.baseEndpoint, graphQLOptions],
  // Playground.
  [graphQLOptions.playgroundEndpoint, { baseEndpoint: '/api/graphql', app: 'playground' }],
])

const options = {
  debug: true,
  forwardUnmatchedRequestsToOrigin: false,
}

function handler(request) {
  try {
    return handleRequest(redirectMap, request, cache)
  } catch (err) {
    console.error(err)
    // Return the error stack as the response
    const result = options.debug ? (err.stack || err) : 'Error. Something went wrong.'
    return new Response(result, { status: 500 })
  }
}
addEventListener('fetch', (event) => {
  event.respondWith(handler(event.request))
})
