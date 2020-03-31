const { gql } = require('apollo-server-cloudflare')

const typeDefs = gql`
  scalar JSONObject
  scalar Date

  interface DataPoint {
    positives: Int
    negatives: Int
    positivesPlusNegatives: Int
    pending: Int
    deaths: Int
    total: Int
  }

  type CovidStat {
    state: String!
    positive: Int
    negative: Int
    pending: Int
    death: Int
    dateModified: Date
    dateChecked: Date
  }

  type Headers {
    Cookie: String
  }
  type Tracker {
    url: String
    kind: String
    filter: String
    headers: JSONObject
    navigate: String
    options: JSONObject
    ssl_no_verify: Boolean
  }
  type Image {
    url: String
    date: String
  }
  type CovidResource {
    state: String!
    url: String
    images: [Image]
    name: String
    pui: String
    pum: Boolean
    notes: String
    tracker: Tracker
    total: CovidStat
    daily: [CovidStat]
  }
  type HealthDepartment {
    url: String
    twitter: String
  }
  type State {
    id: String!
    name: String!
    covidResource: CovidResource
    healthDepartment: HealthDepartment
  }

  type USDailyDataPoint implements DataPoint {
    date: Date
    states: Int
    positive: Int
    negative: Int
    posNeg: Int
    pending: Int
    hospitalized: Int
    death: Int
    total: Int
    hash: String
    dateChecked: Date
    totalTestResults: Int
    deathIncrease: Int
    hospitalizedIncrease: Int
    negativeIncrease: Int
    positiveIncrease: Int
    totalTestResultsIncrease: Int
  }

  type USTotalDataPoint implements DataPoint {
    positives: Int
    negatives: Int
    positivesPlusNegatives: Int
    pending: Int
    deaths: Int
    total: Int
  }

  type Query {
    state(id: ID!): State
    states(ids: [ID]): [State]!
    usCumulativeTotal: USTotalDataPoint
    usDailyData: [USDailyDataPoint]
  }
`

module.exports = typeDefs
