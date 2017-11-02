// Impl
var c2e = new CES;

var optionsMenu = OptionsMenu(c2e);
var coloursMenu = ColoursMenu(c2e);

c2e.defcontext("pos",contextPos)
c2e.defcontext("draw",contextDraw)
c2e.defcontext("player",contextPlayer)
c2e.defcontext("alive",contextAlive)
c2e.defcontext("collider",contextRectCollider)
c2e.defcontext("velocity",contextVelocity)
c2e.defcontext("team",contextTeam)
c2e.defcontext("direction",contextDirection)
c2e.defcontext("sentDirection",contextDirection)
c2e.defcontext("otherPlayer",contextOtherPlayer)
c2e.defcontext("otherPlayerLive",contextOtherPlayerLive)
c2e.defcontext("remoteInput",contextRemoteInput)
c2e.defcontext("simpleAI",contextSimpleAI)
c2e.defcontext("bullet",contextBullet)
c2e.defcontext("expanding",contextExpanding)
c2e.defcontext("circle",contextCircle)
c2e.defcontext("explosion",contextExplosion)
c2e.defcontext("id",contextId)
c2e.defcontext("uid",contextId)
c2e.defcontext("text",contextText)
c2e.defcontext("backgroundBox",contextBackgroundBox)
c2e.defcontext("boundingBox",contextBoundingBox)
c2e.defcontext("hovered",contextHovered)
c2e.defcontext("event",contextEvent)
c2e.defcontext("clickEvent",contextEvent)
c2e.defcontext("hoverEvent",contextEvent)
c2e.defcontext("colour",contextColour)
c2e.defcontext("health",contextHealth)
c2e.defcontext("power",contextPower)
c2e.defcontext("damage",contextDamage)
c2e.defcontext("powerBuildUp",contextPowerBuildUp)
c2e.defcontext("moveKeys",contextMoveKeys)
c2e.defcontext("colouredBackgroundBox",contextColouredBackgroundBox)

c2e.defcontext("match",contextMatch)
c2e.defcontext("loadMenu",contextLoadMenu)
c2e.defcontext("loadingScreen",contextLoadingScreen)
c2e.defcontext("matchlist",contextMatchlist)
c2e.defcontext("optionsMenu",contextOptionsMenu);


c2e.defsystem("receiveExit",systemReceiveExit,[])
c2e.defsystem("sendExit",systemSendExit,[])
c2e.defsystem("die",systemDie,[])
c2e.defsystem("receiveDead",systemReceiveDead,[])
c2e.defsystem("turnOther",systemTurnOther,[])
c2e.defsystem("turnOther",systemTurnOther,[])
c2e.defsystem("setOtherColour",systemSetOtherColour,[])
c2e.defsystem("moveOtherPlayer",systemMoveOtherPlayer,[])
c2e.defsystem("receiveKeyDown",systemReceiveKeyDown,[])
c2e.defsystem("receiveKeyUp",systemReceiveKeyUp,[])
c2e.defsystem("sendKey",systemSendKey,[]);
c2e.defsystem("damage",systemDamage,[]);
c2e.defsystem("otherDamage",systemOtherDamage,[]);
c2e.defsystem("damageAnimate",systemDamageAnimate,[]);
c2e.defsystem("updatePlayer",systemUpdatePlayer);
c2e.defsystem("playerCreateBullet",systemPlayerCreateBullet);
c2e.defsystem("updateButton",systemUpdateButton,systemUpdateButtonReqs);
c2e.defsystem("drawButton",systemDrawButton,systemDrawButtonReqs);
c2e.defsystem("drawColouredButton",systemDrawColouredButton,[]);
c2e.defsystem("sendPos",systemSendPos,[]);
c2e.defsystem("sendAngle",systemSendAngle,[]);
c2e.defsystem("updateBullet",systemUpdateBullet,[])
c2e.defsystem("updateExplosion",systemUpdateExplosion,[])
c2e.defsystem("updateOtherPlayerLive",systemUpdateOtherPlayerLive,[])
c2e.defsystem("death",systemDeath,[])
c2e.defsystem("simpleAI",systemSimpleAI,[["pos","otherPlayer"]])
c2e.defsystem("movePlayer",systemMovePlayer,[["pos","player"]])
c2e.defsystem("drawObj",systemDrawObj,[["pos","draw"]])
c2e.defsystem("drawPlayer",systemDrawPlayer,[["pos","draw","dir"]])
c2e.defsystem("drawOtherPlayer",systemDrawOtherPlayer,[["pos","draw","dir"]])

