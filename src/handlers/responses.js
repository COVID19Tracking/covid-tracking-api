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

const jsonTxtResponse = (res, init = {}) => new Response(res, resInit(init))
const dataResponse = (res, init) => jsonTxtResponse(JSON.stringify(res), init)
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

function handleResponse({ ext, pathname }) {
  return (res) => {
    if (ext === 'csv') {
      return new Promise((resolve) => {
        jsonexport(res, (err, csv) => {
          if (err) return resolve(new Response(err.stack || err))
          return resolve(csvResponse(csv, pathname))
        })
      })
    }
    // txt or html could be added.
    return dataResponse(res)
  }
}

function handleResponse2({ ext, pathname }, value) {
  // console.log('handleResponse2', pathname)
  if (ext === 'csv') return csvResponse(value, pathname)
  if (_.isString(value)) return jsonTxtResponse(value)
  // console.log('data')
  return dataResponse(value)
}

module.exports = {
  resInit,
  csvResponse,
  dataResponse,
  handleResponse,
  handleResponse2,
  htmlResponse,
  jsonTxtResponse,
}
