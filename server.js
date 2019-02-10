// these sample API URL & Authentication URL correspond to Speech Services - Text-to-speech API
// please refer to the Speech Services API Reference for API usage
var API_URL = "https://southeastasia.tts.speech.microsoft.com/cognitiveservices/v1";
var API_AUTH_URL = "https://southeastasia.api.cognitive.microsoft.com/sts/v1.0/issuetoken";

// replace this with your own API KEY
var API_KEY = "---YOUR_API_KEY---";

// (Optional - replace this with supported Standard voices service name)
var SERVICE_NAME = "Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)";

// (Optional - replace this with supported Neural voices service name)
var SERVICE_NAME_NEURAL = "Microsoft Server Speech Text to Speech Voice (en-US, JessaNeural)";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

var service_used = SERVICE_NAME;
var target_text = "What would you like to convert to speech?";

app.use(express.static('public'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/', (req, res) => {
    console.log("[GET] Index page");
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/generate', (req, res) => {
    console.log("[GET] /generate ");
    console.log(req.query);
    if (req.query.text.length > 0){
        target_text = req.query.text;
    } else {
        target_text = "What would you like to convert to speech?"
    }
    if (req.query.neural == 'true'){
        service_used = SERVICE_NAME;
    } else {
        service_used = SERVICE_NAME_NEURAL;
    }
    console.log("Using Service: " + service_used);
    request({
        method: 'POST',
        uri: API_AUTH_URL,
        headers: {
            'Ocp-Apim-Subscription-Key': API_KEY
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var accessToken = body;
            console.log("[GET] accessToken: " + accessToken);
            request({
                method: 'POST',
                uri: API_URL,
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'cache-control': 'no-cache',
                    'User-Agent': 'neural-speech-api',
                    'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
                    'Content-Type': 'application/ssml+xml'
                },
                body: '<speak version=\'1.0\' xmlns="http://www.w3.org/2001/10/synthesis" xml:lang=\'en-US\'>\n<voice  name=\''+ service_used +'\'>' + target_text + '</voice> </speak>'
            }, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    console.log("Converted: " + target_text);
                }
                else {
                    res.status(500).send('Text-to-speech API failed: ' + error);
                }
            }).pipe(res);
        }
        else {
            res.status(500).send('Text-to-speech API failed: ' + error);
        }
    });
});

var port = process.env.PORT || 1337;
app.listen(port, () => console.log('Example app listening on port 1337!'));
