function ColoursMenu (ces,initParams){
    var state = null;
    function makeGrid(x,y,d){
        var tiles=[];
        var colours=["red","blue","green"];
        for(var i=0; i<Math.floor(x/d); i++){
            tiles.push([]);
            for(var j =0; j< Math.floor(y/d); j++)
                tiles[i].push(colours[Math.floor(Math.random()*3)])
        }
        var game={
            tileSize:{x:d,y:d},
            tiles:tiles
        };
        return game;
    }

    // only for small tile sets
    function drawTiles(ctx,game,colours){
        var ts = game.tileSize;
        var ntile = {x:game.tiles.length,y:game.tiles[0].length}
        var findColour = findColourGen(colours);
        //ctx.canvas.width = ntile.x*ts.x;
        //ctx.canvas.height = ntile.y*ts.y;
        var offX =ctx.canvas.width * 18/32

        var offY =ctx.canvas.height * 2/8-15
        for(var i = 0; i < ntile.x; i++){
            for(var j = 0; j < ntile.y; j++){
                ctx.beginPath();
                ctx.rect(i*ts.x+offX,j*ts.y+offY,ts.x,ts.y);
                ctx.fillStyle= findColour(game.tiles[i][j]);
                ctx.fill();
            }
        }

    }

    function makeButton(ctx,x,y,w,text,event,hEvent){
        var font = "30px Impact";
        var hFont = "40px Impact";
        var h = 50
        var tColour="white"
        var bgColour="blue"
        var temp = ces.addEnt();
        ces.addContext(temp,"text",[text,text,font,hFont,tColour,tColour]);
        ces.addContext(temp,"backgroundBox",
                       [bgColour,bgColour,null,"black",null,5]);
        ces.addContext(temp,"boundingBox",[w,h]);
        ces.addContext(temp,"event",[event]);
        ces.addContext(temp,"hoverEvent",[hEvent]);
        ces.addContext(temp,"hovered",[false]);
        ces.addContext(temp,"pos",[x,y]);
        ces.addContext(temp,"optionsMenu",[]);
        return temp;

    }

    function makeColourButton(ctx,index,count,colours,event,hEvent){
        var w = ctx.canvas.width*13/32;
        var offsetY = ctx.canvas.height*2/8-10;
        var offsetX = ctx.canvas.width*2/32;
        var buff = 10;
        var h = (ctx.canvas.height*5/8 - 30 - buff*count)/count;
        var x = offsetX+w/2;
        var y =offsetY+h*index+buff*index+h/2;
        var temp = ces.addEnt();
        ces.addContext(temp,"colouredBackgroundBox",[colours,
                                                    colours,
                                                    null,"black",null,5]);
        ces.addContext(temp,"boundingBox",[w,h]);
        ces.addContext(temp,"event",[event]);
        ces.addContext(temp,"hoverEvent",[hEvent]);
        ces.addContext(temp,"hovered",[false]);
        ces.addContext(temp,"pos",[x,y]);
        ces.addContext(temp,"optionsMenu",[]);
        return temp;
    }

    function clear(){
        var ents = ces.alle("optionsMenu");
        for(i in ents){
            ces.removeEnt(ents[i]);
        }
    }

    function addPallet(pallet,name){
        var event,high;
        var colours={team1:"red",team2:"blue",team3:"green",
                     dead:"black",pointer:"black",hitExp:"yellow",
                     accent:"yellow",behind:"white"}
        var keys = Object.keys(pallet);
        for(var i in keys){
            colours[keys[i]]=pallet[keys[i]];
        }
        //var colours=palletToColours(pallet);
        event = function(params){
            events.push(function(game){
                game.nextState=loadMenu;
                game.params.colours=colours
                game.params.colourName=name
                game.terminate=true;
                return game;})
        };
        high = function(params){
            events.push(function(game){
                game.note=name;
                game.params.colours=colours
                game.params.colourName=name
                return game;})
        };
        return [event,high];
    }

    //ColourListsToButton
    function c2b(ctx,colours,name,index,count){
        var pallet ={team1:colours[0],
                      team2:colours[2],
                      team3:colours[1],
                      dead:colours[4],
                      pointer:colours[4],
                      hitExp:colours[3],
                      accent:colours[3],
                      behind:colours[5]}
        var e,e1,e2;
        e=addPallet(pallet,name);
        e1=e[0];
        e2=e[1];
        makeColourButton(ctx,index,count,colours,e1,e2);
    }
    function backHover() {
        events.push(function(game){
             return game;});
    }
    function backEvent (params){
        events.push(function(game){
            game.nextState=loadMenu;
            game.terminate=true;
            return game;})
    }
    // required
    function init (ctx,params){
        var state;
        var time = (new Date).getTime();
        state = {terminate:false,
                 type:"coloursMenu",
                 params:params,
                 nextState:loadMenu,
                 cleanup:clear,
                 tiles:makeGrid(300,300,75),
                 matches:{number:0,
                          list:{}},
                 pnote:params.colourName,
                 note:params.colourName}

        // Replace these with pallet gen from the server
        var options = initParams.colourOptions;
        var n =options.length;
        for(var i in options)
            c2b(ctx,options[i][0],options[i][1],i,n)
        //addButton(ctx,"Back to Menu",pass1,notImplementedHover)
        makeButton(ctx,
                   ctx.canvas.width*24/32,
                   ctx.canvas.height*7/8 -60,
                   300,"Continue",backEvent,backHover)

        gameloop(state,eval,draw,ctx,time,frames);
    }

    function eval(state,inputs,ctx,dt){
        var click =inputs.click;
        var mouse =inputs.pos;
        inputs=escape(inputs,escapeCallback(optionsMenu));
        updateButtons(mouse,click,[null]);
        if(events.length==0)
            state.note=state.params.colourName;
        if(state.note!=state.pnote)
            state.tiles=makeGrid(300,300,75);
        state.pnote=state.note;
        state = checkForEvents(state);
        return state;
    }

    function draw(state,ctx){
        var findColour = findColourGen(state.params.colours)
        // background
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle=findColour("red");
        ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.fillStyle=findColour("green");
        ctx.fillRect(0,ctx.canvas.height*7/8,
                     ctx.canvas.width,ctx.canvas.height*1/8);


        ctx.fillStyle=findColour("white");
        ctx.fillRect(ctx.canvas.width*1/32,ctx.canvas.height*2/8-25,
                     ctx.canvas.width*15/32,ctx.canvas.height*5/8);

        ctx.fillStyle=findColour("white");
        ctx.fillRect(ctx.canvas.width*17/32,ctx.canvas.height*2/8-25,
                     ctx.canvas.width*14/32,ctx.canvas.height*5/8);


        // Header
        ctx.fillStyle=findColour("black");
        ctx.font = "60px Impact";
        ctx.textBaseline ="middle";
        ctx.textAlign ="center";
        ctx.fillText("Select Colours",ctx.canvas.width/2,ctx.canvas.height*0.1);

        // footer
        ctx.fillStyle=findColour("black");
        ctx.font = "30px Impact";
        ctx.textBaseline ="middle";
        ctx.textAlign ="center";
        ctx.fillText(state.note,ctx.canvas.width/2,ctx.canvas.height*15/16);

        drawAlphaLogo(ctx,findColour);
        drawColouredButtons(ctx);
        drawButtons(ctx,state.params.colours);
        drawTiles(ctx,state.tiles,state.params.colours)
    }

    return init;
};
