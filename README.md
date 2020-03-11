# 👷 Covid Tracking API

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) that makes a requests to get the sheet info and then cleans it up a bit and returns an array of values.

## Initial Basic API

The default response is JSON. If you'd like CSV just append `.csv` at the end of the url. For example https://covid.cape.io/states.csv

* States current - https://covid.cape.io/states
* States daily 4 pm ET - https://covid.cape.io/states/daily
* States info - https://covid.cape.io/states/info
* US current - https://covid.cape.io/us
* US daily - https://covid.cape.io/us/daily
* Counties- https://covid.cape.io/counties

## How

Currently each and every request to an endpoint makes an API request to google and cleans it up before returning results. A cache can be configured if desired.

#### Easy Deploy w/ Wrangler

[wrangler](https://github.com/cloudflare/wrangler)

* Add wrangler.toml file.
* Get a Google API Key https://console.developers.google.com/
* Add Google API Key to cloudflare environment with the command `wrangler secret put GOOGLE_API_KEY`
* Publish to Cloudflare with the command `wrangler publish`

#### Serverless

To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.
