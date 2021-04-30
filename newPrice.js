var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
const got = require('got');
const fetch = require('node-fetch');
var async = require('async');
// 调用 express 实例，它是一个函数，不带参数调用时，会返回一个 express 实例，将这个变量赋予 app 变量。
// var xlsx = require('node-xlsx'); // npm i node-xlsx 安装
var fs = require('fs'); // node自带
const jsonfile = require('jsonfile')
const {
    getZh
} = require('./util/countries')
const {
    getDate
} = require('./util/date')
var app = express();
const gameUrl = 'https://eshop-prices.com';

//浏览器库
const userAgents = [
    "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12",
    "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Acoo Browser; SLCC1; .NET CLR 2.0.50727; Media Center PC 5.0; .NET CLR 3.0.04506)",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20",
    "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Fedora/1.9.0.8-1.fc10 Kazehakase/0.5.6",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER",
    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:2.0b13pre) Gecko/20110307 Firefox/4.0b13pre",
    "Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; fr) Presto/2.9.168 Version/11.52",
    "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)",
    "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Fedora/1.9.0.8-1.fc10 Kazehakase/0.5.6",
    "Mozilla/5.0 (X11; U; Linux; en-US) AppleWebKit/527+ (KHTML, like Gecko, Safari/419.3) Arora/0.6",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
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

var fetchUrl = function (item, callback) {
    return new Promise((resolve, reject) => {
        let url = item
        var delay = parseInt((Math.random() * 10000000) % 10000, 10);
        console.log(delay, 'delay')
        setTimeout(function () {
            superagent.get(url).timeout({
                response: 10000, // Wait 5 seconds for the server to start sending,
                deadline: 60000, // but allow 1 minute for the file to finish loading.
            }).set({
                "User-Agent": randomHead(),
                "X-Forwarded-For": returnIp()
            }).query({
                current_page: 1,
                page_size: 24,
            }).end(async function (err, sres) {
                if (err) {
                    // console.log(err,'err')
                    // return next(err);
                    resolve([url, err.text]);
                    return true
                }
                console.log('经过了这里')
                resolve([url, sres.text]);
            });

        }, delay);
    })

};
var fetchHisPrice = function (item) {
    return new Promise((resolve, reject) => {
        let url = item
        var delay = parseInt((Math.random() * 10000000) % 10000, 10);
        setTimeout(function () {
            superagent.get(url).timeout({
                response: 10000, // Wait 5 seconds for the server to start sending,
                deadline: 60000, // but allow 1 minute for the file to finish loading.
            }).set({
                "User-Agent": randomHead(),
                "X-Forwarded-For": returnIp()
            }).end(async function (err, sres) {
                if (err) {
                    console.log('err')
                    // return next(err);
                    resolve(err);
                    return true
                }
                resolve(sres);
            });

        }, delay);
    })

};
var fetchOriginPrice = function (item) {
    return new Promise((resolve, reject) => {
        let url = item
        var delay = parseInt((Math.random() * 10000000) % 10000, 10);
        setTimeout(function () {
            superagent.get(url).timeout({
                response: 10000, // Wait 5 seconds for the server to start sending,
                deadline: 60000, // but allow 1 minute for the file to finish loading.
            }).set({
                "User-Agent": randomHead(),
                "X-Forwarded-For": returnIp()
            }).end(async function (err, sres) {
                if (err) {
                    console.log('err')
                    // return next(err);
                    resolve(err);
                    return true
                }
                resolve(sres);
            });

        }, delay);
    })

};
var fetchInfoUrl = function (item, callback) {
    return new Promise((resolve, reject) => {
        let searchName = item.nameEn
        var delay = parseInt((Math.random() * 10000000) % 10000, 10);
        setTimeout(function () {
            console.log(searchName, 'searchName')
            superagent.get('https://eshop-prices.com/games').timeout({
                response: 10000, // Wait 5 seconds for the server to start sending,
                deadline: 60000, // but allow 1 minute for the file to finish loading.
            }).set({
                "User-Agent": randomHead(),
                "X-Forwarded-For": returnIp(),
            }).query({
                q: searchName,
                currency: 'CNY'
            }).end(function (err, res) {
                if (err) {
                    console.log(err, 'err')
                    resolve([err])
                    return true
                }
                var $ = cheerio.load(res.text)
                let href = $(".games-list-item").eq(0).attr('href')
                console.log(href, 'href')
                let url = gameUrl + href
                // callback(null, [url]);
                resolve([url])
            });
        }, delay);
    })

};

function getDiscount(basic, dis) {
    let tBasic = Number(basic.replace('¥', ''))
    let tDis = Number(dis.replace('¥', ''))
    return (((tBasic - tDis) / tBasic) * 100).toFixed(2)
}




function getData(search) {
    console.log('开始运行')
    return new Promise(async (resolve, reject) => {
        let dataList = await async.mapLimit(search, 1, async function (item, callback) {
            let result = await fetchInfoUrl(item, callback)
            // return result
            // console.log(result, 'result')
            let dataLists = await formatHtml(result)
            // resolve(dataList)
            return dataLists
        })
        resolve(dataList)

    })

}

