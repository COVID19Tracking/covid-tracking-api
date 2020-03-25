const _ = require('lodash/fp')
const { log, processResult } = require('./fetch')
const { runSearch } = require('./utils')
const toStr = require('./csv')

const CACHE_LIFETIME = 18000 // 5 hours

// fetch, save, return result of toStr()
async function handleUpdate(args, updateData, returnRaw = false) {
  const { cache, cacheId } = args
  // fetch new data
  const data = await updateData(args)
    .then(processResult(args.route.fixItems))
    .then(runSearch(args.search))
  // save
  if (_.isEmpty(data)) return Promise.reject(new Error('Missing data.'))
  const dataStr = await toStr(args, data)
  return cache.put(cacheId, dataStr, { expirationTtl: CACHE_LIFETIME })
    .then(() => log({
      cacheId,
      category: 'handleUpdate',
      text: 'Saved item to cache',
    }))
    .then(() => (returnRaw ? data : dataStr)) // return data.
}

async function checkCache(args, updateData) {
  // If there is a search.date then extend TTL to max.
  const { cache, cacheId, ttl = 300 } = args
  // Figure out cache times.
  const list = await cache.list({ prefix: cacheId, limit: 1 })
  const time = list.keys[0].expiration // will fail processes if not found.
  const cacheTtl = _.round(time - (new Date() / 1000))
  const age = CACHE_LIFETIME - cacheTtl
  const replace = age > ttl
  if (replace) {
    await log({
      cacheId,
      category: 'checkCache',
      text: `replace ttl: ${ttl}, age: ${age}`,
    })
  }
  // Save a new copy to the cache.
  return replace ? handleUpdate(args, updateData) : Promise.resolve()
}

async function handleCacheRequest(event, args, updateData, handleResponse) {
  const { cache, cacheId } = args
  // Look for saved value first.
  const value = await cache.get(cacheId)
  // console.log('cache val', value)
  // If we did not find a value in the cache get a new copy, save it, respond with it.
  if (!value) return handleUpdate(args, updateData).then((data) => handleResponse(args, data))
  // Found value. Respond early. Always (for now anyway).
  event.waitUntil(checkCache(args, updateData))
  return handleResponse(args, value)
}

module.exports = {
  checkCache,
  handleCacheRequest,
  handleUpdate,
}
