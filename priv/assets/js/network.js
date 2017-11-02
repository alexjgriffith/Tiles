var ws = new Object;
var clientID = 0;
var lognet={};
lognet.rec=false; // log all received ws messages
var address = "ws://sadcod.com/websocket"
//var address = "ws://skyisles.ca:11000/websocket"
//var address = "ws://107.170.127.8:11000/websocket"

function websocketPing(){
    websocketSendEvent("message","hello world!");
     //console.log('Message sent');
}

function websocketSendPos(pos){
    websocketSendEvent("updatePlayerPos",pos);
}

function websocketSendEvent(type,body){
    if(ws.readyState != undefined)
    if(ws.readyState === ws.OPEN ){
        var msg = {
            type:type,
            body:body,
            id:clientID,
            time:Date.now()
        }
        ws.send(JSON.stringify(msg));
    }
}

function websocketClose(){
    //console.log("close connection");
    ws.close();
}

function websocketOpen(fun,params){
    //console.log("hello world");
    if ( window.WebSocket) {
         //console.log("Browser Supported")
     }
     else {
         alert("Browser Not Suported");
     }
    ws = new WebSocket(address);
    ws.onopen = function() {
        if(params.name)
            websocketSendEvent("req_id",params.name);
        else
            websocketSendEvent("req_id","guest");
        //console.log('Connected');
     };
     ws.onmessage = function (evt){
         var cases = {createExplosion:createExplosion,
                      createBullet:createBullet,
                      updatePlayerPos:updatePlayerPos,
                      damaged:damaged,
                      dead:dead,
                      keyUp:keyUp,
                      keyDown:keyDown,
                      colourChanged:colourChanged,
                      turned:turned,
                      exitMatch:exitMatch
                      //req_id:req_id
                     }
         var received_msg = JSON.parse(evt.data);
         if(lognet.rec==true){
             console.log("V10 Log: Message Rec: " + evt.data)
         }
         if(received_msg.type == "req_id"){
             if(params.match)
                 websocketSendEvent("req_specific_match",params.match);
             else
                 websocketSendEvent("req_match","")
             req_id(received_msg.id)}
         else if (received_msg.type == "create"){
             fun(received_msg.body.player,
                 JSON.parse(received_msg.body.tiles));
         }
         else if(cases[received_msg.type]){
             cases[received_msg.type].apply(undefined,Object.values(received_msg.body));
        }
     };
    ws.onclose = function()
    {
        //console.log('Connection closed');
    };
}

function req_id(id){
    //console.log(id)
    clientID=id;
}


var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        var cases ={matches:matches};
        var received_msg = JSON.parse(xhttp.responseText);
        // console.log(received_msg);
        if(cases[received_msg.type]){
             cases[received_msg.type](received_msg.body);
        }
    }
};

function match_api(endpoint){
    xhttp.open("GET", "/api/v0/match?"+ endpoint, true);
    xhttp.send(null);
};
