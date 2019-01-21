const express = require('express')
const firebase = require('firebase');
const path = require('path')
const app = express()
app.use(express.json())
const led = require('./led')
const lightsensor = require('./lightsensor')

const ModeEnum = { DUSK_ONLY: 'DUSK_ONLY', TIME_ONLY: 'TIME_ONLY', DUSK_OVER_TIME: 'DUSK_OVER_TIME', OVERRIDE: 'OVERRIDE' }

const _id = 213
var refDirectory = '/lights/' + _id + '/'
var _duskThreshold = 200
var _duskSensorReadInterval = 10000
var _turnOffTime = { hour: 0, minute: 0 }
var _turnOnTime = { hour: 0, minute: 0 }
var _mode = ModeEnum.OVERRIDE

var firebaseapp = firebase.initializeApp({
    apiKey: "AIzaSyB9yMeGp9hyzhInZgDiCKi9ba1lT5orz30",
    authDomain: "light-ting.firebaseapp.com",
    databaseURL: "https://light-ting.firebaseio.com",
    projectId: "light-ting",
    storageBucket: "",
    messagingSenderId: "131433570336"
});

var databaseRef = firebaseapp.database().ref(refDirectory)
databaseRef.on('value', function (snapshot) {


    if (snapshot.val().led) {
        led.turnOn()
    } else if (!snapshot.val().led) {
        led.turnOff()
    }
    _duskThreshold = snapshot.val().duskThreshold
    _turnOffTime.hour = snapshot.val().turnOffTime.hour
    _turnOffTime.minute = snapshot.val().turnOffTime.minute
    _turnOnTime.hour = snapshot.val().turnOnTime.hour
    _turnOnTime.minute = snapshot.val().turnOnTime.minute
    _mode = snapshot.val().mode

})

setInterval(function () {

    lightsensor.read().then((result) => {
        var sensorReading = result


        switch (_mode) {

            case ModeEnum.DUSK_ONLY:
                if (sensorReading <= _duskThreshold) {
                    led.turnOn()
                    firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
                } else {
                    led.turnOff()
                    firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
                }
                break

            case ModeEnum.TIME_ONLY:
                var hours = (new Date()).getHours();
                var minutes = (new Date()).getMinutes();
                if (hours == _turnOnTime.hour && minutes == _turnOnTime.minute) {
                    led.turnOn()
                    firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
                }
                if (hours == _turnOffTime.hour && minutes == _turnOffTime.minute) {
                    led.turnOff()
                    firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
                }
                break

            case ModeEnum.DUSK_OVER_TIME:
                var hours = (new Date()).getHours();
                var minutes = (new Date()).getMinutes();
                if (hours == _turnOnTime.hour && minutes == _turnOnTime.minute || sensorReading <= _duskThreshold) {
                    led.turnOn()
                    firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
                }
                if (hours == _turnOffTime.hour && minutes == _turnOffTime.minute && sensorReading > _duskThreshold) {
                    led.turnOff()
                    firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
                }

                break

            case ModeEnum.OVERRIDE:
                break
        }

        firebaseapp.database().ref(refDirectory + 'duskSensorReadings').set(sensorReading)

    })

}, _duskSensorReadInterval)



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/css/materialize.min.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/css/materialize.min.css'))
})

app.get('/js/materialize.min.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/js/materialize.min.js'))
})

app.get('/images/bulb.png', (req, res) => {
    res.sendFile(path.join(__dirname + '/images/bulb.png'))
})

app.get('/images/bulb_off.png', (req, res) => {
    res.sendFile(path.join(__dirname + '/images/bulb_off.png'))
})

app.get('/js/axios.min.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/js/axios.min.js'))
})

app.get('/id', (req,res)=>{
    res.send({id: _id})
})

app.get('/led', (req, res) => {
    res.send({ isOn: led.isOn() })
})

app.get('/sensor', (req, res) => {
    lightsensor.read().then((result) => {
        res.send({ sensorReadingValue: result })
    })
})

app.get('/duskThreshold', (req, res) => {
    res.send({ duskThreshold: _duskThreshold })
})

app.post('/duskThreshold', (req, res) => {
    _duskThreshold = req.body.duskThreshold
    firebaseapp.database().ref(refDirectory + 'duskThreshold').set(_duskThreshold)
})

app.get('/mode', (req, res) => {
    res.send({ mode: _mode })
})

app.post('/mode', (req, res) => {
    _mode = req.body.mode
    firebaseapp.database().ref(refDirectory + 'mode').set(_mode)
})


app.post('/led', (req, res) => {
    const state = req.body.state

    if (state == 1) {
        led.turnOn()
        res.send({ state: led.isOn() })
        firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
    }
    else if (state == 0) {
        led.turnOff()
        res.send({ state: led.isOn() })
        firebaseapp.database().ref(refDirectory + 'led').set(led.isOn())
    } else {
        res.sendStatus(400)
    }
})

app.post('/turnontime', (req, res) => {
    _turnOnTime.hour = req.body.hour
    firebaseapp.database().ref(refDirectory + 'turnOnTime/hour').set(_turnOnTime.hour)
    _turnOnTime.minute = req.body.minute
    firebaseapp.database().ref(refDirectory + 'turnOnTime/minute').set(_turnOnTime.minute)
})

app.post('/turnofftime', (req, res) => {
    _turnOffTime.hour = req.body.hour
    firebaseapp.database().ref(refDirectory + 'turnOffTime/hour').set(_turnOffTime.hour)
    _turnOffTime.minute = req.body.minute
    firebaseapp.database().ref(refDirectory + 'turnOffTime/minute').set(_turnOffTime.minute)
})

app.get('/turnontime', (req, res) => {
    res.send({ hour: _turnOnTime.hour, minute: _turnOnTime.minute })
})

app.get('/turnofftime', (req, res) => {
    res.send({ hour: _turnOffTime.hour, minute: _turnOffTime.minute })
})

app.get('/config', (req, res) => {
    res.send({
        duskThreshlod: _duskThreshold,
        turnOffTime: {
            hour: _turnOffTime.hour,
            minute: _turnOffTime.minute
        },
        turnOnTime: {
            hour: _turnOnTime.hour,
            minute: _turnOnTime.minute
        },
        mode: _mode
    })
})





let port = 3000 || process.env.PORT

app.listen(3000, () => { console.log(`sluchane na porcie ${port}`) })