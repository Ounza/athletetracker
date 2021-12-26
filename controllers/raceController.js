//Handling the race requests and responses

const path = require('path')
const fs = require('fs/promises')
const { writeContent, parseJSON, isEmptyObj } = require('../utils/utils')
const { validatePostRace, validatePutRace } = require('../utils/validation')

const controller = {}
const racesFile = path.resolve(__dirname, '../data/races.json')

/**
 * Get all races
 * @route GET api/races/
 */
controller.getRaces = async (req, res) => {
    try {
        const races = await fs.readFile(racesFile, 'utf-8')
        writeContent(res, 200, races, false)
    } catch (e) {
        writeContent(res, 500, { status: 'Internal server error' })
    }
}

/**
 * Get a single race by id
 * @route GET api/races/:id
 */
controller.getRaceById = async (req, res, raceId) => {
    try {
        const allRaces = await fs.readFile(racesFile, 'utf-8')
        const parsedRaces = parseJSON(allRaces)

        if (!isEmptyObj(parsedRaces)) {
            const race = parsedRaces.findIndex((race) => race.id == raceId)
            if (race > -1) {
                writeContent(res, 200, parsedRaces[race])
            } else {
                writeContent(res, 404, { status: '404 Race not found' })
            }
        } else {
            writeContent(res, 500, { status: 'Internal server error' })
        }
    } catch (e) {
        writeContent(res, 500, { status: 'Internal server error' })
    }
}

/**
 * Get a single race by querystring
 * @route GET api/race?key=value
 */
controller.getRaceByQuerystring = async (req, res, queryString) => {
    try {
        const allRaces = await fs.readFile(racesFile, 'utf-8')
        const parsedRaces = parseJSON(allRaces)

        if (!isEmptyObj(parsedRaces)) {
            if (Object.keys(queryString).length === 1) {
                const queryKey = Object.keys(queryString)
                const queryValue = Object.values(queryString)
                let race
                // Iterate every objects
                userrace: for (const singlerace of parsedRaces) {
                    // Iterate every field of and object
                    for (let field in singlerace) {
                        // If query field match with object field
                        if (field === queryKey[0]) {
                            // If query value match with object value
                            if (singlerace[field] == queryValue[0]) {
                                race = singlerace
                                break userrace
                            }
                        }
                    }
                }
                // If race is null, race is not found in database
                if (race) {
                    writeContent(res, 200, race)
                } else {
                    writeContent(res, 404, { status: 'Race not found' })
                }
            } else {
                writeContent(res, 400, { status: 'More than one query is not accepted' })
            }
        } else {
            writeContent(res, 500, { status: 'Internal server error' })
        }
    } catch (e) {
        console.log(e.message)
        writeContent(res, 500, { status: 'Internal server error' })
    }
}

/**
 * Create a single race
 * @route POST api/races
 */

controller.postRace = async (req, res, payload) => {
    console.log(payload)
    
    
    try {
        // Payload come with json formate.so, we should parse it in js object
        let postedrace = parseJSON(payload)
        postedrace = validatePostRace(postedrace)
        // Validation check
        if (postedrace) {
            const allRaces = await fs.readFile(racesFile, 'utf-8')
            const parsedRaces = parseJSON(allRaces)
            const lastSavedraceId =
                parsedRaces.length > 0
                    ? parsedRaces[parsedRaces.length - 1].id
                    : 0
            // Set new race's id to last saved races (id + 1)
            postedrace.id = lastSavedraceId + 1
            // Read race array and push new race
            parsedRaces.push(postedrace)
            // Update whole array in database
            await fs.writeFile(racesFile, JSON.stringify(parsedRaces, null, 2))
            // Response new race to user
            writeContent(res, 200, postedrace)
        } else {
            writeContent(res, 400, { status: 'There was a problem in your request' })
        }
    } catch (e) {
        console.log(e.message)
        writeContent(res, 500, { status: 'Internal server error' })
    }
}

/**
 * Update a single race
 * @route PUT api/races/:id
 */
controller.putRace = async (req, res, id, payload) => {
    try {
        // Grab request payload and validate it
        const race = parseJSON(payload)
        const { competition, meters, time } = validatePutRace(race)
        // Read and parse all exiting races
        const allRaces = await fs.readFile(racesFile, 'utf-8')
        const parsedRaces = parseJSON(allRaces, [])
        // Checks if requested id was saved in database
        const findrace = parsedRaces.findIndex((race) => race.id == id)

        if (findrace > -1) {
            // Check at least one field is validate
            if (competition || meters || time) {
                // Grab the updated race object form parsed races array
                // todo: As object is muted, when we update property on 'updaterace' object automatically property updated in requested race object of 'parsedRaces' array
                const updaterace = parsedRaces[findrace]
                // Update field as user's input
                if (competition) updaterace.competition = competition
                if (meters) updaterace.meters = meters
                if (time) updaterace.time = time
                // Write all races in database
                await fs.writeFile(racesFile, JSON.stringify(parsedRaces, null, 2))
                // Response the updated race to user
                writeContent(res, 200, updaterace)
            } else {
                writeContent(res, 400, { status: 'Invalid update field' })
            }
        } else {
            writeContent(res, 404, { status: 'race not found' })
        }
    } catch (e) {
        console.log(e.message)
        writeContent(res, 500, { status: 'Internal sever error!!' })
    }
}

/**
 * Delete a single race
 * @route DELETE api/races/:id
 */
controller.deleteRace = async (req, res, id) => {
    try {
        const allRaces = await fs.readFile(racesFile, 'utf-8')
        const races = parseJSON(allRaces)
        const findRemoveRaceIndex = races.findIndex((race) => {
            return race.id == id
        })
        if (findRemoveRaceIndex > -1) {
            races.splice(findRemoveRaceIndex, 1)
            await fs.writeFile(racesFile, JSON.stringify(races, null, 2))
            writeContent(res, 200, {})
        } else {
            writeContent(res, 404, { status: 'race not found' })
        }
    } catch (e) {
        console.log(e.message)
        writeContent(res, 500, { status: 'Internal sever error!!' })
    }
}

module.exports = controller
