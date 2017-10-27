function contextPos (x,y){
    return {x:x,y:y};
}

function contextMoveKeys (){
    return {keys:[]};
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

function contextDraw (shape,strokeColour,radius,r,g,b,k,w){
    return {shape:shape,
            damageDt:200,
            timeDamage:0,
            damageFlag:false,
            damage:"yellow",
            strokeColour:strokeColour,
            radius:radius,
            colour:"black",
            r=r,
            g=g,
            b=b,
            k=k,
            w=w};
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

function contextAlive(alive){
    return {alive:alive};
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


function contextBackgroundBox (colour,hColour,stroke,hStroke,
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

function contextHoverEvent(fun){
    return {fun:fun};
}

function contextLoadMenu(){
    return {};
}

function contextLoadingScreen(){
    return {};
}

function contextMatch(){
    return {};
}

function contextColour(colour){
    return{colour:colour};
}

function colourOptions(opt1,opt2,opt3,opt4,opt5){
    // opt
    return{red:opt1,blue2:opt2,green:opt3,
           yellow:opt4,black:opt5}
}

function contextHealth(health){
    return{health:health,max:health};
}

function contextPower(red,blue,green){
    return {red:red,blue:blue,green:green,max:10};
}

function contextPowerBuildUp(dt){
    var date = new Date;
    return {list:[],time:date.getTime(),dt:dt};
}

function contextTeam(team){
    return {team:team};
}

function contextDamage(damage){
    return {damage:damage};
}

function contextMatchlist(){
    return {};
}
