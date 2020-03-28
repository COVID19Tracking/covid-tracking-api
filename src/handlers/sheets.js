const _ = require('lodash/fp')
const { fetchJson, rejectError } = require('./fetch')
const { getVals, runSearch } = require('./utils')
const { loadOrUpdateCached } = require('./cache')

const fixVals = _.flow(
  _.get('values'),
  ([keys, ...values]) => _.map(
    _.zipObject(_.map(_.camelCase, keys)), // process keys
    _.map(getVals, values), // process values
  ),
)

function getSheet({ worksheetId, sheetName, key }) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${worksheetId}/values/${sheetName}?key=${key}`
  return fetchJson(url)
    .then(rejectError)
    .then(fixVals) // Fix every time.
    // .then((x) => console.log(x) || x)
}

// function sheetVals({ fixItems, ...rest }, { search }) {
//   return getSheet(rest)
//     .then(processResult(fixItems))
//     .then(runSearch(search))
//     .catch((err) => console.log(err) || err)
// }

const sheetVals = _.curry((route, cacheId, args) => loadOrUpdateCached(
  {
    ...args,
    ext: 'json',
    search: null,
    route,
    cacheId,
  },
  () => getSheet(route),
))

module.exports = {
  getSheet,
  runSearch,
  sheetVals,
}
