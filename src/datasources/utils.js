const _ = require('lodash/fp')
const { addHours, formatISO, parse } = require('date-fns/fp')
const { zonedTimeToUtc } = require('date-fns-tz/fp')
const { setFieldWith } = require('prairie')
const { nameByCode } = require('./stateNames')

const toDate = _.flow(
  zonedTimeToUtc('America/New_York'),
  addHours(16),
  formatISO,
)

const dailyDate = _.flow(
  parse(new Date(), 'yyyyMMdd'),
  toDate,
)
const totalDate = _.flow(
  parse(new Date(), 'M/dd HH:mm'),
  toDate,
)

const addName = setFieldWith('name', 'state', nameByCode)

module.exports = {
  addName,
  dailyDate,
  totalDate,
}
