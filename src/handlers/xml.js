const _ = require('lodash/fp')
const parser = require('fast-xml-parser')

/* globals fetch */

// const xml2js = require('xml2js') // TOO SLOW - RESOURCE INTENSE
// const parser = new xml2js.Parser({
//   explicitArray: false,
//   explicitRoot: false,
//   ignoreAttrs: true,
//   mergeAttrs: true,
//   tagNameProcessors: [_.camelCase],
// })

function parse(xmlText, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      resolve(parser.parse(xmlText, options, true))
    } catch (err) {
      reject(err)
    }
  })
}

function getXml({ fixItems, url }) {
  // console.log(url)
  return fetch(url, { cf: { cacheTtl: 300 }, headers: { Accept: 'text/xml' } })
    .then((response) => response.text())
    // .then((x) => console.log(x) || x)
    .then(parse)
    .then((x) => (_.isFunction(fixItems) ? fixItems(x) : x))
}

module.exports = getXml
