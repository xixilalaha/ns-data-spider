var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
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
const {
    writeJson
} = require('./util/writeJson')
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

let errorArr = []
var fetchInfoUrl = function (item, callback) {
    return new Promise((resolve, reject) => {
        let searchName = item.nameEn
        var delay = parseInt((Math.random() * 10000000) % 6000, 10);
        console.log(delay, 'delay')
        setTimeout(async function () {
            console.log(searchName, 'searchName')
            let searchName2 = encodeURI(searchName.replace(/\™/g, ' ').replace(/\®/g, ' '))
            let url = `https://eshop-prices.com/games?q=${searchName2}&currency=CNY`
            try {
                let tempData = await fetch(url, {
                    headers: {
                        "User-Agent": randomHead(),
                        "X-Forwarded-For": returnIp()
                    }
                });
                let text = await tempData.text()
                var $ = cheerio.load(text)
                let href = $(".games-list-item").eq(0).attr('href')
                console.log(href, 'href')
                let url2 = href ? (gameUrl + href) : `${searchName}网站不存在`
                resolve([url2])
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        }, delay);
    })

};

var fetchUrl = function (item, callback) {
    return new Promise((resolve, reject) => {
        let url = item
        var delay = parseInt((Math.random() * 10000000) % 8000, 10);
        console.log(delay, 'delay2')
        setTimeout(async function () {
            console.log(url, 'url222')
            let url2 = `${url}&current_page=1&page_size=24`
            try {
                let tempData = await fetch(url2, {
                    headers: {
                        "User-Agent": randomHead(),
                        "X-Forwarded-For": returnIp()
                    }
                });
                let text = await tempData.text()
                resolve([url, text]);
            } catch (err) {
                console.log(err)
                resolve(err)
            }

        }, delay);
    })

};
var fetchHisPrice = function (item) {
    return new Promise((resolve, reject) => {
        let url = item
        var delay = parseInt((Math.random() * 10000000) % 12000, 10);
        console.log(delay, 'delay3')
        setTimeout(async function () {
            try {
                let tempData = await fetch(url, {
                    headers: {
                        "User-Agent": randomHead(),
                        "X-Forwarded-For": returnIp()
                    }
                });
                let tempJson = await tempData.json()
                resolve(tempJson);
            } catch (err) {
                console.log(err)
                resolve(err)
            }

        }, delay);
    })

};
var fetchOriginPrice = function (item) {
    return new Promise((resolve, reject) => {
        let url = item
        var delay = parseInt((Math.random() * 10000000) % 15000, 10);
        console.log(delay, 'delay4')
        setTimeout(async function () {
            try {
                let tempData = await fetch(url, {
                    headers: {
                        "User-Agent": randomHead(),
                        "X-Forwarded-For": returnIp()
                    }
                });
                let text = await tempData.text()
                resolve(text)
            } catch (err) {
                console.log(err)
                resolve(err)
            }



        }, delay);
    })

};


function getDiscount(basic, dis) {
    let tBasic = Number(basic.replace('¥', ''))
    let tDis = Number(dis.replace('¥', ''))
    return parseFloat(((tDis / tBasic) * 10).toFixed(2))
}




function getData(search) {
    console.log('开始运行')
    return new Promise(async (resolve, reject) => {
        let xx = await async.mapLimit(search, 1, async function (item, callback) {
            try {
                let result = await fetchInfoUrl(item, callback)
                let dataLists = await formatHtml(result)
                return dataLists
            } catch (err) {
                return []
            }

        })
        resolve(xx)


    })

}

function formatHtml(gameList, callback) {
    return new Promise(async (resolve, reject) => {
        await async.mapLimit(gameList, 1, async function (item, callback) {
            try {
                let topicPair = await fetchUrl(item);
                console.log('final:');
                console.log(topicPair[0], 'topicPair[0]');
                let tempId = topicPair[0].split('games/')[1].split('-')[0]
                console.log('该进行历史价格请求了')
                let price = await fetchHisPrice(`https://charts.eshop-prices.com/prices/${tempId}?currency=CNY`)
                let priceArr2 = price.map(item => {
                    return item.value
                })
                priceArr2 = priceArr2.sort((n1, n2) => {
                    return n1 - n2;
                    // n2 - n1  从大到小
                    // n1 - n2  从小到大
                })
                console.log('该进行原服价格请求了')
                let detail = await fetchOriginPrice(`${topicPair[0].replace('?currency=CNY', '')}`)
                console.log('获取价格')
                let xxPriceArr = {
                    xxPriceArr: [],
                    lowestPrice: priceArr2[0]
                }
                var _$ = cheerio.load(detail);
                _$(".prices-table tbody tr.pointer").each((idx, element) => {
                    let isOnSale = _$(element).find(".price-value").find(".discounted").length > 0
                    xxPriceArr.xxPriceArr.push({
                         region: getZh(_$(element).find("td").eq(1).html().replace(/<[^>]+>/g, "").replace(/\t/g, '').replace(/\n/g, '')),
                        priceCNY: isOnSale ? _$(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim() : _$(element).find(".price-value").text().replace(/\n/g, '').trim(),
                        price: isOnSale ? _$(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim() : _$(element).find(".price-value").text().replace(/\n/g, '').trim(),
                        priceBasic: isOnSale ? _$(element).find(".price-value .discounted")[0].children[1].children[0].data.replace(/\n/g, '').trim() : _$(element).find(".price-value").text().replace(/\n/g, '').trim(),
                        discountLast: isOnSale ? getDate(_$(element).find(".price-meta span").attr("title")).trim() : '暂无优惠',
                        discountValue: isOnSale ? getDiscount(_$(element).find(".price-value .discounted")[0].children[1].children[0].data.replace(/\n/g, '').trim(), _$(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim()) : 10,
                    })
                })
                // 接下来都是 jquery 的用法了
                var $ = cheerio.load(topicPair[1]);
                let priceArr = {
                    priceArr: [],
                    lowestPrice: priceArr2[0],
                    currentDiscountRate: '',
                    currentLowestPrice: '',
                    currentLowestPriceRegion: '',
                }
                $(".prices-table tbody tr.pointer").each((idx, element) => {
                    let isOnSale = _$(element).find(".price-value").find(".discounted").length > 0
                    priceArr.priceArr.push({
                        region: getZh($(element).find("td").eq(1).html().replace(/<[^>]+>/g, "").replace(/\t/g, '').replace(/\n/g, '')),
                        priceCNY: isOnSale ? $(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim() : $(element).find(".price-value").text().replace(/\n/g, '').trim(),
                        price: isOnSale ? $(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim() : $(element).find(".price-value").text().replace(/\n/g, '').trim(),
                        priceBasic: isOnSale ? $(element).find(".price-value .discounted")[0].children[1].children[0].data.replace(/\n/g, '').trim() : $(element).find(".price-value").text().replace(/\n/g, '').trim(),
                        discountLast: isOnSale ? getDate($(element).find(".price-meta span").attr("title")).trim() : '',
                        discountValue: isOnSale ? getDiscount($(element).find(".price-value .discounted")[0].children[1].children[0].data.replace(/\n/g, '').trim(), $(element).find(".price-value .discounted")[0].children[2].data.replace(/\n/g, '').trim()) : 10,
                        nameSearch: $("h1").text()
                    })
                })
                priceArr.priceArr.map((item, index) => {
                    item.price = xxPriceArr.xxPriceArr[index].price
                })
                let tempJson = priceArr.priceArr[0]
                let tempCNY = Number(tempJson.priceCNY.replace("¥", '')) * 1000
                let tempBasic = Number(tempJson.priceBasic.replace("¥", '')) * 1000
                priceArr.currentDiscountRate = parseFloat((tempCNY / tempBasic).toFixed(2)) * 10
                priceArr.lowestPrice = priceArr.lowestPrice
                priceArr.currentLowestPriceRegion = tempJson.region
                priceArr.currentLowestPriceRegion = tempJson.region
                priceArr.isLowestPrice = (tempCNY - priceArr.lowestPrice) > 0 ? 0 : 1
                priceArr.item = item
                console.log('结束')
                // return priceArr
                resolve(priceArr)
            } catch (err) {
                console.log(err, 'err')
                item.err = err.message
                errorArr.push(item)
                resolve([])
            }

        });
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


function readFileJson() {
    return new Promise((resolve, reject) => {
        jsonfile.readFile('./dist/NUSAExistArr.json')
            .then(obj => resolve(obj))
            .catch(error => reject(error))
    })
}

function readFileJson2(i) {
    return new Promise((resolve, reject) => {
        jsonfile.readFile(`./price/switch/existPrice${i}.json`)
            .then(obj => resolve(obj))
            .catch(error => reject(error))
    })
}

function readFileJson3(i) {
    return new Promise((resolve, reject) => {
        jsonfile.readFile(`./price/switch/existFixPrice${i}.json`)
            .then(obj => resolve(obj))
            .catch(error => reject(error))
    })
}
app.get('/', async function (req, res, next) {
    let data = await readFileJson()
    let total = data.length / 10
    let dot = total.toString().indexOf('.')
    let count = 0
    if (dot !== -1) {
        count = parseInt(total) + 1
    } else {
        count = parseInt(total)
    }
    // count = 1
    /**
     * 首次爬取游戏价格，异常抛出
     */
    async function getFirstData() {
        for (let i = 1; i <= count; i++) {
            let start = i * 10 - 10
            let end = 10 * i
            if (end >= data.length) {
                end = data.length
            }
            console.log(start, 'start')
            console.log(end, 'end')
            let dataList = await getData(data.slice(start, end))
            await writeJson(dataList, `existPrice${i}.json`)
        }
        await writeJson(errorArr, `existErrorPrice.json`)
    }

    /**
     * 错误信息补全
     */
    async function getErrorData() {
        return new Promise(async (resolve, reject) => {
            let lostArr = []
            for (let i = 1; i <= count; i++) {
                let start = i * 10 - 10
                let dataList = await readFileJson2(i)
                for (let j in dataList) {
                    if (JSON.stringify(dataList[j]) == '[]') {
                        console.log(j, 'j', i, 'i')
                        let dataList2 = await getData(data.slice((start + Number(j)), (start + Number(j) + 1)))
                        dataList.splice(j, 1, ...dataList2)
                        lostArr.concat(dataList2)
                    }
                    await writeJson(dataList, `existPrice${i}.json`)
                }
            }
            resolve(lostArr)
        })
    }

    /**
     * 
     * 排查信息
     */
    async function reviewErrorData() {
        let lostArr = await getErrorData()
        if (lostArr.length >= 11) {
            return await reviewErrorData()
        }
    }

    /**
     * 对于价格FREE数据，修改信息
     */
    async function fixFreeData() {
        for (let i = 1; i <= count; i++) {
            let dataList = await readFileJson2(i)
            for (let j in dataList) {
                if (dataList[j].currentLowestPrice === 'FREE' || !dataList[j].currentLowestPrice) {
                    console.log('进来了')
                    dataList[j].currentDiscountRate = 10
                    dataList[j].currentLowestPrice = '¥0'
                    for (let k in dataList[j].priceArr) {
                        if (dataList[j].priceArr[k].priceCNY === 'FREE') {
                            dataList[j].priceArr[k].priceCNY = '¥0'
                        }
                        if (dataList[j].priceArr[k].priceBasic === 'FREE') {
                            dataList[j].priceArr[k].priceBasic = '¥0'
                        }
                    }
                }
            }
            await writeJson(dataList, `existFixPrice${i}.json`)
        }
    }

    /**
     * 对于异常数据重新处理
     */
    async function getBugData() {
        let lostArr = []
        let data2 = JSON.parse(JSON.stringify(data))
        for (let i = 1; i <= count; i++) {
            let start = i * 10 - 10
            let dataList = await readFileJson3(i)
            for (let j in dataList) {
                if (JSON.stringify(dataList[j]) == '[]') {
                    data2.splice(start + Number(j), 1, null)
                } else {
                    let error = false
                    for (let k in dataList[j].priceArr) {
                        if ((dataList[j].priceArr[k].priceCNY.split('¥').length - 1) === 2) {
                            error = true
                        }
                    }
                    if (error) {
                        console.log(i, j)
                        let dataList2 = await getData(data.slice((start + Number(j)), (start + Number(j) + 1)))
                        dataList.splice(j, 1, ...dataList2)
                        await writeJson(dataList, `existFixPrice${i}.json`)
                        lostArr.push(dataList2)
                    }
                }
            }
            await writeJson(dataList, `existFixPrice${i}.json`)
        }
    }

    /**
     * 数据整合，生成整体文件
     */
    async function getFinalData() {
        let data2 = JSON.parse(JSON.stringify(data))
        for (let i = 1; i <= count; i++) {
            let start = i * 10 - 10
            let dataList = await readFileJson3(i)
            for (let j in dataList) {
                if (JSON.stringify(dataList[j]) == '[]') {
                    data2.splice(start + Number(j), 1, null)
                } else {
                    data2[start + Number(j)].currentDiscountRate = dataList[j].currentDiscountRate
                    data2[start + Number(j)].currentLowestPrice = dataList[j].currentLowestPrice
                    data2[start + Number(j)].currentLowestPriceRegion = dataList[j].currentLowestPriceRegion
                    data2[start + Number(j)].priceArr = dataList[j].priceArr
                    data2[start + Number(j)].isLowestPrice = dataList[j].isLowestPrice
                    data2[start + Number(j)].lowestPrice = `¥${dataList[j].lowestPrice / 100}`
                    data2[start + Number(j)].pricePage = dataList[j].item
                }
            }
        }
        data2 = data2.filter(item => {
            return item
        })
        data2 = data2.map(item => {
            item.nameEn = item.nameEn.trim()
            return item
        })
        // for (let i in data2) {
        //     for (let j in data2[i].priceArr) {
        //         if (typeof data2[i].priceArr[j].discountValue !== 'number') {
        //             data2[i].priceArr[j].discountValue = getDiscount(data2[i].priceArr[j].priceBasic,data2[i].priceArr[j].priceCNY)
        //         }
        //         if (!data2[i].priceArr[j].discountValue) {
        //             data2[i].priceArr[j].priceCNY = data2[i].priceArr[j].priceCNY.split(" ")[1]
        //             data2[i].priceArr[j].discountValue = getDiscount(data2[i].priceArr[j].priceBasic,data2[i].priceArr[j].priceCNY)
        //         }
        //     }
        //     if (data2[i].currentDiscountRate.toString().length > 4) {
        //         data2[i].currentDiscountRate = parseFloat(data2[i].currentDiscountRate.toFixed(2))
        //     }
    
        // }
        let time = new Date()
        let year = time.getFullYear()
        let month = time.getMonth() < 9 ? '0' + (time.getMonth() + 1):time.getMonth() + 1
        let date = time.getDate() < 10 ? '0' + time.getDate():time.getDate() + 1
        let fullTime = `${year}-${month}-${date}`
        await writeJson(data2, `${fullTime}-switchGame.json`)
    }
    let totalArr = []
    await getFirstData()
    await reviewErrorData()
    await fixFreeData()
    await getFinalData()
    console.log(totalArr.length, 'totalArr.length')
    console.log('数据爬取完毕')
    res.send(totalArr)
})

app.listen(3018, function () {
    console.log('app is listening at port 3018');
});