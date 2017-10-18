function systemSendPos (ent){
    websocketSendPos({pos:ent.pos,
                      team:ent.team,
                      alive:ent.alive,
                      direction:ent.direction,
                      id:clientID});
    return ent;
}

function systemSendAngle (ent){
    websocketSendPos({direction:ent.direction,
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

var systemDrawButtonReqs = ["text","backgroundBox","boudningBox","pos","hovered"];
function systemDrawButton(ent,ctx){
    if(ent["hovered"].state){
        ctx.fillStyle=ent["backgroundBox"].colour;
        ctx.fillRect(ent["pos"].x-ent["boudningBox"].w/2,
                     ent["pos"].y-ent["boundingBox"].h/2,
                     ent["boundingBox"].w,ent["boundingBox"].h);
        ctx.fillStyle = ent["text"].colour;
        ctx.font = ent["text"].font;
        ctx.textAlign ="center";
        ctx.textBaseline ="middle";
        ctx.fillText(ent["text"].text,ent["pos"].x,ent["pos"].y);
    }
    else{
        ctx.fillStyle=ent["backgroundBox"].hColour;
        ctx.fillRect(ent["pos"].x-ent["boudningBox"].w/2,
                     ent["pos"].y-ent["boundingBox"].h/2,
                     ent["boundingBox"].w,ent["boundingBox"].h);
        ctx.strokeStyl=ent["backgroundBox"].hStroke;
        ctx.lineWidth=ent["backgroundBox"].hLineWidth;
        ctx.strokeRect(ctx.canvas.width/2-150,ctx.canvas.height/2+15,
                       300,50);
        ctx.fillStyle = ent["text"].hColour;
        ctx.font = ent["text"].hFont;
        ctx.textAlign ="center";
        ctx.textBaseline ="middle";
        ctx.fillText(ent["text"].hText,ent["pos"].x,ent["pos"].y);
    }
    return Ent;
}
var systemUpdateButtonReqs = ["clickable","hovered","boundingBox","pos","event"];
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
        ent.hoverd.state=true;
    }
    else{
        ent.hoverd.state=false;
    }
    if(click!=undefined)
        if (within(click,buttonRange)){
            ent.event.fun.apply(undefined,args)
        }
    return Ent;
}
