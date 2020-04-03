# 👷 Covid Tracking API

**THIS CODE IS BEING MOVED TO THE WEBSITE REPOSITORY**

PLEASE VISIT https://github.com/COVID19Tracking/website/tree/master/build

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
