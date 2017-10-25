function initLoading(ctx){
    var manu;
    var date = new Date;
    ctx.canvas.style.cursor="none"
    //console.log("init loading")
    menu={
        type:"loading",
        terminate:false,
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
    ctx.fillText("Loading ...",ctx.canvas.width/2,ctx.canvas.height*0.5);

    ctx.font = "30px Impact";
    ctx.fillText("ALPHA V0.1.0",ctx.canvas.width-100,ctx.canvas.height*15/16);

}
