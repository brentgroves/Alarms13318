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

function Every15Mins(transDate) {
  console.log(`Every15Mins: ${transDate}`);

  let msg = {
    TransDate: transDate,
  };
  let msgString = JSON.stringify(msg);
  console.log(msg);
  mqttClient.publish('Periodic13318', msgString);
  return;
}

function CheckForQuarterHour() {
  var dt = datetime.create();
  var transDate = dt.format('Y-m-d H:M');
  var min = dt.format('M');
  console.log(`CheckForQuarterHour: ${min}`);

  if (
    min === '00' ||
    min === '15' ||
    min === '30' ||
         // (min === '40') ||
    min === '45'
  ) {
           // Every15Mins(16,'00');

    Every15Mins(transDate);
  }
}

function main() {
  try {
    mqttClient = mqtt.connect(config.MQTT);
    setInterval(CheckForQuarterHour, 1000 * 60);
  } catch (err) {
    console.log('Error !!!', err);
  }
}
main();
