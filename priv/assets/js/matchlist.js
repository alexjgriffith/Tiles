function matchlistWrapper(matches){
    return function(ctx,params) {matchlist(ctx,params,matches)};
}

function matchlist(ctx,params,matches){
    var game;
    var time = (new Date).getTime();
    var matchHover =
        function(index){
            return function(){
                events.push(function(game){
                    var time = (new Date).getTime();
                    var values="0";
                    for(var i in game.matches.list){
                        if(Object.keys(game.matches.list[i])==index){
                            values = Object.values(game.matches.list[i]);}
                    }
                    game.note="Available Slots: "+values;
                    if(game.nextRequest < time){
                        match_api("request_matches");
                        game.nextRequest = time + game.requestFrequency;

                    }
                    return game;})}
    }
    var notImplementedHover = function(){
        events.push(function(game){game.note="Not Implemented"; return game;});
    }

    var match = function (num){
        return function(params){
            events.push(function(game){
                //game.terminate=true
                // need to somehow find out which match
                // we are clocking on
                //params={match:0,name:"Zoë"};
                params.match=num;
                //console.log(num);
                game.nextState=initLoading;
                game.terminate=true;
                //console.log("new match")
                websocketOpen(matchFunction(ctx,game.params),params)
                return game;});
        };}
    var newMatch = function(params){
        events.push(function(game){
            match_api("new_match");
            return game;
        })}
    ctx.canvas.style.cursor="crosshair"
    game={type:"matchlist",
          terminate:false,
          nextState:initLoading,
          params:params,
          cleanup:clearMatchlist,
          matches:matches,
          requestFrequency:5000,
          nextRequest:time,
          updateButtons:function(){
              //console.log("updateButtons")
              clearMatchlist()
              createMatchListButtons(ctx,game.matches,match,matchHover,
                                     newMatch,matchHover);
              createPlayerGrid(ctx,[],pass1,notImplementedHover);
          },
          note:""};
    //console.log(game.matches);

    createPlayerGrid(ctx,[],pass1,notImplementedHover);

    createMatchListButtons(ctx,game.matches,match,matchHover,newMatch,matchHover);
    gameloop(game,matchlisteval,matchlistdraw,ctx,time,frames);
}


function matchlistEscapeFunction(){
    //console.log("escape");
    events.push(function(game ){
        game.nextState=loadMenu;
        game.terminate=true;
        return game})
}

function matchlisteval(game,inputs,ctx,dt){
    var click = inputs.click;
    var mouse = inputs.pos;
    inputs=escape(inputs,matchlistEscapeFunction);
    updateButtons(mouse,click,[{}]);
    if(events.length==0)
        game.note="";
    game = checkForEvents(game);
    return game;
}

function matchlistdraw(game,ctx){
    // Background
    var findColour = findColourGen(game.params.colours)
    ctx.fillStyle=findColour("red");
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle=findColour("green");
    ctx.fillRect(ctx.canvas.width/2,ctx.canvas.height*2/8-25,
                 ctx.canvas.width*15/32,ctx.canvas.height*5/8);

    ctx.fillStyle=findColour("green");
    ctx.fillRect(0,ctx.canvas.height*7/8,
                 ctx.canvas.width,ctx.canvas.height*1/8);
    // Header
    ctx.fillStyle=findColour("black");
    ctx.font = "60px Impact";
    ctx.textBaseline ="middle";
    ctx.textAlign ="center";
    ctx.fillText("Available Matches",ctx.canvas.width/2,ctx.canvas.height*0.1);

    ctx.font = "30px Impact";
    ctx.fillText(game.note,ctx.canvas.width/2,ctx.canvas.height*15/16);

    drawAlphaLogo(ctx,findColour)


    drawButtons(ctx,game.params.colours);
}
