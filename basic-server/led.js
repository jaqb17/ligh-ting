const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({
  //io: new Raspi({ enableSoftPwm: true })
  io: new Raspi()//,
//   repl: false,
//   debug: false
});

let _isOn = false

board.on('ready', () => {
     _led = new five.Led('GPIO18')
     //_led.blink(22)
     console.log('board ready\n')

     exports.turnOn = function(){ 
        _led.on()
        _isOn = true }
     exports.turnOff = function(){
        _led.off()
        _isOn = false }      
})

exports.isOn = function()
{
    return _isOn
}
