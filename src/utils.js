// Return a copy of the given object where values are sorted by key
const sortByKey = (obj) => {
    let res = {}
    Object.keys(obj).sort().forEach(key => {
        res[key] = obj[key]
    })
    return res
}


// Validate the given duration string
const validateDuration = (val) => {
    if (
        !val ||
        !(/^([0-9]{1,2}(?:(?::[0-9]{2})?(?:[\.,][0-9]{1,2})?)?)$/gm.test(val))
    ) {
        return false
    }

    return true
}

// Transform the given duration string
const transformDuration = (val) => {
    let duration = val.toString()

    // Replace all commas with decimal points
    duration = duration.replace(',', '.')

    // If the duration contains a colon, split the duration on the colon and convert the minute part from base60
    if (duration.indexOf(':') > -1) {
        let duration_parts = duration.split(':')
        let integer_part = duration_parts[0]
        let fractional_part = ("00" + Math.round(duration_parts[1] / 0.6)).slice(-2)
        duration = `${integer_part}.${fractional_part}`
    }

    // Parse duration as a number
    duration = Number(duration)

    // Round duration to two decimals
    duration = Math.round(duration * 100) / 100

    return duration
}

// Transform the given string to a hex color string
const stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
        var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}


export default {
    sortByKey,
    validateDuration,
    transformDuration,
    stringToColour,
}
