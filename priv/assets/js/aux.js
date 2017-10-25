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

function tileOverlap(tiles,weight,xmin,xmax,ymin,ymax){
    return comparePoints(xmin,xmax,ymin,ymax,tiles,75,75,weight);
}

function comparePoints(xmin,xmax,ymin,ymax,tiles,px,py,weight){
    var tileA = pointToTile(xmax,ymin,px,py,tiles);
    var tileB = pointToTile(xmax,ymax,px,py,tiles);
    var tileC = pointToTile(xmin,ymax,px,py,tiles);
    var tileD = pointToTile(xmin,ymin,px,py,tiles);
    var dim = {xmin:xmin,xmax:xmax,ymin:ymin,ymax:ymax}
    var A1 = (xmax-xmin) * (ymax-ymin);
    var m1 = comparePointA(A1,xmax,ymin,tileA.pos.x,tileA.pos.y,px,py,dim)*weight;
    var m2 = comparePointB(A1,xmax,ymax,tileB.pos.x,tileB.pos.y,px,py,dim)*weight;
    var m3 = comparePointC(A1,xmin,ymax,tileC.pos.x,tileC.pos.y,px,py,dim)*weight;
    var m4 = comparePointD(A1,xmin,ymin,tileD.pos.x,tileD.pos.y,px,py,dim)*weight;
    var retSum={red:0,blue:0,green:0};
    var tform={earth:"red",water:"blue",grass:"green"};
    retSum[tform[tileA.type]]+=m1
    retSum[tform[tileB.type]]+=m2
    retSum[tform[tileC.type]]+=m3
    retSum[tform[tileD.type]]+=m4
    return retSum;
}

function comparePointA(A1,x1,y1,x2,y2,px,py,dim){
    var x2p = x2-px
    var xmin = dim.xmin;
    var ymax = dim.ymax;
    var A2 = (x1-x2p)*(y2-y1);
    var A3 = (x1-xmin)*(y2-y1);
    var A4 = (x1-x2p) *(ymax - y1)
    return Math.min(A1,A2,A3,A4)
}

function comparePointB(A1,x1,y1,x2,y2,px,py,dim){
    var x2p = x2-px
    var y2p = y2-py
    var xmin = dim.xmin;
    var ymin = dim.ymin;
    var A2 = (x1-x2p)*(y1-y2p);
    var A3 = (x1-xmin)*(y1-y2p);
    var A4 = (x1-x2p) *(y1-ymin)
    return Math.min(A1,A2,A3,A4)
}

function comparePointC(A1,x1,y1,x2,y2,px,py,dim){
    var y2p = y2-py
    var xmax = dim.xmax;
    var ymin = dim.ymin;
    var A2 = (x2-x1)*(y1 -y2p);
    var A3 = (xmax-x1)*(y1-y2p);
    var A4 = (x2-x1) *(y1-ymin)
    return Math.min(A1,A2,A3,A4)
}

function comparePointD(A1,x1,y1,x2,y2,px,py,dim){
    var xmax = dim.xmax;
    var ymax = dim.ymax;
    var A2 = (x2-x1)*(y2 -y1);
    var A3 = (xmax-x1)*(y2-y1);
    var A4 = (x2-x1) *(ymax-y1)
    return Math.min(A1,A2,A3,A4)
}


function tileOverlapMaxColour(colourList){
    var red=0,green=0,blue=0;
    for(i in colourList){
        red+=colourList[i]["red"]
        blue+=colourList[i]["blue"]
        green+=colourList[i]["green"]
    }
    return maxColour(red,blue,green);
}

function maxColour(red,blue,green){
    var colour;
    if(red>blue && red>green)
        colour = ["red"]
    else if(green > blue && green > red)
        colour =["green"]
    else if (blue > green && blue > red)
        colour =["blue"]
    else if (red == green && red == blue)
        colour =["red","blue","green"]
    else if (red == green && green> 0)
        colour =["red","green"]
    else if (red == blue && blue> 0)
        colour = ["red","blue"]
    else if (blue == green && green> 0)
        colour = ["green","blue"]
    return colour[Math.floor(Math.random()*colour.length)];
}

function pointToTile(x,y,px,py,tile){
    return tile[Math.floor(x/px)][Math.floor(y/py)];
}

function pdiff(p1,p2){
    return {x:p1.x-p2.x,
            y:p1.y-p2.y};
}

function padd(p1,p2){
    return {x:p1.x+p2.x,
            y:p1.y+p2.y};
}

function anlge(p1,p2){
    var diff = pdiff(p1,p2);
    return Math.atan2(diff.y,diff.x);
}

function slope(p1,p2){
    return (p2.y-p1.y)/(p2.x-p1.x);
}

function radslope(radius,slope){
    var x = radius * Math.sqrt(1/(slope*slope+1));
    return {x:x,
            y:x*slope}
}

function pdist (p1,p2){
    var r2 = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
    return Math.sqrt(r2);
}

function pass1(game){
    return game
}

function pass0(){
}
