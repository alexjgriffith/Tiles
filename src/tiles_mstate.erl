-module(tiles_mstate).
-behaviour(gen_server).

-record(match,{id,
               version=0.1,
               teams=[1,2],
               players=[],
               objects=[],
               next_available_id=0,
               tiles,
               bounds=[],
               limit=20,
               eh}).

-export([start_link/2]).

-export([init/1,handle_cast/2,handle_call/3,handle_info/2,
        terminate/2,code_change/3,place_random/1]).


-export([capacity/1,clear_match/1,eh/1,id/1,tiles/1,state_to_proplist/1,state/1,
         add_player/2,update_player/3,remove_player/2,update_objects/2,
         players/1,available_slot/1]).

start_link(Id,Limit)->
    gen_server:start_link(?MODULE,[Id,Limit],[]).

add_player(Pid,Player) ->
    gen_server:call(Pid,{add_player,Player}).

available_slot(Pid)->
    gen_server:call(Pid,available_slot).

place_random(Pid)->
    gen_server:call(Pid,place_random).


capacity(Pid)->
    gen_server:call(Pid,capacity).

update_player(Pid,Id,Player) ->
    gen_server:cast(Pid,{update_players,Id,Player}).

remove_player(Pid,Id) ->
    gen_server:call(Pid,{remove_player,Id}).

update_objects(Pid,Objects) ->
    gen_server:cast(Pid,{update_objects,Objects}).

id(Pid) ->
    gen_server:call(Pid,return_id).
eh(Pid) ->
    gen_server:call(Pid,return_eh).
tiles(Pid) ->
    gen_server:call(Pid,return_tiles).
players(Pid) ->
    gen_server:call(Pid,return_players).

state_to_proplist(_Match=#match{id=Id,tiles=Tiles,eh=Eh}) ->
    {[{id,Id},{tiles,Tiles},{eh,Eh}]}.

state(Match) ->
    Match.

clear_match(Match)->
    catch exit(Match#match.eh).


init([Id,Limit]) ->
    {ok,new_match(Id,Limit)}.

handle_cast({update_objects, Objects},State) ->
    {noreply,State#match{objects=Objects}};
handle_cast({update_player, Id,Player},State=#match{players=Players}) ->
    Players2=lists:replaceKey(Id,1,Players,Player),
    {noreply,State#match{players=Players2}};
handle_cast(_Msg,State) ->
    {noreply,State}.

handle_call({add_player,Player},_From,State=#match{players=Players,limit=L,next_available_id=Id}) ->
    case L==Id of
        true ->
            io:format("ouversized match"),
            {reply,failed,State};
        false ->
            Players2 = [{Id,Player} | Players],
            State2=State#match{players=Players2},
            NextId=next_id(State2),
            io:format("Next ID: ~p~n", [NextId]),
            {reply,{ok,NextId},State2#match{next_available_id=NextId}}
    end;
handle_call({remove_player, Id},_From,State=#match{players=Players,limit=L}) ->
    Players2=proplists:delete(Id,Players),
    State2 = State#match{players=Players2},
    NextId= next_id(State2),
    tiles_match_making:update_match_index(self(),NextId,L),
    {reply,ok,State2#match{next_available_id=NextId}};
handle_call(return_eh, _From, State=#match{eh=Ret}) ->
    {reply,Ret,State};
handle_call(return_id, _From, State=#match{id=Ret}) ->
    {reply,Ret,State};
handle_call(return_tiles, _From, State=#match{tiles=Ret}) ->
    {reply,Ret,State};
handle_call(return_players, _From, State=#match{players=Ret}) ->
    {reply,Ret,State};
handle_call(place_random, _From, State=#match{bounds=[X,Y]}) ->
    Ret = [{x,rand:uniform(X-150)+75},{y,rand:uniform(Y-150)+75}],
    {reply,Ret,State};
handle_call(available_slot, _From, State=#match{next_available_id=Id,limit=L}) ->
    case Id<L of
        true ->
            {reply,{ok,Id},State};
        false->
            {reply,{no,Id},State}
        end;
handle_call(capacity,_From,State) ->
    {reply,length(find_available(State)),State};
handle_call(_Msg,_From,State) ->
    {noreply,State}.

handle_info(_Msg,State) ->
    {noreply,State}.

code_change(_OldVsn,State,_ExData) ->
    {ok,State}.

terminate(_Reason,_State)->
    ok.


%% Internal
new_match(Id,Limit) ->
    X=30,Y=30,
    Tiles = tiles_generate:new_equal_weight(X,Y,75,75,
                                            [<<"grass">>,<<"earth">>,<<"water">>]),
    {ok,Event_Handler} = tiles_match:start(), %% Pass to super in the future
    #match{limit=Limit,id=Id,tiles=tiles_generate:encode(Tiles),eh=Event_Handler,
          bounds=[X*75,Y*75]}.


find_available(_State=#match{players=Players,limit=L})->
    Current = sets:from_list([Id || {Id,_} <- Players]),
    All = sets:from_list(lists:seq(0,L-1)),
    Diff = sets:subtract(All,Current),
    sets:to_list(Diff).


next_id(State=#match{limit=L}) ->
    case find_available(State) of
        [First | _] -> First;
        [] -> L
    end.
