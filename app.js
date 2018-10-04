/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';

var userIds = [];
//var prduserIds = [];

//          ini
var userComplain = {
    0: {
      "address": "",
      "bottlesRequired": "",
      "landMark": "",
      "waterType": "",
      "city": "",
      "landlineNumber": "",
      "name": "Noman",
      "paymentMode": "",
      "mobileNumber": "",
      brandName:""
    
    }
};

//------------------Data--------------//

var questions={
 
      
          "name":{
          
          "prompts": [
            {
              "lang": "en",
              "value": "What is your Name?"
            },
            {
              "lang": "en",
              "value": "May I know your good name please?"
            },
            {
              "lang": "en",
              "value": "Your good name?"
            }
          ]},
        
        
           "address":{
       
          "prompts": [
            {
              "lang": "en",
              "value": "please tell your address?"
            },
            {
              "lang": "en",
              "value": "what is your residential address?"
            },
            {
              "lang": "en",
              "value": "what is your street address?"
            }
          ]
        },
         "landMark":{
        
          "prompts": [
            {
              "lang": "en",
              "value": "Landmark near your location?"
            },
            {
              "lang": "en",
              "value": "please tell landmark nearby your place?"
            }
          ]
        },
          
        "city":{
         
          "prompts": [
            {
              "lang": "en",
              "value": "What is the name of your city?"
            },
            {
              "lang": "en",
              "value": "In which city you are located?"
            },
            {
              "lang": "en",
              "value": "Please tell me the name of your city?"
            }
          ]
        },
          "mobileNumber":
          {
        
          "prompts": [
            {
              "lang": "en",
              "value": "May I know your cell number?"
            },
            {
              "lang": "en",
              "value": "Your cell number please?"
            },
            {
              "lang": "en",
              "value": "Do you have any cell number?"
            },
            {
              "lang": "en",
              "value": "Enter your mobile number?"
            }
          ]
        },
        "landlineNumber":{
        
          "prompts": [
            {
              "lang": "en",
              "value": "Enter your landline number?"
            }
          ]
        },

          "bottlesRequired":
          {
        
          "prompts": [
            {
              "lang": "en",
              "value": "how many 19 liters bottles required by your per week?"
            },
            {
              "lang": "en",
              "value": "Enter your weekly requirement of 19 liters water bottles?"
            }
          ]
        },
        "waterType":
        {
      
        "prompts": [
          {
            "lang": "en",
            "value": "Which type of water you use for drinking?"
          },
          {
            "lang": "en",
            "value": "Which type of water do you use?"
          }
        ]
      }
      ,
        "brandName":
        {
      
        "prompts": [
          {
            "lang": "en",
            "value": "Which Brand?"
          },
          {
            "lang": "en",
            "value": "Please tell the name of your drinking water brand?"
          }
        ]
      }
    }



//------------------------------------------------
const
    bodyParser = require('body-parser'),
    config = require('config'),
    crypto = require('crypto'),
    express = require('express'),
    https = require('https'),
    request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
    (process.env.MESSENGER_VALIDATION_TOKEN) :
    config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
    (process.env.SERVER_URL) :
    config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
    console.error("Missing config values");
    process.exit(1);
}

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
    var data = req.body;
