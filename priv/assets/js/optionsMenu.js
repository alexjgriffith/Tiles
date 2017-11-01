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
