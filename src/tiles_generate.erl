-module(tiles_generate).

-export([new/6,new_equal_weight/5,encode/1,decode/1]).

-record(tile,{pos,
              outline,
              type}).
-record(pos,{x,y}).

%% API
encode(Tiles)->
    jiffy:encode([[encode_tile(Tile)|| Tile<-T] || T<- Tiles]).

decode(Tiles)->
    Decoded = jiffy:decode(Tiles),
    [decode_tile(D) || D <- Decoded].

new(Width,Height,Px,Py,Outline,TileTypes)->
    Weight = [T || {_,T} <- TileTypes],
    Sum = lists:foldr(fun(X,Y)-> X+Y end, 0,Weight),
    Reg = define_regions(Weight),
    %% [{tile,
    %%   {pos, X*Px,Y*Py},
    %%   Outline,
    %%   element(1,lists:nth(greater_than(rand:uniform(Sum),Reg),TileTypes))} ||
    %%     X <- lists:seq(1,Width),
    %%     Y <- lists:seq(1,Height)].
    [[{tile,
      {pos, X*Px,Y*Py},
      Outline,
      element(1,lists:nth(greater_than(rand:uniform(Sum),Reg),TileTypes))} ||
         Y <- lists:seq(1,Height)] ||
        X <- lists:seq(1,Width)]
        .


new_equal_weight(Width,Height,Px,Py,Names) ->
    new(Width,Height,Px,Py,<<"black">>,equal_weight(Names)).


%% Internal
encode_tile(#tile{pos=#pos{x=X,y=Y},outline=Outline,type=Type})->
    %%{pos,X,Y}= Pos,
    {[{<<"pos">>,{[{<<"x">>,X},{<<"y">>,Y}]}},
                   {<<"outline">>,Outline},
                   {<<"type">>,Type}
     ]}.

decode_tile({Structure})->
    Plist = [{binary_to_existing_atom(T,unicode),R}
             ||{T,R}<-Structure],
    #tile{pos = decode_pos(proplists:get_value(pos,Plist)),
             outline = proplists:get_value(outline,Plist),
             type   = proplists:get_value(type,Plist)}.


decode_pos({Pos}) ->
        Plist = [ {binary_to_existing_atom(T,unicode),R}
              ||{T,R}<-Pos],
    #pos{x = proplists:get_value(x,Plist),
         y = proplists:get_value(x,Plist)}.

cumulative(X,All=[First|_]) ->
    Next = X + First,
    [Next|All].

define_regions(List)->
    Cumu = lists:foldr(fun cumulative/2,[0],List),
    lists:reverse(Cumu).

greater_than(X,List)->
    greater_than(X,List,1)-1.

greater_than(_X,[],_N)->
    error;
greater_than(X,[First|[]],_N) when X>First->
    error;
greater_than(X,[First|Rest],N) when X>First ->
    greater_than(X,Rest,N+1);
greater_than(_X,[_First|_],N) ->
    N.

%% between(X,A,B) ->
%%     (X < A) & (X =< B).

weight_tile(Name,Weight)->
    {Name,Weight}.

equal_weight(Names) ->
    [weight_tile(Name,1) || Name <- Names].
