function initMatch(ctx,player,tiles){
    var game;
    var date;
    var x=ctx.canvas.width,y=ctx.canvas.height;
    ctx.canvas.style.cursor="none"
    console.log(player);
    definePlayer(player);
    game = {
        terminate:false,
        version:"0.1",
        fps:[30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30,
             30,30,30,30,30,30,30,30,30,30],
            highlight: null,
            tiles:tiles,
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
    date = new Date;
    gameloop(game,eval,draw,ctx,date.getTime(),frames);
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
        inputs.keydown.actions=
            inputs.keydown.actions.map(
                function(x){
                    if(x.name=="shoot") {x.val=false}; return x;})
        playerCreateBullet();
    }

    if (inputs.keydown.actions.filter(function(x){
        return x.name=="escape" && x.val==true}).length >0){
        inputs.keydown.actions=
            inputs.keydown.actions.map(
                function(x){
                    if(x.name=="escape") {x.val=false}; return x;})
        closeSocket();
        console.log("escape");
        game.terminate=true;
    }

    if(inputs.keydown.moves.length>0){
        for(var j in inputs.keydown.moves){
            move(inputs.keydown.moves[j],
                 Math.floor(dt/33.3333*10/inputs.keydown.moves.length))
        }
    }
    if(game.terminate==true){
        loadMenu(ctx,matchFunction(ctx))

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
}
