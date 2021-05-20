/*
  墨西哥
*/

const { requestUSATarget2 } = require('./USA2');

const CAGAMEHTMLURL = 'https://www.nintendo.com/en_CA/games/game-guide'; //页面url
const CAGAMEURL = 'https://u3b6gr4ua3-dsn.algolia.net/1/indexes/*/queries';
const indexName = 'ncom_game_es_mx';

const Referer = 'https://www.nintendo.com/en_CA/games/game-guide/';

async function requestLATarget(query){
  return requestUSATarget2(query,indexName)
}

module.exports = {
  requestLATarget
};