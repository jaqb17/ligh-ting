const express = require('express')
const firebase = require('firebase');
const app = express()
app.use(express.json())
const led = require('./led')
const lightsensor = require('./lightsensor')

const ModeEnum = { DUSK_ONLY: 'DUSK_ONLY', TIME_ONLY: 'TIME_ONLY', DUSK_OVER_TIME: 'DUSK_OVER_TIME', OVERRIDE: 'OVERRIDE' }

const _id = 213
var _duskThreshold = 200
var _duskSensorReadInterval = 10000
var _turnOffTime = { hour: 0, minute: 0 }
var _turnOnTime = { hour: 0, minute: 0 }
var _mode = ModeEnum.DUSK_ONLY

var firebaseapp = firebase.initializeApp({
    apiKey: "AIzaSyB9yMeGp9hyzhInZgDiCKi9ba1lT5orz30",
    authDomain: "light-ting.firebaseapp.com",
    databaseURL: "https://light-ting.firebaseio.com",
    projectId: "light-ting",
    storageBucket: "",
    messagingSenderId: "131433570336"
});

var databaseRef = firebaseapp.database().ref('/' + _id + '/')
databaseRef.on('value', function (snapshot) {

    if (snapshot.val().led == 'on') {
        led.turnOn()
    } else if (snapshot.val().led == 'off') {
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
    if (lightsensor.read() < _duskThreshold) {
        led.turnOn()
        firebaseapp.database().ref('/' + _id + '/led').set('on')
    } else {
        led.turnOff()
        firebaseapp.database().ref('/' + _id + '/led').set('off')
    }
    firebaseapp.database().ref('/' + _id + '/duskSensorReadings').set(lightsensor.read())
}, _duskSensorReadInterval)



app.get('/', (req, res) => {

})

app.get('/led', (req, res) => {
    res.send({ isOn: led.isOn() })
})

app.get('/sensor', (req, res) => {
    var value = lightsensor.read()
    res.send({ sensorReadingValue: value })
})

app.post('/led', (req, res) => {
    const state = req.body.state

    if (state == 1) {
        led.turnOn()
        res.send({ state: led.isOn() })
        firebaseapp.database().ref('/' + _id + '/led').set('on')
    }
    else if (state == 0) {
        led.turnOff()
        res.send({ state: led.isOn() })
        firebaseapp.database().ref('/' + _id + '/led').set('off')
    } else {
        res.sendStatus(400)
    }
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

app.post('/config', (req, res) => {
    _duskThreshold = req.body.duskThreshold
    firebaseapp.database().ref('/' + _id + '/duskThreshold').set(_duskThreshold)
    _turnOffTime.hour = req.body.turnOffTime.hour
    firebaseapp.database().ref('/' + _id + '/turnOffTime/hour').set(_turnOffTime.hour)
    _turnOffTime.minute = req.body.turnOffTime.minute
    firebaseapp.database().ref('/' + _id + '/turnOffTime/minute').set(_turnOffTime.minute)
    _turnOnTime.hour = req.body.turnOnTime.hour
    firebaseapp.database().ref('/' + _id + '/turnOnTime/hour').set(_turnOnTime.hour)
    _turnOnTime.minute = req.body.turnOnTime.minute
    firebaseapp.database().ref('/' + _id + '/turnOnTime/minute').set(_turnOnTime.minute)
    _mode = req.body.mode
    firebaseapp.database().ref('/' + _id + '/mode').set(_mode)
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