function triangle(x,y,b,h,theta){
    var b2 = b/2;
    return [{x:x+h*Math.cos(theta),
             y:y+h*Math.sin(theta)},
            {x:x-b2*Math.cos(Math.PI/2 - theta),
             y:y+b2*Math.sin(Math.PI/2 - theta)},
            {x:x-b2*Math.cos(Math.PI/2 + theta),y:y-b2*Math.sin(Math.PI/2 + theta)}];
}


function trunktriangle(x,y,b1,b2,h,theta){
    var b12=b1/2;
    var b22=b2/2;
    var H = Math.sqrt(h*h+b22*b22);
    var phi = Math.atan2(h,b22);
    return [{x:x-b12*Math.cos(theta + Math.PI/2 ),
             y:y-b12*Math.sin(theta + Math.PI/2)},
            {x:x-b12*Math.cos(3*Math.PI/2 + theta),
             y:y-b12*Math.sin(3*Math.PI/2 + theta)},
            {x:x-H*Math.cos(theta + phi),
             y:y-H*Math.sin(theta + phi)},
            {x:x-H*Math.cos(theta - phi),
             y:y-H*Math.sin(theta - phi)}
           ];
}


function fillPoly(ctx,poly,colour){
    ctx.beginPath();
    ctx.moveTo(poly[0].x,poly[0].y);
    for(var i = 1 ; i < poly.length ; i++){
        ctx.lineTo(poly[i].x,poly[i].y);
    }
    ctx.lineTo(poly[0].x,poly[0].y);
    ctx.fillStyle=colour;
    ctx.fill();
}

function rotate(dir,rads){
    var mag = Math.sqrt(dir.x*dir.x+dir.y*dir.y);
    var theta = Math.atan2(dir.y,dir.x);
    dir.x = mag*Math.cos(theta+rads);
    dir.y = mag*Math.sin(theta+rads);
    return dir;
}
