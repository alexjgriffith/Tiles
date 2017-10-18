var ws = new Object;
var clientID = 0;

function websocketPing(){
     ws.send("hello world!");
     console.log('Message sent');
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
    console.log("close connection");
    ws.close();
}

function websocketOpen(fun,parameters){
    console.log("hello world");
    if ( window.WebSocket) {
         console.log("Browser Supported")
     }
     else {
         alert("Browser Not Suported");
     }
    ws = new WebSocket("ws://107.170.127.8:11000/websocket");
    ws.onopen = function() {
        websocketSendEvent("req_id","place_holder");
        console.log('Connected');
     };
     ws.onmessage = function (evt){
         var cases = {createExplosion:createExplosion,
                      createBullet:createBullet,
                      updatePlayerPos:updatePlayerPos
                      //req_id:req_id
                     }
         var received_msg = JSON.parse(evt.data);
         if(received_msg.type == "req_id"){
             websocketSendEvent("req_match","")
             req_id(received_msg.id)}
         else if (received_msg.type == "create"){
             console.log(typeof(received_msg.body.tiles));
             fun(received_msg.body.player,
                 JSON.parse(received_msg.body.tiles));
         }
         else if(cases[received_msg.type]){
             cases[received_msg.type].apply(undefined,Object.values(received_msg.body));
        }
     };
    ws.onclose = function()
    {
        console.log('Connection closed');
    };
}

function req_id(id){
    console.log(id)
    clientID=id;
}
