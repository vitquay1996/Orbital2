'use strict';


const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
var path = require('path');
var nus = require( path.resolve( __dirname, "./nusmod.js" ) );

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


const sessions = {};
const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

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

const fbMessageWithButtons = (recipientId, msg, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        'attachment': {
        	'type': 'template',
        	'payload': {
        		'template_type': 'button',
        		'text': msg,
        		'buttons': [
        		{
        			'type': 'postback',
        			'title': 'Thank you',
        			'payload': 'yay'
        		},
        		{
        			'type': 'postback',
        			'title': 'Err no',
        			'payload': 'nay'
        		}
        		]
        	}
      },
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
// const getFirstMessagingEntry = (body) => {
//   const val = body.object == 'page' &&
//     body.entry &&
//     Array.isArray(body.entry) &&
//     body.entry.length > 0 &&
//     body.entry[0] &&
//     body.entry[0].id === FB_PAGE_ID &&
//     body.entry[0].messaging &&
//     Array.isArray(body.entry[0].messaging) &&
//     body.entry[0].messaging.length > 0 &&
//     body.entry[0].messaging[0]
//   ;
//   return val || null;
// };

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
  
  // const messaging = getFirstMessagingEntry(req.body);
  // if (messaging && messaging.message && messaging.recipient.id === FB_PAGE_ID) {
  //   // Yay! We got a new message!

  //   // We retrieve the Facebook user ID of the sender
    
  //   const sender = messaging.sender.id;

    

  //   // We retrieve the message content
  //   const msg = messaging.message.text.toUpperCase();
  //   const atts = messaging.message.attachments;
  //   // const payload = messaging.postback;


  

  //   if (atts) {
  //     // We received an attachment

  //     // Let's reply with an automatic message

  //     fbMessage(
  //       sender,
  //       'What a nice photo!'
  //     );
  //   } else if (msg) {
      
  //     execute(sender, msg);

  //   } else if (payload){
  //   	console.log('fine');
  //   }
  //   // } else if (payload) {
      
  //   //   // Handle a payload from this sender
  //   //   console.log(payload);
  //   // }
  // }

  let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {

		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		const sessionId = findOrCreateSession(sender);



		if (event.message && event.message.text) {
			let text = event.message.text.toUpperCase()
			// sessions[sessionId].context.parameter = execute(sender,text);
			// fbMessage(sender,sessions[sessionId].context.parameter);
			execute(sender,text);
		}
		if (event.postback) {
			if (event.postback.payload == 'yay' ) {
				fbMessage(sender,'It is my pleasure!');
				delete sessions[sessionId];
				console.log('session terminated');
			} else {
				fbMessage(sender,'Too bad!');
				delete sessions[sessionId];
				console.log('session terminated');
			}
		}
	}

  res.sendStatus(200);
});

//function to check text

var execute = (sender, msg ) => {
  
	var intent = nus.findKey(msg);
	var module = nus.findModule(msg);
	
	// var module = nusmod.findModule(msg);
  
	switch(intent){
		case "unsure":

		fbMessage(sender,"Do you wish to find class location or examination detail?");
		break;

		case "no intent":

		fbMessage(sender,"We are not ready for this sh*t");
		break;

		case "class":

		if (module !== -1) {
		var result = {};
		nus.getModule("2015-2016",module).then(function(res){
				result = Object.assign(result,res);
		}).catch(function(err){
			console.log(err);
		})
		// blah blah
		var messageToSend = "This is the message to send";
		fbMessage(sender,messageToSend);
		} else 
			fbMessage(sender,'There is either no module indicated or we cannot find that module. Please indicate again');
		break;

		case "exam":

		if (module !== -1) {
			var result = {};

			nus.getModule(nus.findmodule(msg)).then(function(res){
				// console.log(nus.findModule(msg));
				// console.log(res);
				result = Object.assign(result,res);
        // console.log(result);

        var messageToSend = "The time of examination of module " + nus.findModule(msg) + " is at " + nus.convertTime(result.ExamDate) + ", it will last for " + nus.convertPeriod(result.ExamDuration) +
        " and it will be held in " + result.ExamVenue + ".";
        console.log(nus.convertTime(result.ExamDate));
        fbMessageWithButtons(sender,messageToSend);
		// delete sessions[sessionId];
		console.log("Waiting for other messages");

		}).catch(function(err){
			// console.log(err);

			var messageToSend = "Sorry we cannot find your module. Is it " + err + "?";
			fbMessage(sender,messageToSend);
			console.log("Waiting for other messages");

		});
		} else 
			fbMessage(sender,'There is either no module indicated or we cannot find that module. Please indicate again');




	}
	// return intent || module;


}


