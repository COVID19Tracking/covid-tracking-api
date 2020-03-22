const _ = require('lodash/fp')
const { addHours, formatISO, parse } = require('date-fns/fp')
const { zonedTimeToUtc } = require('date-fns-tz/fp')
const { setFieldWith } = require('prairie')
const { nameByCode } = require('./stateNames')

const toDate = _.flow(
  zonedTimeToUtc('America/New_York'),
  formatISO,
)

const dailyDate = _.flow(
  parse(new Date(), 'yyyyMMdd'),
  addHours(16),
  toDate,
)
const totalDate = _.flow(
  (x) => parse(new Date(), 'M/dd HH:mm', x),
  toDate,
)
const screenshotDate = _.flow(
  parse(new Date(), 'yyyyMMddHHmmss'),
  toDate,
)
const addName = setFieldWith('name', 'state', nameByCode)

module.exports = {
  addName,
  dailyDate,
  screenshotDate,
  totalDate,
}
