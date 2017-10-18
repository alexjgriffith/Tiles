// Impl
var c2e = new CES;

c2e.defcontext("pos",contextPos)
c2e.defcontext("draw",contextDraw)
c2e.defcontext("player",contextPlayer)
c2e.defcontext("alive",contextPlayer)
c2e.defcontext("collider",contextRectCollider)
c2e.defcontext("velocity",contextRectCollider)
c2e.defcontext("team",contextRectCollider)
c2e.defcontext("direction",contextDirection)
c2e.defcontext("otherPlayer",contextOtherPlayer)
c2e.defcontext("otherPlayerLive",contextOtherPlayerLive)
c2e.defcontext("remoteInput",contextRemoteInput)
c2e.defcontext("simpleAI",contextSimpleAI)
c2e.defcontext("bullet",contextBullet)
c2e.defcontext("expanding",contextExpanding)
c2e.defcontext("circle",contextCircle)
c2e.defcontext("explosion",contextExplosion)
c2e.defcontext("id",contextId)
c2e.defcontext("text",contextText)
c2e.defcontext("backgroundBox",contextBackgroundBox)
c2e.defcontext("boundingBox",contextBoundingBox)
c2e.defcontext("hovered",contextHovered)
c2e.defcontext("event",contextEvent)


c2e.defsystem("updateButton",systemUpdateButton,systemUpdateButtonReqs);
c2e.defsystem("drawButton",systemDrawButton,systemDrawButtonReqs);
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
c2e.defsystem("playerDirection",systemPlayerDirection,
              [["direction"]]);

// API
// Need to clean up to remove globals, should only need c2e
var playerId;
var bounds;
var object=[];
var bullets=[];
var otherPlayers = [];
var otherPlayersLive = {};


function definePlayer(Player){
    playerId = c2e.addEnt();
    c2e.addContext(playerId,"pos",[Player.pos.x,Player.pos.y]);
    c2e.addContext(playerId,"draw",["circle",Player.colour,"black",25]);
    c2e.addContext(playerId,"id",[Player.id]);
    c2e.addContext(playerId,"team",[Player.team]);
    c2e.addContext(playerId,"player",[]);
    c2e.addContext(playerId,"alive",[Player.alive]);
    c2e.addContext(playerId,"direction",[1,0]);
    c2e.addContext(playerId,"collider",[50,50,false,true,100,[]]);
}

function defineOtherPlayer(team,x,y,inputType,inputArgs){
    var temp = c2e.addEnt();
    otherPlayers.push(temp);
    c2e.addContext(temp,inputType,inputArgs);
    c2e.addContext(temp,"pos",[x,y]);
    c2e.addContext(temp,"draw",["circle",team,"black",25]);
    c2e.addContext(temp,"team",[team]);
    c2e.addContext(temp,"otherPlayer",[]);
    c2e.addContext(playerId,"alive",[true]);
    c2e.addContext(temp,"direction",[1,0]);
    c2e.addContext(temp,"collider",[50,50,false,true,100,[]]);
}

function createBullet(pos,velocity,range,team){
    var temp = c2e.addEnt();
    c2e.addContext(temp,"pos",[pos.x,pos.y]);
    c2e.addContext(temp,"draw",["cicle","yellow","black",5]);
    c2e.addContext(temp,"bullet",[team,range,pos]);
    // need to make collider triggers
    // c2e.addContext(temp,"collider",[5,5,false,true,0,[]]);
    c2e.addContext(temp,"velocity",[velocity.x,velocity.y]);
}

function createExplosion(pos,rate,initialRadius,finalRadius,team){
    var temp = c2e.addEnt();
    c2e.addContext(temp,"pos",[pos.x,pos.y]);
    c2e.addContext(temp,"draw",
                   ["cicle","yellow","black",initialRadius]);
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
    c2e.addContext(temp,"draw",["circle","yellow","black",25]);
    c2e.addContext(temp,"collider",[50,50,false,false,50,[]]);
}

function defineBoundBox(x,y){
    bounds = c2e.addEnt();
    c2e.addContext(bounds,"pos",[0,0]);
    c2e.addContext(bounds,"collider",[x,y,true,false,0,[]]);
}