c2e.defsystem("collide",systemCollide,[["pos","collider"]
                                       ["pos","collider"]]);
c2e.defsystem("collideI",systemInverseCollide,[["pos","collider"]
                                               ["pos","collider"]]);
c2e.defsystem("triggerCollide",systemTriggerCollide,[]);

c2e.defsystem("playerDirection",systemPlayerDirection,
              [["direction"]]);

// API
// Need to clean up to remove globals, should only need c2e
var playerId
;
var bounds;
var object=[];
var otherPlayersLive={};
var otherPlayers=[];

/* start fixing here */
function definePlayer(Player,colours){
    playerId = c2e.addEnt();
    //console.log(Player)
    c2e.addContext(playerId,"pos",[Player.pos.x,Player.pos.y]);
    //c2e.addContext(playerId,"draw",["circle","black",25]);
    addDraw(playerId,"circle","black",25,colours)
    c2e.addContext(playerId,"colour",[Player.colour])
    c2e.addContext(playerId,"power",[Player.power.red,
                                     Player.power.blue,
                                     Player.power.green])
    c2e.addContext(playerId,"powerBuildUp",[1000])
    c2e.addContext(playerId,"health",[Player.health])
    c2e.addContext(playerId,"id",[Player.id]);
    c2e.addContext(playerId,"team",[Player.team]);
    c2e.addContext(playerId,"player",[]);
    c2e.addContext(playerId,"match",[]);
    c2e.addContext(playerId,"alive",[Player.alive]);
    c2e.addContext(playerId,"direction",[Player.dir.x,Player.dir.y]);
    c2e.addContext(playerId,"sentDirection",[Player.dir.x,Player.dir.y]);
    c2e.addContext(playerId,"collider",[50,50,false,true,100,[]]);
}

function defineOtherPlayer(team,x,y,inputType,inputArgs){
    var temp = c2e.addEnt();
    otherPlayers.push(temp);
    c2e.addContext(temp,inputType,inputArgs);
    c2e.addContext(temp,"colour",["grey"])
    c2e.addContext(temp,"pos",[x,y]);
    c2e.addContext(temp,"draw",["circle","black",25]);
    c2e.addContext(temp,"team",[team]);
    c2e.addContext(temp,"otherPlayer",[]);
    c2e.addContext(playerId,"alive",[true]);
    c2e.addContext(temp,"direction",[1,0]);
    c2e.addContext(temp,"collider",[50,50,false,true,100,[]]);
}

function createBullet(uid,pos,velocity,range,team,colour,matchid){
    var temp = c2e.addEnt();
    // Hack has to be called in an env with params.colours defined!!
    //
    var findColour = function(colourIn){
        var swapColour={red:"team1",blue:"team2",green:"team3",black:"dead",
                        yellow:"hitExp",white:"behind"};
        return params.colours[swapColour[colourIn]];};

    c2e.addContext(temp,"id",[matchid]);
    c2e.addContext(temp,"uid",[uid]);
    c2e.addContext(temp,"pos",[pos.x,pos.y]);
    c2e.addContext(temp,"draw",["cicle","black",5]);
    c2e.addContext(temp,"colour",[findColour(colour)]);
    c2e.addContext(temp,"bullet",[team,range,pos]);
    c2e.addContext(temp,"damage",[1]);
    // need to make collider triggers
    c2e.addContext(temp,"collider",[5,5,false,true,0,[]]);
    c2e.addContext(temp,"velocity",[velocity.x,velocity.y]);
}

function createExplosion(pos,rate,initialRadius,finalRadius,team){
    var temp = c2e.addEnt();
    // Hack has to be called in an env with params.colours defined!!
    // This HAS to be done at this level since different envs will have
    // different colour names
    var findColour = function(colourIn){
        var swapColour={red:"team1",blue:"team2",green:"team3",black:"dead",
                        yellow:"hitExp",white:"behind"};
        return params.colours[swapColour[colourIn]];};

    c2e.addContext(temp,"pos",[pos.x,pos.y]);
    c2e.addContext(temp,"draw",
                   ["cicle","black",initialRadius]);
    c2e.addContext(temp,"colour",[findColour("yellow")]);
    c2e.addContext(temp,"explosion",[team,finalRadius]);
    // need to make collider triggers
    // c2e.addContext(temp,"collider",[5,5,false,true,0,[]]);
    c2e.addContext(temp,"expanding",[rate]);
    c2e.addContext(temp,"circle",[initialRadius]);
}


