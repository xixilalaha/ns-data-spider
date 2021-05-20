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
const algoliasearch = require('algoliasearch');
const {
  writeJson
} = require('./util/writeJson')

const USAGAMEHTMLURL = 'https://www.nintendo.com/games/game-guide/?pv=true'; //页面url
const USAGAMEURL = 'https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries';

const Referer = "https://www.nintendo.com/games/game-guide/?pv=true";
const US_FACETS = ["generalFilters", "platform", "availability", "genres", "howToShop", "virtualConsole", "franchises", "priceRange", "esrbRating", "playerFilters"]

async function requestUSATarget2( query = 'Zumba® Burn It Up!',indexName = 'ncom_game_en_us',page = 0, data = [], url = USAGAMEURL) {
  const formData = {
    requests: [{
        indexName: indexName,
        params: stringify({
          query,
          hitsPerPage: 42,
          maxValuesPerFacet: 30,
          page,
          analytics: true,
          facets: US_FACETS,
          tagFilters:''
        })
      },
    ]
  };
  let total = 0;
  console.log(url, 'url')
  await superagent.post(url)
    .query({
      "Content-Type": 'application/json',
      "x-algolia-application-id": "U3B6GR4UA3",
      "x-algolia-agent": "Algolia for JavaScript (3.33.0); Browser (lite); JS Helper 2.20.1",
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
      console.log(err.response,'err')
      return err
    });
  // if (total >= page) {
  //   await requestUSATarget2(250, page, data)
  // }
  // writeJson(data,'USA.json')
  return data
}

module.exports = {
  requestUSATarget2
};