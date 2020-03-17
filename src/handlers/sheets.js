const _ = require('lodash/fp')

/* globals fetch */

function getVal(value) {
  if (value === '') return null
  if (value === 'N') return false
  if (value === 'Y') return true
  if (value.match(/^(\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/)) return Number(value.replace(/,/g, ''))
  if (!isNaN(value)) return Number(value)
  return value
}

const getVals = _.map(_.map(getVal))

const fixVals = _.flow(
  _.get('values'),
  ([keys, ...values]) => _.map(_.zipObject(_.map(_.camelCase, keys)), getVals(values)),
)

function sheetVals({ worksheetId, sheetName, key }, { search }) {
  const runSearch = _.flow(
    _.filter(_.mapValues(getVal, search)),
    (x) => (x.length === 1 ? x[0] : x),
  )
  return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${worksheetId}/values/${sheetName}?key=${key}`)
    .then((res) => res.json())
    .then(fixVals)
    .then((x) => (_.isEmpty(search) ? x : runSearch(x)))
    .catch((err) => console.log(err))
}

module.exports = {
  sheetVals,
}