function placeObject(x,y){
    var temp = c2e.addEnt();
    object.push(temp);
    c2e.addContext(temp,"pos",[x,y]);
    c2e.addContext(temp,"draw",["circle","black",25]);
    c2e.addContext(temp,"colour",["yellow"]);
    c2e.addContext(temp,"collider",[50,50,false,false,50,[]]);
}

function defineBoundBox(x,y){
    bounds = c2e.addEnt();
    c2e.addContext(bounds,"pos",[1,1]);
    c2e.addContext(bounds,"collider",[x-2,y-2,true,false,0,[]]);
}


function testCollision(){
    var playerId = c2e.alle("player")[0];
    var bullets = c2e.alle("bullet");
    c2e.applySystem("collideI",[playerId,bounds],[])

    for(var i in object)
        c2e.applySystem("collide",[playerId,object[i]],[])
    for(var i in otherPlayers){
        c2e.applySystem("collide",[playerId,otherPlayers[i]],[])
        c2e.applySystem("collideI",[otherPlayers[i],bounds],[])
         for(var j in otherPlayers){
             if(j!=i)
                 c2e.applySystem("collide",[otherPlayers[i],otherPlayers[j]],[])
         }
    }

    for(var i in bullets)
        c2e.applySystem("triggerCollide",[playerId,bullets[i]],[bulletEvent]);
    //c2e.applySystem("collide",[object[0],object[1]],[])
    //c2e.applySystem("collideI",[object[1],bounds],[])
    //c2e.applySystem("collideI",[object[0],bounds],[])
}


function move(dir,step,ent){
    if(dir=="down"){
        c2e.applySystem("movePlayer", [ent],[{x:0,y:step}])
    }
    if(dir=="up"){
            c2e.applySystem("movePlayer", [ent],[{x:0,y:-step}])
    }
    if(dir=="right"){
        c2e.applySystem("movePlayer", [ent],[{x:step,y:0}])
    }
    if(dir=="left"){
        c2e.applySystem("movePlayer", [ent],[{x:-step,y:0}])
    }
}


function pdraw(ctx,camera,point){
    var playerId = c2e.alle("player")[0];
    var time = new Date;
    c2e.applySystem("damageAnimate",[playerId],[time.getTime()]);
    c2e.applySystem("drawPlayer", [playerId],[ctx,camera,point])
}

function opdraw(ctx,camera){
    for(i in otherPlayers){
        c2e.applySystem("drawOtherPlayer", [otherPlayers[i]],[ctx,camera])}
}

function odraw(ctx,camera){
    for(i in object)
        c2e.applySystem("drawObj", [object[i]],[ctx,camera])
}

function bdraw(ctx,camera){
    var bullets = c2e.alle("bullet");
    for(i in bullets){
        c2e.applySystem("drawObj", [bullets[i]],[ctx,camera]);
    }
}

function opldraw(ctx,camera){
    var ops = c2e.alle("otherPlayerLive");
    var date = new Date;
    var time = date.getTime();
    for(i in ops){
        c2e.applySystem("damageAnimate",[ops[i]],[time]);
        c2e.applySystem("drawOtherPlayer", [ops[i]],[ctx,camera]);
    }
}

function edraw(ctx,camera){
    var explosions = c2e.alle("explosion");
    for(i in explosions){
        c2e.applySystem("drawObj", [explosions[i]],[ctx,camera]);
    }
}



function updateBullets(dt){
    var bullets = c2e.alle("bullet");
    for(i in bullets){
        c2e.applySystem("updateBullet",[bullets[i]],[dt,bullets[i]]);
    }
}

function updateExplosions(dt){
    var explosions = c2e.alle("explosion");
    for(i in explosions){
        c2e.applySystem("updateExplosion",[explosions[i]],[dt,explosions[i]]);
    }
}

function playerPos(){
    return c2e.allc(playerId).pos;
}

function drawCollider(ctx,ent,camera){
    e = c2e.allc(ent);
    ctx.rect(e.pos.x-camera.x,
             e.pos.y-camera.y,
             e.collider.x,
             e.collider.y);
    ctx.strokeStyle="red";
    ctx.stroke();
}

