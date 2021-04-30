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
  let tempUk = [...ukTitles]
  let tempUsa = [...usaTitles]
  let exitArr = []
  for (let i in ukTitles) {
    if (ukTitles.indexOf(usaTitles[i]) !== -1) {
      tempUsa.splice(i,1,'')
      tempUk.splice(ukTitles.indexOf(usaTitles[i]), 1, '')
      let _i = ukTitles.indexOf(usaTitles[i])
      exitArr.push({
        usa: {
          title: usa[i].title,
          url:`https://www.nintendo.com${usa[i].url}`,
          nsuid: usa[i].nsuid,
          
        },
        uk: {
          title: uk[_i].title,
          url: `https://www.nintendo.co.uk/${uk[_i].url}`,
          nsuid: uk[i].nsuid_txt?uk[i].nsuid_txt[0]:'',
          productCode: uk[i].product_code_txt[0],
          language: uk[i].language_availability,
          demo_availability: uk[i].demo_availability,
          agerating: uk[i].pretty_agerating_s,
          play_mode_tv_mode_b:uk[i].play_mode_tv_mode_b,
          play_mode_handheld_mode_b:uk[i].play_mode_handheld_mode_b,
          play_mode_tabletop_mode_b:uk[i].play_mode_tabletop_mode_b,
          cloud_saves_b: uk[i].cloud_saves_b,
          club_nintendo:uk[i].club_nintendo,
          compatible_controller:uk[i].compatible_controller,
          digital_version_b:uk[i].digital_version_b,
        },
        code:uk[i].product_code_txt[0]
      })
    }
  }
  tempUsa = tempUsa.filter(item => {
    return item
  })
  tempUk = tempUk.filter(item => {
    return item
  })
  console.log(exitArr.length,'exitArr')
  // writeJson(exitArr,'ukUsa.json')
  // writeJson(tempUk,'tempUk.json')
}
compareJSON()