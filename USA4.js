/*
  香港
*/

const superagent = require('superagent');
const cheerio = require('cheerio');
var async = require('async');
var fs = require('fs'); // node自带
const jsonfile = require('jsonfile')
const download = require('download');
const {
  getDate2
} = require('./util/date2')
const {
  writeJson
} = require('./util/writeJson')

var xlsx = require('node-xlsx'); // npm i node-xlsx 安装

const HKHTMLURL = 'https://store.nintendo.com.hk/games/all-released-games';

//浏览器库
const userAgents = [
  "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12",
  "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Acoo Browser; SLCC1; .NET CLR 2.0.50727; Media Center PC 5.0; .NET CLR 3.0.04506)",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20",
  "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Fedora/1.9.0.8-1.fc10 Kazehakase/0.5.6",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER",
  "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET CLR 2.0.50727; Media Center PC 6.0) ,Lynx/2.8.5rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/1.2.9",
  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
  "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
  "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:2.0b13pre) Gecko/20110307 Firefox/4.0b13pre",
  "Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; fr) Presto/2.9.168 Version/11.52",
  "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12",
  "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)",
  "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Fedora/1.9.0.8-1.fc10 Kazehakase/0.5.6",
  "Mozilla/5.0 (X11; U; Linux; en-US) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.6",
  "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
  "Opera/9.25 (Windows NT 5.1; U; en), Lynx/2.8.5rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/1.2.9",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
];


//构造请求头-浏览器
function randomHead() {
  return userAgents[
    Math.floor(Math.random() * (0 - userAgents.length) + userAgents.length)
  ];
}

//构造请求头-ip
function returnIp() {
  return (
    Math.floor(Math.random() * (10 - 255) + 255) +
    "." +
    Math.floor(Math.random() * (10 - 255) + 255) +
    "." +
    Math.floor(Math.random() * (10 - 255) + 255) +
    "." +
    Math.floor(Math.random() * (10 - 255) + 255)
  );
}
var errorArr = []

var concurrencyCount = 0;
var fetchUrl = function (item) {
  return new Promise((resolve, reject) => {
    // console.log(item, 'items')
    var delay = parseInt((Math.random() * 10000000) % 4000, 10);
    concurrencyCount++;
    // console.log(concurrencyCount)
    setTimeout(function () {
      let detailUrl = item.url
      concurrencyCount--;
      console.log('来过这里', detailUrl, 'detailUrl')
      superagent.get(detailUrl).set({
        "User-Agent": randomHead(),
        "X-Forwarded-For": returnIp()
      }).then(res => {
        // console.log('成功了')
        resolve({
          content: res,
          url: detailUrl,
          idx: item.idx
        })
      }).catch(rej => {
        console.log('失败了')
        // console.log(rej)
        resolve({
          name: item.name,
          url: detailUrl,
          content: rej,
          idx: item.idx
        })
      })
    }, delay)

  })

};

function formatHtml(gameList, callback) {
  return new Promise(async (resolve, reject) => {
    let singleResult = await async.mapLimit(gameList, 1, async function (item, callback) {
      console.log(item, 'item')
      let response = await fetchUrl(item);
      try {
        if (response.content.status !== 200) {
          response.desc = '未搜索到信息'
          errorArr.push(response)
          return response
        }
        var topicHtml = response.content.text;
        var $ = cheerio.load(topicHtml);
        let name = $("h1").text()
        let price = ''
        let specialPrice = ''
        let specialDate = ''
        let isSpecial = $("#purchase-options .sale-price").text().trim()
        if (isSpecial) {
          specialPrice = $("#purchase-options .sale-price").text().trim()
          price = $("#purchase-options .msrp").text().trim()
          specialDate = $(".special-period").text().trim()
        } else {
          price = $("#purchase-options .msrp").text().trim()
          specialPrice = '暂无优惠'
          specialDate = '暂无优惠'
        }
        let priceCurrency = $("meta[itemprop='priceCurrency']").attr("content")
        let platform = 'Switch'
        let nsuid = $("platform-label").attr("nsuid")
        let platform2 = $("platform-label").attr("platform")
        let game_category = $(".genre dd").text()
        let release_date = getDate2($(".release-date dd[itemprop='releaseDate']").html())
        let publisher = $(".publisher dd[itemprop='brand']").html()
        let developer = $(".developer dd[itemprop='manufacturer']").html()
        let no_of_players = $(".players dd").text()
        let supported_languages = $(".supported-languages dd").text()
        let isTotalCh = $(".supported-languages dd").text().indexOf("Chinese") !== -1 ? 1 : 0
        let required_space = $(".file-size dd").text()
        let agerating = $("esrb-rating").attr("rating")
        let desc = $("div[itemprop='description'] p").text()
        let imgList = []
        $("#gallery").find("product-gallery-item").each((index, item) => {
          let type = $(item)[0].attribs.type
          if (type === 'image') {
            let thumb = $(item)[0].attribs.thumbnail
            let img = $(item)[0].attribs.src
            imgList.push({
              thumb: thumb,
              img: img,
              type: "image",
            })
          }
        })
        let play_mode_tv_mode_b = $(".playmode-tv img").attr("src") ? $(".playmode-tv img").attr("src").indexOf("no_tv") === -1 : false
        let play_mode_handheld_mode_b = $(".playmode-tabletop img").attr("src") ? $(".playmode-tabletop img").attr("src").indexOf("no_tabletop") === -1 : false
        let play_mode_tabletop_mode_b = $(".playmode-handheld img").attr("src") ? $(".playmode-handheld img").attr("src").indexOf("no_handheld") === -1 : false
        let supports = []
        $(".services-supported a").each((index, item) => {
          supports.push($(item).find('styled-button').text())
        })
        let club_nintendo = supports.indexOf("Online Play") !== -1
        let cloud_saves_b = supports.indexOf("Save Data Cloud") !== -1
        let temp = {
          name,
          nameEn: name,
          url: response.url,
          priceCurrency,
          price,
          specialPrice,
          specialDate,
          platform,
          nsuid,
          platform2,
          desc,
          game_category,
          release_date,
          agerating,
          isTotalCh,
          publisher,
          developer,
          no_of_players,
          supported_languages,
          required_space,
          play_mode_tv_mode_b,
          play_mode_handheld_mode_b,
          play_mode_tabletop_mode_b,
          club_nintendo,
          cloud_saves_b,
          imgList,
          idx: response.idx,
        }
        return temp
      } catch (ex) {
        console.log(ex)
        response.err = {
          message: ex.message,
          stack: ex.stack,
          name: ex.name,
        }
        return response
      }

    })
    resolve(singleResult)
  })

}

