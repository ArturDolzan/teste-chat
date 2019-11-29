var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
const formidable = require('formidable')
const util = require('util')
const path = require('path')

var port = process.env.PORT || 3006

app.get('/', function(req, res){
  //res.sendFile(__dirname + '/index.html')

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
})

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/index.html')
})

app.post('/upload', function(req, res){

  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.keepFilenames = true

    form.uploadDir = __dirname + "/dirUpload/"
    form.keepExtensions = true
 
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      
      //console.log(util.inspect({fields: fields, files: files}))

      //console.log(files.upload.name)

      var filename = path.parse(files.upload.path).base
      
      if(!filename || filename.match(/\.(jpg|jpeg|png)$/i)) {
        io.emit('chat message', {
          tipo: 'foto',
          data: 'http://localhost:3007/' + filename
        })
      } else if (filename.match(/\.(mp4|ogg|ogv)$/i)) {
        io.emit('chat message', {
          tipo: 'video',
          data: 'http://localhost:3007/' + filename
        })
      } else {
        io.emit('chat message', {
          tipo: 'arquivo',
          data: 'http://localhost:3007/' + filename
        })
      }

      res.end('feito!!');
    });
 
    return;
  }
})

io.on('connection', function(socket){
  console.log(socket.id)
  socket.on('chat message', function(msg){
    io.emit('chat message', {
      tipo: 'texto',
      data: msg
    })
  });

  socket.on('disconnect', function(msg){
    console.log('Disconnect ' + socket.id)
  });

})

var dir = path.join(__dirname, 'dirUpload')

console.log(dir)

app.use(express.static(dir))

app.listen(3007, function () {
  console.log('Listening on http://localhost:3007/');
});

http.listen(port, function(){
  console.log('listening on *: ' + port)
})