function playerUpdateDirection(mouse,cam){
    c2e.applySystem("playerDirection", [playerId],[mouse,cam])
}

function runOtherPlayerAI(step){
    for(i in otherPlayers){
        c2e.applySystem("simpleAI", [otherPlayers[i]],[step])}
}

function playerCreateBullet(){
    var players = c2e.alle("player");
    for(i in players){
        c2e.applySystem("playerCreateBullet",[players[i]],[]);
    }
}

function updatePlayer(tiles,dt){
    var players = c2e.alle("player");
    var date = new Date;
    for(i in players){
        c2e.applySystem("updatePlayer",[players[i]],[tiles,date.getTime(),dt]);
    }
}


function playerCreateExplosion(){
    var conts = c2e.allc(playerId);
    var start = {}
    start.x = conts.pos.x-25 + conts.direction.x * 250
    start.y = conts.pos.y-25 + conts.direction.y * 250
    createExplosion(start,5,25,150,"red")
    //pos,rate,initialRadius,finalRadius,team
}

function clickCreateExplosion(x,y){
    var start={};
    start.x = x
    start.y = y
    var msg = {pos:start,rate:5,initialRadius:0,
               finalRadius:150, team:"red"};
    websocketSendEvent("createExplosion",msg)

    //createExplosion(start,5,0,150,"red")
    //pos,rate,initialRadius,finalRadius,team
}

function moveKeyDown(key){
    c2e.applySystem("sendKey", [playerId],["keyDown",key]);
}

function moveKeyUp(key){
    c2e.applySystem("sendKey", [playerId],["keyUp",key]);
}

function sendPlayerAngle(){
    c2e.applySystem("sendAngle", [playerId],[]);
}

function sendPlayerPos(){
    c2e.applySystem("sendPos", [playerId],[]);
}

function createOtherPlayerLive(pos,team,colour,alive,direction,matchid,id){
    var temp = c2e.addEnt();
    otherPlayersLive[matchid]=temp;
    c2e.addContext(temp,"pos",[pos.x,pos.y]);
    c2e.addContext(temp,"colour",[colour]);
    c2e.addContext(temp,"draw",["circle","black",25]);
    c2e.addContext(temp,"team",[team]);
    c2e.addContext(temp,"otherPlayerLive",[]);
    c2e.addContext(temp,"moveKeys",[]);
    c2e.addContext(temp,"match",[]);
    c2e.addContext(temp,"id",[matchid]);
    //console.log(["alive",alive]);
    c2e.addContext(temp,"alive",[alive]);
    c2e.addContext(temp,"direction",[direction.x,direction.y]);
    c2e.addContext(temp,"collider",[50,50,false,true,100,[]]);
}

function updateOtherPlayerLive(entId,pos,team,colour,alive,direction){
    c2e.applySystem("updateOtherPlayerLive", [entId],[pos,team,colour,alive,direction]);
}

function moveOthers(weight){
    var others = c2e.alle("otherPlayerLive");
    for(var i in others){
        c2e.applySystem("moveOtherPlayer",[others[i]],[others[i],weight]);
    }
}

function updatePlayerPos(pos,team,colour,alive,direction,matchid,id){
    var ops;
    // Hack, this HAS to be called from an environment with colours
    // defined,
    // in the future the first arg of all net call functions will be
    // a params arg
    var findColour = function(colourIn){
        var swapColour={red:"team1",blue:"team2",green:"team3",black:"dead",
                        yellow:"hitExp",white:"behind"};
        return params.colours[swapColour[colourIn]];};
    //console.log(colours);
    // can be updated with match id
    if(id[1]!=clientID[1]){
        if(Object.keys(otherPlayersLive).includes(matchid.toString())){
            updateOtherPlayerLive(otherPlayersLive[matchid],
                                  pos,team,findColour(colour),alive,direction);
        }
        else{
            createOtherPlayerLive(pos,team,findColour(colour),alive,direction,matchid,id);
        }}
}

function createQuickButton(text,event,hEvent,x,y){
    var font = "30px Impact";
    var hFont = "40px Impact";
    return createMenuButton(text,x,y,300,50,font,hFont,"white","blue",event,hEvent);
}

