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

async function getSetupContainers(
  TransDate,
  PCN,
  ProdServer,
  WorkCenter,
  Cycle_Counter_Shift_SL,
) {
  if (ProdServer) plexWSDL = config.ProdWSDL;
  else plexWSDL = config.TestWSDL;

  var BAS;
  if ('Albion' == PCN) {
    BAS = new soap.BasicAuthSecurity(config.AlbionUser, config.AlbionPassword);
  } else if ('Avilla' == PCN) {
    BAS = new soap.BasicAuthSecurity(config.AvillaUser, config.AvillaPassword);
  }

  console.log(plexWSDL);
  soap.createClient(plexWSDL, function(err, client) {
    // we now have a soapClient - we also need to make sure there's no `err` here.
    if (err) {
      return client.status(500).json(err);
    }

    client.setSecurity(BAS);
    debugger;
    var request_data = {
      ExecuteDataSourceRequest: {
        DataSourceKey: '13318',
        InputParameters: {
          InputParameter: {
            Name: 'Workcenter_Key',
            Value: `${WorkCenter}`,
            Required: 'true',
            Output: 'false',
          },
        },
      },
    };
    client.ExecuteDataSource(request_data, function(err, result) {
      // we now have a soapClient - we also need to make sure there's no `err` here.
      if (err) {
        return res.status(500).json(err);
      }

      console.log(
        result.ExecuteDataSourceResult.ResultSets.ResultSet[0].Rows.Row[0]
          .Columns.Column[0].Name,
      );

      var res = result.ExecuteDataSourceResult.ResultSets.ResultSet[0].Rows.Row;
      var setupContainer = {};
      for (let i = 0; i < res.length; i++) {
        let container = res[i].Columns.Column;
        for (let j = 0; j < container.length; j++) {
          let name = container[j].Name;
          setupContainer[name] = container[j].Value;
        }
        debugger;
        setupContainer['TransDate'] = TransDate;
        setupContainer['ProdServer'] = ProdServer;
        setupContainer['PCN'] = PCN;
        setupContainer['Cycle_Counter_Shift_SL'] = Cycle_Counter_Shift_SL;
        // Ready javascript object for transport
        let msgString = JSON.stringify(setupContainer);

        //console.log(setupContainer);

        mqttClient.publish('Plex13318', msgString);
        setupContainer = {};
      }
    });
  });
}


function Every15Mins(Hour,Min) {
    console.log(`Every15Mins: ${Hour}:${Min}`);
    return;

    const obj = JSON.parse(message.toString()); // payload is a buffer
    let PCN = obj.PCN;
    let WorkCenter = obj.WorkCenter;
    let Cycle_Counter_Shift_SL = obj.Cycle_Counter_Shift_SL;
    console.log(message.toString());
    let date_ob = new Date();
    let date = ('0' + date_ob.getDate()).slice(-2);
    let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let TransDate = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    console.log(TransDate);

    for (let i = 0; i < config.Nid.length; i++) {
      getSetupContainers(
        TransDate,
        config.Nid[i].PCN,
        true,  // Production
        config.Nid[i].WorkCenter,
        Cycle_Counter_Shift_SL,
      );
    }
    /*
    getSetupContainers(
      TransDate,
      PCN,
      false,
      WorkCenter,
      Cycle_Counter_Shift_SL,
    );
    */
}

function CheckForQuarterHour() {
  var nextDate = new Date();
  var mins = nextDate.getMinutes();
  var hour = nextDate.getHours();
  console.log(`CheckForQuarterHour: ${hour}:${mins}`);

  if ((mins === 0) ||
      (mins === 15) ||
      (mins === 30) ||
      (mins === 45)) 
  { 
      Every15Mins(hour,mins);
  }


}


function main() {
  /*
  mqttClient = mqtt.connect(
      config.MQTT
  );
*/
   setInterval(CheckForQuarterHour, 1000 * 60 );
//  setTimeout(CheckForQuarterHour, 60000); // Every 60 seconds
  return;


  mqttClient.on('message', function(topic, message) {
    const obj = JSON.parse(message.toString()); // payload is a buffer
    let PCN = obj.PCN;
    let WorkCenter = obj.WorkCenter;
    let Cycle_Counter_Shift_SL = obj.Cycle_Counter_Shift_SL;
    console.log(message.toString());
    let date_ob = new Date();
    let date = ('0' + date_ob.getDate()).slice(-2);
    let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let TransDate = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    console.log(TransDate);
    getSetupContainers(
      TransDate,
      PCN,
      true,
      WorkCenter,
      Cycle_Counter_Shift_SL,
    );
    /*
    getSetupContainers(
      TransDate,
      PCN,
      false,
      WorkCenter,
      Cycle_Counter_Shift_SL,
    );
    */
  });
}
main();