async function requestUSATarget4() {
  function getAllJson() {
    return new Promise((resolve, reject) => {
      jsonfile.readFile('./dist/USA2.json')
        .then(obj => resolve(obj))
        .catch(error => reject(error))
    })
  }

  let originArr = await getAllJson()
  console.log(originArr.length, 'originArr')
  let tempData = originArr.map((item, index) => {
    return {
      url: 'https://www.nintendo.com' + item.url,
      name: item.title,
      idx: index,
    }
  })
  errorArr = []
  console.log('中途执行了一次')
  let total = tempData.length / 50
  let dot = total.toString().indexOf('.')
  let count = 0
  if (dot !== -1) {
    count = parseInt(total) + 1
  }
  let totalArr = []
  let totalNameArr = []
  for (let i = 1; i <= count; i++) {
    let data = await readFileJson(i)
    totalArr = totalArr.concat(data)
    let nameArr = data.map(item => {
      return item.nameEn?item.nameEn.trim():''
    })
    totalNameArr = totalNameArr.concat(nameArr)
    // let resultData = await formatHtml(errArr)
    // for (let i in resultData) {
    //   let arrIndex = idxArr.indexOf(resultData[i].idx)
    //   data[arrIndex] = resultData[i]
    // }
  }
  console.log(totalArr.length, 'totalArr')
  console.log(totalNameArr.length, 'totalNameArr')
  let tempArr = await readFileXlsx()
  console.log(tempArr.length, 'tempArr')
  let err = []
  let existArr = []
  for (let i in tempArr) {
    if (totalNameArr.indexOf(tempArr[i][2]) == -1) {
      err.push({
        index: i,
        name: tempArr[i][2]
      })
    }else{
      totalArr[totalNameArr.indexOf(tempArr[i][2])].name = tempArr[i][0]
      existArr.push(totalArr[totalNameArr.indexOf(tempArr[i][2])])
    }
  }
  console.log(existArr.length,'existArr')
  // await writeJson(existArr, `NUSAExistArr.json`)
  await writeJson(err, `NUSAExistErrArr.json`)
  return err
}

function readFileJson(i) {
  return new Promise((resolve, reject) => {
    jsonfile.readFile(`./dist/NUSA${i}.json`)
      .then(obj => resolve(obj))
      .catch(error => reject(error))
  })
}


function readFileXlsx() {
  return new Promise((resolve, reject) => {
    console.log('scheduleCronstyle:' + new Date());
    const workSheetsFromBuffer = readData('./eshop 美服筛选游戏.xlsx');
    let tempArr = workSheetsFromBuffer[0].data
    tempArr.splice(0, 1)
    tempArr = tempArr.filter(item => {
      return item.length && item[2] != '#N/A'
    })
    tempArr = tempArr.map(item => {
      item[2] = item[2].trim()
      return item
    })
    resolve(tempArr)
    // getData(tempArr)
  })

}


/**
 * 
 * @param {要写入的数据} data 
 * @param {文件名} fileName 
 */
function readData(fileName) {
  // 写xlsx
  const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(fileName));
  return workSheetsFromBuffer
}

module.exports = {
  requestUSATarget4
};