function createMenuButton(text,x,y,w,h,font,hFont,tColour,bgColour,event,hEvent){
    var temp = c2e.addEnt();
    c2e.addContext(temp,"text",[text,text,font,hFont,tColour,tColour]);
    c2e.addContext(temp,"backgroundBox",[bgColour,bgColour,null,"black",null,5]);
    c2e.addContext(temp,"boundingBox",[w,h]);
    c2e.addContext(temp,"event",[event]);
    c2e.addContext(temp,"hoverEvent",[hEvent]);
    c2e.addContext(temp,"hovered",[false]);
    c2e.addContext(temp,"pos",[x,y]);
    c2e.addContext(temp,"loadMenu",[]);
    return temp;
}

function updateButtons(mpos,click,args){
    var buttons = c2e.alle("hovered");
    for(i in buttons){
        c2e.applySystem("updateButton",[buttons[i]],[mpos,click,args]);
    }
}

function drawButtons(contexts,colours){
    var buttons = c2e.alle("hovered");
    for(i in buttons){
        c2e.applySystem("drawButton",[buttons[i]],[contexts,colours]);
    }
}

function drawColouredButtons(contexts){
    var buttons = c2e.alle("colouredBackgroundBox");
    for(i in buttons){
        c2e.applySystem("drawColouredButton",[buttons[i]],[contexts]);
    }
}

function clearLoadMenu(){
    var buttons = c2e.alle("loadMenu");
    for(i in buttons){
        c2e.removeEnt(buttons[i]);
    }
}

function clearMatchlist(){
    var buttons = c2e.alle("matchlist");
    for(i in buttons){
        c2e.removeEnt(buttons[i]);
    }
}

function clearMatch(){

    delete playerId;
    delete bounds;
    object=[];
    otherPlayersLive ={};
    otherPlayers = {};

    var ents = c2e.alle("match");
    for(i in ents){
        c2e.removeEnt(ents[i]);
    }
}

function clearLoadingScreen(){
    var buttons = c2e.alle("loadingScreen");
    for(i in buttons){
        c2e.removeEnt(buttons[i]);
    }
}

function damaged(bulletUID,health,alive,time,matchid,id){
    var bullet=false,bullets=c2e.alle("bullet");
    for (var i in bullets)
        if (bulletUID == c2e.allc(bullets[i]).uid.id)
            bullet=bullets[i];
    if(id[1]!=clientID[1] && bullet){
        //console.log("hit other")
        if(Object.keys(otherPlayersLive).includes(matchid.toString())){
            c2e.applySystem("otherDamage",[otherPlayersLive[matchid],bullet],[])
        }
    }
    // var date = new Date;
    // if(player==matchid)
    //     c2e.applySystem("showDamage",[player][time,1000-time+date.getTime()])
    //console.log("damage")
}

function dead (alive,matchid,id){
    //console.log("dead")
    if(Object.keys(otherPlayersLive).includes(matchid.toString())){
        c2e.applySystem("receiveDead",[otherPlayersLive[matchid]],[alive])
    }
}

function keyUp (dir,matchid){
    if(Object.keys(otherPlayersLive).includes(matchid.toString())){
        c2e.applySystem("receiveKeyUp",[otherPlayersLive[matchid]],[dir])
    }
}

function keyDown (dir,matchid){
    if(Object.keys(otherPlayersLive).includes(matchid.toString())){
        c2e.applySystem("receiveKeyDown",[otherPlayersLive[matchid]],[dir])
    }
}

function turned(dir,matchid){
    if(Object.keys(otherPlayersLive).includes(matchid.toString())){
        c2e.applySystem("turnOther",[otherPlayersLive[matchid]],[dir])
    }
}

function colourChanged(colour,matchid){
    if(Object.keys(otherPlayersLive).includes(matchid.toString())){
        c2e.applySystem("setOtherColour",[otherPlayersLive[matchid]],[colour])
    }
}

function die(){
    var player = c2e.alle("player")[0];
    c2e.applySystem("die",[player],[]);
}

function createQuickMatchButton(text,event,hEvent,x,y){
    var font = "30px Impact";
    var hFont = "40px Impact";
    //console.log([x,y]);
    return createMatchButton(text,x,y,300,50,font,hFont,"white","blue",event,hEvent);
}

function createMatchButton(text,x,y,w,h,font,hFont,tColour,bgColour,event,hEvent){
    var temp = c2e.addEnt();
    c2e.addContext(temp,"text",[text,text,font,hFont,tColour,tColour]);
    c2e.addContext(temp,"backgroundBox",[bgColour,bgColour,null,"black",null,5]);
    c2e.addContext(temp,"boundingBox",[w,h]);
    c2e.addContext(temp,"event",[event]);
    c2e.addContext(temp,"hoverEvent",[hEvent]);
    c2e.addContext(temp,"hovered",[false]);
    c2e.addContext(temp,"pos",[x,y]);
    c2e.addContext(temp,"match",[]);
    return temp;
}

