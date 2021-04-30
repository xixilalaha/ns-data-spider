/*
  香港
*/

const superagent = require('superagent');
const cheerio = require('cheerio');
var async = require('async');
var fs = require('fs'); // node自带
const jsonfile = require('jsonfile')
const download = require('download');

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
var logArr = []

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
      logArr.push(response)
      if (response.content.status !== 200) {
        response.desc = '未搜索到信息'
        errorArr.push(response)
        return response
      }
      // console.log(response.statusCode, 'statusCode:')
      var topicHtml = response.content.text;
      var $ = cheerio.load(topicHtml);
      let name = $("h1 span").text()
      let productCode = $(".product-add-form form").attr("data-product-sku")
      let price = ''
      let specialPrice = ''
      let specialDate = ''
      let isSpecial = $(".product-page-info-form .old-price").html()
      if (isSpecial) {
        price = $(".old-price .price").html()
        specialPrice = $(".special-price .price").html()
        specialDate = $(".special-period").html()
      } else {
        price = $(".product-page-info-form .price").html()
        specialPrice = '暂无优惠'
        specialDate = '暂无优惠'
      }
      let priceCurrency = $("meta[itemprop='priceCurrency']").attr("content")
      let platform = $(".platform .product-attribute-val").text()
      let game_category = $(".game_category .product-attribute-val").text()
      let release_date = $(".release_date .product-attribute-val").text()
      let publisher = $(".publisher .product-attribute-val").text()
      let no_of_players = $(".no_of_players .product-attribute-val").text()
      let supported_languages = $(".supported_languages .product-attribute-val").text()
      let required_space = $(".required_space .product-attribute-val").text()
      let supported_controllers = $(".supported_controllers .product-attribute-val").text()
      let supported_play_modes = $(".supported_play_modes .product-attribute-val").text()
      let desc = $(".description .value").text()
      let detailUrl = $("link[rel='canonical']").attr('href')
      let imgList = []
      $("script[type='text/x-magento-init']").each((index, item) => {
        // console.log($(item)[0].children[0].data,'item')
        let firstJson = $(item)[0].children[0].data
        if ('[data-gallery-role=gallery-placeholder]' in JSON.parse(firstJson)) {
          if ('mage/gallery/gallery' in JSON.parse(firstJson)['[data-gallery-role=gallery-placeholder]']) {
            imgList = JSON.parse(firstJson)['[data-gallery-role=gallery-placeholder]']['mage/gallery/gallery'].data
          }
        }
      })
      let temp = {
        name,
        url: detailUrl,
        productCode,
        priceCurrency,
        price,
        specialPrice,
        specialDate,
        platform,
        game_category,
        release_date,
        publisher,
        no_of_players,
        supported_languages,
        required_space,
        supported_controllers,
        supported_play_modes,
        imgList,
        desc,
        idx:response.idx,
      }
      // console.log($("script[type='text/x-magento-init']"), 'script')

      return temp
    })
    resolve(singleResult)
  })

}

async function requestHKTarget2(url = HKHTMLURL, replaceStr = "發售日期 ", orReplaceStr = '') {
  // console.log(url, 'url')
  const data = [];
  errorArr = []
  logArr = []
  await superagent.get(url).set({
      "User-Agent": randomHead(),
      "X-Forwarded-For": returnIp()
    })
    .then(async (res) => {
      const $ = cheerio.load(res.text);
      console.log($('.category-product-item').length, '长度')
      $('.category-product-item')
        .each((idx, ele) => {
          const url = $(ele).find('.product-list-item').attr("href");
          const name = $(ele).find('.category-product-item-title-link').text().replace(/\n/g, '').trim()
          data.push({
            url: url,
            name: name,
            idx: idx,
          })
        });
    })
    .catch(err => console.log(err, '网页加载错误'));
  console.log('中途执行了一次')
  let resultData = await formatHtml(data)
  if (errorArr.length) {
    let tempArr = [...errorArr]
    errorArr = []
    let secondResult = await formatHtml(tempArr)
    console.log(secondResult,'secondResult')
    for (let i in secondResult) {
      resultData[secondResult[i].idx] = secondResult[i]
    }
  }
  writeJson(resultData, `HK.json`)
  console.log(errorArr,'errorArr')
  writeJson(errorArr, `HKError.json`)
  return resultData
}
/**
 * 
 * @param {要写入的数据} data 
 * @param {文件名} fileName 
 */
function writeJson(data, fileName) {
  fs.unlink(`./dist/${fileName}`, function (err) {
    if (err) {
      console.log('文件删除失败')
      throw err;
    }
    // console.log(data, 'data')
    // console.log('文件删除成功')
    jsonfile.writeFile(`./dist/${fileName}`, data, function (err) {
      if (err) throw err;
      console.log('Write to json has finished');
    });
  })

}

module.exports = {
  requestHKTarget2
};