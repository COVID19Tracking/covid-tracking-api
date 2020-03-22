const _ = require('lodash/fp')
const { getVals, runSearch } = require('./utils')

/* globals fetch */


const fixVals = _.flow(
  _.get('values'),
  ([keys, ...values]) => _.map(_.zipObject(_.map(_.camelCase, keys)), _.map(getVals, values)),
)

function sheetVals({
  fixItems, worksheetId, sheetName, key,
}, { search }) {
  return fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${worksheetId}/values/${sheetName}?key=${key}`,
    { cf: { cacheEverything: true, cacheTtl: 120 } },
  )
    .then((res) => res.json())
    .then((x) => (x.error ? Promise.reject(x) : x))
    .then(fixVals)
    .then((x) => (_.isFunction(fixItems) ? fixItems(x) : x))
    .then(runSearch(search))
    .catch((err) => console.log(err) || err)
}

module.exports = {
  runSearch,
  sheetVals,
}
