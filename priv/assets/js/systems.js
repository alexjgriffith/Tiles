function systemSendExit(ent){
    //console.log("exiting")
    //console.log(ent);
    websocketSendEvent("exitMatch",{
        matchid:ent.id.id,
        id:clientID});
    closeSocket();
    return ent;
}

function systemReceiveExit(ent){
    return null;
}

function systemDie(ent){
    ent.alive.alive=false;
    ent.colour.colour="black";
    ent.draw.colour ="black";
    events.push(function(game){game.playerAlive=false; return game;}),
    websocketSendEvent("dead",{
        alive:ent.alive.alive,
        matchid:ent.id.id,
        id:clientID});
    return ent;
}

function systemReceiveDead(ent,alive){
    ent.alive.alive=alive;
    if(alive==false){
        ent.colour.colour="black";
        ent.draw.colour="black";
    }
    return ent;
}

function systemSendKey(ent,onoff,key){
    var id = ent.id.id;
    websocketSendEvent(onoff,{key:key,
                              id:id
                             });
    return ent;
}

function systemReceiveKeyDown(ent,key){
    if(ent.alive.alive)
        ent.moveKeys.keys.push(key);
    else
        ent.moveKeys.keys=[]
    return ent;
}

function systemReceiveKeyUp(ent,key){
    var keys = ent.moveKeys.keys.filter(function(x)
                           {return x!=
                            key})
    if (ent.alive.alive)
        ent.moveKeys.keys=keys;
    else
        ent.moveKeys.keys=[];
    return ent;
}

function systemDamage(ent,bullet){
    var colour= bullet.colour.colour ,id=bullet.id.id,damage=bullet.damage.damage;
    var time = new Date;
    //console.log(ent.alive.alive);
    if(ent.alive.alive){
        if(ent.colour.colour != colour && ent.id.id != id){
            ent.health.health-=damage;
            if(ent.health.health<0){
                ent.health.health=0;
                ent = systemDie(ent);
            }
            else{
                ent.draw.timeDamage=time.getTime();
                ent.draw.damageFlag=true;
            }
            websocketSendEvent("damaged",{
                bullet:bullet.uid.id,
                health:ent.health.health,
                alive:ent.alive.alive,
                time:time.getTime(),
                matchid:ent.id.id,
                id:clientID});

            bullet=null;
        }}
    return [ent,bullet];
}

function systemDamageAnimate(ent,time){
    if(ent.draw.damageFlag){
        if (time - ent.draw.timeDamage < ent.draw.damageDt)
            ent.colour.colour=ent.draw.damage;
        else {
            //console.log("animation over");
            ent.draw.damageFlag=false;
            ent.colour.colour = ent.draw.colour
        }
    }
    return ent;
}

function systemSendPos (ent){
    websocketSendPos({pos:ent.pos,
                      team:ent.team.team,
                      colour:ent.colour.colour,
                      alive:ent.alive.alive,
                      dir:ent.direction,
                      matchid:ent.id.id,
                      id:clientID});
    return ent;
}

function systemSendAngle (ent){
    websocketSendEvent("turned",{direction:ent.direction,
                                 matchid:ent.id.id});
    return ent;
}

function systemPlayerCreateBullet(ent){
    var start = {}
    var velocity = {x:25*ent.direction.x,
                    y:25*ent.direction.y};
    var range = {x:500,y:500}
    var msg ;
    var power = ent.power;
    var colour;
    start.x = ent.pos.x + 25 + ent.direction.x * 25
    start.y = ent.pos.y + 25 + ent.direction.y * 25
    if((power.red+power.blue+power.green)>0){
        colour=maxColour(power.red,power.blue,power.green)
        ent.power[colour]=ent.power[colour]-1
        msg = {pos:start,
               velocity:velocity,
               range:range,
               team:ent.team,
               colour:colour,
               matchid:ent.id.id,}
        websocketSendEvent("createBullet",msg);
    }
    return ent;
}

