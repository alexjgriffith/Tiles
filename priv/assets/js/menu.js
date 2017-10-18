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

function loadMenu (ctx,matchFunction){
    var date = new Date;
    ctx.canvas.style.cursor="crosshair"
    menu={
        terminate:false,
        startMatch:function(params){websocketOpen(matchFunction,params);},
        join:{hover:false},
        signin:{hover:false}
    };

    gameloop(menu,meval,mdraw,ctx,date.getTime(),frames);
}

function meval(menu,inputs,ctx,dt){
    var click =inputs.click;
    var mouse =inputs.pos;
    var buttonRange = {xmin:ctx.canvas.width/2-150,
                        ymin:ctx.canvas.height/2+15,
                       xrange:300,
                       yrange:50};
    var signinRange = {xmin:ctx.canvas.width/2-150,
                       ymin:ctx.canvas.height/2+75,
                       xrange:300,
                       yrange:50};

    within = function(l,range){
        var x = l.x;
        var y = l.y;
        var xmin = range.xmin;
        var xrange = range.xrange;
        var ymin = range.ymin;
        var yrange = range.yrange;
        return (x>xmin && x<(xmin+xrange) && y>ymin && y<(ymin+yrange));
    };
    if (within(mouse,buttonRange)){
        menu.join.hover=true;
    }
    else{
        menu.join.hover=false;
    }
    if (within(mouse,signinRange)){
        menu.signin.hover=true
    }
    else{
        menu.signin.hover=false;
    }

    if(click != null ){
        if (within(click,buttonRange)){
            menu.startMatch(0);
            menu.terminate=true;
        }

        index = {x:click.x,
                 y:click.y};
        console.log(click.x,click.y)
    }
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
    ctx.font = "50px Impact";
    ctx.textAlign ="center";
    ctx.fillText("Search and Destroy",ctx.canvas.width/2,ctx.canvas.height/2);
    // Join as Guest
    ctx.fillStyle="blue";
    ctx.fillRect(ctx.canvas.width/2-150,ctx.canvas.height/2+15,
                 300,50);
    // ContinueBB
    if (menu.join.hover){
        ctx.strokeStyle="black";
        ctx.lineWidth=5;
        ctx.strokeRect(ctx.canvas.width/2-150,ctx.canvas.height/2+15,
                       300,50);
        ctx.fillStyle="White";

        ctx.font = "40px Impact";
        ctx.textAlign ="center";
        ctx.fillText("Join as Guest",ctx.canvas.width/2,ctx.canvas.height/2+55);

    }
    else{
        ctx.fillStyle="White";
        ctx.font = "30px Impact";
        ctx.textAlign ="center";
        ctx.fillText("Join as Guest",ctx.canvas.width/2,ctx.canvas.height/2+50);
    }
    // Sign In
    ctx.fillStyle="blue";
    ctx.fillRect(ctx.canvas.width/2-150,ctx.canvas.height/2+75,
                 300,50);

    if (menu.signin.hover){
        ctx.strokeStyle="black";
        ctx.lineWidth=5;
        ctx.strokeRect(ctx.canvas.width/2-150,ctx.canvas.height/2+75,
                       300,50);
        ctx.fillStyle="White";
        ctx.font = "40px Impact";
        ctx.textAlign ="center";
        ctx.fillText("Sign in",ctx.canvas.width/2,ctx.canvas.height/2+115);

    }
    else{
        ctx.fillStyle="white";
        ctx.font = "30px Impact";
        ctx.textAlign ="center";
        ctx.fillText("Sign in",ctx.canvas.width/2,ctx.canvas.height/2+110);
    }
}
