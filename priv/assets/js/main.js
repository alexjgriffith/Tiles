var frames = 1000 / 60;
var mouse={pos:{x:null,y:null},click:null};
var keys = {moves:[],actions:[]};

function main(){
    var canvas,context,game,date;
    var x=500,y=500;
    document.getElementById("mainGame").innerHTML="<canvas id='gameCanvas' width='"+x+"' height='"+y+"' tabindex='1'></canvas>";
    context = document.getElementById("gameCanvas").getContext("2d");
    websocketOpen(function(){initialize(x,y,context);});

}

function gameloop (game,ctx,time,dt){
    var date,wait,end,start = new Date();
    var inputs = getInputs();
    game = eval(game,inputs,ctx,dt);
    draw(game,ctx);
    end = new Date();
    wait = end.getTime() - start.getTime();
    if(wait < frames){
        setTimeout(function(){
            var date = new Date();
            window.requestAnimationFrame(function() {
                gameloop(game,ctx,date.getTime(),date.getTime()-time )});
        }, frames - wait)
    }
    else {
        date = new Date();
        window.requestAnimationFrame(function(){
            gameloop(game,ctx,date.getTime(),date.getTime()-time)});
    }
}

function genTiles(x,y,px,py){
    var tiles = new Array(x);
    var temp;
    var types = ["grass","earth","water"];
    for (var i = 0; i < x; i++){
        temp = new Array(y);
        for (var j = 0; j < x; j++){
            temp[j]={pos: {x:i*px,y:j*py},
                     outline: "black",
                     //type:types[2]}
                     type:types[Math.floor(Math.random()*3)]}
        }
        tiles[i]=temp;
    }
    return tiles;
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
    var actions = {32:{name:"shoot",val:true}};
    if(moves.hasOwnProperty(event.keyCode)){
        if(state=="down" && ! keys.moves.includes(moves[event.keyCode])){
            keys.moves.push(moves[event.keyCode])
        }
        if(state=="up"){
            keys.moves = keys.moves.filter(function(x)
                                     {return x!=
                                      moves[event.keyCode]})
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

function initialize(x,y,ctx){
    var game;
    var date;
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
    placeObject(500,500);
    placeObject(300,300);
    definePlayer();
    defineOtherPlayer("red",1100,200,"simpleAI",[0.05])
    defineOtherPlayer("blue",1000,100,"simpleAI",[0.05])
    defineOtherPlayer("blue",1000,100,"simpleAI",[0.05])
    defineOtherPlayer("blue",100,1000,"simpleAI",[0.05])
    defineOtherPlayer("green",700,900,"simpleAI",[0.05])
    defineOtherPlayer("blue",100,100,"simpleAI",[0.05])
    defineOtherPlayer("blue",520,500,"simpleAI",[0.001])
    defineOtherPlayer("green",700,670,"simpleAI",[0.01])
    defineOtherPlayer("green",250,200,"simpleAI",[0.1])
    game = {
        version:"0.1",
        fps:[30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30],
            highlight: null,
            tiles:genTiles(20,20,75,75),
            tileSize:{x:75,y:75},
            camera:{x:0,y:0},
            types:{grass:{colour:"green"},
                   earth:{colour:"red"},
                   water:{colour:"blue"}},
            dim:{x:x,y:y},
            ces:c2e
           }
    game.grid = fullGridDraw(game);
    game.range = {x:game.tiles.length*game.tileSize.x,
                  y:game.tiles[0].length*game.tileSize.y}

    defineBoundBox(game.range.x,game.range.y)
    var date = new Date;
    gameloop(game,ctx,date.getTime(),frames);
}

function getInputs(){
    var ret = Object.assign({},mouse);
    mouse.click = null;
    ret.keydown=keys;
    return ret;
}

function eval(game,inputs,ctx, dt){
    var ts = game.tileSize;
    var dim = game.dim;
    var xmax = Math.floor(game.dim.x / ts.x);
    var ymax = Math.floor(game.dim.y / ts.y);
    var highlight ={x: Math.floor((inputs.pos.x +game.camera.x)/ts.x),
                    y: Math.floor((inputs.pos.y + game.camera.y)/ts.y)
                   }
    var offset ={x:game.camera.x % ts.x,
                 y:game.camera.y % ts.y

                }
    var click =inputs.click;
    var index = null ;
    var pelem;
    game.fps.push(dt);
    game.fps.shift();
    var fps = game.fps.reduce(function(a,b){return a+b})/
        game.fps.length;
    if(click != null ){
        index = {x:Math.floor((click.x+game.camera.x)/ts.x),
                 y:Math.floor((click.y+game.camera.y)/ts.y)};
        console.log(game.tiles[index.x][index.y].pos)
        clickCreateExplosion((click.x+game.camera.x),
                              (click.y+game.camera.y));
    }
    playerUpdateDirection(mouse,game.camera);
    game.highlight=highlight;

    if (inputs.keydown.actions.filter(function(x){
        return x.name=="shoot" && x.val==true}).length >0){
        console.log("shoot")
        inputs.keydown.actions=
            inputs.keydown.actions.map(
                function(x){
                    if(x.name=="shoot") {x.val=false}; return x;})
        playerCreateBullet();
    }

    if(inputs.keydown.moves.length>0){
        for(var j in inputs.keydown.moves){
            move(inputs.keydown.moves[j],
                 Math.floor(dt/33.3333*10/inputs.keydown.moves.length))
        }
    }

    pelem = document.getElementById("index");
    pelem.innerHTML="fps: " + Math.round(1000 / fps) + " frames: " + "60";
    runOtherPlayerAI(dt/33.3333)
    updateBullets(dt/33.3333)
    updateExplosions(dt/33.3333)
    testCollision();
    game=updateCamera(game,playerPos());
    updatePP(Date.now());
    return game;
}

var positionPlayer={ptime:Date.now(),pos:[]};

function updatePP(time){
    //playerPos.pos.push(playerPos());
    if(time-positionPlayer.ptime > 100){
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


function draw(game, ctx){
    var type;
    var cam = game.camera;
    var dim = game.dim;
    var ts = game.tileSize;
    var xmax = Math.floor(game.dim.x / ts.x);
    var ymax = Math.floor(game.dim.y / ts.y);
    var tx = Math.floor(game.camera.x / ts.x);
    var ty = Math.floor(game.camera.y / ts.y);
    //ctx.clearRect(0,0,600,400);
    ctx.drawImage(game.grid,game.camera.x,game.camera.y,game.dim.x,game.dim.y,0,0,game.dim.x,game.dim.y,);
    edraw(ctx,game.camera)
    odraw(ctx,game.camera);
    opldraw(ctx,game.camera);
    opdraw(ctx,game.camera);
    pdraw(ctx,game.camera,mouse.pos);
    bdraw(ctx,game.camera)

    if(game.highlight){
        ctx.beginPath();
        ctx.rect(
            game.highlight.x*ts.x-game.camera.x,
            game.highlight.y*ts.y-game.camera.y,
            ts.x,
            ts.y
        );
        ctx.strokeStyle="black";
        ctx.stroke()
    }

    // drawCollider(ctx,playerId,game.camera);
    // drawCollider(ctx,bounds,game.camera);
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
