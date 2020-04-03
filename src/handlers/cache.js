const _ = require('lodash/fp')
const { cacheLog, processResult, refererLog } = require('./fetch')
const { runFinalPrep, runSearch } = require('./utils')
const toStr = require('./csv')

const CACHE_LIFETIME = 18000 // 5 hours

const NO_DATA = { error: true, message: 'No data available. Try changing query args.' }

async function save(args, data, returnRaw = false) {
  const { cache, cacheId, ttl } = args
  console.log('ttl', ttl)
  // const expirationTtl = ttl === false ? undefined : Math.max(CACHE_LIFETIME, ttl)
  const expirationTtl = Math.max(CACHE_LIFETIME, ttl || 60)
  const dataStr = await toStr(args, _.isEmpty(data) ? NO_DATA : data)
  return cache.put(cacheId, dataStr, { expirationTtl })
    .then(() => cacheLog({
      id: cacheId,
      category: 'handleUpdate',
      text: `Saved item to cache ttl: ${expirationTtl}`,
    }))
    .then(() => (returnRaw ? data : dataStr)) // return data.
}

// fetch, fixItems, search, finalPrep, save, return result of toStr()
// @TODO If there is a search query try loading raw data cache first.
const handleUpdate = (args, updateData, returnRaw, oldValue) => updateData(args)
  .then(processResult(args.route.fixItems, oldValue))
  .then(runSearch(args.search))
  .then(runFinalPrep(args))
  // @TODO Validate result before saving it.
  // save
  .then((data) => save(args, data, returnRaw))

async function cacheLife({ cache, cacheId, ttl = 300 }) {
  if (!cache.list) return { age: 222, ttl, replace: false }
  // @TODO If there is a search.date then extend TTL to max.
  const list = await cache.list({ prefix: cacheId, limit: 1 })
  const time = list.keys[0].expiration // will fail processes if not found.
  const cacheTtl = _.round(time - (new Date() / 1000))
  const age = CACHE_LIFETIME - cacheTtl
  const replace = age > ttl
  if (replace) {
    await cacheLog({
      id: cacheId,
      category: 'checkCache',
      text: `replace ttl: ${ttl}, age: ${age}`,
    })
  }
  return {
    time, cacheTtl, age, replace, ttl,
  }
}
const parseJson = (x) => (_.isString(x) ? JSON.parse(x) : x)

async function checkCache(args, updateData, value, returnRaw) {
  // Figure out cache times.
  const { replace } = await cacheLife(args)
  console.log('cache refresh', replace)
  // Save a new copy to the cache.
  const oldValue = (args.ext !== 'csv') ? parseJson(value) : null
  return replace ? handleUpdate(args, updateData, returnRaw, oldValue) : value
}

const loadCached = ({ cache, cacheId }, type) => cache.get(cacheId, type)
  // Sometimes it is not returned as an object?!? Maybe only locally.
  .then((x) => (type === 'json' ? parseJson(x) : x))

// Load valid JSON value. Expired is replaced.
async function loadOrUpdateCached(args, updateData) {
  const value = await loadCached(args, 'json')
  console.log('cacheVal', !!value)
  if (!value) return handleUpdate(args, updateData, true)
  return checkCache(args, updateData, value, true)
}

async function handleCacheRequest(event, args, updateData, handleResponse) {
  // Look for saved value first.
  const value = await loadCached(args)
  console.log('cache val', !!value)
  // If we did not find a value in the cache get a new copy, save it, respond with it.
  if (!value) return handleUpdate(args, updateData).then((data) => handleResponse(args, data))
  // Found value. Respond early. Always (for now anyway).
  event.waitUntil(checkCache(args, updateData)
    .then(() => refererLog(event.request.headers.get('referer'))))
  return handleResponse(args, value)
}

module.exports = {
  checkCache,
  handleCacheRequest,
  handleUpdate,
  loadCached,
  loadOrUpdateCached,
}
