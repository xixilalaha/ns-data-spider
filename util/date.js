let Month = {
    "Jan.": '01',
    "Feb.": '02',
    "Mar.": '03',
    "Apr.": '04',
    "May.": '05',
    "Jun.": '06',
    "Jul.": '07',
    "Aug.": '08',
    "Sept.": '09',
    "Oct.": '10',
    "Nov.": '11',
    "Dec.": '12'
}

function getDate(timeStr) {
    timeStr = timeStr.replace('On sale until ', '')
    let month = Month[timeStr.split(' ')[0]]
    let day = timeStr.split(' ')[2].split(",")[0] < 10 ? '0' + timeStr.split(' ')[2].split(",")[0] : timeStr.split(' ')[2].split(",")[0]
    let year = timeStr.split(' ')[3]
    return `${year}-${month}-${day}`
}

module.exports = {
    getDate
}