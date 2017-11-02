function systemDrawOtherPlayer (ent,ctx,camera){
    var draw = ent["draw"];
    var pos = ent["pos"];
    var dir = ent["direction"];
    var tri = triangle((pos.x-camera.x)+25+20*dir.x,
                       (pos.y-camera.y)+25+20*dir.y,
                       20,20,Math.atan2(dir.y,dir.x));
    ctx.fillStyle=ent.colour.colour;
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius,0,2*Math.PI)
    ctx.fill()
    fillPoly(ctx,tri,draw.fillColour);
    return ent;
}

function systemUpdateOtherPlayerLive(ent,pos,team,colour,alive,direction){
    ent.pos=pos;
    ent.team.team=team;
    ent.alive.alive=alive;
    if(ent.alive.alive)
        ent.colour.colour=colour;
    ent.direction=direction;
    ent.draw.colour=colour
    return ent;
}

function systemOtherDamage(ent,bullet){
    var colour= bullet.colour.colour ,id=bullet.id.id,damage=bullet.damage.damage;
    var time = new Date;
    if(ent.colour.colour != colour && ent.id.id != id){
        ent.draw.timeDamage=time.getTime();
        ent.draw.damageFlag=true;
        bullet=null;
    }
    return [ent,bullet];
}

function systemMoveOtherPlayer(ent,entId,weight){
    var keys = ent.moveKeys.keys;
    if(keys.length>0){
        for(var j in keys){
            move(keys[j],
                 Math.floor(weight*10/Math.sqrt(keys.length)),
                 entId)
        }
    }
    return ent;
}

function systemTurnOther(ent,direction){
    ent.direction=direction;
    return ent;
}

function systemSetOtherColour(ent,colour){
    if(ent.alive)
        ent.colour.colour=colour;
    return ent;
}
