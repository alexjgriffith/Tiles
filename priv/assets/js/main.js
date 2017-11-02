var frames = 1000 / 60;
var mouse={pos:{x:null,y:null},click:null};
var keys = {moves:[],actions:[]};
var positionPlayer={ptime:Date.now(),pos:[]};
var forumButton={toggleConnection:false};
var events=[];

function main(){
    var x=800,y=600;
    var ctx,colours,findColour;
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

    var colSets =[[["red","green","blue","yellow","black","white"],
                   "\"Default\""],
                  [["#fb6542","#3f681c","#375e97","#ffbb00",
                    "black","white"],"\"Watermelon Lagoon\""],
                  [["#F0A830","#78C0A8","#5E412F","#F07818",
                    "#332E2C","#FCEBB6"],"\"ZO\xCB M1\""],
                  [["#ae6e38","#e3c66a","#636ea3","#8ab4ba",
                    "black","#fbfbfb"],"\"Muddy Beach\""],
                  [["#a67b7b","#819d74","#6f8995","#7d7184",
                    "black","#c6bb85"],"\"Not Quite Pastel\""],
                  [["#009e73","#cc79a7","#0072b2","#d55e00","black",
                    "#f0e442"],"\"Oi Vey\""],
                  [["#4daf4a","#984ea3","#377eb8","#ff7f00","black",
                    "#f0e442"],"\"High Contra\""]
                 ];
    var index = Math.floor(Math.random()*colSets.length);
    coloursMenu= ColoursMenu(c2e,{colourOptions:colSets})
    params={_atest:"",
            colours:pallet2colours(colSets[index][0]),
            colourName:colSets[index][1]};
    //loadMenu(ctx,params);
    //optionsMenu(ctx,params);
    coloursMenu(ctx,params);



    //document.getElementById("mainGame").appendChild(grid);
}


function pallet2colours(colours){
    var pallet ={team1:colours[0],
                 team2:colours[2],
                 team3:colours[1],
                 dead:colours[4],
                 pointer:colours[4],
                 hitExp:colours[3],
                 accent:colours[3],
                 behind:colours[5]}
    var colours={team1:"red",team2:"blue",team3:"green",
                 dead:"black",pointer:"black",hitExp:"yellow",
                 accent:"yellow",behind:"white"}
    var keys = Object.keys(pallet);
    for(var i in keys){
        colours[keys[i]]=pallet[keys[i]];
    }
    return colours;
}

function checkForEvents(game){
    for(var i in events)
        game=events[i](game);
    events=[];
    return game;
}


// For the most part these can be shared in a new gen object
function escapeCallback(nextState){
    return function(){
        events.push(function(game ){
            game.nextState=nextState;
            game.terminate=true;
            return game})}
}

function findColourGen(colours){
    return function(colourIn){
        var swapColour={red:"team1",blue:"team2",green:"team3",black:"dead",
                        yellow:"hitExp",white:"behind"};
        return colours[swapColour[colourIn]];
    }
};

function drawAlphaLogo(ctx,findColour){
    ctx.fillStyle=findColour("black");
    ctx.textBaseline ="middle";
    ctx.textAlign ="center";
    ctx.font = "30px Impact";
    ctx.fillText("ALPHA V0.1.1",ctx.canvas.width-100,ctx.canvas.height*15/16);
}


var notImplementedHover = function(){
    events.push(function(game){game.note="Not Implemented"; return game;});
}

// function matchFunction(ctx){
//     return function(tiles,player){
//         initMatch(ctx,tiles,player)
//     };
// };

function matchFunction(ctx,params){
    return function(player,tiles){
        events.push(function(game){
            game.terminate=true;
            game.nextState=function(ctx,params){
                //console.log("call match");
                initMatch(ctx,params,tiles,player);
            };
            return game;
        });};}

function gameloop (game,eval,draw,ctx,time,dt){
    var date,wait,end,start = new Date();
    var inputs = getInputs();
    game = eval(game,inputs,ctx,dt);
    if(game.terminate){
        game.cleanup();
        game.nextState(ctx,game.params);
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
