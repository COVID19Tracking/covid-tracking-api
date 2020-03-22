const _ = require('lodash/fp')

function getVal(value) {
  if (value === '') return null
  if (value === 'N' || value === 'FALSE') return false
  if (value === 'Y' || value === 'TRUE') return true
  if (value.match(/^(\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/)) return Number(value.replace(/,/g, ''))
  if (!isNaN(value)) return Number(value)
  return value
}

function runSearch(search) {
  if (_.isEmpty(search)) return _.identity
  return _.flow(
    _.filter(_.mapValues(getVal, search)),
    (x) => (x.length === 1 ? x[0] : x),
  )
}

module.exports = {
  getVal,
  getVals: _.map(getVal),
  runSearch,
}