//console.log(data);
    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
      if(data.entry)
      {
        data.entry.forEach(function(pageEntry) {
      if(pageEntry)
      {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
         if(pageEntry.messaging)
                 {
            pageEntry.messaging.forEach(function(messagingEvent) {
                
                if (messagingEvent.optin) {
                    receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
              
            });}
      }});
        
      }
        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */
app.get('/authorize', function(req, res) {
    var accountLinkingToken = req.query.account_linking_token;
    var redirectURI = req.query.redirect_uri;

    // Authorization Code should be generated per user by the developer. This will
    // be passed to the Account Linking callback.
    var authCode = "1234567890";

    // Redirect users to this URI on successful login
    var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

    res.render('authorize', {
        accountLinkingToken: accountLinkingToken,
        redirectURI: redirectURI,
        redirectURISuccess: redirectURISuccess
    });
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
        // For testing, let's log an error. In production, you should throw an
        // error.
        console.error("Couldn't validate the signature.");
    } else {
        var elements = signature.split('=');
        var method = elements[0];
        var signatureHash = elements[1];

        var expectedHash = crypto.createHmac('sha1', APP_SECRET)
            .update(buf)
            .digest('hex');

        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set this to an arbitrary value to associate the
    // authentication callback with the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderID, recipientID, passThroughParam,
        timeOfAuth);

    // When an authentication is received, we'll send a message back to the sender
    // to let them know it was successful.
    sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;
  if(userIds.indexOf(senderID) < 0 && !message.is_echo){
        console.log("Adding ID ::::" + senderID);
        userIds.push(senderID);
        userComplain[senderID] ={
          "name": "",
          "address": "",
          "landMark": "",
          "city": "",
          "landlineNumber": "",
          "mobileNumber": "",
          "bottlesRequired": "",
          "waterType": "",
           "brandName":""

        }
    }
  console.log(userComplain[senderID])
  
//  Received message for user 211362078889550 and page 1335853019864882 at 1500385586341 with message:
    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    


    if (isEcho) {
        // Just logging message echoes to console
        console.log("Received echo for message %s and app %d with metadata %s",
            messageId, appId, metadata);
        if("HI_META_DATA" == metadata){
           // sendGenderOptMsg(recipientID);
            console.log("Received HI msg");
        }
        return;
    } else if (quickReply) {
        var quickReplyPayload = quickReply.payload;
        console.log("Quick reply for message %s with payload %s",
            messageId, quickReplyPayload);

        sendTextMessage(senderID, quickReplyPayload+" tapped");
        return;
    }

    if (messageText) {

        // If we receive a text message, check to see if it matches any special
        // keywords and send back the corresponding example. Otherwise, just echo
        // the text we received.
        // cases
        //

 for(var i in userComplain[senderID])
  {
  console.log(i,userComplain[senderID][i]);
  userComplain[senderID][i]
    if(messageText=="Get Started" ){
  
    userComplain[senderID][i]="";
    
    continue;
    }
      
    if(i=="name" && userComplain[senderID][i]=="" )
    {
      if(messageText=="hi")
      {
      sendTextMessage(senderID, "Hey - I’m Aquafina. Let’s make an order!");
        console.log(questions["name"].prompts,Math.random()*(questions["name"].prompts.length-1));
      sendTextMessage(senderID, questions["name"].prompts[Math.round(Math.random()*(questions["name"].prompts.length-1))].value);
      }
      else
      {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["address"].prompts[Math.round(Math.random()*(questions["address"].prompts.length-1))].value);

      }
      break;
      
    }
    if(i=="address" && userComplain[senderID][i]=="" )
    {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["landMark"].prompts[Math.round(Math.random()*(questions["landMark"].prompts.length-1))].value);
      break;
      
    }
    if(i=="landMark" && userComplain[senderID][i]=="" )
    {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["city"].prompts[Math.round(Math.random()*(questions["city"].prompts.length-1))].value);
      break;
      
    }
    if(i=="city" && userComplain[senderID][i]=="" )
    {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["landlineNumber"].prompts[Math.round(Math.random()*(questions["landlineNumber"].prompts.length-1))].value);
      break;
    }
    if(i=="landlineNumber" && userComplain[senderID][i]=="" )
    {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["mobileNumber"].prompts[Math.round(Math.random()*(questions["mobileNumber"].prompts.length-1))].value);
      break;
      
    }
    if(i=="mobileNumber" && userComplain[senderID][i]=="" )
    {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["bottlesRequired"].prompts[Math.round(Math.random()*(questions["bottlesRequired"].prompts.length-1))].value);
      break;
      
    }
    if(i=="bottlesRequired" && userComplain[senderID][i]=="" )
    {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["waterType" ].prompts[Math.round(Math.random()*(questions["waterType"].prompts.length-1))].value);
      break;
      
    }
    if(i== "waterType" && userComplain[senderID][i]=="" )
    {
      userComplain[senderID][i]=messageText;
      sendTextMessage(senderID, questions["brandName"].prompts[Math.round(Math.random()*(questions["brandName"].prompts.length-1))].value);
      break;
      
    }
    if(i== "brandName" && userComplain[senderID]["brandName"]=="" )
    {
      userComplain[senderID][i]=messageText;
      //sendTextMessage(senderID, questions[i].prompts[Math.round(Math.random()*(questions[i].prompts.length-1))].value);
      break;
      
    } 
  }

        switch (messageText) {

             case 'hi':
              
               // sendTextMessage(senderID, "Hey - I’m Aquafina. Let’s make an order!","HI_META_DATA");
                
                break;
            case 'renewlife':
                sendRenewLifeWelcomeMsg(senderID);
                break;

            case 'image':
                sendImageMessage(senderID);
                break;

            case 'gif':
                sendGifMessage(senderID);
                break;

            case 'audio':
               // sendAudioMessage(senderID);
                break;

            case 'video':
                sendVideoMessage(senderID);
                break;

            case 'file':
                sendFileMessage(senderID); 
                break;

            case 'button':
                sendButtonMessage(senderID);
                break;

            case 'generic':
                sendGenericMessage(senderID);
                break;

            case 'receipt':
                //sendReceiptMessage(senderID);
                break;

            case 'quick reply':
                sendQuickReply(senderID);
                break;

            case 'read receipt':
                sendReadReceipt(senderID);
                break;

            case 'typing on':
                sendTypingOn(senderID);
                break;

            case 'typing off':
                sendTypingOff(senderID);
                break;

            case 'account linking':
                sendAccountLinking(senderID);
                break;

            default:
                sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;
    var sequenceNumber = delivery.seq;

    if (messageIDs) {
        messageIDs.forEach(function(messageID) {
            console.log("Received delivery confirmation for message ID: %s",
                messageID);
        });
    }

    console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 *
 *          hassupostback
 *
 */

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

    // cases

    switch (payload) {
        case 'NAME':
            sendComplainQuery(senderID,"Sorry for the inconvenience, kindly let us know the details.");
            break;
        case 'ADDRESS':
            sendProductMessage(senderID);
            break;
        case 'LANDMARK':
            sendFormOptMsg(senderID);
            demographic="infant";
            break;
        case 'CITY':
            demographic="kid";
            sendFormOptMsg(senderID);
            break;
        case 'CELL_NUMBER':
            demographic="man";
            sendFormOptMsg(senderID);
            break;
        case 'LANDLINE_NUMBER':
            demographic="man";
            sendFormOptMsg(senderID);
            break;
        case 'BOTTLES':
            demographic="woman";
            sendFormOptMsg(senderID);
            break;
        case 'WATER_TYPE':
            demographic="woman";
            sendFormOptMsg(senderID);
            break;
        case 'BRAND_NAME':
            form="capsule";
            sendSupportOptMsg(senderID);
            break;
        case 'RL_CHEWABLES_OPT':
            form="chewable";
            sendSupportOptMsg(senderID);
            break;
        case 'RL_POWDER_OPT':
            form="powder";
            sendSupportOptMsg(senderID);
        setTimeout(sendSupportOptMsg,12000,senderID);
            break;
        case 'RL_TARGETED_OPT':
            sendBuyOptMsg(senderID);
            break;
        case 'RL_EXTRACARE_OPT':
            sendBuyOptMsg(senderID);
            break;
        case 'RL_EVERYDAY_OPT':
            sendBuyOptMsg(senderID);
            break;
        case 'RL_ONLINE_OPT':
            sendProductMessage(senderID);
            break;
        case 'RL_STORE_OPT':
            sendProductMessage(senderID);
            break;


        default:
            sendTextMessage(senderID, "Postback called");
    }

    console.log("Received postback for user %d and page %d with payload '%s' " + "at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    var watermark = event.read.watermark;
    var sequenceNumber = event.read.seq;

    console.log("Received message read event for watermark %d and sequence " +
        "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    var status = event.account_linking.status;
    var authCode = event.account_linking.authorization_code;

    console.log("Received account link event with for user %d with status %s " +
        "and auth code %s ", senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId,url) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                   url: url ? url:"http://2civ.2cimple.com/aquafina/assets/images/bg.jpg"
 
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId,url) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: url ? url:"https://i.makeagif.com/media/2-15-2015/KAOiut.gif"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId,url) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "audio",
                payload: {
                    url: url ? url:SERVER_URL + "/assets/sample.mp3"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId,url) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "video",
                payload: {
                    url: url ? url: "https://www.youtube.com/watch?v=-mlpgiiUcAc"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId,url) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "file",
                payload: {
                    url: url ? url:SERVER_URL + "/assets/test.txt"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText, metaData) {
    var _metaData = "DEVELOPER_DEFINED_METADATA";
    if(metaData)
    _metaData = metaData;

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,

            metadata: _metaData
        }
    };

    callSendAPI(messageData);
}


