/*
  香港
*/

const superagent = require('superagent');
const cheerio = require('cheerio');
var async = require('async');
var fs = require('fs'); // node自带
const jsonfile = require('jsonfile')
const {writeJson} = require('./util/writeJson')


function getUSAJson() {
  return new Promise((resolve, reject) => {
    jsonfile.readFile('./dist/HK.json')
      .then(obj => resolve(obj))
      .catch(error => reject(error))
  })
}

function getUKJson() {
  return new Promise((resolve, reject) => {
    jsonfile.readFile('./dist/jp.json')
      .then(obj => resolve(obj))
      .catch(error => reject(error))
  })
}

async function compareJSON() {
  let usa = await getUSAJson()
  let uk = await getUKJson()
  let usaTitles = usa.map(item => {
    // console.log(item.productCode, 'item.productCode')
    let tempCode = item.productCode? item.productCode.replace(/HACP/g, ``):''
    return tempCode ? tempCode.substr(0, tempCode.length - 1):''
  })
  let ukTitles = uk.map((item, index) => {
    return item.icode?item.icode.substr(0, item.icode.length - 1):''
  })
  // console.log(usaTitles,'usaTitles')
  // console.log(ukTitles,'ukTitles')
  let exitArr = []
  for (let _i in ukTitles) {
    if (usaTitles.indexOf(ukTitles[_i]) !== -1) {
      let i = usaTitles.indexOf(ukTitles[_i])
      exitArr.push({
        hk: {
          title: usa[i].name,
          url: usa[i].url,
          productCode: usa[i].productCode,
          platform: usa[i].platform,
          game_category: usa[i].game_category,
          release_date: usa[i].release_date,
          publisher: usa[i].publisher,
          no_of_players: usa[i].no_of_players,
          language: usa[i].supported_languages,
          required_space: usa[i].required_space,
          imgList: usa[i].imgList,
          desc: usa[i].desc,
          
        },
        jp: {
          title: uk[_i].title,
          url: uk[_i].iurl,
          nsuid: uk[i].nsuid?uk[i].nsuid:'',
          productCode: uk[i].icode,
          language: uk[i].lang,
        },
        code:uk[i].icode
      })
    }
  }
  // tempUsa = tempUsa.filter(item => {
  //   return item
  // })
  // tempUk = tempUk.filter(item => {
  //   return item
  // })
  console.log(exitArr.length,'exitArr')
  // writeJson(exitArr,'hkJp.json')
  // writeJson(tempUk,'tempUk.json')
}
compareJSON()