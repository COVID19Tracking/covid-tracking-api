// const _ = require('lodash/fp')
const yaml = require('js-yaml')
const { fetchYaml, log, processResult } = require('./fetch')
const { handleResponse2 } = require('./responses')
const { runSearch } = require('./utils')
const toStr = require('./csv')

function update({ args, multi, url }) {
  return () => fetchYaml(url)
    .then((text) => {
      try {
        if (!multi) return yaml.safeLoad(text, args)
        const items = []
        const addItem = (item) => items.push(item)
        yaml.safeLoadAll(text, addItem, args)
        return items
      } catch (err) {
        return {
          error: true,
          ...err,
        }
      }
    })
}

// fetch, save, return result of toStr()
async function handleUpdate(args, updateData, returnRaw = false) {
  const { cache, cacheId } = args
  // fetch new data
  const data = await updateData(args)
    .then(processResult(args.fixItems))
    .then(runSearch(args.search))
  // save
  const dataStr = await toStr(args, data)
  await log(`Saving to cache ${cacheId}`)
  return cache.put(cacheId, dataStr, { expirationTtl: 3600 })
    .then(() => (returnRaw ? data : dataStr)) // return data.
}

async function checkCache(args, updateData) {
  const { cache, cacheId, ttl = 300 } = args
  // Figure out cache times.
  const list = await cache.list({ prefix: cacheId, limit: 1 })
  const time = list.keys[0].expiration // will fail processes if not found.
  const cacheTtl = time - (new Date() / 1000)
  const age = 3600 - cacheTtl
  const replace = age > ttl
  await log(`${cacheId}, replace: ${replace}, age: ${age}`)
  // Save a new copy to the cache.
  return replace ? handleUpdate(args, updateData) : Promise.resolve()
}

async function handleRequest(event, args, updateData, handleResponse) {
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

function getYaml(event, routeInfo, args) {
  const updateData = update(routeInfo)
  return handleRequest(event, args, updateData, handleResponse2)
}

module.exports = getYaml
