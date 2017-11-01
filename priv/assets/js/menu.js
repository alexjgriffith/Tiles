// Define button and title element definitions
// Components: Text, Background, BoundingBox, Event, Hovered,Clickable,Pos
// Systems: DrawButton(mpos), ClickButton(click), DrawTitle
// API: DrawAllButtons(), updateButtons(mpos,click)
// Text: Text,Font,Fill, Hover_text,Hover_Fill, Hover_font)
// Background: colour,lineWidth,stroke,line_width_highlight,
//                            colour_highlight,stroke_highlight)
// BoundingBox: wb2,hb2
// Pos
// Event: function
// Hovered:
// Clickable:
//

function matches(body){
    events.push(function(game){
        if(game.type=="menu" || game.type=="matchlist"){
            if(body==null){
                game.matches.number=0;
                game.matches.list={};
                game.nextState=matchlistWrapper(game.matches);
            }
            else{
                game.matches.number=body.length;
                game.matches.list=body;
                game.nextState=matchlistWrapper(game.matches);
            }
        }
        if(game.type=="matchlist"){
            game.updateButtons();

        }
        return game;});
}

function loadMenu (ctx,params){
    var manu;
    var date = new Date;
    if(params==null || params == undefined )
        console.log("Error: Params Not Initializes")

    var match = function(params){
        //console.log("new match")
        //websocketOpen(matchFunction(ctx),params)
        events.push(function(game){game.terminate=true; return game;});
    };
    var signin = function(Param){};
    var about = function(Param){};
    var signinHover = function(){
        events.push(function(game){game.note="Not Implemented"; return game;});
    }
    var matchHover = function(){
        events.push(function(game){
            var time = (new Date).getTime();
            if(game.nextRequest < time){
                match_api("request_matches");
                game.nextRequest = time + game.requestFrequency;
            }
            game.note="Active Matches: "+ game.matches.number;
            return game;})
    }
    var time = (new Date).getTime();
    match_api("request_matches");
    ctx.canvas.style.cursor="crosshair"
    createQuickButton("Join as Guest",match,matchHover,ctx.canvas.width/2,
                      ctx.canvas.height/2+35);
    createQuickButton("Sign In",signin,signinHover,ctx.canvas.width/2,
                      ctx.canvas.height/2+95);
    createQuickButton("Options",about,signinHover,ctx.canvas.width/2,
                      ctx.canvas.height/2+155);
    menu={terminate:false,
          type:"menu",
          params:params,
          //nextState:initLoading,
          nextState:matchlistWrapper({number:0,list:{}}),
          cleanup:clearLoadMenu,
          matches:{number:0,
                   list:{}},
          requestFrequency:1000,
          nextRequest:time,
          note:""};

    //next_state =
    gameloop(menu,meval,mdraw,ctx,date.getTime(),frames);
    //next_state(ctx)
}

function meval(menu,inputs,ctx,dt){
    var click =inputs.click;
    var mouse =inputs.pos;
    updateButtons(mouse,click,[null]);
    if(events.length==0)
        menu.note="";
    menu = checkForEvents(menu);
    return menu;
}

function mdraw(menu,ctx){
    // Background
    ctx.fillStyle="red";
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle="green";
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height/8);
    ctx.fillRect(0,ctx.canvas.height*7/8,ctx.canvas.width,ctx.canvas.height/8);
    // Title
    ctx.fillStyle="black";
    ctx.font = "60px Impact";
    ctx.textBaseline ="middle";
    ctx.textAlign ="center";
    ctx.fillText("Search and Destroy",ctx.canvas.width/2,ctx.canvas.height*0.3);
    ctx.font = "50px Impact";
    ctx.fillText("Colours of Destiny",ctx.canvas.width/2,ctx.canvas.height*0.4);

    ctx.font = "30px Impact";
    ctx.fillText("ALPHA V0.1.0",ctx.canvas.width-100,ctx.canvas.height*15/16);

    ctx.font = "30px Impact";
    ctx.fillText(menu.note,ctx.canvas.width/2,ctx.canvas.height*15/16);

    drawButtons(ctx);
}
