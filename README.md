# 👷 Covid Tracking API

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) that makes a requests to get the sheet info and then cleans it up a bit and returns an array of values.

## Initial Basic API

The default response is JSON. If you'd like CSV just append `.csv` at the end of the url. For example https://covidtracking.com/api/states.csv

* States current - http://covidtracking.com/api/states
* States daily 4 pm ET - http://covidtracking.com/api/states/daily
* States info - http://covidtracking.com/api/states/info
* US current - http://covidtracking.com/api/us
* US daily - http://covidtracking.com/api/us/daily
* Counties- http://covidtracking.com/api/counties
* Tracker URLs - http://covidtracking.com/api/urls

## How

Currently each and every request is passed through netlify to cloudflare and then to an endpoint that makes an API request to google and then cleans it up and decides format before returning results. A cache can be configured if desired but is not currently enabled.

#### Easy Deploy w/ Wrangler

[wrangler](https://github.com/cloudflare/wrangler)

* Add wrangler.toml file.
* Get a Google API Key https://console.developers.google.com/
* Add Google API Key to cloudflare environment with the command `wrangler secret put GOOGLE_API_KEY`
* Publish to Cloudflare with the command `wrangler publish`

#### Serverless

To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.

#### Testing locally
`yarn global add cloudflare-work-local`
`wrangler build && cloudflare-worker-local worker/script.js covid.cape.io 3000`
