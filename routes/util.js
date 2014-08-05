//Mirror whatever was sent into the body
var type = require("type-detect");

// istanbul ignore next: not official function
exports.mirror = function(req, res){
  var string = "<html><body>";
  res.set({
    'Content-Type': 'text/plain'
  });
  for(var key in req.body){
    if (req.body.hasOwnProperty(key)){
      string += "<p></p><b>key: </b>" + key +
        "<b> has value: </b>" + req.body[key].toString() +
        "<b> which is of type: </b>" + type(req.body[key]);
    }
  }
  string += '<p><br> Server date is: ' + Date.now() + '</p>';
  string += "</body></html>";
  res.send(string);

};
