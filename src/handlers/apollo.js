const { ApolloServer } = require('apollo-server-cloudflare')
const { graphqlCloudflare } = require('apollo-server-cloudflare/dist/cloudflareApollo')
const setCors = require('./setCors')
// const KVCache = require('./kv-cache')

/* globals Response */

const createServer = ({
  dataSources, typeDefs, resolvers,
}) => new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  dataSources,
  // cache: kvCache ? new KVCache() : undefined,
})

function getApollo(request, graphQLOptions) {
  if (request.method === 'OPTIONS') return new Response('', { status: 204 })
  const server = createServer(graphQLOptions)
  return graphqlCloudflare(() => server.createGraphQLServerOptions(request))(request)
}
const handler = (request, graphQLOptions) => getApollo(request, graphQLOptions)
  .then(setCors(graphQLOptions.cors || {}))

module.exports = handler
