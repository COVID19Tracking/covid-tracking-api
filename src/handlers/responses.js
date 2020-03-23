const _ = require('lodash/fp')
const jsonexport = require('jsonexport')
/* globals Response */

const resInit = _.defaultsDeep({
  status: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    // 'Allow-Headers': 'Content-type',
    // 'Allow-Methods': 'GET, POST, PUT',
    'Content-Type': 'application/json;charset=UTF-8',
    'Cache-Control': 'public, max-age=3600',
  },
})

const dataResponse = (res, init = {}) => new Response(JSON.stringify(res), resInit(init))
const csvResponse = (res, pathname) => new Response(res, resInit({
  headers: {
    'Content-Type': 'text/csv;charset=UTF-8',
    'Content-Disposition': `filename=${pathname.substr(1).replace(/\//g, '-')}`,
  },
}))

const htmlResponse = (html) => new Response(html, {
  headers: {
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=3600',
  },
})

function handleResponse({ cache, ext, pathname }) {
  const put = cache && _.isFunction(cache.put) ? cache.put : _.noop
  const cacheArgs = { expirationTtl: 60 * 60 }
  return (res) => {
    if (ext === 'csv') {
      return new Promise((resolve) => {
        jsonexport(res, (err, csv) => {
          if (err) return resolve(new Response(err.stack || err))
          put(pathname, csv, cacheArgs)
          return resolve(csvResponse(csv, pathname))
        })
      })
    }
    put(pathname, JSON.stringify(res), cacheArgs)
    // txt or html could be added.
    return dataResponse(res)
  }
}

module.exports = {
  resInit,
  csvResponse,
  dataResponse,
  handleResponse,
  htmlResponse,
}
