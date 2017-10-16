// Engine
function CES() {
    var c2e = {};
    var e2c = {};
    var ents = {};
    var index = 0;
    var systems = {};
    var contexts = {};
    this.viewObj = function(){
        return {c2e:c2e,
                e2c:e2c,
                ents:ents};
    }
    this.addEnt = function(){
        ents[index]={};
        e2c[index]=[];
        index += 1;
        return index-1;
    };
    this.removeEnt = function (index){
        delete ents[index];
        for(var i in e2c[index]){
            c2e[e2c[index][i]] =
                c2e[e2c[index][i]].filter(function(x){return x!=index;})
        }
        delete e2c[index];
    };
    this.addContext = function(index,context,vals){
        var cont = contexts[context].apply(undefined,vals);
        ents[index][context]=cont;
        e2c[index].push(context);
        if(c2e[context] == null){
            c2e[context]=[index];
        }
        else{
            c2e[context].push(index);
        }
    }
    this.removeContext = function(index,context){
        e2c = e2c[index].filter(function(x) {x!=context});
        c2e = c2e[context].filter(function(x){x!=ent})
        delete ents[index][context]
    }
    this.defcontext = function(name,fun){
        contexts[name]=fun;
    }
    this.alle = function(context){
        return c2e[context];
    }
    this.allc = function(ent){
        return ents[ent];
    }
    this.defsystem = function(name,fun,deps){
        // deps need to be contexts
        systems[name]={fun:fun,depends:deps};
    }
    this.applySystem = function(system,index,args){
        var temp;
        if(index.length==1){
            args.reverse().push(ents[index[0]]);
            args.reverse();
            fun = systems[system].fun;
            temp = fun.apply(undefined,args);
            if(temp!=null)
                ents[index]=temp;
        }
        else if(index.length=2){
            args.reverse().push(ents[index[1]]);
            args.push(ents[index[0]]);
            args.reverse();
            fun = systems[system].fun;
            temp = fun.apply(undefined,args);
            if(temp[0]!=null)
                ents[index[0]]=temp[0];
            if(temp[1]!=null)
                ents[index[1]]=temp[1];
        }
    }
}

// Impl

function contextPos (x,y){
    return {x:x,y:y};
}

function contextId (id){
    return {id:id};
}

function contextVelocity (x,y){
    return {x:x,y:y};
}

function contextBullet(team,range,start){
    return {team:team,range:range,start:start};
}

function contextDraw (shape,fillColour,strokeColour, radius){
    return {shape:shape,
            fillColour:fillColour,
            strokeColour:strokeColour,
            radius:radius};
}

function contextDirection(x,y){
    return {x:x,y:y};
}

function contextRectCollider (x,y,inverted,moveable,mass,event){
    return {x:x,y:y,inverted:inverted,moveable:moveable,mass:mass,event:event};
}

function contextPlayer (){
    return {};
}

function alive(state){
    return {state:state};
}

function contextCircle(radius){
    return {radius:radius};
}

function contextExplosion(team,finalRadius){
    return {team:team,finalRadius:finalRadius};
}

function contextExpanding(rate){
    return {rate:rate}
}

function contextOtherPlayer (){
    return {};
}

function contextOtherPlayerLive (){
    return {};
}

function contextSimpleAI (lrp){
    // VERY SIMPLY logic
    return {lrp:lrp,dir:-1};
}

function contextRemoteInput (x,y,signal,maxCol){
    // x and y should be vectors that will
    // allow for better interpolation
    return {x:x,y:y,signal:signal};
}

function systemSendPos (ent){
    websocketSendPos({pos:ent.pos,
                      team:ent.team,
                      alive:ent.alive,
                      direction:ent.direction,
                      id:clientID});
    return ent;
}


function systemMovePlayer (ent,move){
    ent["pos"].x+=move.x;
    ent["pos"].y+=move.y;
    return ent;
}

function systemSimpleAI(ent,step){
    var probs = ent.simpleAI;
    var dir = ent.direction
    if(Math.random()<probs.lrp){
        probs.dir = probs.dir*-1
    }
    dir = rotate(dir,probs.dir*Math.PI/128)
    ent = systemMovePlayer(ent,{x:dir.x*3*step,y:dir.y*3*step});
    ent.direction = dir;
    return ent;
}

