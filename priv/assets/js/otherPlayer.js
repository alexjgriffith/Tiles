function systemDrawOtherPlayer (ent,ctx,camera){
    var draw = ent["draw"];
    var pos = ent["pos"];
    var dir = ent["direction"];
    var tri = triangle((pos.x-camera.x)+25+20*dir.x,
                       (pos.y-camera.y)+25+20*dir.y,
                       20,20,Math.atan2(dir.y,dir.x));
    ctx.strokeStyle=draw.strokeColour;
    ctx.fillStyle=draw.fillColour;
    ctx.beginPath();
    ctx.arc(pos.x-camera.x+draw.radius,pos.y-camera.y+draw.radius,draw.radius,0,2*Math.PI)
    ctx.fill()
    fillPoly(ctx,tri,draw.fillColour);
    return ent;
}
