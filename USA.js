/*
  美国
*/

const superagent = require('superagent');
const {
  stringify
} = require('querystring');
const {
  randomHead,
  returnIp
} = require('./util/hideIp')
const {writeJson} = require('./util/writeJson')

const USAGAMEHTMLURL = 'https://www.nintendo.com/games/game-guide/?pv=true'; //页面url
const USAGAMEURL = 'https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries';

const Referer = "https://www.nintendo.com/games/game-guide/?pv=true";
const US_FACETS = ["generalFilters", "platform", "availability", "genres", "howToShop", "virtualConsole", "franchises", "priceRange", "esrbRating", "playerFilters"]
const US_INDEX_TITLE_ASC = 'ncom_game_en_us_title_asc';
const US_INDEX_TITLE_DES = 'ncom_game_en_us_title_des';
const US_ESRB_RATINGS_FILTERS = {
  everyone: 'esrbRating:Everyone',
  everyone10: 'esrbRating:Everyone 10+',
  teen: 'esrbRating:Teen',
  mature: 'esrbRating:Mature'
};
const US_PLATFORM_FACET_FILTER = 'platform:Nintendo Switch';
const US_AVAILABILITY_FILTER = 'availability:Coming soon';

async function requestUSATarget(limit = 250, page = 1, data = [], url = USAGAMEURL, referer = Referer) {
  const formData = {
    requests: [
      {
      indexName: US_INDEX_TITLE_ASC,
      params: stringify({
        query: '',
        hitsPerPage: limit,
        page,
        analytics: false,
        facets: US_FACETS,
        facetFilters: `[["${US_ESRB_RATINGS_FILTERS.everyone}"],["${US_PLATFORM_FACET_FILTER}"]]`
      })
      },
      {
        indexName: US_INDEX_TITLE_DES,
        params: stringify({
          query: '',
          hitsPerPage: limit,
          page,
          analytics: false,
          facets: US_FACETS,
          facetFilters: `[["${US_ESRB_RATINGS_FILTERS.everyone}"],["${US_PLATFORM_FACET_FILTER}"]]`
        })
      },
      {
        indexName: US_INDEX_TITLE_ASC,
        params: stringify({
          query: '',
          hitsPerPage: limit,
          page,
          analytics: false,
          facets: US_FACETS,
          facetFilters: `[["${US_ESRB_RATINGS_FILTERS.everyone10}"],["${US_PLATFORM_FACET_FILTER}"]]`
        })
      },
      {
        indexName: US_INDEX_TITLE_DES,
        params: stringify({
          query: '',
          hitsPerPage: limit,
          page,
          analytics: false,
          facets: US_FACETS,
          facetFilters: `[["${US_ESRB_RATINGS_FILTERS.everyone10}"],["${US_PLATFORM_FACET_FILTER}"]]`
        })
      },
      {
        indexName: US_INDEX_TITLE_ASC,
        params: stringify({
          query: '',
          hitsPerPage: limit,
          page,
          analytics: false,
          facets: US_FACETS,
          facetFilters: `[["${US_ESRB_RATINGS_FILTERS.teen}"],["${US_PLATFORM_FACET_FILTER}"]]`
        })
      },
      {
        indexName: US_INDEX_TITLE_DES,
        params: stringify({
          query: '',
          hitsPerPage: limit,
          page,
          analytics: false,
          facets: US_FACETS,
          facetFilters: `[["${US_ESRB_RATINGS_FILTERS.teen}"],["${US_PLATFORM_FACET_FILTER}"]]`
        })
      },
      {
        indexName: US_INDEX_TITLE_ASC,
        params: stringify({
          query: '',
          hitsPerPage: limit,
          page,
          analytics: false,
          facets: US_FACETS,
          facetFilters: `[["${US_ESRB_RATINGS_FILTERS.mature}"],["${US_PLATFORM_FACET_FILTER}"]]`
        })
      },
      {
        indexName: US_INDEX_TITLE_ASC,
        params: stringify({
          query: '',
          hitsPerPage: limit,
          page,
          analytics: false,
          facets: US_FACETS,
          facetFilters: `[["${US_AVAILABILITY_FILTER}"],["${US_PLATFORM_FACET_FILTER}"]]`
        })
      }
    ]
  };
  let total = 0;
  console.log(url, 'url')
  await superagent.post(url).set({
      "User-Agent": randomHead(),
      "X-Forwarded-For": returnIp()
    })
    .query({
      "Content-Type": 'application/json',
      "x-algolia-application-id": "U3B6GR4UA3",
      "x-algolia-api-key": "c4da8be7fd29f0f5bfa42920b0a99dc7"
    })
    .send(formData)
    .then(res => {
      console.log(res.body, 'res')
      const {
        results
      } = res.body;
      const {
        hits,
        nbPages
      } = results[0];
      page += 1;
      total = nbPages;
      data.push(...hits);
    })
    .catch(err => {
      console.log(err.response)
      return err
    });
  if (total >= page) {
    await requestUSATarget(250, page, data)
  }
  writeJson(data,'USA.json')
  return data
}

module.exports = {
  requestUSATarget
};