var http = require('http');
var path = require('path');
var modules = path.resolve( __dirname, "./modules.json");

module.exports = {
  getModule: function (ay,modulecode){
    return new Promise( function(response,reject){
     // var url = 'http://api.nusmods.com/' + ay + '/1/modules.json';
     // console.log("day");
     // http.get(url, function(res){
     //   var body = '';

     //   res.on('data', function(chunk){
     //     body += chunk;
     //   });

     //   res.on('end', function(){
      var fs = require("fs");
      var body = fs.readFileSync(modules);
      var result = JSON.parse(body);
      // console.log(typeof body);

      var i = 0;
      while (i < result.length){
        // console.log("outside if" + modulecode);
       if (result[i].ModuleCode === modulecode){
        // console.log(modulecode)
        delete result[i].CorsBiddingStats;
        // console.log(result[i]);
        response(result[i]);

      };
      i++;
    };
    if (i === result.length){
      reject(modulecode);
    }

  });
    //  }).on('error', function(e){
    //   console.log("Got an error: ", e);
    // });
   // });

 },

  // splitString: function(text){
  //   return new Promise(function(response){
  //     var i = Math.ceil(context.des.length / 3);
  //     while (context.des[i] !== " "){
  //       i++;
  //     };


  //     context.first = context.des.substring(0,i);
  //     var textleft = context.des.substring(i+1);
  //     var i2 = Math.ceil(textleft.length / 2)
  //     while (textleft[i2] !== " ") {
  //       i2++;
  //     }
  //     context.second = textleft.substring(0,i2);
  //     context.third = textleft.substring(i2 + 1);

  //     console.log(context.first.length);
  //     response(str);
  //   })
  // }

// Our own function

// find Module in a string
findModule: function(string){
  var s = /([A-Z])+([A-Z])+\d+\d+\d+\d+([A-Z])/;
  var r = /([A-Z])+([A-Z])+\d+\d+\d+\d/;

  var module = string.match(r);
  var module2 = string.match(s);
  if (module2 == null) {
    if (module == null)
        return -1;
    else 
        return module[0];
  }
  else
    return module2[0]; 
},

// find keyword in a string
findKey: function(string){
  var intent;
  
  if (string.search("EXAM") != -1 && string.search("CLASS") != -1)
    intent = "unsure";
  else if (string.search("EXAM") != -1)
    intent = "exam";
  else if (string.search("CLASS") != -1)
    intent = "class";
  else if (string.search("EXAM") == -1 && string.search("CLASS") == -1)
    intent = "no intent"
  return intent;
},
// execute: function(sender, msg){
//   var intent = findKey(msg);
//   var module = findModule(msg);
//   if (intent === "unsure")
//     fbMessage(sender,"We are unclear of your intent");
//   else if (intent === "no intent")
//     fbMessage(sender,"We are not ready for this sh*t");
//   else if (intent === "class") {
//     var result = {};
//     getModule("2015-2016",module).then(function(res){
//         result = Object.assign(result,res);
//     }).catch(function(err){
//       console.log(err);
//     })
//     // blah blah
//     var messageToSend = "This is the message to send";
//     fbMessage(sender,messageToSend);
//   } else if (intent === "exam") {

//     var result = {};

//     getModule("2015-2016",module).then(function(abc){

//         console.log("res is " + abc);
//         result = Object.assign(result,res);
//         cb(result);

//     }).catch(function(err){
//       console.log(err);
//     });

//     console.log("Mod is " + module);
//     console.log("intent: " + intent);
//     console.log("result " + result);
//     var messageToSend = "The date of examination is " + result.ExamDate + ", it will last for " + result.ExamDuration +
//     " and it will be held in " + result.ExamVenue + ".";
//     fbMessage(sender,messageToSend);

//   }

// }


}
