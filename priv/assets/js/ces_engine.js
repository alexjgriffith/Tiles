// Engine
function CES() {
    var c2e = {};
    var e2c = {};
    var ents = {};
    var index = 0;
    var systems = {};
    var contexts = {};
    this.viewObj = function(){
        return {c2e:c2e,
                e2c:e2c,
                ents:ents};
    }
    this.addEnt = function(){
        ents[index]={};
        e2c[index]=[];
        index += 1;
        return index-1;
    };
    this.removeEnt = function (index){
        delete ents[index];
        for(var i in e2c[index]){
            c2e[e2c[index][i]] =
                c2e[e2c[index][i]].filter(function(x){return x!=index;})
        }
        delete e2c[index];
    };
    this.addContext = function(index,context,vals){
        var cont = contexts[context].apply(undefined,vals);
        ents[index][context]=cont;
        e2c[index].push(context);
        if(c2e[context] == null){
            c2e[context]=[index];
        }
        else{
            c2e[context].push(index);
        }
    }
    this.removeContext = function(index,context){
        e2c = e2c[index].filter(function(x) {x!=context});
        c2e = c2e[context].filter(function(x){x!=ent})
        delete ents[index][context]
    }
    this.defcontext = function(name,fun){
        contexts[name]=fun;
    }
    this.alle = function(context){
        return c2e[context];
    }
    this.allc = function(ent){
        return ents[ent];
    }
    this.defsystem = function(name,fun,deps){
        // deps need to be contexts
        systems[name]={fun:fun,depends:deps};
    }
    this.applySystem = function(system,index,args){
        var temp;
        if(index.length==1){
            args.reverse().push(ents[index[0]]);
            args.reverse();
            fun = systems[system].fun;
            temp = fun.apply(undefined,args);
            if(temp!=null)
                ents[index]=temp;
        }
        else if(index.length=2){
            args.reverse().push(ents[index[1]]);
            args.push(ents[index[0]]);
            args.reverse();
            fun = systems[system].fun;
            temp = fun.apply(undefined,args);
            if(temp[0]!=null)
                ents[index[0]]=temp[0];
            if(temp[1]!=null)
                ents[index[1]]=temp[1];
        }
    }
}
