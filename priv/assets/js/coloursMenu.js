function ColoursMenu (ces){
    var state = null;
    function createButton(x,y,w,h,colours,event,hEvent){
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

    function makeButton(ctx,index,count,colours,event,hEvent){
        var width = ctx.canvas.width*13/32;
        var offsetY = ctx.canvas.height*2/8-10;
        var offsetX = ctx.canvas.width*2/32;
        var buff = 10;
        var height = (ctx.canvas.height*5/8 - 30 - buff*count)/count;
        createButton(offsetX+width/2,
                     offsetY+height*index+buff*index+height/2,
                     width,height,colours,event,hEvent)

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
        event = function(params){
            events.push(function(game){
                game.nextState=loadMenu;
                game.params.colours=colours
                game.terminate=true;
                return game;})
        };
        high = function(params){
            events.push(function(game){
                game.note=name;
                game.params.colours=colours
                return game;})
        };
        return [event,high];
    }

    function defaultColours(params){
        var colours={team1:"red",team2:"blue",team3:"green",
                     dead:"black",pointer:"black",hitExp:"yellow",
                     accent:"yellow",behind:"white"}
        events.push(function(game){
            game.nextState=loadMenu;
            game.params.colours=colours
            game.terminate=true;
            return game;})
    }
    function defaultColoursHover(params){
        var colours={team1:"red",team2:"blue",team3:"green",
                     dead:"black",pointer:"black",hitExp:"yellow",
                     accent:"yellow",behind:"white"}
        events.push(function(game){
            game.note="\"Default\"";
            game.params.colours=colours
            return game;})
    }
    function newColours(params){
        var colours={team1:"#fb6542",team2:"#375e97",team3:"#3f681c",
                     dead:"black",pointer:"black",hitExp:"#ffbb00",
                     accent:"#ffbb00",behind:"white"}
        events.push(function(game){
            game.nextState=loadMenu;
            game.params.colours=colours
            game.terminate=true;
            return game;})
    }

    function newColoursHover(params){
        var colours={team1:"#fb6542",team2:"#375e97",team3:"#3f681c",
                     dead:"black",pointer:"black",hitExp:"#ffbb00",
                     accent:"#ffbb00",behind:"white"}
        events.push(function(game){
            game.note="\"Watermelon Lagoon\"";
            game.params.colours=colours
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
                 matches:{number:0,
                          list:{}},
                 note:""}
        // Replace these with pallet gen from the server
        makeButton(ctx,1,3,["#fb6542","#3f681c","#375e97","#ffbb00"],
                   newColours,newColoursHover)
        makeButton(ctx,0,3,["red","green","blue","yellow"],
                   defaultColours,defaultColoursHover)
        var pallet1 ={team1:"#F0A830",
                      team2:"#5E412F",
                      team3:"#78C0A8",
                      dead:"#332E2C",
                      pointer:"#332E2C",
                      hitExp:"#F07818",
                      accent:"#F07818",
                      behind:"#FCEBB6"}
        var e1,e2;
        // &euml; \xEB
        [e1,e2]=addPallet(pallet1,"\"ZO\xCB M1\"");
        makeButton(ctx,2,3,["#F0A830","#78C0A8","#5E412F","#F07818",
                            "#332E2C","#FCEBB6"],e1,e2);

        gameloop(state,eval,draw,ctx,time,frames);
    }

    function eval(state,inputs,ctx,dt){
        var click =inputs.click;
        var mouse =inputs.pos;
        inputs=escape(inputs,escapeCallback(optionsMenu));
        updateButtons(mouse,click,[null]);
        if(events.length==0)
            state.note="";
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

        // Header
        ctx.fillStyle=findColour("black");
        ctx.font = "60px Impact";
        ctx.textBaseline ="middle";
        ctx.textAlign ="center";
        ctx.fillText("Select Colours to Continue",ctx.canvas.width/2,ctx.canvas.height*0.1);

        // footer
        ctx.fillStyle=findColour("black");
        ctx.font = "30px Impact";
        ctx.textBaseline ="middle";
        ctx.textAlign ="center";
        ctx.fillText(state.note,ctx.canvas.width/2,ctx.canvas.height*15/16);

        drawAlphaLogo(ctx,findColour);
        drawColouredButtons(ctx);
    }

    return init;
};
