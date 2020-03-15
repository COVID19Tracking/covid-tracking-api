const { gql } = require('apollo-server-cloudflare')

const typeDefs = gql`
  scalar JSONObject

  type CovidStat {
    state: String!
    positive: Int
    negative: Int
    pending: Int
    death: Int
    dateModified: String
    dateChecked: String
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

  type Query {
    state(id: ID!): State
    states(ids: [ID]): [State]!
  }
`

module.exports = typeDefs
