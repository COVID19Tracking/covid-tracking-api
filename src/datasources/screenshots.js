const _ = require('lodash/fp')
const { isGt } = require('understory')
const {
  mergeFieldsWith, move, propDo, setField, setFieldWith,
} = require('prairie')
const { screenshotDate } = require('./utils')

const isScreenshot = _.overEvery([
  propDo('Key', _.startsWith('state_screenshots/')),
  propDo('Key', _.negate(_.includes('public'))),
  propDo('Size', isGt(0)),
])

const addUrl = setField(
  'url',
  ({ state, filename }) => `https://covidtracking.com/screenshots/${state}/${filename}`,
)

const addDate = setFieldWith('dateChecked', 'filename', _.flow(
  _.split('-'), // state-date-time.png
  (x) => screenshotDate((x[1] + x[2]).split('.')[0]),
))

const fixItem = _.flow(
  mergeFieldsWith(
    'Key',
    _.flow(
      _.split('/'),
      _.tail,
      _.zipObject(['state', 'filename']),
      addUrl,
      addDate,
    ),
  ),
  _.omit(['StorageClass', 'Key', 'LastModified']),
  move('Size', 'size'),
)

const fixItems = _.flow(
  _.get('ListBucketResult.Contents'),
  _.filter(isScreenshot),
  _.map(fixItem),
)

module.exports = {
  app: 'xml',
  url: 'https://covid-data-archive.s3.us-east-2.amazonaws.com/',
  // isValidResult: // Check if there are x number of items and they have a URL.
  // search: true,
  // prepResponse: // Get headers.
  finalPrep: ({ search }, value) => (_.isEmpty(search) ? _.groupBy('state', value) : value),
  fixItems,
}
