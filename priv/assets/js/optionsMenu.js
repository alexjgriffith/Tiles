/*
Add options for colours;
Zoe was not impressed by the default rgb

Colours needed to replace
red, green, blue, black, white

1. Expand DRAW context to include rgbkw and replace all draw contexts
2. Identify all draw options and have them utilize the appropriate
   draw colours
3. Add colour option to options menu

*/

function initOptionMenu(ctx){
    var game;
    var time = (new Date).getTime();

    // Initialize Elements in CES
    optionButton=newOptionButton(ctx,300,50,10);
    optionButton("Select Colours",colourEvent,colourHover);

    gameloop(game,evalOptoinMenu,drawOptionMenu,ctx,date.getTime(),frames);
}

function evalOptionMenu(game,inputs,ctx,dt){

}

function drawOptionMenu(game,ctx){

}
