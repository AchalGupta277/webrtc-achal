const express = require("express");
const app = express();

try {

  const socket = require("socket.io");
  const port = process.env.PORT || 3000;
  const server = app.listen(port, function() {
    console.log("App running");
  });

  const io = socket(server);

  app.use(express.static(__dirname + "/public"));

  let clients = 0;

  io.on("connection", function(socket) {
    socket.on("newClient", function() {
    //   if (clients < 2) {
    //     if (clients == 1) {
    //       this.emit("CreatePeer");
    //     }
    //   } else {
    //     this.emit("SessionActive");
    //   }
    //   clients++;
      console.log("New Client");
      this.emit("createPeer");
    });
    socket.on("offer", sendOffer);
    socket.on("answer", sendAnswer);
    socket.on("disconnect", disconnect);

    function disconnect() {
      if (clients > 0) {
        clients--;
      }
    }

    function sendOffer(offer) {
      console.log("Sending offer to frontend");
      this.broadcast.emit("backOffer", offer);
    }

    function sendAnswer(offer) {
      this.broadcast.emit("backAnswer", offer);
    }
  });
} catch (err) {
  console.log(err);
}