/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId,title,buttons) {
    var messageData = {
        recipient: { 
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: title,
                    buttons:buttons
                }
            }
        }
    };

    callSendAPI(messageData);
}
/*      Renew Life Code
 *
 *     hassu



 * Send a Structured Message (Renew Life Type) using the Send API.
 *
 */


function sendRenewLifeWelcomeMsg(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome to Renew Life Automated Query System.\u000A How Can I help you ?",
                    buttons:[{
                        type: "postback",
                        title: "Register A Complaint",
                        payload: "RL_COMPLAINT_OPT"
                    }, {
                        type: "postback",
                        title: "Get A Product Recommendation / Buy A Product",
                        payload: "RL_PRODUCTBUY_OPT"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}
/*      complainq     */

function sendComplainQuery(recipientId,messageText) {


    if(userIds.indexOf(recipientId) < 0){
        console.log("Adding ID ::::" + recipientId);
        userIds.push(recipientId);
        userComplain[recipientId] = {
            complain: "",
            phonenumber: ""
        }
    }

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

/*      Product Query     */

function sendProductQuery(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome to Renew Life Automated Query System. How Can I help you ?",
                    buttons:[{
                        type: "postback",
                        title: "Register A Complaint",
                        payload: "RL_COMPLAINT_OPT"
                    }, {
                        type: "postback",
                        title: "Get A Product Recommendation / Buy A Product",
                        payload: "RL_PRODUCTBUY_OPT"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "rift",
                        subtitle: "Next-generation virtual reality",
                        item_url: "https://www.oculus.com/en-us/rift/",
                        image_url: SERVER_URL + "/assets/rift.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/rift/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for first bubble"
                        }]
                    },{
                        title: "touch",
                        subtitle: "Your Hands, Now in VR",
                        item_url: "https://www.oculus.com/en-us/touch/",
                        image_url: SERVER_URL + "/assets/touch.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/touch/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for second bubble"
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function sendGenderOptMsg(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "First, I need to know a little bit about you so that I can make the best recommendations.\u000A How would you describe your age and gender?",
                    buttons:[{
                        type: "postback",
                        title: "Kid under 18",
                        payload: "RL_KIDS_OPT"
                    },{
                        type: "postback",
                        title: "Man under 50",
                        payload: "RL_MAN_OPT"
                    },{
                        type: "postback",
                        title: "Woman under 50",
                        payload: "RL_WOMAN_OPT"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}


function sendFormOptMsg(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Ok great - thanks for that! How do you prefer to take your probiotic?",
                    buttons:[{
                        type: "postback",
                        title: "Capsules",
                        payload: "RL_CAPSULE_OPT"
                    }, {
                        type: "postback",
                        title: "Chewables",
                        payload: "RL_CHEWABLES_OPT"
                    },{
                        type: "postback",
                        title: "Powder",
                        payload: "RL_POWDER_OPT"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

function sendSupportOptMsg(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Got it. What kind of support are you needing?",
                    buttons:[{
                        type: "postback",
                        title: "Targeted",
                        payload: "RL_TARGETED_OPT"
                    }, {
                        type: "postback",
                        title: "Extra Care",
                        payload: "RL_EXTRACARE_OPT"
                    },{
                        type: "postback",
                        title: "Everyday",
                        payload: "RL_EVERYDAY_OPT"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}


function sendBuyOptMsg(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Perfect - we’re almost done. Last question - Where do you prefer buying your supplements?",
                    buttons:[{
                        type: "postback",
                        title: "Online",
                        payload: "RL_ONLINE_OPT"
                    }, {
                        type: "postback",
                        title: "In the store",
                        payload: "RL_STORE_OPT"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}



function sendProductMessage(recipientId) {

    var _elements=createElementsList(demographic,form);
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: _elements
                }
            }
        }
    };
    console.log(_elements,"  ELEMENTS   ");
    console.log("   MESSAGE DATA ", messageData);
    callSendAPI(messageData);
}


/*
 * Send a receipt message using the Send API.
 *
 */



/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "What's your favorite movie genre?",
            quick_replies: [
                {
                    "content_type":"text",
                    "title":"Action Movies",
                    "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
                },
                {
                    "content_type":"text",
                    "title":"Comedy Movies",
                    "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
                },
                {
                    "content_type":"text",
                    "title":"Drama Movies",
                    "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
                }
            ]
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
    console.log("Sending a read receipt to mark message as seen");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "mark_seen"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
    console.log("Turning typing indicator on");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_on"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
    console.log("Turning typing indicator off");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_off"
    };

    callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome. Link your account.",
                    buttons:[{
                        type: "account_link",
                        url: SERVER_URL + "/authorize"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}




//-------------- Calling Renewlife Api-----------------------------//
function callRenewAPI(senderId,demographic,form,segment,container,store_type,id) {
    var requestParams="";
    if(demographic)
        requestParams+="demographic="+demographic;
    if(form)
        requestParams+="&form="+form;
    if(segment)
        requestParams+="&segment="+segment;
    if(container)
        requestParams+="&container="+container;
    if(store_type)
        requestParams+="&store_type="+store_type;
    if(id)
        requestParams+="&id="+id;

    request({
        uri: 'http://www.renewlife.com/json?' + requestParams,
        method: 'GET'


    }, function(error, response, body) {


        if (!error) {
            console.log(body);
            console.log("bodyTest")
            sendTextMessage(senderId,body);
            //console.log(response);
        }

    });
}
//-----------------------------------------------//

//----------------------------Loading Dynamic Data---------------------//


var productsData= {
    "infant": {

        "powder": {}

    },

    "kid": {

        "chewable": {},
        "powder": {}

    },

    "man": {
        "capsule": {
            "Ultimate Flora Everyday Probiotic 15 Billion": {
                price: "$9.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-everyday15b-14ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-everyday-probiotic-15-billion.html"

            },
            "Ultimate Flora Saccharomyces Boulardii 6 Billion": {
                price: "$13.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-S-Boulardii-6B-20ct.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-saccharomyces-boulardii-6-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 50 Billion": {
                price: "$21.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare50b-14ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-50-billion.html"

            },
            "Ultimate Flora Everyday Probiotic Go Pack 15 Billion": {
                price: "$21.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-everyday15b-go-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-everyday-probiotic-go-pack-15-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 30 Billion": {
                price: "$26.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare-30b-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-30-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic Go Pack 30 Billion": {
                price: "$29.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare-go-30b-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-go-pack-30-billion.html"

            },
            "Ultimate Flora Daily Immune Probiotic 25 Billion": {
                price: "$32.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-dailyimmune-main.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-daily-immune-probiotic-25-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic Go Pack 50 Billion": {
                price: "$39.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare50b-go-30ct-main-0816_1.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-go-pack-50-billion.html"

            },
            "Ultimate Flora Men’s Complete Probiotic 90 Billion": {
                price: "$49.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-menscomplete90b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-mens-complete-probiotic-90-billion.html"

            },
            "Ultimate Flora Colon Care Probiotic 80 Billion": {
                price: "$49.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-coloncare80b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-colon-care-probiotic-80-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 100 Billion": {
                price: "$59.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare100b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-100-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 150 Billion": {
                price: "$69.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare150b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-150-billion.html"

            }
        },

        "chewable": {
            "Ultimate Flora Probiotic Gummies": {
                price: "$20.49",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-Gummy2B.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-probiotic-gummies.html"
            },
            "Ultimate Flora Probiotic Sour Gummies": {
                price: "$19.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-SourGummies2B-60ct.png",
                webUrl:"http://www.renewlife.com/ultimate-flora-sour-gummies.html"
            }
        },
        "powder": {
            "Ultimate Flora Probiotic Fizzy Drink Mix – Mixed Berry": {
                price: "$9.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-FizzyProbiotic15B-Berry-main.png",
                webUrl:"http://www.renewlife.com/ultimate-flora-probiotic-fizzy-drink-mix-mixed-berry.html"


            },
            "Ultimate Flora Probiotic Fizzy Drink Mix – Raspberry Lemonade": {
                price: "$9.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-FizzyProbiotic15B-RaspLemon-main.png",
                webUrl:"http://www.renewlife.com/ultimate-flora-probiotic-fizzy-drink-mix-raspberry-lemonade.html"


            },
            "Ultimate Flora Everyday Probiotic 15 Billion": {
                price: "$9.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-everyday15b-14ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-everyday-probiotic-15-billion.html"

            }
        }

    },
    "woman": {

        "capsule": {
            "Ultimate Flora Everyday Probiotic 15 Billion": {
                price: "$9.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-everyday15b-14ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-everyday-probiotic-15-billion.html"

            },
            "Ultimate Flora Saccharomyces Boulardii 6 Billion": {
                price: "$13.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-S-Boulardii-6B-20ct.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-saccharomyces-boulardii-6-billion.html"

            },
            "Ultimate Flora Women’s Care Probiotic Go Pack 15 Billion": {
                price: "$21.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-womenscare15b-go-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-womens-care-probiotic-go-pack-15-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 50 Billion": {
                price: "$21.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare50b-14ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-50-billion.html"

            },
            "Ultimate Flora Everyday Probiotic Go Pack 15 Billion": {
                price: "$21.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-everyday15b-go-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-everyday-probiotic-go-pack-15-billion.html"

            },
            "Ultimate Flora Women’s Care Probiotic 25 Billion": {
                price: "$26.29",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-womenscare25b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-womens-care-probiotic-25-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 30 Billion": {
                price: "$26.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare-30b-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-30-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic Go Pack 30 Billion": {
                price: "$29.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare-go-30b-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-go-pack-30-billion.html"

            },
            "Ultimate Flora Daily Immune Probiotic 25 Billion": {
                price: "$32.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-dailyimmune-main.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-daily-immune-probiotic-25-billion.html"

            },
            "Ultimate Flora Women's Vaginal Probiotic 50 Billion": {
                price: "$39.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-womensvaginal-50b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-womens-vaginal-probiotic-50-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic Go Pack 50 Billion": {
                price: "$39.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare50b-go-30ct-main-0816_1.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-go-pack-50-billion.html"

            },
            "Ultimate Flora Women’s Complete Probiotic 90 Billion": {
                price: "$49.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-womenscomplete-90b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-womens-complete-probiotic-90-billion.html"

            },
            "Ultimate Flora Colon Care Probiotic 80 Billion": {
                price: "$49.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-coloncare80b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-colon-care-probiotic-80-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 100 Billion": {
                price: "$59.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare100b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-100-billion.html"

            },
            "Ultimate Flora Extra Care Probiotic 150 Billion": {
                price: "$69.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare150b-30ct-main-0816.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-150-billion.html"

            }
        },
        "chewable": {
            "Ultimate Flora Probiotic Gummies": {
                price: "$20.49",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-Gummy2B.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-probiotic-gummies.html"

            },
            "Ultimate Flora Probiotic Sour Gummies": {
                price: "$19.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-SourGummies2B-60ct.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-sour-gummies.html"

            }
        },
        "powder": {
            "Ultimate Flora Probiotic Fizzy Drink Mix – Mixed Berry": {
                price: "$9.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-FizzyProbiotic15B-Berry-main.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-probiotic-fizzy-drink-mix-mixed-berry.html"

            },
            "Ultimate Flora Probiotic Fizzy Drink Mix – Raspberry Lemonade": {

                price: "$9.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/P/R/PRO-UF-FizzyProbiotic15B-RaspLemon-main.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-probiotic-fizzy-drink-mix-raspberry-lemonade.html"

            },
            "Ultimate Flora Extra Care Probiotic 200 Billion": {

                price: "$29.99",
                imageUrl: "http://renewlife.coventuremedia.netdna-cdn.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/r/pro-uf-extracare200b-carton.png",
                webUrl: "http://www.renewlife.com/ultimate-flora-extra-care-probiotic-200-billion.html"

            }

        }

    }

}


var demographic="man";
var form="capsule";

var createProductElement=function (title, price, weburl, image_url) {
    var element={};
    element.title = title;
    element.subtitle = price;
    element.item_url = weburl;
    element.image_url = image_url;
    element.buttons = [{
        type: "web_url",
        url: weburl,
        title: "Open Web URL"
    },{
        type: "postback",
        title: "Buy Now",
        payload: "Payload for first bubble"

    }];
    return element;

}
function createElementsList(demographic,form) {
    var elements = [];
    for (var i in productsData[demographic][form]) {

        var product = productsData[demographic][form][i]
        var name = i;
        elements.push(createProductElement(name, product["price"], product["webUrl"], product["imageUrl"]));

    }
    return elements;
  //  console.log(elements);
}



//------------------------------------------------------------------//

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
