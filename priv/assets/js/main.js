var frames = 1000 / 60;
var mouse={pos:{x:null,y:null},click:null};
var keys = {moves:[],actions:[]};
var positionPlayer={ptime:Date.now(),pos:[]};
var forumButton={toggleConnection:false};

// Views
// 1. Load Menu
// 2. Sign In
// 3. Looking for match
// 4. Match
// 5. Match Overlay

// Game vs match
function main(){
    var x=500,y=500;
    var ctx;
    document.getElementById("mainGame").innerHTML="<canvas id='gameCanvas' width='"+x+"' height='"+y+"' tabindex='1'></canvas>";
    ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.canvas.addEventListener("click",
                                function(e){click(e,ctx)},
                                false);
    ctx.canvas.addEventListener("mousemove",
                                function(e){mousemove(e,ctx)},
                                false);
    ctx.canvas.addEventListener("keydown",
                                function(e){keyboard(e,"down")},
                                false);
    ctx.canvas.addEventListener("keyup",
                                function(e){keyboard(e,"up")},
                                false);

    loadMenu(ctx,matchFunction(ctx));
}

function matchFunction(ctx){
    return function(tiles,player){
        initMatch(ctx,tiles,player);
    };
};


function gameloop (game,eval,draw,ctx,time,dt){
    var date,wait,end,start = new Date();
    var inputs = getInputs();
    game = eval(game,inputs,ctx,dt);
    if(game.terminate){
        return 0;
    }
    draw(game,ctx);
    end = new Date();
    wait = end.getTime() - start.getTime();
    if(wait < frames){
        setTimeout(function(){
            var date = new Date();
            window.requestAnimationFrame(function() {
                gameloop(game,eval,draw,ctx,date.getTime(),date.getTime()-time )});
        }, frames - wait)
    }
    else {
        date = new Date();
        window.requestAnimationFrame(function(){
            gameloop(game,eval,draw,ctx,date.getTime(),date.getTime()-time)});
    }
}

function click(event,ctx){
    mouse.click = {x:event.pageX-ctx.canvas.offsetLeft,
                   y:event.pageY- ctx.canvas.offsetTop}
}

function mousemove(event,ctx){
    mouse.pos = {x:event.pageX-ctx.canvas.offsetLeft,
                 y:event.pageY- ctx.canvas.offsetTop}
}

function keyboard(event,state){
    var moves = {65:"left",37:"left",
                 87:"up",38:"up",
                 68:"right",39:"right",
                 83:"down",40:"down"};
    var actions = {32:{name:"shoot",val:true},27:{name:"escape",val:true}};
    if(moves.hasOwnProperty(event.keyCode)){
        if(state=="down" && ! keys.moves.includes(moves[event.keyCode])){
            keys.moves.push(moves[event.keyCode]);
            moveKeyDown(moves[event.keyCode]);
        }
        if(state=="up"){
            keys.moves = keys.moves.filter(function(x)
                                     {return x!=
                                      moves[event.keyCode]})
            moveKeyUp(moves[event.keyCode]);
        }}
    if(actions.hasOwnProperty(event.keyCode)){
        if(state=="down" &&
           ! keys.actions.filter(function(x){
               return !Object.is(x,actions[event.keyCode])}).length > 0){
            keys.actions.push(actions[event.keyCode])
        }
        if(state=="up"){
            console.log("up");
            keys.actions =
                keys.actions.filter(
                    function(x){
                        return Object.is(x,actions[event.keyCode])})
        }}
}


function getInputs(){
    var ret = Object.assign({},mouse);
    var button = Object.assign({},forumButton);
    forumButton.toggleConnection=false;
    mouse.click = null;
    //console.log(ret.click);
    ret.keydown=keys;
    ret.button=button
    return ret;
}


function updatePP(time){
    //playerPos.pos.push(playerPos());
    if(time-positionPlayer.ptime > 1000){
        sendPlayerPos();
        positionPlayer.ptime=time;
    }
}

function updateCamera(game,pos){
    return mouseCamera(game,pos);
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
    var theta = Math.atan2((mpos.y-(pos.y-game.camera.y)),(mpos.x-(pos.x-game.camera.x)));
    p.x=  Math.cos(theta)*depth.x ;
    p.y= Math.sin(theta)*depth.y ;//* Math.sign((mpos.y-pos.y)) ;
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

function swapColour(game,index,colour1,colour2){
    var currentColour  = game.tiles[index.x][index.y].type;
    if(currentColour == colour1){
        game.tiles[index.x][index.y].type = colour2;
    }
    else{
        game.tiles[index.x][index.y].type = colour1;
    }
    game.grid=fullGridDraw(game);
    return game;
}

function animate(game,ctx){
    var drawable = game.c2e.draw();
    var type;
    for (i in drawable){
        drawtype = game.ents[i].contexts["draw"].drawtype;
        game.systems[drawtype](game.ents[i]);
    }
}


function fullGridDraw(game){
    var dim = game.dim;
    var ts = game.tileSize;
    var ntile = {x:game.tiles.length,y:game.tiles[0].length}
    var canvas =  document.createElement('canvas');
    var ctx= canvas.getContext('2d');
    canvas.width = ntile.x*ts.x;
    canvas.height = ntile.y*ts.y;
    for(var i = 0; i < ntile.x; i++){
        for(var j = 0; j < ntile.y; j++){
            ctx.beginPath();
            ctx.rect(i*ts.x,j*ts.y,ts.x,ts.y);
            type = game.tiles[i][j].type;
            // type = game.tiles[i+j].type;
            //console.log(game.tiles);
            ctx.fillStyle= game.types[type].colour;
            ctx.strokeStyle="black";
            //ctx.stroke();
            ctx.fill();
        }
    }
    var imageData = new Image();
    imageData.src=canvas.toDataURL();
    imageData.crossOrigin = "Anonymous";
    return imageData;
}

function openSocket(){
    console.log("open socket")
}

function closeSocket(){
    websocketClose();
    forumButton.toggleConnection=true;
    //button = document.getElementById("sockCon");
    //button.innerHTML="<button type='button' onclick='openSocket();'>Open Connection </button>"
}
