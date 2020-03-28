const _ = require('lodash/fp')

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

module.exports = cache
