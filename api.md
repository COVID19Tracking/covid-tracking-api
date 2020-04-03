The default response is JSON using normal GET requests. If you'd like CSV just use `.csv` as an extension instead of `.json` at the end of the url.

All data is cumulative (unless specifically noted), so you should not see any counts going down over time. If you do, please get in touch as it is likely an error. As you might be able to tell from the key names, date time values are in ET.

Please be aware that each state has its own set of caveats, which we have documented on our [data page](/data/).

Major API revisions will be versioned. Please see fields marked _DEPRECATED_ below.

* States Current Values - [/api/v1/states/current.json](/api/v1/states/current.json) | [CSV](/api/v1/states/current.csv)
* States Historical Data - [/api/v1/states/daily.json](/api/v1/states/daily.json) | [CSV](/api/v1/states/daily.csv)
* States Information - [/api/v1/states/info.json](/api/v1/states/info.json) | [CSV](/api/v1/states/info.csv)
* US Current Values - [/api/v1/us/current.json](http://covidtracking.com/api/us) | [CSV](/api/us.csv)
* US Historical Data - [/api/us/daily](/api/us/daily) | [CSV](/api/us/daily.csv)
* Counties- [/api/counties](/api/counties) | [CSV](/api/counties.csv)
* Tracker URLs - [/api/urls](/api/urls)
* State Website Screenshots - [/api/screenshots](/api/screenshots)
* In the press - [/api/press](/api/press)

If you want to filter the `/api/states/daily` you can add a query param like `?state=NY` to only show cases in New York. Or `/api/states/daily?state=NY&date=20200316` to show the result of a specific date. Or to access the most recent value `/api/states?state=NY`.

## GraphQL API

* Playground - [/api/playground](https://covidtracking.com/api/playground)
* GraphQL API - [/api/graphql](https://covidtracking.com/api/graphql)

## Endpoint Details

### /api/states - States Current Values

These numbers are updated periodically throughout the day.

[/api/states](http://covidtracking.com/api/states) | [CSV](/api/states.csv)

* `state` - State or territory postal code abbreviation.
* `positive` - Total cumulative **positive** test results.
* `positiveScore` - +1 for reporting positives reliably.
* `negative` - Total cumulative **negative** test results.
* `negativeScore` - +1 for reporting negatives sometimes.
* `negativeRegularScore` - +1 for reporting negatives reliably.
* `commercialScore` - +1 for reporting all commercial tests.
* `score` - Total reporting quality score.
* `grade` - Letter grade based on score.
* `totalTestResults` - Calculated value (`positive` + `negative`) of total test results.
* `hospitalized` - Total cumulative number of people hospitalized.
* `death` - Total cumulative number of people that have died.
* `dateModified` - ISO 8601 date of the time the data was last updated by the state.
* `dateChecked` - ISO 8601 date of the time we last visited their website
* `hash` - A unique ID changed every time the data updates.
* `total` - _DEPRECATED_ Will be removed in the future. (`positive` + `negative` + `pending`). Pending has been an unstable value and should not count in any totals.

### /api/states/daily - States Historical Data

Entries saved each day at 4 pm ET.

[/api/states/daily](http://covidtracking.com/api/states/daily) | [CSV](/api/states/daily.csv)

* `state` - State or territory postal code abbreviation.
* `positive` - Total cumulative **positive** test results.
* `positiveIncrease` - Increase from the day before.
* `negative` - Total cumulative **negative** test results.
* `negativeIncrease` - Increase from the day before.
* `pending` - Tests that have been submitted to a lab but no results have been reported yet.
* `totalTestResults` - Calculated value (`positive` + `negative`) of total test results.
* `totalTestResultsIncrease` - Increase from the day before.
* `hospitalized` - Total cumulative number of people hospitalized.
* `hospitalizedIncrease` - Increase from the day before.
* `death` - Total cumulative number of people that have died.
* `deathIncrease` - Increase from the day before.
* `dateChecked` - ISO 8601 date of the time we saved visited their website
* `total` - _DEPRECATED_ Will be removed in the future. (`positive` + `negative` + `pending`). Pending has been an unstable value and should not count in any totals.

### /api/states/info - States Information

[/api/states/info](/api/states/info) | [CSV](/api/states/info.csv)

* `state` - State or territory postal code abbreviation.
* `name` - Full state or territory name.
* `fips` - Federal Information Processing Standard state code
* `covid19Site` - Webpage dedicated to making results available to the public. More likely to contain numbers. We make regular screenshots of this URL.
* `covid19SiteSecondary` - Typically more informational.
* `twitter` - Twitter for the State Health Department
* `pui` - Person Under Investigation; it is meant to capture positive, negative, and pending test results.
* `pum` - Person Under Monitoring; we don’t collect these numbers as they are reported far less consistently across states
* `notes` - Notes about the information available and how we collect or record it.

### /api/us - US Current Values

These numbers are updated periodically throughout the day.

[/api/us](http://covidtracking.com/api/us) | [CSV](/api/us.csv)

* `positive` - Total cumulative **positive** test results.
* `negative` - Total cumulative **negative** test results.
* `totalTestResults` - Calculated value (`positive` + `negative`) of total test results.
* `hospitalized` - Total cumulative number of people hospitalized.
* `death` - Total cumulative number of people that have died.
* `hash` - A unique ID changed every time the data updates. Survives a cache reset.
* `lastModified` - The date the _API cache_ was last updated. Even if the values didn't change but the cache was manually cleared or reset the date will reflect that time of reset and doesn't necessarily indicate an update was made. Manual cache clearing is rare however.

* `posNeg` - _DEPRECATED_ Renamed to `totalTestResults`.
* `total` - _DEPRECATED_ Will be removed in the future. (`positive` + `negative` + `pending`). Pending has been an unstable value and should not count in any totals.

### /api/us/daily - US Historical Data

Entries saved each day at 4 pm ET.

[/api/us/daily](/api/us/daily) | [CSV](/api/us/daily.csv)

* `dateChecked` - ISO 8601 date of when these values were valid.
* `states` - Quantity of states and territories that are reporting data.
* `positive` - Total cumulative **positive** test results.
* `positiveIncrease` - Increase from the day before.
* `negative` - Total cumulative **negative** test results.
* `negativeIncrease` - Increase from the day before.
* `hospitalized` - Total cumulative number of people hospitalized.
* `hospitalizedIncrease` - Increase from the day before.
* `death` - Total cumulative number of people that have died.
* `deathIncrease` - Increase from the day before.
* `pending` - Tests that have been submitted to a lab but no results have been reported yet.
* `totalTestResults` - Calculated value (`positive` + `negative`) of total test results.
* `totalTestResultsIncrease` - Increase from the day before.
* `posNeg` - _DEPRECATED_ Renamed to `totalTestResults`.
* `total` - _DEPRECATED_ Will be removed in the future. (`positive` + `negative` + `pending`). Pending has been an unstable value and should not count in any totals.

### /api/urls - Tracker URLs

[/api/urls](/api/urls)

* `name`: State Name
* `stateId`: State or territory postal code abbreviation.
* `url`: String
* `kind`: String
* `filter`: String
* `headers`: Object
* `navigate`: String
* `options`: Object
* `ssl_no_verify`: Boolean

### /api/cdc/daily - CDC Reported Tests

[/api/cdc/daily](/api/cdc/daily) | [CSV](/api/cdc/daily.csv)

The table found on the [CDC Testing in U.S. webpage](https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/testing-in-us.html) is available via this endpoint. Please visit the [CDC](https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/testing-in-us.html) to learn more. [Source](https://docs.google.com/spreadsheets/d/16gBHQ7dCJK1psqEMasmLKiFlzoNKcfNujVpmHLHldSY/edit#gid=0)

[/api/cdc/daily](http://covidtracking.com/api/cdc/daily) | [CSV](/api/api/cdc/daily.csv)

* `dateCollected`
* `cdcLabs`
* `usPubHealthLabs`
* `dailyTotal`
* `lag`
