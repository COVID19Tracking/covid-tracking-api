const _ = require('lodash/fp')
const { isGt } = require('understory')
const {
  mergeFieldsWith, move, propDo, setField, setFieldWith,
} = require('prairie')
const { screenshotDate } = require('./utils')
const { handleCacheRequest, loadOrUpdateCached } = require('../handlers/cache')
const { handleResponse2 } = require('../handlers/responses')
const getXml = require('../handlers/xml')

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
  (x) => {
    const dateStr = (x[1] + x[2]).split('.')[0]
    if (/^\d+/.test(dateStr)) return screenshotDate(dateStr)
    console.error('INVALID DATE', dateStr)
    return null
  },
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
  _.omit(['ETag', 'StorageClass', 'Key', 'LastModified', 'filename']),
  move('Size', 'size'),
)

const getItems = _.get('ListBucketResult.Contents')
const fixItems = _.flow(
  getItems,
  _.filter(isScreenshot),
  _.map(fixItem),
)

function getPage(marker) {
  const baseUrl = 'https://covid-data-archive.s3.us-east-2.amazonaws.com/'
  const url = `${baseUrl}?prefix=state_screenshots/&marker=${marker || ''}`
  console.log(url)
  return getXml({ url })
}
const hasMore = _.get('ListBucketResult.IsTruncated')
const getMarker = _.flow(getItems, _.last, _.get('Key'))

async function getPages(previousItems = [], marker) {
  const result = await getPage(marker)
  const items = previousItems.concat(fixItems(result))
  return hasMore(result) ? getPages(items, getMarker(result)) : items
}

const getScreenshots = (args) => loadOrUpdateCached(
  {
    ...args,
    ext: 'json',
    search: null,
    cacheId: 'screenshots',
  },
  () => getPages(),
)

function finalPrep({ search }) {
  return (value) => (_.isEmpty(search) ? _.groupBy('state', value) : value)
}

module.exports = (event, args) => {
  const updateData = () => getScreenshots(args).then(finalPrep(args))
  return handleCacheRequest(event, args, updateData, handleResponse2)
}