function formatHtml(gameList, callback) {
    return new Promise(async (resolve, reject) => {
        let tempArr = await async.mapLimit(gameList, 1, async function (item, callback) {
            console.log(item, 'item')
            let topicPair = await fetchUrl(item);
            // console.log(result,'result');
            console.log('final:');
            let temp = []
            let emptyTemp = []
            console.log(item, 'item')
            console.log(topicPair[0], 'topicPair')
            let tempId = topicPair[0].split('games/')[1].split('-')[0]
            console.log('该进行历史价格请求了')
            // let price = await superagent.get(`https://charts.eshop-prices.com/prices/${tempId}?currency=CNY`).timeout({
            //     response: 10000, // Wait 5 seconds for the server to start sending,
            //     deadline: 60000, // but allow 1 minute for the file to finish loading.
            // }).set({
            //     "User-Agent": randomHead(),
            //     "X-Forwarded-For": returnIp()
            // })
            let price = await fetchHisPrice(`https://charts.eshop-prices.com/prices/${tempId}?currency=CNY`)
            let priceArr2 = JSON.parse(price.text).map(item => {
                return item.value
            })
            console.log('该进行原服价格请求了')
            // let detail = await superagent.get(`${topicPair[0].replace('?currency=CNY','')}`).timeout({
            //     response: 10000, // Wait 5 seconds for the server to start sending,
            //     deadline: 60000, // but allow 1 minute for the file to finish loading.
            // }).set({
            //     "User-Agent": randomHead(),
            //     "X-Forwarded-For": returnIp()
            // })
            let detail = await fetchOriginPrice(`${topicPair[0].replace('?currency=CNY','')}`)
            console.log('获取价格')
            let xxPriceArr = []
            var _$ = cheerio.load(detail.text);
            _$("tbody tr.pointer").each((idx, element) => {
                let isOnSale = _$(element).find(".price-meta").html().trim()
                xxPriceArr.push({
                    price: isOnSale ? _$(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim() : _$(element).find(".price-value").text().replace(/\n/g, '').trim(),
                })
            })
            // 接下来都是 jquery 的用法了
            var $ = cheerio.load(topicPair[1]);
            let demo = {
                "region": "俄罗斯",
                "priceCNY": "¥ 22.72",
                "price": "RUB 257.00",
                "releaseDate": "2020-12-15",
                "gameLanguage": " 英语",
                "regionDesc": "",
                "lowestPriceHistory": "¥ 19.89",
                "discountValue": "8.0折",
                "discountLast": "剩余3天"
            }
            let priceArr = {
                priceArr: [],
                lowestPrice: priceArr2[0]
            }
            $("tbody tr.pointer").each((idx, element) => {
                let isOnSale = $(element).find(".price-meta").html().trim()
                priceArr.priceArr.push({
                    region: getZh($(element).find("td").eq(1).html().replace(/<[^>]+>/g, "").replace(/\t/g, '').replace(/\n/g, '')),
                    priceCNY: isOnSale ? $(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim() : $(element).find(".price-value").text().replace(/\n/g, '').trim(),
                    price: isOnSale ? $(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim() : $(element).find(".price-value").text().replace(/\n/g, '').trim(),
                    priceBasic: isOnSale ? $(element).find(".price-value .discounted")[0].children[1].children[0].data.replace(/\n/g, '').trim() : $(element).find(".price-value").text().replace(/\n/g, '').trim(),
                    discountLast: isOnSale ? getDate($(element).find(".price-meta span").attr("title")).trim() : '暂无优惠',
                    discountValue: isOnSale ? getDiscount($(element).find(".price-value .discounted")[0].children[1].children[0].data.replace(/\n/g, '').trim(), $(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim()) : '暂无优惠',
                })
            })
            priceArr.priceArr.map((item, index) => {
                item.price = xxPriceArr[index].price
            })
            console.log('结束')
            return priceArr

        });
        resolve(tempArr)
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
        console.log(data, 'data')
        console.log('文件删除成功')
        jsonfile.writeFile(`./dist/${fileName}`, data, function (err) {
            if (err) throw err;
            console.log('Write to json has finished');
        });
    })

}


function readFileJson() {
    return new Promise((resolve, reject) => {
        jsonfile.readFile('./dist/infoFinal.json')
            .then(obj => resolve(obj))
            .catch(error => reject(error))
    })
}
app.get('/', async function (req, res, next) {
    let data = await readFileJson()

    let dataList = await getData([data[0], data[1]])
    // console.log(dataList,'dataList')
    res.send(dataList)
    // try {
    //     let dataList = await fetch('https://eshop-prices.com/games?q=Animal+Pals+Bubble+Pop', {
    //         headers: {
    //             cookie :'_ga=GA1.2.1643546862.1613960760; __gads=ID=d5231d6866c891d8-2202d8091ac6008f:T=1613960785:RT=1613960785:S=ALNI_MbVy6ZMnzErQesY6ogYhJqAuJ6Qsg; __cfduid=d081a0e15598485d60802d02943d852cc1619321359; _gid=GA1.2.1748061141.1619493124' 
    //         }
    //     });
    //     let xx = await dataList.text()
    //     res.send(xx)
    //   } catch (err) {
    //     if (/(?:JP_games_request_failed)/i.test(err.toString())) throw new EshopError('Fetching of JP Games failed');
    //     res.send(err)
    //   }
})

app.listen(3001, "127.0.0.1", function () {
    console.log('app is listening at port 3001');
});