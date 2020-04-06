const _ = require('lodash/fp')
const { getSheet } = require('./sheets')
const { dataResponse, handleResponse2 } = require('./responses')
const apollo = require('./apollo')
const playground = require('./playground')
const getXml = require('./xml')
const getYaml = require('./yaml')
const { handleCacheRequest } = require('./cache')
const { getJson } = require('./fetch')

/* globals fetch Response */

// Function to fetch or build new content body.
// Apply headers
// Return result

const handleRequest = (redirectMap, event, cache) => {
  const { request } = event
  if (request.method === 'OPTIONS') return new Response('', { status: 204 })
  const { url } = request
  const {
    origin, pathname, search, searchParams,
  } = new URL(url)
  const [path, ext] = pathname.split('.')
  const route = redirectMap && redirectMap.get(path)
  if (!route) {
    const res = { code: 404, error: '404 - NOT FOUND', pathname }
    return dataResponse(res, { status: 404 })
  }
  if (_.isString(route)) {
    // Anything that starts with 'files' will proxy b2.
    if (route.startsWith('http')) return Response.redirect(route, 302)
    return Response.redirect(`${origin}/${route}`, 302)
  }
  // Check to see if the pathname is in the cache.
  // cache.get(pathname)

  const args = {
    cache,
    cacheId: pathname + search,
    ext,
    origin,
    pathname,
    path,
    route,
    ttl: route.ttl,
    search: _.fromPairs([...searchParams.entries()]),
    responseType: (ext === 'csv') ? ext : 'json',
  }
  if (_.isFunction(route)) return route(event, args)

  const { app } = route

  function getApp(updateFunc) {
    const updateData = () => updateFunc(args.route)
    return handleCacheRequest(event, args, updateData, handleResponse2)
  }

  if (app === 'apollo') return apollo(request, route)
  if (app === 'playground') return playground(route)
  if (app === 'sheets') return getApp(getSheet)
  if (app === 'xml') return getApp(getXml)
  if (app === 'yaml') return getApp(getYaml)
  if (app === 'json') {
    if (_.isEmpty(search) && !route.fixItems && !route.finalPrep) {
      Response.redirect(route.url, 302)
    }
    return getApp(getJson)
  }
  return fetch(request)
}

module.exports = handleRequest
