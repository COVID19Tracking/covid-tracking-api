const _ = require('lodash/fp')
const {
  setField, setFieldWith,
} = require('prairie')
const {
  addFips, addName, dailyDate,
} = require('./utils')

const sheets = {
  app: 'sheets',
  worksheetId: '18oVRrHj3c183mHmq3m89_163yuYltLNlOmPerQ18E8w',
  key: global.GOOGLE_API_KEY,
}


const addDailyDateChecked = setFieldWith('dateChecked', 'date', dailyDate)
const addTotalResults = setField('totalTestResults', _.flow(_.at(['positive', 'negative']), _.sum))
const fixDaily = _.map(_.flow(
  addDailyDateChecked,
  addTotalResults,
))
const fixStatesInfo = _.map(_.flow(
  addFips,
  addName,
))

const statesDaily = {
  ...sheets,
  fixItems: fixDaily,
  sheetName: 'States daily 4 pm ET',
}
const statesInfo = {
  ...sheets,
  fixItems: fixStatesInfo,
  sheetName: 'States',
}
const usDaily = {
  ...sheets,
  fixItems: fixDaily,
  sheetName: 'US daily 4 pm ET',
}

module.exports = {
  statesDaily,
  statesInfo,
  usDaily,
}
