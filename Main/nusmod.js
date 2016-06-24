var http = require('http');
var path = require('path');
var modules = path.resolve( __dirname, "./modules.json");
// var classroom = path.resolve( __dirname, "./classroom.json");

module.exports = {
  getModule: function (modulecode){
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


  },

 

// Our own functions

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
// findTutorialClass: function(modulecode){
//   return new Promise( function(response,reject){
//       var fs = require("fs");
//       var body = fs.readFileSync(classroom);
//       var result = JSON.parse(body);
//       // console.log(typeof body);

//       var i = 0;
//       while (i < result.length){
//         // console.log("outside if" + modulecode);
//         if (result[i].ModuleCode === modulecode){
//         // console.log(modulecode)
        
//         // console.log(result[i]);
//         response(result[i]);

//       };
//       i++;
//     };
//     if (i === result.length){
//       reject(modulecode);
//     }

//   })


// },

  convertPeriod: function(string){
    if (string.search("M"))
      return string[string.indexOf("M") - 4 ] + ' hours and ' + string[string.indexOf("M") - 2 ]+ string[string.indexOf("M") - 1 ] + ' minutes';
    else
      return string[string.indexOf("H") - 1 ] + ' hours';

  },

  convertTime: function(string){
    var date = string.subString(0,string.indexOf("T"));
    var time = string.subString(string.indexOf("T") + 1, string.indexOf("T") + 6 );
    return time + ' on ' + date;
  }

// findLecture: function(modulecode){
//   return new Promise( function(response,reject){
//       var fs = require("fs");
//       var body = fs.readFileSync(classroom);
//       var result = JSON.parse(body);
//       // console.log(typeof body);

//       var i = 0;
//       while (i < result.length){
//         // console.log("outside if" + modulecode);
//         if (result[i].ModuleCode === modulecode){
//         // console.log(modulecode)
        
//         // console.log(result[i]);
//         response(result[i]);

//       };
//       i++;
//     };
//     if (i === result.length){
//       reject(modulecode);
//     }

//   })
// },
}
