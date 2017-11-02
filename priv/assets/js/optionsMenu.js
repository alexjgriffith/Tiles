/*
Add options for colours;
Zoe was not impressed by the default rgb

Colours needed to replace
red, green, blue, black, white

1. Expand DRAW context to include rgbkw and replace all draw contexts
2. Identify all draw options and have them utilize the appropriate
   draw colours
3. Add colour option to options menu


A draw queue may be a better option than what we have currently

rather than calling draw functions directly you will push shapes
dimensions and colours to a draw queue, which is colour aware,
rather than having these spread all over the code base

eg
"circle" 100 100 50 "colourA"
draws a simple circle, red is mapped to whichever colour the user
has selected for colourA
each of these will be systems, called in the draw cycle,
these systems can be kept seperate from the main body of systems
eg drawCircle -> in drawlibrary
drawPlayer ~> drawCircle + drawCircle + drawTriangle + drawArch + drawArch + draw Arch
-> in Player or Global set of systems

// slots available is broken
*/

// This will be the pilot for the new view plugin format
function OptionsMenu (ces){
    var buttons =[];
    var state = null;

    function createButton(text,x,y,w,h,font,hFont,tColour,bgColour,event,hEvent){
        var temp = ces.addEnt();
        ces.addContext(temp,"text",[text,text,font,hFont,tColour,tColour]);
        ces.addContext(temp,"backgroundBox",[bgColour,bgColour,null,"black",null,5]);
        ces.addContext(temp,"boundingBox",[w,h]);
        ces.addContext(temp,"event",[event]);
        ces.addContext(temp,"hoverEvent",[hEvent]);
        ces.addContext(temp,"hovered",[false]);
        ces.addContext(temp,"pos",[x,y]);
        ces.addContext(temp,"optionsMenu",[]);
        return temp;
    }

    function quickButton(text,event,hEvent,index,total){
        var font = "30px Impact";
        var hFont = "40px Impact";
        var y = 150+index*60;
        createButton(text,400,y,300,50,font,hFont,"white","blue",event,hEvent)
    }

    function confirmButtons(){
        buttons.map(function(x){
            x.push(buttons.length);
            quickButton.apply(undefined,x);
        });
    }

    function addButton(text,event,hevent){
        buttons.push([text,event,hevent,buttons.length])
    }

    function clear(){
        // console.log("clearing options menu")
        var ents = ces.alle("optionsMenu");
        for(i in ents){
            ces.removeEnt(ents[i]);
        }
        buttons=[]
    }

    function selectColoursHover (){
        events.push(function(game){
            game.note="Change Colour Scheme";
            return game;});
    }

    function selectColourEvent(params){
        events.push(function(game){
            game.nextState=coloursMenu;
            game.terminate=true;
            return game;})
    }
    // required
    function init (ctx,params){
        var state;
        var time = (new Date).getTime();

        addButton("Colours",selectColourEvent,selectColoursHover);
        addButton("Controls",pass1,notImplementedHover);
        addButton("Network",pass1,notImplementedHover);
        addButton("Button4",pass1,notImplementedHover);
        confirmButtons();
        state = {terminate:false,
                 type:"optionsMenu",
                 params:params,
                 nextState:loadMenu,
                 cleanup:clear,
                 matches:{number:0,
                          list:{}},
                 note:""}
        gameloop(state,eval,draw,ctx,time,frames);
    }

    function eval(state,inputs,ctx,dt){
        var click =inputs.click;
        var mouse =inputs.pos;
        // add matchlistEscapeFunction to the global engine
        inputs=escape(inputs,escapeCallback(loadMenu));
        updateButtons(mouse,click,[null]);
        if(events.length==0)
            state.note="";
        state = checkForEvents(state);
        return state;
    }

    function draw(state,ctx){
        var findColour = findColourGen(state.params.colours)
        ctx.fillStyle=findColour("red");
        ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.fillStyle=findColour("green");
        ctx.fillRect(0,ctx.canvas.height*7/8,
                 ctx.canvas.width,ctx.canvas.height*1/8);
        // Header
        ctx.fillStyle=findColour("black");
        ctx.font = "60px Impact";
        ctx.textBaseline ="middle";
        ctx.textAlign ="center";
        ctx.fillText("Options",ctx.canvas.width/2,ctx.canvas.height*0.1);

        // Footer
        ctx.fillStyle=findColour("black");
        ctx.font = "30px Impact";
        ctx.textAlign ="center";
        ctx.fillText(state.note,ctx.canvas.width/2,ctx.canvas.height*15/16);


        drawAlphaLogo(ctx,findColour);
        drawButtons(ctx,menu.params.colours);
    }

    return init;
};