function systemUpdatePlayer(ent,tiles,time,dt){
    var colour,time = new Date;
    var powerBuildUp = ent.powerBuildUp;
    var pos = ent.pos;
    var w = ent["collider"].x;
    var h = ent["collider"].y;
        var dir= ent["direction"];
    var sdir = ent["sentDirection"];
    if(0.038429439 < ((sdir.x-dir.x) *(sdir.x-dir.x) +
                      (sdir.y-dir.y)*(sdir.y-dir.y))){
        websocketSendEvent("turned",{direction:dir,
                                     matchid:ent.id.id});
        ent["sentDirection"].x = dir.x;
        ent["sentDirection"].y = dir.y;
    }

    //var overlap = tileOverlap(tiles,dt,pos.x-w/2,pos.x+w/2,pos.y-h/2,pos.y+h/2);
    var overlap = tileOverlap(tiles,dt,pos.x,pos.x+w,pos.y,pos.y+h);
    ent.powerBuildUp.list.push(overlap);
    if(time - powerBuildUp.time > powerBuildUp.dt){
        colour = tileOverlapMaxColour(ent.powerBuildUp.list);
        if(ent.power.red+ent.power.blue+ent.power.green < ent.power.max){
            ent.power[colour]+=1;
        }
        else {
            ent.power[maxColour(ent.power.red,ent.power.blue,ent.power.green)]-=1;
            ent.power[colour]+=1;
        }

        ent.colour.colour = maxColour(ent.power.red,ent.power.blue,ent.power.green);
        ent.draw.colour=ent.colour.colour
        ent.powerBuildUp.time = time.getTime();
        ent.powerBuildUp.list=[];
    }
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
        ent=null;
    }
    return ent;
}

function systemUpdateExplosion(ent,dt,entid){
    var expand = ent.expanding.rate*dt;
    ent.circle.radius+=expand
    ent.draw.radius = ent.circle.radius
    ent.pos.x-=expand//Math.sqrt(2);
    ent.pos.y-=expand//Math.sqrt(2);
    if(ent.circle.radius > ent.explosion.finalRadius){
        ent=null;
    }
    return ent;
}

function systemDrawObj (ent,ctx,camera){
    var draw = ent["draw"];
    var pos = ent["pos"];
    //console.log(ent["colour"].colour)
    var fillColour = ent["colour"].colour; // by this point the colour should be right
    ctx.strokeStyle=draw.strokeColour;
    ctx.fillStyle=fillColour;
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
    // to red blue green yellow and black have been removed
    // hack, need to replace when all reference
    var findColour = function(colourIn){
        var swapColour={red:"team1",blue:"team2",green:"team3",black:"dead",
                        yellow:"hitExp",white:"behind"};
        return ent.draw[swapColour[colourIn]];};
    // replace red green blue, with team_1 ... team_3
    // yellow-> explosion
    // yellow-> accentColour
    // black -> dead
    // black -> strokeColour
    // black -> lineColour

    var fillColour=findColour(ent["colour"].colour);
    var pos = ent["pos"];
    var dir = ent["direction"];
    var health = ent["health"];
    var ratio = ((health.health-health.max/2)/health.max);
    var power = ent["power"];
    var tri = triangle((pos.x-camera.x)+25+20*dir.x, (pos.y-camera.y)+25+20*dir.y,20,20,Math.atan2(dir.y,dir.x));
    var ttr = trunktriangle((pos.x-camera.x)+25,
                            (pos.y-camera.y)+25,
                            50,8000,-10000,Math.atan2(dir.y,dir.x));
    // Tail
    fillPoly(ctx,ttr,findColour("white"));
    ctx.beginPath();
    // Pointer
    ctx.moveTo(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius);
    ctx.lineTo(posEnd.x,posEnd.y);
    ctx.strokeStyle=findColour("black");
    ctx.stroke();
    ctx.strokeStyle=draw.strokeColour;
    ctx.fillStyle=fillColour;
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,
            draw.radius,0,2*Math.PI)
    //ctx.stroke();
    ctx.fill()
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/1.5,0,2*Math.PI)
    ctx.fillStyle=findColour("yellow");
    //ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/2,
            0,Math.PI*2*power.blue/power.max,false)
    ctx.lineWidth=4
    ctx.strokeStyle = findColour("blue");
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/2,
            Math.PI*2*power.blue/power.max,
            Math.PI*2*(power.green+power.blue)/power.max,false)
    ctx.lineWidth=4
    ctx.strokeStyle = findColour("green");
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/2,
            Math.PI*2*(power.blue+ power.green)/power.max,
            Math.PI*2*(power.red+power.green+power.blue)/power.max,false)
    ctx.lineWidth=4
    ctx.strokeStyle = findColour("red");
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius/4,
            Math.PI+Math.PI*ratio,
            0-Math.PI*ratio,true)
    ctx.fillStyle = fillColour;
    ctx.fill();

    ctx.lineWidth=1
    fillPoly(ctx,tri,fillColour);
    return ent;
}

