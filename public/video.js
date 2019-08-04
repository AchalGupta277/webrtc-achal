var globalStream;
var peer;
const socket = io.connect("https://webrtc-achal.herokuapp.com/");
let client={};

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {

    socket.emit("newClient");

    globalStream = stream;
    var video = document.querySelector("#self-video");
    video.muted = true;
    video.srcObject = stream;
    video.play();

    // document.querySelector("form").addEventListener("submit", ev => {
    //   ev.preventDefault();
    //   peer.signal(JSON.parse(document.querySelector("#incoming").value));
    // });

    function makePeer(){
        console.log('Creating init peer');
        client.gotAnswer=false;
        let peer=initPeer('init');
        peer.on("signal", data => {
            // console.log("SIGNAL", JSON.stringify(data));
            // document.querySelector("#outgoing").textContent = JSON.stringify(data);
            console.log("signal init data");
            if (!client.gotAnswer) {
                socket.emit('offer', data)
            }
            // peer.signal(data);
          });
        client.peer=peer;
    
    }
    
    function frontAnswer(offer){
        let peer=initPeer('notInit');
        peer.signal(offer);
    
        peer.on("signal", data => {
            console.log("signal not init data");
            socket.emit('answer', data)
        });
    
        client.peer=peer;
    }

    function signalAnswer(answer) {
        console.log("Signalling answer of the offer");
        client.gotAnswer = true;
        let peer = client.peer;
        peer.signal(answer);
    }
    

    function initPeer(type) {
      console.log("Inside peer function");
      peer = new SimplePeer({
        initiator: type==="init",
        stream: stream,
        trickle: false
      });
      // peer._debug=console.log;
      peer.on("error", err => console.log("error", err));

      peer.on("connect", () => {
        console.log("connected");
        peer.send("whatever" + Math.random());
      });

      peer.on("data", data => {
        console.log("data: " + data);
      });

      peer.on("stream", function(stream) {
        console.log("Streaming video");
        var peerVideo = document.querySelector("#peer-video");
        peerVideo.muted=true;
        peerVideo.srcObject = stream;
        peerVideo.play();
      });

      peer.on("close", () => {
        peer.destroy();
      });
      return peer;
    }

    socket.on("connect", function() {
        console.log("socket connected");
      });
    socket.on("createPeer", function() {
        makePeer();
        
    });
    socket.on('backOffer',function(data){
        console.log("Getting an offer from backend");
        frontAnswer(data);
    });
    socket.on('backAnswer',function(data){
        console.log("Getting an answer from backend");
        signalAnswer(data);
    });

  })
  .catch(err => {
    document.write(err);
  });
