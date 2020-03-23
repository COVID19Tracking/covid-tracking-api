const _ = require('lodash/fp')
/* globals fetch */

const fetchJson = (url) => fetch(
  url,
  { cf: { cacheEverything: true, cacheTtl: 120 } },
).then((res) => res.json())

const fetchXml = (url) => fetch(
  url,
  { cf: { cacheTtl: 300 }, headers: { Accept: 'text/xml' } },
).then((response) => response.text())

function rejectError(x) {
  return x.error ? Promise.reject(x) : x
}

function processResult(fixItems) {
  if (!_.isFunction(fixItems)) return _.identity
  return fixItems
}

module.exports = {
  fetchJson,
  fetchXml,
  processResult,
  rejectError,
}
