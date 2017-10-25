var frames = 1000 / 60;
var mouse={pos:{x:null,y:null},click:null};
var keys = {moves:[],actions:[]};
var positionPlayer={ptime:Date.now(),pos:[]};
var forumButton={toggleConnection:false};
var events=[];

function main(){
    var x=800,y=600;
    var ctx;
    //document.getElementById("mainGame").innerHTML="<canvas id='gameCanvas' width='"+x+"' height='"+y+"' tabindex='1'></canvas>";
    document.getElementById("mainGame").innerHTML="<canvas id='gameCanvas' width='"+x+"' height='"+y+"'></canvas>";

    ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.canvas.addEventListener("click",
                                function(e){click(e,ctx)},
                                false);
    ctx.canvas.addEventListener("mousemove",
                                function(e){mousemove(e,ctx)},
                                false);
    document.addEventListener("keydown",
                                function(e){keyboard(e,"down")},
                                false);
    document.addEventListener("keyup",
                                function(e){keyboard(e,"up")},
                                false);

    loadMenu(ctx);
}

function checkForEvents(game){
    for(var i in events)
        game=events[i](game);
    events=[];
    return game;
}

// function matchFunction(ctx){
//     return function(tiles,player){
//         initMatch(ctx,tiles,player)
//     };
// };

function matchFunction(ctx){
    return function(tiles,player){
        events.push(function(game){
            game.terminate=true;
            game.nextState=function(ctx){
                //console.log("call match");
                initMatch(ctx,tiles,player)
            };
            return game;
        });};}

function gameloop (game,eval,draw,ctx,time,dt){
    var date,wait,end,start = new Date();
    var inputs = getInputs();
    game = eval(game,inputs,ctx,dt);
    if(game.terminate){
        game.cleanup();
        game.nextState(ctx);
        return -1;
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

function updateCamera(game,pos){
    return mouseCameraAlt(game,pos);
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
    //console.log("open socket")
}

function closeSocket(){
    websocketClose();
    forumButton.toggleConnection=true;
    //button = document.getElementById("sockCon");
    //button.innerHTML="<button type='button' onclick='openSocket();'>Open Connection </button>"
}
