function mouseCameraAlt(game,pos){
    var mid ={x:game.dim.x/2,y:game.dim.y/2}
    var mpos = mouse.pos;
    var r =250 ;
    var p1={};
    p1.x = pos.x - mid.x;
    p1.y = pos.y - mid.y;
    var p2 =  {};
    p2.x = pos.x - mid.x + (mpos.x  - mid.x)/1.5;
    p2.y = pos.y - mid.y + (mpos.y  - mid.y)/1.5;

    var theta = Math.atan2(p2.y-p1.y,
                           p2.x-p1.x);
    var p3 ={x: Math.cos(theta) * r,
             y: Math.sin(theta) * r};
    var p = {x:p1.x+p3.x,
             y:p1.y+p3.y};

    if(pdist(p1,p2)<r){
        if(p2.x<0)
            game.camera.x=0
        else if(p2.x>game.range.x - game.dim.x)
            game.camera.x=game.range.x - game.dim.x
        else
            game.camera.x = p2.x;
        if(p2.y<0)
            game.camera.y=0
        else if(p2.y>game.range.y - game.dim.y)
            game.camera.y=game.range.y - game.dim.y
        else
            game.camera.y = p2.y;
    }
    else{
        if(p.x<0)
            game.camera.y=0
        else if(p.x>game.range.x - game.dim.x)
            game.camera.x = game.range.x - game.dim.x
        else
            game.camera.x = p.x ;
        if(p.y<0)
            game.camera.y=0
        else if(p.y>game.range.y - game.dim.y)
            game.camera.y=game.range.y - game.dim.y
        else
            game.camera.y = p.y ;
    }
    return game;
}

function mouseCamera(game,pos){
    var mpos = mouse.pos;
    var mid={};
    var p={};
    var damp = 0.9;
    var depth={};
    depth.x = game.dim.x*0.3;
    depth.y = game.dim.y*0.3;
    mid.x = game.dim.x/2
    mid.y = game.dim.y/2
    //console.log(pos)
    var theta = Math.atan2((mpos.y-(pos.y-game.camera.y)),
                           (mpos.x-(pos.x-game.camera.x)));
    p.x=  Math.cos(theta)*depth.x;
    p.y=  Math.sin(theta)*depth.y;
    //* Math.sign((mpos.y-pos.y)) ;
    //(game.camera.y - (pos.y-mid.y)) * damp
    //console.log(theta / Math.PI);
    if(pos.x-mid.x+p.x<0)
        game.camera.x=0
    else if(pos.x-mid.x+p.x>game.range.x - game.dim.x)
        game.camera.x=game.range.x - game.dim.x
    else
        game.camera.x=pos.x-mid.x + p.x;

    if(pos.y-mid.y+p.y<0)
        game.camera.y=0
    else if(pos.y-mid.y+p.y>game.range.y - game.dim.y)
        game.camera.y=game.range.y - game.dim.y
    else{
        game.camera.y=pos.y-mid.y +p.y;//pos.y-mid.y+p.y;
    }
    return game;

}

function lagCamera(game,pos){
    //game.camera=pos;
    //var dim = game.dim;
    //var range = game.range;
    var mid={};
    var p={};
    var damp = 0.9;
    mid.x = game.dim.x/2
    mid.y = game.dim.y/2
    p.x= (game.camera.x - (pos.x-mid.x)) * damp;
    if(pos.x-mid.x+p.x<0)
        game.camera.x=0
    else if(pos.x-mid.x+p.x>game.range.x - game.dim.x)
        game.camera.x=game.range.x - game.dim.x
    else
        game.camera.x=pos.x-mid.x+p.x;

    p.y= (game.camera.y - (pos.y-mid.y)) * damp;
    if(pos.y-mid.y+p.y<0)
        game.camera.y=0
    else if(pos.y-mid.y+p.y>game.range.y - game.dim.y)
        game.camera.y=game.range.y - game.dim.y
    else{
        game.camera.y=pos.y-mid.y+p.y;
    }
    return game;
}
