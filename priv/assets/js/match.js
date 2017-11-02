/*
switch all views to require params
*/

function initMatch(ctx,params,tiles,player){
    var game;
    var date;
    var x=ctx.canvas.width,y=ctx.canvas.height;
    //console.log(params);
    if(params==null || params == undefined )
        console.log("Error: Params Not Initializes")
    var findColour;
    ctx.canvas.style.cursor="none"
    //console.log(player);
    definePlayer(player,params.colours);
    var findColour = function(colourIn){ // hack
        var swapColour={red:"team1",blue:"team2",green:"team3",black:"dead",
                        yellow:"hitExp",white:"behind"};

        return params.colours[swapColour[colourIn]];};
    game = {
        type:"match",
        terminate:false,
        nextState:loadMenu,
        params:params,
        cleanup:clearMatch,
        note:"",
        version:"0.1",
        fps:[30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30],
        matches:{number:0,
                 list:{}},
        highlight: null,
        tiles:tiles,
        playerAlive:true,
        tileSize:{x:75,y:75},
        camera:{x:0,y:0},
        types:{grass:{colour:findColour("green")},
               earth:{colour:findColour("red")},
               water:{colour:findColour("blue")}},
        dim:{x:x,y:y},
        ces:c2e // this is how it should be done for the api
    }
    game.grid = fullGridDraw(game);
    game.range = {x:game.tiles.length*game.tileSize.x,
                  y:game.tiles[0].length*game.tileSize.y}

    defineBoundBox(game.range.x,game.range.y)
    createQuickMatchButton("Join New Match",function(x){
        sendExit();
        events.push(function(game){game.terminate=true;
                                   game.nextState=loadMenu;
                                   return game;});
    },
                           pass0,ctx.canvas.width/2,
                           ctx.canvas.height*0.75)
    date = new Date;
    findColour=findColourGen(game.params.colours)
    ctx.fillStyle=findColour("white");
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    gameloop(game,eval,draw,ctx,date.getTime());
}

function keyAction(inputs,action,fun){
    if (inputs.keydown.actions.filter(function(x){
        return x.name==action && x.val==true}).length >0){
        inputs.keydown.actions=
            inputs.keydown.actions.map(
                function(x){
                    if(x.name==action) {x.val=false}; return x;})
        fun()
    }
    return inputs;
}

function escape(inputs,fun){
    return keyAction(inputs,"escape",fun);
}


function matchEscapeFunction(){
    //console.log("escape");
    events.push(function(game ){
        closeSocket();
        game.nextState=loadMenu;
        game.terminate=true;
        return game})
}

function eval(game,inputs,ctx, dt){
    var ts = game.tileSize;
    var dim = game.dim;
    var xmax = Math.floor(game.dim.x / ts.x);
    var ymax = Math.floor(game.dim.y / ts.y);
    var highlight ={x: Math.floor((inputs.pos.x +game.camera.x)/ts.x),
                    y: Math.floor((inputs.pos.y + game.camera.y)/ts.y)};
    var offset ={x:game.camera.x % ts.x,
                 y:game.camera.y % ts.y};
    var click =inputs.click;
    var index = null ;
    var pelem;
    game.fps.push(dt);
    game.fps.shift();
    var fps = game.fps.reduce(function(a,b){return a+b})/
        game.fps.length;

    // if (inputs.keydown.actions.filter(function(x){
    //     return x.name=="escape" && x.val==true}).length >0){
    //     inputs.keydown.actions=
    //         inputs.keydown.actions.map(
    //             function(x){
    //                 if(x.name=="escape") {x.val=false}; return x;})
    //     closeSocket();
    //     console.log("escape");
    //     game.terminate=true;
    // }
    inputs=escape(inputs,matchEscapeFunction);
    if(game.playerAlive){
        if(click != null ){
            index = {x:Math.floor((click.x+game.camera.x)/ts.x),
                     y:Math.floor((click.y+game.camera.y)/ts.y)};
            clickCreateExplosion((click.x+game.camera.x),
                                 (click.y+game.camera.y));
        }
        playerUpdateDirection(mouse,game.camera);
        game.highlight=highlight;

        if (inputs.keydown.actions.filter(function(x){
            return x.name=="shoot" && x.val==true}).length >0){
            inputs.keydown.actions=
                inputs.keydown.actions.map(
                    function(x){
                        if(x.name=="shoot") {x.val=false}; return x;})
            playerCreateBullet();
        }


        if(inputs.keydown.moves.length>0){
            for(var j in inputs.keydown.moves){
                move(inputs.keydown.moves[j],
                     Math.floor(dt/33.3333*10/
                                Math.sqrt(inputs.keydown.moves.length)),
                     playerId)
            }
        }
    }
    //pelem = document.getElementById("index");
    //pelem.innerHTML="fps: " + Math.round(1000 / fps) + " frames: " + "60";
    game.note="fps: " + Math.round(1000 / fps)
    runOtherPlayerAI(dt/33.3333)
    updateBullets(dt/33.3333)
    updateExplosions(dt/33.3333)
    moveOthers(dt/33.3333)
    testCollision();
    //if(game.playerAlive){
        updatePlayer(game.tiles,dt/33.3333);
    //}
    updatePP(Date.now());
    if(game.playerAlive == false){
        updateButtons(inputs.pos,inputs.click,[null]);
    }

    game = checkForEvents(game);
    game=updateCamera(game,playerPos());
    websocketPing();
    return game;
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
    var findColour = findColourGen(game.params.colours)
    //ctx.clearRect(0,0,600,400);
    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(game.grid,game.camera.x,game.camera.y,game.dim.x,game.dim.y,0,0,game.dim.x,game.dim.y);
    edraw(ctx,game.camera)
    odraw(ctx,game.camera);
    bdraw(ctx,game.camera)
    opldraw(ctx,game.camera);
    opdraw(ctx,game.camera);
    pdraw(ctx,game.camera,mouse.pos);

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
    if(game.playerAlive==false){
        ctx.canvas.style.cursor="crosshair"
        ctx.fillStyle=findColour("red");
        ctx.fillRect(200,0,ctx.canvas.width-400,ctx.canvas.height);
        //ctx.fillRect(80,0,ctx.canvas.width-160,ctx.canvas.height);
        // Title
        ctx.fillStyle=findColour("black");
        ctx.font = "40px Impact";
        ctx.textBaseline ="middle";
        ctx.textAlign ="center";
        ctx.fillText("Search and Destroy",ctx.canvas.width/2,ctx.canvas.height*0.1);
        ctx.font = "35px Impact";
        ctx.fillText("Colours of Destiny",ctx.canvas.width/2,ctx.canvas.height*0.2);
        // Title
        ctx.fillStyle=findColour("black");
        ctx.font = "60px Impact";
        ctx.textBaseline ="middle";
        ctx.textAlign ="center";
        ctx.fillText("Ship Down",ctx.canvas.width/2,ctx.canvas.height*0.5);
        drawButtons(ctx,game.params.colours);
    }
    drawFPS(ctx,game.note,findColour);
    drawAlphaLogo(ctx,findColour);
}

function drawFPS(ctx,note,findColour){
    ctx.fillStyle=findColour("black");
    ctx.textBaseline ="middle";
    ctx.textAlign ="center";
    ctx.font = "20px Impact";
    ctx.fillText(note,ctx.canvas.width-50,ctx.canvas.height*1/16);
}


function updatePP(time){
    if(time-positionPlayer.ptime > 1000){
        sendPlayerPos();
        positionPlayer.ptime=time;
    }
}