function systemPlayerDirection(ent,mouse,camera){
    var mpos=mouse.pos;
    var pos = ent["pos"];
    var y = (mpos.y-(pos.y-camera.y+25));
    var x = (mpos.x-(pos.x-camera.x+25));
    var mag = Math.sqrt(y*y + x*x)
    ent.direction.x=x/mag;
    ent.direction.y=y/mag;
    return ent;
}

function systemUpdateBullet(ent,dt,entid){
    ent.pos.x=ent.pos.x+ent.velocity.x*dt
    ent.pos.y=ent.pos.y+ent.velocity.y*dt
    if(Math.abs(ent.bullet.start.x - ent.pos.x) > ent.bullet.range.x ||
       Math.abs(ent.bullet.start.y - ent.pos.y) > ent.bullet.range.y){
        c2e.removeEnt(entid);
        ent=null;
    }
    return ent;
}

function systemUpdateOtherPlayerLive(ent,pos,direction,alive){
    ent.pos=pos;
    ent.direction=direction;
    ent.alive=alive;
    return ent;
}

function systemUpdateExplosion(ent,dt,entid){
    var expand = ent.expanding.rate*dt;
    ent.circle.radius+=expand
    ent.draw.radius = ent.circle.radius
    ent.pos.x-=expand//Math.sqrt(2);
    ent.pos.y-=expand//Math.sqrt(2);
    if(ent.circle.radius > ent.explosion.finalRadius){
        c2e.removeEnt(entid);
        ent=null;
    }
    return ent;
}

function systemDrawObj (ent,ctx,camera){
    var draw = ent["draw"];
    var pos = ent["pos"];
    ctx.strokeStyle=draw.strokeColour;
    ctx.fillStyle=draw.fillColour;
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,
            draw.radius,0,2*Math.PI)
    ctx.stroke();
    ctx.fill()
    return ent;
}

function systemDeath (ent1,ent2){
    return systemTriggerCollide(ent1,ent2);
}

function systemDrawPlayer (ent,ctx,camera,posEnd){
    var draw = ent["draw"];
    var pos = ent["pos"];
    var dir = ent["direction"];
    var tri = triangle((pos.x-camera.x)+25+20*dir.x, (pos.y-camera.y)+25+20*dir.y,20,20,Math.atan2(dir.y,dir.x));
    var ttr = trunktriangle((pos.x-camera.x)+25,
                            (pos.y-camera.y)+25,
                            50,8000,-10000,Math.atan2(dir.y,dir.x));
    fillPoly(ctx,ttr,"white");
    ctx.beginPath();
    ctx.moveTo(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius);
    ctx.lineTo(posEnd.x,posEnd.y);
    ctx.strokeStyle="black";
    ctx.stroke();
    ctx.strokeStyle=draw.strokeColour;
    ctx.fillStyle=draw.fillColour;
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius,0,2*Math.PI)
    //ctx.stroke();
    ctx.fill()
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/1.5,0,2*Math.PI)
    ctx.strokeStyle="black";
    ctx.fillStyle="yellow";
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/2,0,Math.PI/2,false)
    ctx.lineWidth=4
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/2,Math.PI/2,Math.PI,false)
    ctx.lineWidth=4
    ctx.strokeStyle = "green";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/2,Math.PI,0,false)
    ctx.lineWidth=4
    ctx.strokeStyle = "red";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/4,Math.PI+Math.PI*(-0.1),0-Math.PI*(-0.1),true)
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.lineWidth=1
    fillPoly(ctx,tri,"red");
    return ent;
}

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



c2e.defsystem("sendPos",systemSendPos,[]);
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
var playerId;
var bounds;
var object=[];
var bullets=[];
var otherPlayers = [];
var otherPlayersLive = {};


function definePlayer(){
    playerId = c2e.addEnt();
    c2e.addContext(playerId,"pos",[300,500]);
    c2e.addContext(playerId,"draw",["circle","red","black",25]);
    c2e.addContext(playerId,"id",[playerId]);
    c2e.addContext(playerId,"team",["red"]);
    c2e.addContext(playerId,"player",[]);
    c2e.addContext(playerId,"alive",[true]);
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
