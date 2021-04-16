/*
  美国
*/

const superagent = require('superagent');
const { stringify } = require('querystring');

const USAGAMEHTMLURL = 'https://www.nintendo.com/games/game-guide/?pv=true'; //页面url
const USAGAMEURL = 'https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries';

const Referer = "https://www.nintendo.com/games/game-guide/?pv=true";

async function requestUSATarget(limit = 250,page = 1,data = [], url = USAGAMEURL, referer = Referer) {
  const formData = {
    requests: [{
      indexName: "ncom_game_en_us",
      params: stringify({
        query: '',
        hitsPerPage: limit,
        page,
        analytics: false,
        facets: ["generalFilters","platform","availability","genres","howToShop","virtualConsole","franchises","priceRange","esrbRating","playerFilters"],
        tagFilters: ''
      })
    }]
  };
  let total = 0;
  console.log(url, 'url')
  await superagent.post(url)
      .query({
        "Content-Type": 'application/json',
        "x-algolia-application-id": "U3B6GR4UA3",
        "x-algolia-api-key": "c4da8be7fd29f0f5bfa42920b0a99dc7"
      })
      .send(formData)
    .then(res => {
      console.log(res.body, 'res')
        const { results } = res.body;
        const { hits,nbPages } = results[0];
        page += 1;
        total = nbPages;
        data.push(...hits);
      })
    .catch(err => {
      console.log(err.response)
      return err
      });
  if(total >= page) {
    await requestUSATarget(250,page,data)
  }
  return data
}

module.exports = {
  requestUSATarget
};

