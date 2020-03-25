const _ = require('lodash/fp')
const jsonexport = require('jsonexport')

const toString = _.curry(({ ext }, res) => {
  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      jsonexport(res, (err, csv) => {
        if (err) return reject(err.stack || err)
        return resolve(csv)
      })
    })
  }
  // txt or html could be added.
  return Promise.resolve(JSON.stringify(res))
})

module.exports = toString
