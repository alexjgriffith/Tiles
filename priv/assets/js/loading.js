function initLoading(ctx,params){
    var manu;
    var date = new Date;
    ctx.canvas.style.cursor="none"
    if(params==null || params == undefined )
        console.log("Error: Params Not Initialized")
    menu={
        type:"loading",
        terminate:false,
        params:params,
        matches:{number:0,
                 list:{}},
        nextState:function(){},
        cleanup:clearLoadingScreen,
        note:""};
    gameloop(menu,evalLoading,drawLoading,ctx,date.getTime(),frames);
}

function evalLoading(menu,inputs,ctx,dt){
    menu=checkForEvents(menu);
    return menu
}

function drawLoading(menu,ctx){
    var findColour = findColourGen(menu.params.colours)
    ctx.fillStyle=findColour("red");
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.fillStyle=findColour("green");
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height/8);
    ctx.fillRect(0,ctx.canvas.height*7/8,ctx.canvas.width,ctx.canvas.height/8);
    // Title
    ctx.fillStyle=findColour("black");
    ctx.font = "60px Impact";
    ctx.textBaseline ="middle";
    ctx.textAlign ="center";
    ctx.fillText("Loading ...",ctx.canvas.width/2,ctx.canvas.height*0.5);
    drawAlphaLogo(ctx,findColour);
}