function testCollision(){
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
    //c2e.applySystem("collide",[object[0],object[1]],[])
    //c2e.applySystem("collideI",[object[1],bounds],[])
    //c2e.applySystem("collideI",[object[0],bounds],[])
}


function move(dir,step){
    if(dir=="down"){
        c2e.applySystem("movePlayer", [playerId],[{x:0,y:step}])
    }
    if(dir=="up"){
            c2e.applySystem("movePlayer", [playerId],[{x:0,y:-step}])
    }
    if(dir=="right"){
        c2e.applySystem("movePlayer", [playerId],[{x:step,y:0}])
    }
    if(dir=="left"){
        c2e.applySystem("movePlayer", [playerId],[{x:-step,y:0}])
    }
}

function pdraw(ctx,camera,point){
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
    for(i in ops){
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
    var conts = c2e.allc(playerId);
    var start = {}
    start.x = conts.pos.x + 25 + conts.direction.x * 25
    start.y = conts.pos.y + 25 + conts.direction.y * 25
    var velocity = {x:25*conts.direction.x,
                    y:25*conts.direction.y};
    var range = {x:500,y:500}

    var msg = {pos:start,velocity:velocity,range:range,team:"red"}
    websocketSendEvent("createBullet",msg);
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
    var msg = key;
    websocketSendEvent("keyDown",msg)
}

function moveKeyUp(key){
    var msg = key;
    websocketSendEvent("keyUp",msg)
}

function sendPlayerAngle(){
    c2e.applySystem("sendAngle", [playerId],[]);
}

function sendPlayerPos(){
    c2e.applySystem("sendPos", [playerId],[]);
}

function createOtherPlayerLive(pos,team,alive,direction,id){
    var temp = c2e.addEnt();
    otherPlayersLive[id]=temp;
    c2e.addContext(temp,"pos",[pos.x,pos.y]);
    console.log(team)
    c2e.addContext(temp,"draw",["circle",team,"black",25]);
    c2e.addContext(temp,"team",[team]);
    c2e.addContext(temp,"otherPlayerLive",[]);
    c2e.addContext(temp,"id",[id]);
    c2e.addContext(temp,"alive",[alive]);
    c2e.addContext(temp,"direction",[direction.x,direction.y]);
    c2e.addContext(temp,"collider",[50,50,false,true,100,[]]);
    console.log(pos)
}

function updateOtherPlayerLive(id,pos,direction,alive){
    c2e.applySystem("updateOtherPlayerLive", [id],[pos,direction,alive]);
}

function updatePlayerPos(pos,team,alive,direction,id){
    var ops;
    if(id[1]!=clientID[1]){
        if(Object.keys(otherPlayersLive).includes(id[1])){
            updateOtherPlayerLive(otherPlayersLive[id[1]],pos,
                                  direction,alive);
        }
        else{
            createOtherPlayerLive(pos,team.x,alive,direction,id[1])
        }}
}

function createQuickButton(text,event,x,y,h,w){
    var font = "30px Impact";
    var hFont = "40px Impact";
    createMenuButton(text,x,y,h,w,font,hFont,"white","blue",event);
}

function createMenuButton(text,x,y,h,w,font,hFont,tColour,bgColour,event){
    var temp = c2e.addEnt();
    c2e.addContext(temp,"text",[text,text,font,hFont,tColour,tColour]);
    c2e.addContext(temp,"backgroundBox",[bgColour,bgColour,null,"black",null,5]);
    c2e.addContext(temp,"boundingBox",[w,h]);
    c2e.addContext(temp,"event",[event]);
    c2e.addContext(temp,"hovered",[false]);
    c2e.addContext(temp,"pos",[x,y]);
}

function updateButtons(mpos,click,args){
    var buttons = c2e.alle("contextHovered");
    for(i in buttons){
        c2e.applySystem("updateButton",[buttons[i]],[mpos,click,args]);
    }
}

function drawButtons(contexts){
    var buttons = c2e.alle("contextHovered");
    for(i in buttons){
        c2e.applySystem("drawButton",[buttons[i]],[contexts]);
    }

}
