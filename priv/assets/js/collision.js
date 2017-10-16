function collider(ent1,ent2){
    var box1 = ent1.collider;
    var pos1 = ent1.pos
    var box2 = ent2.collider;
    var pos2 = ent2.pos
    var xl = pos1.x - (pos2.x + box2.x)
    var xu = pos2.x - (pos1.x + box1.x)
    var yl = pos1.y - (pos2.y + box2.y)
    var yu = pos2.y - (pos1.y + box1.y)
    return {col:(xl < 0 && xu < 0 && yl < 0 && yu < 0),
            overlap:{xl:xl,xu:xu,yl:yl,yu:yu}};
}

function icollider(ent1,ent2){
    var box1 = ent1.collider;
    var pos1 = ent1.pos
    var box2 = ent2.collider;
    var pos2 = ent2.pos
    var xl = pos1.x - pos2.x
    var xu = (pos2.x + box2.x) - (pos1.x + box1.x)
    var yl = pos1.y - pos2.y
    var yu = (pos2.y + box2.y) - (pos1.y + box1.y)
    return {col:!(xl > 0 && xu > 0 && yl > 0 && yu > 0),
            overlap:{xl:xl,xu:xu,yl:yl,yu:yu}};
}

function systemTriggerCollide(ent1,ent2,event){
    var collide = colldier(ent1,ent2);
    var retvar =[ent1,ent2];
    if(collide)
        retvar = event(ent1,ent2,collide.overlap);
    return retvar;
}

function deathTrigger(ent1,ent2,overlap){
    if(ent1.keys().includes("alive").state){
        ent1.draw.fillColour="black";
    }
    if(ent2.keys().includes("alive").state){
        ent2.draw.fillColour="black";
    }
    return [ent1,ent2];
}

function systemInverseCollide (ent1,ent2){
    var collide = icollider(ent1,ent2);
    var xl=collide.overlap.xl,
        xu=collide.overlap.xu,
        yl=collide.overlap.yl,
        yu=collide.overlap.yu;
    if(collide.col &&  !
       ent2.collider.moveable &&
       ent1.collider.moveable){
        if(xl<0)
            ent1.pos.x-=xl
        else if(xu<0)
            ent1.pos.x+=xu;
        if(yl<0)
            ent1.pos.y-=yl
        else if(yu<0)
            ent1.pos.y+=yu
    }
    return [ent1,ent2];
}

function systemCollide (ent1,ent2){
    var temp;
    var collide = collider(ent1,ent2)
    var xl=collide.overlap.xl,
        xu=collide.overlap.xu,
        yl=collide.overlap.yl,
        yu=collide.overlap.yu;
    if(collide.col){
        if(xl<0 && xl>xu && xl>yl && xl>yu){
            temp = resolveXL(ent1,ent2,xl);
            ent1=temp[0];
            ent2=temp[1];
        }
        else if(xu<0 && xu>xl && xu>yl && xu>yu){
            temp = resolveXU(ent1,ent2,xu);
            ent1=temp[0];
            ent2=temp[1];
        }
        if(yl<0 && yl>xl && yl>xu && yl>yu){
            temp = resolveYL(ent1,ent2,yl);
            ent1=temp[0];
            ent2=temp[1];
        }
        else if(yu<0 && yu>xl && yu>xu && yu>yl){
            temp = resolveYU(ent1,ent2,yu);
            ent1=temp[0];
            ent2=temp[1];
        }
    }
    return [ent1,ent2];
}


function resolveXL (ent1,ent2,dist){
    var tmass = ent1.collider.mass + ent2.collider.mass;
    if(ent1.collider.moveable && ent2.collider.moveable){
        ent1.pos.x -= (dist * ent2.collider.mass / tmass);
        ent2.pos.x += (dist * ent1.collider.mass / tmass);}
    else if (!ent1.collider.moveable )
        ent2.pos.x += dist
    else if (!ent2.collider.moveable )
        ent1.pos.x -= dist
    return [ent1,ent2];
}

function resolveXU (ent1,ent2,dist){
    var tmass = ent1.collider.mass + ent2.collider.mass;
    if(ent1.collider.moveable && ent2.collider.moveable){
        ent1.pos.x += (dist * ent2.collider.mass / tmass);
        ent2.pos.x -= (dist * ent1.collider.mass / tmass);
    }
    else if (!ent1.collider.moveable )
        ent2.pos.x -= dist
    else if (!ent2.collider.moveable )
        ent1.pos.x += dist
    return [ent1,ent2];
}

function resolveYL (ent1,ent2,dist){
    var tmass = ent1.collider.mass + ent2.collider.mass;
    if(ent1.collider.moveable && ent2.collider.moveable){
        ent1.pos.y -= (dist * ent2.collider.mass / tmass);
        ent2.pos.y += (dist * ent1.collider.mass / tmass);
    }
    else if (!ent1.collider.moveable )
        ent2.pos.y += dist
    else if (!ent2.collider.moveable )
        ent1.pos.y -= dist

    return [ent1,ent2];
}

function resolveYU (ent1,ent2,dist){
    var tmass = ent1.collider.mass + ent2.collider.mass;
    if(ent1.collider.moveable && ent2.collider.moveable){
        ent1.pos.y += (dist * ent2.collider.mass / tmass);
        ent2.pos.y -= (dist * ent1.collider.mass / tmass);
    }
    else if (!ent1.collider.moveable )
        ent2.pos.y -= dist
    else if (!ent2.collider.moveable )
        ent1.pos.y += dist

    return [ent1,ent2];
}
