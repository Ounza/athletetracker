//Validating the user Input

const { regexMatch } = require('./utils') //regexMatch we defined in our utils
const validate = {}

// Validate a Single POST Race

validate.validatePostRace = (race) => {
    let { competition, meters, time } = race
    competition = validate._validatecompetition(competition)
    meters = validate._validatemeters(meters)
    time = validate._validatetime(time)
    if (Object.keys(race).length === 3 && competition && meters && time) {
        return { competition, meters, time }
    }
    return false
}

// Validate a Single PUT Race

validate.validatePutRace = ({ competition, meters, time }) => {
    competition = validate._validatecompetition(competition)
    meters = validate._validatemeters(meters)
    time = validate._validatetime(time)
    return { competition, meters, time }
}

// Validate the Competition

validate._validatecompetition = (competition) => {
    return typeof competition === 'string' && regexMatch(/([a-z]|\s){5,25}/gi, competition.trim())
        ? competition.trim()
        : false
}

// Validate meters

validate._validatemeters = (meters) => {
    const regex = /^[0-9]*$/g

    return typeof meters === 'string' && regexMatch(regex, meters.trim())
        ? meters.trim()
        : false
}

// Validate Time
validate._validatetime = (time) => {
    return typeof time === 'string' && regexMatch(/^\d+\.\d{1,2}$/, time.trim())
        ? time.trim()
        : false
}

//Export the module
module.exports = validate
