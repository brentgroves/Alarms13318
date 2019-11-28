// https://github.com/vpulim/node-soap
const mqtt = require('mqtt');
const config = require('../Config13318/config.json');
var datetime = require('node-datetime');

var mqttClient;

// At the bottom of the wsdl file you will find the http address of the service

// CNC422
// WorkcenterGroup/WorkCenter
// GA FWD Knuckle/FWD BE 517
// Plex Workcenter: 61420

function Alarm1(transDate) {
  console.log(`Alarm1: ${transDate}`);

  let msg = {
    TransDate: transDate,
  };
  let msgString = JSON.stringify(msg);
  console.log(msg);
  mqttClient.publish('Alarm13318-1', msgString);
  return;
}

function Alarm2(transDate) {
  console.log(`Alarm1: ${transDate}`);

  let msg = {
    TransDate: transDate,
  };
  let msgString = JSON.stringify(msg);
  console.log(msg);
  mqttClient.publish('Alarm13318-2', msgString);
  return;
}

function CheckForAlarm() {
  var dt = datetime.create();
  var transDate = dt.format('Y-m-d H:M');
  var min = dt.format('M');
  console.log(`CheckForAlarm: ${min}`);

  if (
    min === '00' ||
    min === '15' ||
    min === '30' ||
         // (min === '54') ||
    min === '45'
  ) {
    Alarm1(transDate);
  }
  if (
    min === '02' ||
    min === '17' ||
    min === '32' ||
         // (min === '54') ||
    min === '47'
  ) {
    Alarm2(transDate);
  }

}

function main() {
  try {
    mqttClient = mqtt.connect(config.MQTT);
    setInterval(CheckForAlarm, 1000 * 60);
  } catch (err) {
    console.log('Error !!!', err);
  }
}
main();