function sendExit(){
    var player = c2e.alle("player")[0];
    c2e.applySystem("sendExit",[player],[]);
}

function exitMatch(matchid,id){
    if(Object.keys(otherPlayersLive).includes(matchid.toString())){
        c2e.applySystem("receiveExit",[otherPlayersLive[matchid]],[])
        delete otherPlayersLive[matchid];
    }

}

function quickMatchListButton(ctx,index,text,event,hEvent){
    var font = "30px Impact";
    var hFont = "40px Impact";
    var x = 200;
    var y = ctx.canvas.height*2/8 + index *65
    //console.log(text);
    return createMatchListButton(text,x,y,300,50,font,hFont,"white","blue",event,hEvent);
}

function createMatchListButton(text,x,y,w,h,font,hFont,tColour,bgColour,event,hEvent){
    var temp = c2e.addEnt();
    c2e.addContext(temp,"text",[text,text,font,hFont,tColour,tColour]);
    c2e.addContext(temp,"backgroundBox",[bgColour,bgColour,null,"black",null,5]);
    c2e.addContext(temp,"boundingBox",[w,h]);
    c2e.addContext(temp,"event",[event]);
    c2e.addContext(temp,"hoverEvent",[hEvent]);
    c2e.addContext(temp,"hovered",[false]);
    c2e.addContext(temp,"pos",[x,y]);
    c2e.addContext(temp,"matchlist",[]);
    return temp;
}


function createMatchListButtons(ctx,matches,event,hEvent,newMatchEvent,newMatchHEvent){
    var vals = Object.values(matches.list);
    var keys = Object.keys(matches.list);
    var text;
    var i=-1;
    //console.log(matches)
    for(var i in vals){
        if(i<=5){
            text = "Match: " + keys[i];
            quickMatchListButton(ctx,i,text,event(i),hEvent(i));
        }
    }
    i=keys.length;
    if(i<=5)
        quickMatchListButton(ctx,i,"New Match",newMatchEvent,newMatchHEvent)
}


function quickPlayerButton(x,y,w,h,ix,iy,text,event,hEvent){
    var font = "30px Impact";
    var hFont = "40px Impact";
    var x2 = x + ix * (w+10);
    var y2 = y + iy * (h+10);
    return createMatchListButton(text,x2,y2,w,h,font,hFont,"white","blue",event,hEvent);
}

function createPlayerButton(text,x,y,w,h,font,hFont,tColour,bgColour,event,hEvent){
    var temp = c2e.addEnt();
    c2e.addContext(temp,"text",[text,text,font,hFont,tColour,tColour]);
    c2e.addContext(temp,"backgroundBox",[bgColour,bgColour,null,"black",null,5]);
    c2e.addContext(temp,"boundingBox",[w,h]);
    c2e.addContext(temp,"event",[event]);
    c2e.addContext(temp,"hoverEvent",[hEvent]);
    c2e.addContext(temp,"hovered",[false]);
    c2e.addContext(temp,"pos",[x,y]);
    c2e.addContext(temp,"matchlist",[]);
    return temp;
}


function createPlayerGrid(ctx,players,event,hEvent){
    var k=0;
    var text="X";
    var x = ctx.canvas.width/2;
    var y = ctx.canvas.height*2/8-25;
    var h = 63;
    var w = 81;
    for(var ix =0;ix<4;ix++){
        for(var iy =0;iy<5;iy++){
            // text = players[k].shortName
            quickPlayerButton(x+w/2+10,y+h/2+10,w,h,ix,iy,text,
                              event,
                              hEvent
                              // event(players[k]),
                              // hEvent(players[k])
                             );
            k++;

        }
    }
}

function addDraw(id,shape,strokeColour,radius,colours){
    if(colours)
        c2e.addContext(id,"draw",
                       [shape,strokeColour,radius,colours.team1,colours.team2,
                        colours.team3,colours.dead,colours.pointer,colours.hitExp,colours.accent,colours.behind]);
    else
        c2e.addContext(id,"draw",
                       [shape,strokeColour,radius,"red","green",
                        "blue","black","yellow","yellow","yellow","white"]);
    return id;
}
