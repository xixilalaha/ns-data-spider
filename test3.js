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
    jsonfile.readFile('./dist/hkJp.json')
      .then(obj => resolve(obj))
      .catch(error => reject(error))
  })
}

function getUKJson() {
  return new Promise((resolve, reject) => {
    jsonfile.readFile('./dist/ukUsa.json')
      .then(obj => resolve(obj))
      .catch(error => reject(error))
  })
}

async function compareJSON() {
  let usa = await getUSAJson()
  let uk = await getUKJson()
  let usaTitles = usa.map(item => {
    return item.code?item.code.substr(0, item.code.length - 1):''
  })
  // console.log(usaTitles,'usaTitles')
  let ukTitles = uk.map((item, index) => {
    let tempCode = item.code? item.code.replace(/HACP/g, ``):''
    return tempCode ? tempCode.substr(0, tempCode.length - 1):''
  })
  // console.log(ukTitles,'ukTitles')
  let exitArr = []
  for (let _i in ukTitles) {
    if (usaTitles.indexOf(ukTitles[_i]) !== -1) {
      let i = usaTitles.indexOf(ukTitles[_i])
      // console.log(usa[i].hk.title,'usaTitles[i]')
      exitArr.push({
        "name": usa[i].hk.title,
        "release_date": usa[i].hk.release_date,
        "nameEn": uk[_i].usa.title,
        "imgList": usa[i].hk.imgList,
        "platform": usa[i].hk.platform.split(' ')[1],
        "required_space": usa[i].hk.required_space,
        "game_category": usa[i].hk.game_category,
        "no_of_players": usa[i].hk.no_of_players,
        "publisher": usa[i].hk.publisher,
        "language": usa[i].hk.language,
        "agerating": uk[i].uk.agerating,
        "play_mode_tv_mode_b": uk[i].uk.play_mode_tv_mode_b,
        "play_mode_handheld_mode_b": uk[i].uk.play_mode_handheld_mode_b,
        "play_mode_tabletop_mode_b": uk[i].uk.play_mode_tabletop_mode_b,
        "cloud_saves_b": uk[i].uk.cloud_saves_b,
        "club_nintendo": uk[i].uk.club_nintendo,
        "compatible_controller": uk[i].uk.compatible_controller,
        "digital_version_b": uk[i].uk.digital_version_b,
        "physical_version_b": uk[i].uk.physical_version_b || false,
        "desc": usa[i].hk.desc,
        "isTotalCh": 1,
        "currentLowestPrice": "",
        "currentLowestPriceRegion": "",
      })
    }
  }
  console.log(exitArr.length,'exitArr')
  writeJson(exitArr,'infoFinal.json')
}
compareJSON()