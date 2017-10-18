function contextPos (x,y){
    return {x:x,y:y};
}

function contextId (id){
    return {id:id};
}

function contextVelocity (x,y){
    return {x:x,y:y};
}

function contextBullet(team,range,start){
    return {team:team,range:range,start:start};
}

function contextDraw (shape,fillColour,strokeColour, radius){
    return {shape:shape,
            fillColour:fillColour,
            strokeColour:strokeColour,
            radius:radius};
}

function contextDirection(x,y){
    return {x:x,y:y};
}

function contextRectCollider (x,y,inverted,moveable,mass,event){
    return {x:x,y:y,inverted:inverted,moveable:moveable,mass:mass,event:event};
}

function contextPlayer (){
    return {};
}

function alive(state){
    return {state:state};
}

function contextCircle(radius){
    return {radius:radius};
}

function contextExplosion(team,finalRadius){
    return {team:team,finalRadius:finalRadius};
}

function contextExpanding(rate){
    return {rate:rate}
}

function contextOtherPlayer (){
    return {};
}

function contextOtherPlayerLive (){
    return {};
}

function contextSimpleAI (lrp){
    // VERY SIMPLY logic
    return {lrp:lrp,dir:-1};
}

function contextRemoteInput (x,y,signal,maxCol){
    // x and y should be vectors that will
    // allow for better interpolation
    return {x:x,y:y,signal:signal};
}

function contextText (text,hText,font,hFont,colour,hColour){
    // x and y should be vectors that will
    // allow for better interpolation
    return {text:text,hText:hText,
            font:font,hFont:hFont,
            colour:colour,
            hColour:hColour};
}


function contextBackgroundBox (colour,hColour,stroke,strokeHighlight,
                               lineWidth,hLineWidth){
    // x and y should be vectors that will
    // allow for better interpolation
    return {colour:colour,
            hColour:hColour,
            stroke:stroke,
            hStroke:hStroke,
            lineWidth:lineWidth,
            hLineWidth:hLineWidth};
}

function contextBoundingBox(w,h){
    return {w:w,h:h};
}

function contextHovered(state){
    return {state:state};
}

function contextEvent(fun){
    return {fun:fun};
}
