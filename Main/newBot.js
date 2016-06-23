'use strict';


const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
var path = require('path');
var nusmod = require( path.resolve( __dirname, "./nusmod.js" ) );

// Webserver parameter
const PORT = process.env.PORT || 8445;

// Messenger API parameters
const FB_PAGE_ID = process.env.FB_PAGE_ID;
if (!FB_PAGE_ID) {
  throw new Error('missing FB_PAGE_ID');
}
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN');
}
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

// Messenger API specific code

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const fbReq = request.defaults({
  uri: 'https://graph.facebook.com/me/messages',
  method: 'POST',
  json: true,
  qs: { access_token: FB_PAGE_TOKEN },
  headers: {'Content-Type': 'application/json'},
});

const fbMessage = (recipientId, msg, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        text: msg,
      },
    },
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

// See the Webhook reference
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
const getFirstMessagingEntry = (body) => {
  const val = body.object == 'page' &&
    body.entry &&
    Array.isArray(body.entry) &&
    body.entry.length > 0 &&
    body.entry[0] &&
    body.entry[0].id === FB_PAGE_ID &&
    body.entry[0].messaging &&
    Array.isArray(body.entry[0].messaging) &&
    body.entry[0].messaging.length > 0 &&
    body.entry[0].messaging[0]
  ;
  return val || null;
};

// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());

// Webhook setup
app.get('/fb', (req, res) => {
  if (!FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
  }
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

// Message handler
app.post('/fb', (req, res) => {
  // Parsing the Messenger API response
  const messaging = getFirstMessagingEntry(req.body);
  if (messaging && messaging.message && messaging.recipient.id === FB_PAGE_ID) {
    // Yay! We got a new message!

    // We retrieve the Facebook user ID of the sender
    const sender = messaging.sender.id;

    // We retrieve the message content
    const msg = messaging.message.text;
    const atts = messaging.message.attachments;

    if (atts) {
      // We received an attachment

      // Let's reply with an automatic message
      fbMessage(
        sender,
        'Sorry I can only process text messages for now.'
      );
    } else if (msg) {
      // We received a text message
      // console.log(msg);
      // console.log(findModule(msg));
      // console.log(findKey(msg));
      // fbMessage(sender,msg);
      execute(sender, msg);
      
    }
  }
  res.sendStatus(200);
});

//function to check text

var execute = (sender, msg) => {
	var intent = nusmod.findKey(msg);
	var module = nusmod.findModule(msg);
  console.log(module);
  console.log(intent);
	if (intent === "unsure")
		fbMessage(sender,"We are unclear of your intent");
	else if (intent === "no intent")
		fbMessage(sender,"We are not ready for this sh*t");
	else if (intent === "class") {
		var result = {};
		nusmod.getModule("2015-2016",module).then(function(res){
				result = Object.assign(result,res);
		}).catch(function(err){
			console.log(err);
		})
		// blah blah
		var messageToSend = "This is the message to send";
		fbMessage(sender,messageToSend);
	} else if (intent === "exam") {

		var result = {};

		nusmod.getModule("2015-2016",nusmod.findModule(msg)).then(function(res){

				// console.log(res);
				result = Object.assign(result,res);
				
				var messageToSend = "The date of examination is " + result.ExamDate + ", it will last for " + result.ExamDuration +
		" and it will be held in " + result.ExamVenue + ".";
		fbMessage(sender,messageToSend);

		}).catch(function(err){
			console.log(err);
		});

		// console.log("Mod is " + module);
		// console.log("intent: " + intent);
		// console.log("result " + result);
		// var messageToSend = "The date of examination is " + result.ExamDate + ", it will last for " + result.ExamDuration +
		// " and it will be held in " + result.ExamVenue + ".";
		// fbMessage(sender,messageToSend);

	}

}


