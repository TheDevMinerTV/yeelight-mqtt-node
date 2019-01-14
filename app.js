const y = require("yeelight-awesome");
const mqtt = require('mqtt');

const discover = new y.Discover({
    port: 1982,
    debug: true,
    fallback: true
});

/**
 * Read the configuration
 */
try {
	configuration = require('./config.json')
} catch (error) {
	throw new Error('Please create and fill your credential file "config.json"!')
}

/**
 * Connect to MQTT
 */
if (configuration.token === '') {
	client = mqtt.connect(configuration.broker)
} else {
	client = mqtt.connect(
		configuration.broker, 
		{
			username: configuration.username,
			password: configuration.token
		}
    )
}
console.log("MQTT     | Connected!");


/**
 * Subscribe to feed
 */
client.on('connect', function () {
    client.subscribe(configuration.feed);
});


discover.once("deviceAdded", (device) => {
    const yeelight = new y.Yeelight({
        lightIp: device.host,
        lightPort: device.port
    });

    console.log("yeelight | Device IP: " + device.host + "\nyeelight | Device port: " + device.port);

    yeelight.on("connected", () => {
        console.log("yeelight | Connected!");
        
        client.on('message', function (topic, message) {
            output = JSON.parse(message.toString());
            console.log("MQTT     | R: " + output.r);
            console.log("MQTT     | G: " + output.g);
            console.log("MQTT     | B: " + output.b + "\n");
            yeelight.setRGB(new y.Color(output.r, output.g, output.b), "smooth", 2000);
        });
    });
    
    yeelight.connect();
});

discover.start();