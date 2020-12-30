# 👷 Covid Tracking API

## Our API has moved to:

- [API Build tool](https://github.com/COVID19Tracking/covid-public-api-build)
- [API data repository](https://github.com/COVID19Tracking/covid-public-api)

---

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) that makes a requests to get the sheet info and then cleans it up a bit and returns an array of values.

## Initial Basic API

The default response is JSON. If you'd like CSV just append `.csv` at the end of the url. For example https://covidtracking.com/api/states.csv

* States current - [/api/states](https://covidtracking.com/api/states) | [CSV](https://covidtracking.com/api/states.csv) `lastUpdateEt` is the state’s last data update. `checkTimeET` is the last time our people checked.
* States daily 4 pm ET - [/api/states/daily](https://covidtracking.com/api/states/daily) | [CSV](https://covidtracking.com/api/states/daily.csv)
* States info - [/api/states/info](https://covidtracking.com/api/states/info) | [CSV](https://covidtracking.com/api/states/info.csv)
* US current - [/api/us](https://covidtracking.com/api/us) | [CSV](https://covidtracking.com/api/us.csv)
* US daily - [/api/us/daily](https://covidtracking.com/api/us/daily) | [CSV](https://covidtracking.com/api/us/daily.csv)
* Counties- [/api/counties](https://covidtracking.com/api/counties) | [CSV](https://covidtracking.com/api/counties.csv)
* Tracker URLs - [/api/urls](https://covidtracking.com/api/urls)
* State Website Screenshots - [/api/screenshots](https://covidtracking.com/api/screenshots)

If you want to filter the `/api/us/daily` you can add a query param like `?state=NY` to only show cases in New York. Or `?state=NY&date=20200316` to show the result of a specific date.

## GraphQL API

* Playground - https://covidtracking.com/api/playground
* GraphQL API - https://covidtracking.com/api/graphql

## Technical How

Currently each and every request is passed through [Netlify](https://docs.netlify.com/routing/redirects/rewrites-proxies/) to [Cloudflare](https://workers.cloudflare.com/) that makes an API request to fetch the resource and then cleans it up and decides on format (CSV/JSON) before returning results. For caching we are utilizing a KV store.

## Staging


## Errors

There is no error console unfortunately.

#### Easy Deploy w/ Wrangler

[wrangler](https://github.com/cloudflare/wrangler)

* Add wrangler.toml file.
* Get a Google API Key https://console.developers.google.com/
* Add Google API Key to cloudflare environment with the command `wrangler secret put GOOGLE_API_KEY`
* Publish to Cloudflare with the command `wrangler publish`

#### Serverless

To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.

#### Testing locally

Install [cloudflare-worker-local](https://github.com/gja/cloudflare-worker-local)

`yarn global add cloudflare-work-local`
`yarn global add nodemon`
`wrangler build && cloudflare-worker-local worker/script.js covid.cape.io 3000 wrangler.toml staging`

`nodemon --watch worker/script.js --signal SIGHUP --exec 'cloudflare-worker-local worker/script.js covid.cape.io 3000'`

#### KV Cache Keys

`wrangler kv:key list --binding=COVID --env=staging`
`wrangler kv:key list --binding=COVID --env=production --prefix="/states.json"`
`wrangler kv:key delete --binding=COVID --env=staging "/screenshots"`
`wrangler kv:key delete --binding=COVID --env=production "/press"`

#### Secrets

`wrangler secret put GOOGLE_API_KEY --env=staging`

## History

Google often requires an API key or has some strange formatting. I just wanted an array of values that reflected the sheet rows. No long complicated URL.

At first the worker was just a simple proxy, making an API request for every worker request.
Then I added cf: { cacheEverything: true, cacheTtl: 120 } to the fetch() options so CF could cache the fetch result.
Some endpoints requested XML from AWS and it takes some time to parse a really big XML file so using the CF Key Value storage for the parsed result was implemented.
It was requested to offer a CSV download so that was added too.
Then people wanted to be able to do some basic queries so I turned the search query args into an object and passed it to _.filter. That allows /states/daily?state=MN to return the state values for a specific state.
It’s tricky to stay within the 50ms processing time limit when doing XML parsing or making large CSV files so Cloudflare had to increase our limits.
We put a TTL limit (like an hour) on every file saved to cache. On a new request we return the previous generated result from the cache and then lookup the TTL of the item and if it’s more than 5 minutes old we make a new request and save it to the cache for next time. This way the user gets a fast result before we update an entry. If no user makes a request for an hour the cached item expires and the next request has to wait for a full process before response but that doesn’t happen for the popular endpoint/query options
No volunteers were excited to help with the API because local development is too difficult.
There’s no official tools for local development. There is https://github.com/gja/cloudflare-worker-local but it’s incomplete and has bugs. There is https://github.com/dollarshaveclub/cloudworker but is has a big “no longer actively maintained” message at the top of the page.
Ultimately this caused the project to start building hundreds of static files (json/csv) for many of the most popular queries during the site build/compile process so it’s easier for others to help.
I had a GraphQL endpoint for a bit but I think it’s easier to send the data into a postgres database and throw Hasura in front of it to handle auto GraphQL functionality.
