const express = require('express')
const app = express()
app.use(express.json())
const led = require('./led')
const lightsensor = require('./lightsensor')

app.get('/', (req, res) => {
    res.send("rucham psa")
})

app.get('/led', (req, res) => {
    res.send({isOn: led.isOn()})
})

app.get('/sensor', (req, res) => {
    res.send({sensorReadingValue: lightsensor.read()})
})

app.post('/led', (req, res) => {

    const state = req.body.state

    if (state == 1) {
        led.turnOn()
        res.send({ state: state })
    }
    else if (state == 0) {
        led.turnOff()
        res.send({ state: state })
    } else {
        res.sendStatus(400)
    }


})



let port = 3000 || process.env.PORT

app.listen(3000, () => { console.log(`sluchane na porcie ${port}`) })