//Logic for Create Read Update Delete the contents of json file and displaying on the frontend

(function () {

    // Grab the frontend html elements first
    const racesWrapper = document.querySelector('#races-container')
    const alertWrapper = document.querySelector('#alert-wrapper')
    const addRaceModal = new bootstrap.Modal(
        document.querySelector('#add-race-modal')
    )
    const addRaceForm = document.querySelector('#add-race-form')
    const editRaceModal = new bootstrap.Modal(
        document.querySelector('#edit-race-modal')
    )
    const editRaceForm = document.querySelector('#edit-race-form')
    const editName = editRaceForm.querySelector('#edit-competition')
    const editMeters = editRaceForm.querySelector('#edit-meters')
    const editMetersValue =  editMeters.options[editMeters.selectedIndex].value;
    const editTime = editRaceForm.querySelector('#edit-time')
    const competition = addRaceForm.querySelector('#new-competition')
    const meters = addRaceForm.querySelector('#new-meters')
    const metersValue =  meters.options[meters.selectedIndex].value;
    const time = addRaceForm.querySelector('#new-time')
    var ctx = document.getElementById('myChart'); //Canvas for the chart
    const app = {};
    
    //The chart with no dataset included 
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Race Time',
                borderWidth: 1,
                backgroundColor: 'rgb(0,100,0)',
                borderColor: 'rgb(0, 0, 0)',
            }]
        },
        
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Rendering the chart based on whether the user clicked All Races /100m / 200m

    // ! All Races
    document.getElementById("all").addEventListener("click", async function() {
        const data = await fetch('/api/races') //get all races first
        const races = await data.json()
        race_competitions = []
        race_times= []
        races.forEach(race => { race_competitions.push(race.competition)});
        races.forEach(race => {race_times.push(parseFloat(race.time))});
        myChart.data.datasets[0].data = race_times;
        myChart.data.labels = race_competitions;
        var dataset = myChart.data.datasets[0];
        dataset.backgroundColor = 'rgb(0,100,0)';
        myChart.update();
      });

    // ! 100m Races
    document.getElementById("100").addEventListener("click", async function() {
        const data = await fetch('/api/races') //get all races first
        const races = await data.json()
        race_competitions = []
        race_times= []
        races.forEach(race => { if(race.meters === "100") race_competitions.push(race.competition)});
        races.forEach(race => { if(race.meters === "100") race_times.push(parseFloat(race.time))});
        median = app.median(race_times);
        race_times.push(median);
        race_competitions.push("Median");
        myChart.data.datasets[0].data = race_times;
        myChart.data.labels = race_competitions;
        var dataset = myChart.data.datasets[0];
        dataset.backgroundColor = 'rgb(0,0,255)';
        myChart.update();
      });
    
      // ! 200m Races
    document.getElementById("200").addEventListener("click", async function() {
        const data = await fetch('/api/races') //get all races including the new one
        const races = await data.json()
        race_competitions = []
        race_times= []
        races.forEach(race => { if(race.meters === "200") race_competitions.push(race.competition)});
        races.forEach(race => { if(race.meters === "200") race_times.push(parseFloat(race.time))});
        median = app.median(race_times);
        race_times.push(median);
        race_competitions.push("Median");
        myChart.data.datasets[0].data = race_times;
        myChart.data.labels = race_competitions;
        var dataset = myChart.data.datasets[0];
        dataset.backgroundColor = 'rgb(255,0,0)';

        myChart.update();
      });

    window.addEventListener('DOMContentLoaded', () => {
        app.init()
    })

    //Application main function 
    app.init = () => {
        app.getRaces()
        app.addRace()
        app.editRaceForm()
    }

    /**
     * Get all saved races when the page loads
     * @async
     */
    app.getRaces = async () => {
        try {
            const data = await fetch('/api/races')
            const races = await data.json()
            if (data.status === 200) {
                //Draw the chart
                race_competitions = []
                race_times= []
                races.forEach(race => {race_competitions.push(race.competition)});
                races.forEach(race => {race_times.push(parseFloat(race.time))});
                myChart.data.datasets[0].data = race_times;
                myChart.data.labels = race_competitions;
                myChart.update();
                races.forEach((race) => {
                    app.renderSingleRace(race, racesWrapper)
                })
            } else {
                throw Error(`Error ${data.status}: When fetching data 😢😢`)
            }
        } catch (e) {
            app.renderErrorMsg(e.message, racesWrapper)
        }
    }

    
    /**
     * Add new Race
     */
    app.addRace = () => {
        
        addRaceForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const validateRace = app.validateRace(competition, meters, time)

            if (validateRace) {
                try {
                    const data = await fetch('/api/races', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'Application/json'
                        },
                        body: JSON.stringify(validateRace)
                    })
                    const newRace = await data.json(); //get the added race
                    if (data.status === 200) {
                        
                        app.renderSingleRace(newRace, racesWrapper)
                        app.renderAlert(
                            'Race has been added successfully 😇😇',
                            'alert-success',
                            alertWrapper
                        )
                        //Update the chart
                        const data = await fetch('/api/races') //get all races including the new one
                        const races = await data.json()
                        race_competitions = []
                        race_times= []
                        races.forEach(race => {race_competitions.push(race.competition)});
                        races.forEach(race => {race_times.push(parseFloat(race.time))});
                        myChart.data.datasets[0].data = race_times;
                        myChart.data.labels = race_competitions;
                        myChart.update();
                    } else {
                        throw Error(
                            `Error ${data.status}: Race has not been added successfully 😢😢`
                        )
                    }
                } catch (e) {
                    app.renderAlert(e.message, 'alert-error', alertWrapper)
                } finally {
                    addRaceModal.hide()
                    app.resetFormField(competition, meters, time)

                }
            }
        })
    }

    /**
     * Edit race form
     */
    app.editRaceForm = () => {
        editRaceForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            if (app.tempRaceId === undefined) return false
            const validateRace = app.validateRace(editName, editMeters, editTime)
            console.log(validateRace)
            if (validateRace) {
                try {
                    const data = await fetch(`/api/races/${app.tempRaceId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'Application/json' },
                        body: JSON.stringify(validateRace)
                    })
                    const { competition, meters, time } = await data.json()
                    console.log(meters);
                    if (data.status === 200) {
                        app.renderAlert(
                            'Race has been updated successfully 😊😊',
                            'alert-success',
                            alertWrapper
                        )
                        for (let raceRow of [...racesWrapper.children]) {
                            if (raceRow.children[0].innerText == app.tempRaceId) {
                                raceRow.children[1].innerText = competition
                                raceRow.children[2].innerText = meters
                                raceRow.children[3].innerText = time
                            }
                        }
                        //Update the chart
                        const data = await fetch('/api/races') //get all races including the new one
                        const races = await data.json()
                        race_competitions = []
                        race_times= []
                        races.forEach(race => {race_competitions.push(race.competition)});
                        races.forEach(race => {race_times.push(parseFloat(race.time))});
                        myChart.data.datasets[0].data = race_times;
                        myChart.data.labels = race_competitions;
                        myChart.update();
                    } else {
                        throw Error(`Error ${data.status}: Race was not updated 😭😭`)
                    }
                } catch (e) {
                    app.renderAlert(e.message, 'alert-error', alertWrapper)
                } finally {
                    editRaceModal.hide()
                    app.resetFormField(editName, editMeters, editTime)
                }
            }
        })
    }

    //Edit single race

    window.editRace = (id, competition, meters, time) => {
        app.tempRaceId = id
        editName.value = competition
        editMeters.value = meters
        editTime.value = time
        editRaceModal.show()
    }

    //Delete single race

    window.deleteRace = async (raceId) => {
        if (confirm('Are you sure you want to remove this race ?')) {
            try {
                const race = await fetch(`api/races/${raceId}`, {
                    method: 'Delete'
                })
                if (race.status === 200) {
                    app.renderAlert(
                        'Race has been deleted successfully 🤗🤗',
                        'alert-success',
                        alertWrapper
                    )
                    for (let raceRow of [...racesWrapper.children]) {
                        if (raceRow.children[0].innerText == raceId) {
                            racesWrapper.removeChild(raceRow)
                        }
                    }
                    //Update the chart
                    const data = await fetch('/api/races') //get all races including the new one
                    const races = await data.json()
                    race_competitions = []
                    race_times= []
                    races.forEach(race => {race_competitions.push(race.competition)});
                    races.forEach(race => {race_times.push(parseFloat(race.time))});
                    myChart.data.datasets[0].data = race_times;
                    myChart.data.labels = race_competitions;
                    myChart.update();
                } else {
                    throw Error(
                        `Error ${race.status}: Race has not been deleted successfully 😢😢`
                    )
                }
            } catch (e) {
                app.renderAlert(e.message, 'alert-error', alertWrapper)
            } 
        }
    }

    // Render single race

    app.renderSingleRace = (race, wrapper) => {
        const { id, competition, meters, time } = race
        const competitionCell = 'this.parentNode.parentNode.parentNode.children[1].innerText'
        const metersCell = 'this.parentNode.parentNode.parentNode.children[2].innerText'
        const timeCell = 'this.parentNode.parentNode.parentNode.children[3].innerText'

        wrapper.innerHTML += `
            <tr>
                <td>${id ? id : 'N/A'}</td>
                <td>${competition ? competition : 'N/A'}</td>
                <td>${meters ? meters : 'N/A'}</td>
                <td>${time ? time : 'N/A'}</td>
                <td>
                    <div class="btn-group">
                        <button
                            class="btn btn-sm btn-warning"
                            onclick="editRace(${id}, ${competitionCell}, ${metersCell}, ${timeCell})"
                        >
                            <i class="bi bi-pencil-square"></i>
                            <span class="d-none d-md-inline">Edit</span>
                        </button>
                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteRace(${id})"
                        >
                            <i class="bi bi-trash"></i>
                            <span class="d-none d-md-inline">Delete</span>
                        </button>
                    </div>
                </td>
            </tr>
            `
    }

    app.median = (numbers) => {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
    
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
    
        return sorted[middle];
    }


    // Render Error Message

    app.renderErrorMsg = (errMsg, wrapper) => {
        wrapper.innerHTML += `
            <tr>
                <td colspan="5" class="text-danger text-center h5">${errMsg}</td>
            </tr>
            `
    }

    // Render alert

    app.renderAlert = (message, alertClass, wrapper) => {
        wrapper.innerHTML = ''
        wrapper.innerHTML = `
        <div class="alert ${alertClass} mb-0 position-fixed fade show" style="top:10px;right:10px" role="alert">
            ${message}
        </div>
        `
        setTimeout(() => (wrapper.innerHTML = ''), 3000)
    }

    // Validate Single Race

    app.validateRace = (competition, meters, time) => {
        const isValidCompetition = app.regexMatch(/([a-z]|\s){5,25}/gi, competition.value.trim())
        const isValidMeters = app.regexMatch(/^[0-9]*$/g, meters.value.trim())
        const isValidTime = app.regexMatch(/^\d+\.\d{1,2}$/, time.value.trim())
        if (!isValidCompetition) competition.classList.add('is-invalid')
        if (!isValidMeters) meters.classList.add('is-invalid')
        if (!isValidTime) time.classList.add('is-invalid')

        if (isValidCompetition && isValidMeters && isValidTime) {
            competition.classList.remove('is-invalid')
            time.classList.remove('is-invalid')
            meters.classList.remove('is-invalid')
            return {
                competition: competition.value.trim(),
                meters: meters.value.trim(),
                time: time.value.trim()
            }
        } else {
            return false
        }
    }

    // Exact Regex Match

    app.regexMatch = (regex, value) => {
        const match = value.match(regex)
        return match && value === match[0]
    }

    // Reset the Form Field

    app.resetFormField = (competition, meters, time) => {
        competition.value = ''
        meters.value = ''
        time.value = ''
    }
})()
