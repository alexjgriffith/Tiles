var ws = new Object;
var clientID = "";
var messages = [];
var textValue="";
var maxMessage =100;


String.prototype.entitize = function() {
    var ret = this.replace(/&/g, '&amp;');
    ret = ret.replace(/>/g, '&gt;');
    ret = ret.replace(/</g, '&lt;');
    ret = ret.replace(/\"/g, '&quot;');
    ret = ret.replace(/'/g, "&apos;");

    return ret;
};

function nameWrap(text){
    return "<div style=\"width:100px;text-align:right;text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;\">"+ text + "</div>";
}

function textBox (funString){
    return "<input type=\"text\" size =\"60\" id=\"text\" value=\"" + textValue+" \" onkeyup=\"return "+funString+"(event); \" >";
}


function sendText(){
    var i = sendText2(document.getElementById("text").value);
    if (i == 1){
        document.getElementById("text").value = "";
    }
}

function sendText2(value){
    var msg = {
        type:"message",
        text:value,
        id: clientID,
        date: Date.now()
    };
    var reqID = {
        type:"req_id",
        text:value,
        id: 0,
        date: Date.now()

    };
    if(clientID != ""){
        ws.send(JSON.stringify(msg));
        return 1;
    }
    else{
        ws.send(JSON.stringify(reqID));
        return 0;
    }

}

function final(){
    var section = document.getElementById("sse");
    section.innerHTML=  textBox("enterSendText");
    document.getElementById("text").focus();
}

function connect(){
    var section = document.getElementById("sse");
    section.innerHTML= "<div style='text-align:center;'><a href=\"javascript:open()\">Open websocket connection</a><br/></div>"
}

function getName(){
    var section = document.getElementById("sse");
    section.innerHTML= textBox("enterSendName")+
        "<br><input type=\"button\" value=\"Name\" onclick=\"javasript:sendName()\">"; ;
    document.getElementById("text").focus();
}

function sendName(){
    sendText();
    final();
    updateMessages();
}

function open()
{
    if ( window.WebSocket) {
        console.log("Browser Supported")
    }
    else {
        console.log("Browser Not Suported")
    }

    ws = new WebSocket("ws://107.170.127.8:9900/websocket");

    ws.onopen = function() {
        if(clientID == ""){
            getName();
            console.log('Connected');}
        else{
            final();
            updateMessages();
        }
    };

    ws.onmessage = function (evt)
    {
        var received_msg = evt.data;
        var data = JSON.parse(received_msg);
        console.log(evt);
        if (data.type== "message"){
            messages.push(data);
            updateMessages();
        }
        if (data.type== "req_id"){
            clientID=data.id;
        }

    };
    ws.onclose = function()
    {
        textValue = document.getElementById("text").value;
        connect();
        console.log('Connection closed');

        document.getElementById('msgs').innerHTML="";
    };
}

function formatMessage(message){
    var text = message.text.entitize();
    var from = message.id[0];
    var time = new Date(message.date).toJSON().slice(11,19);
    var fromtext = "<font style=\"color:blue;\">"+ "@" + from +"</font>";
    var timetext = "<font style=\"color:red;\"> || </font>" + time + "<font style=\"color:red;\"> ||</font>";
    return  nameWrap(fromtext) +"</td><td><font style=\"color:red;\"> | </font></td><td>"  +
        text  ;//+ timetext ;
}

function updateMessages(){
    var txt,len,ret,diff,msg,scroll;
    len = messages.length;
    diff =  maxMessage - len
    txt = messages.slice(Math.max(0,len-maxMessage),len).map(formatMessage).join("</td></tr><tr><td>");
    ret = "<div id=\"scroll\"  style=\"height:270px;width:100%;overflow-y:hidden;\">" +
        "<table ><tr>"+
        "<td >" + txt+
        "</td></tr></table></div>"
    msg = document.getElementById('msgs');
    msg.innerHTML=ret;
    scroll = document.getElementById('scroll');
    scroll.scrollTop = scroll.scrollHeight;
}

function UserAction() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://107.170.127.8:9900/api/token", false);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
}

function enterSendText(e)
{
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13)
    {
        sendText()
        return false;
    }
    return true;

}


function enterSendName(e)
{
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13)
    {
        sendName();
        return false;
    }
    return true;

}
