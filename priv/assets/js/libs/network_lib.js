var networking=(function (XMLHttpRequest,WebSocket){
// fix here
    var ws = new Object;
    var xhttp = new Object;
    var localId = 0;
    //var address = "ws://sadcod.com/websocket"
    var address = "ws://skyisles.ca:11000/websocket"

    function websocketSendPos(pos){
        websocketSendEvent("updatePlayerPos",pos);
    }

    function websocketSendEvent(type,body){
        if(ws.readyState != undefined)
            if(ws.readyState === ws.OPEN ){
                var msg = {
                    type:type,
                    body:body,
                    id:localId,
                    time:Date.now()
                }
                ws.send(JSON.stringify(msg));
            }
    }

    function websocketClose(){
        ws.close();
    }

    function websocketOpen(fun,params){
        if ( !window.WebSocket) {
            alert("This browser does not support websockets");
        }
        ws = new WebSocket(address);
        ws.onopen = function() {
            if(params.name)
                websocketSendEvent("req_id",params.name);
            else
                websocketSendEvent("req_id","guest");

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

                        }
            var received_msg = JSON.parse(evt.data);
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
        localId=id;
    }


    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            var cases ={matches:matches};
            var received_msg = JSON.parse(xhttp.responseText);
            //console.log(received_msg);
            if(cases[received_msg.type]){
                cases[received_msg.type](received_msg.body);
            }
        }
    };

    function match_api(endpoint){
        xhttp.open("GET", "/api/v0/match?"+ endpoint, true);
        xhttp.send(null);
    };
})(XMLHttpRequest,WebSocket);

/*
//{type,body,matchid,time}
state={encoding:"json",
       hash=genRandomHash(),
       var:{matchid:null,
               name:'guest'}
}
mh = networking.ws.create(params);
//type,fun(body,state),fun(body,state)
// if(body.id!=localId)
mh.addHandler("keyDown",keyDown);
mh.addHandler("keyUp",keyUp);
mh.addHandler("recId",function(body,state){
    if(state.hash == body.hash)
                           mh.updateLocalId(body.id);
                           return state});
mh.onOpen(function(state){ return state});
mh.open();
function sendPos(pos){
    ces.verifyComponent.pos(pos)
    mh.send("pos",pos)
}
*/