var systemDrawButtonReqs = ["text","backgroundBox","boudningBox","pos","hovered"];
function systemDrawButton(ent,ctx,colours){
    var findColour = findColourGen(colours)
    if(!ent["hovered"].state){
        ctx.fillStyle=findColour(ent["backgroundBox"].colour);
        ctx.fillRect(ent["pos"].x-ent["boundingBox"].w/2,
                     ent["pos"].y-ent["boundingBox"].h/2,
                     ent["boundingBox"].w,ent["boundingBox"].h);
        ctx.fillStyle = findColour(ent["text"].colour);
        ctx.font = ent["text"].font;
        ctx.textAlign ="center";
        ctx.textBaseline ="middle";
        ctx.fillText(ent["text"].text,ent["pos"].x,ent["pos"].y);
    }
    else{
        ctx.fillStyle=findColour(ent["backgroundBox"].hColour);
        ctx.fillRect(ent["pos"].x-ent["boundingBox"].w/2,
                     ent["pos"].y-ent["boundingBox"].h/2,
                     ent["boundingBox"].w,ent["boundingBox"].h);
        ctx.strokeStyle=findColour(ent["backgroundBox"].hStroke);
        ctx.lineWidth=ent["backgroundBox"].hLineWidth;
        ctx.strokeRect(ent["pos"].x-ent["boundingBox"].w/2,
                       ent["pos"].y-ent["boundingBox"].h/2,
                       ent["boundingBox"].w,ent["boundingBox"].h);
        ctx.fillStyle = ent["text"].hColour;
        ctx.font = ent["text"].hFont;
        ctx.textAlign ="center";
        ctx.textBaseline ="middle";
        ctx.fillText(ent["text"].hText,ent["pos"].x,ent["pos"].y);
    }
    return ent;
}

var systemUpdateButtonReqs = ["clickable","hovered","boundingBox","pos","event","hoverEvent"];
function systemUpdateButton(ent,mpos,click,args){
    var buttonRange = {xmin:ent["pos"].x-ent["boundingBox"].w/2,
                       ymin:ent["pos"].y-ent["boundingBox"].h/2,
                       xrange:ent["boundingBox"].w,
                       yrange:ent["boundingBox"].h};
    var within = function(l,range){
        var x = l.x;
        var y = l.y;
        var xmin = range.xmin;
        var xrange = range.xrange;
        var ymin = range.ymin;
        var yrange = range.yrange;
        return (x>xmin && x<(xmin+xrange) && y>ymin && y<(ymin+yrange));
    };
    if (within(mpos,buttonRange)){
        ent.hovered.state=true;
        ent.hoverEvent.fun()
    }
    else{
        ent.hovered.state=false;
    }
    if(click!=undefined)
        if (within(click,buttonRange)){
            ent.event.fun.apply(undefined,args)
            //console.log("returned from event");
        }
    return ent;
}
function systemDrawColouredButton(ent,ctx){
    var x = ent["pos"].x-ent["boundingBox"].w/2;
    var y = ent["pos"].y-ent["boundingBox"].h/2;
    var length,colours;
    if(!ent["hovered"].state){
        colours=ent["colouredBackgroundBox"].colours
    }
    else{
        colours=ent["colouredBackgroundBox"].hColours
    }
    length=colours.length
    for(var i in colours){
        ctx.fillStyle=colours[i];
        ctx.fillRect(x+ent["boundingBox"].w/length*i,
                     y,
                     ent["boundingBox"].w/length,ent["boundingBox"].h);
    }

    if(ent["hovered"].state){
        ctx.lineWidth=ent["colouredBackgroundBox"].hWidth;
        ctx.strokeRect(ent["pos"].x-ent["boundingBox"].w/2,
                       ent["pos"].y-ent["boundingBox"].h/2,
                       ent["boundingBox"].w,ent["boundingBox"].h);
    }
    return ent;
}
