let Month = {
    "January": '01',
    "February": '02',
    "March": '03',
    "April": '04',
    "May": '05',
    "June": '06',
    "July": '07',
    "August": '08',
    "September": '09',
    "October": '10',
    "November": '11',
    "December": '12'
}

function getDate2(timeStr) {
    if (timeStr.indexOf(" ") === -1) {
        return timeStr
    }
    let month = Month[timeStr.split(' ')[0]]
    let day = timeStr.split(' ')[1].split(",")[0]
    let year = timeStr.split(' ')[2]
    return `${year}-${month}-${day}`
}

module.exports = {
    getDate2
}