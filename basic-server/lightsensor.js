
const mcpadc = require('mcp-spi-adc');
const shell = require('shelljs');
var isInitialzed = false

exports.read = function () {

    if (!isInitialzed) {
        shell.exec('sudo rmmod spi_bcm2835')
        shell.exec('sudo modprobe spi_bcm2835')
        isInitialzed = true
    }
    var promise = new Promise((resolve, reject) => {

        const tempSensor = mcpadc.openMcp3008(4, (err) => {
            tempSensor.read((err, reading) => {
                resolve(reading.rawValue)
            })
        })
    })
    return promise
}

