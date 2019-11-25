// https://github.com/vpulim/node-soap
const soap = require('soap');
const mqtt = require('mqtt');
const config = require('../Config13318/config.json');

var mqttClient;

// At the bottom of the wsdl file you will find the http address of the service

// CNC422
// WorkcenterGroup/WorkCenter
// GA FWD Knuckle/FWD BE 517
// Plex Workcenter: 61420

function Every15Mins(hour,min) {
    console.log(`Every15Mins: ${hour}:${min}`);

      let date_ob = new Date();
      let date = ('0' + date_ob.getDate()).slice(-2);
      let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();

      let TransDate = `${year}-${month}-${date} ${hour}:${min}:00`;
    console.log(TransDate);

        let msg = {
          TransDate: TransDate
        };
        let msgString = JSON.stringify(msg);
        console.log(msg);
        mqttClient.publish('Periodic13318', msgString);
        return;
}

function CheckForQuarterHour() {
  var nextDate = new Date();
  var min = nextDate.getMinutes();
  var hour = nextDate.getHours();

      if (min == 0) {
        min='00'
        console.log('minutes == int')
      }
  console.log(`CheckForQuarterHour: ${hour}:${min}`);

  if ((min === '00') ||
      (min === 15) ||
      (min === 30) ||
//      (min === 52) ||
      (min === 45)) 
  { 
  //        Every15Mins(16,'00');

      Every15Mins(hour,min);
  }


}


function main() {
  try{
  mqttClient = mqtt.connect(
      config.MQTT
  );
  setInterval(CheckForQuarterHour, 1000 * 60 );
//  setTimeout(CheckForQuarterHour, 60000); // Every 60 seconds

  } catch (err) {
    console.log('Error !!!', err);
  }
}
main();
