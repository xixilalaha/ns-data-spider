/*
  加拿大
*/

const { requestUSATarget2 } = require('./USA2');

const CAGAMEHTMLURL = 'https://www.nintendo.com/en_CA/games/game-guide'; //页面url
const CAGAMEURL = 'https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries';
const indexName = 'ncom_game_en_ca';

const Referer = 'https://www.nintendo.com/en_CA/games/game-guide/';

async function requestCATarget(query){
  return requestUSATarget2(query,indexName)
}

module.exports = {
  requestCATarget
};