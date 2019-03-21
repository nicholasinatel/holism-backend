const {
    promisify
} = require('util')

const DateNowAsync = promisify(DateNow)

// TIMESTAMP GETTER
// https://tecadmin.net/get-current-date-time-javascript/
function DateNow(callback) {
    let today = new Date();

    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = (today.getHours() - 2) + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

    const now = {
        time: dateTime
    }

    return callback(null, now)
}

class DateHandler {
    static DateGetter() {
        return DateNowAsync()
    }
}

module.exports = DateHandler