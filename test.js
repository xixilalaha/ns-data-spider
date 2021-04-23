/*
  香港
*/

const superagent = require('superagent');
const cheerio = require('cheerio');
var async = require('async');
var fs = require('fs'); // node自带
const jsonfile = require('jsonfile')


function getUSAJson() {
  return new Promise((resolve, reject) => {
    jsonfile.readFile('./dist/USA2.json')
      .then(obj => resolve(obj))
      .catch(error => reject(error))
  })
}

function getUKJson() {
  return new Promise((resolve, reject) => {
    jsonfile.readFile('./dist/UK.json')
      .then(obj => resolve(obj))
      .catch(error => reject(error))
  })
}

async function compareJSON() {
  let usa = await getUSAJson()
  let uk = await getUKJson()
  let usaTitles = usa.map(item => {
    return item.title
  })
  let ukTitles = uk.map((item, index) => {
    return item.title
  })
  let exitArr = []
  for (let i in ukTitles) {
    if (ukTitles.indexOf(usaTitles[i]) !== -1) {
      exitArr.push(usaTitles[i])
    }
  }
  console.log(exitArr,'exitArr')
}
compareJSON()