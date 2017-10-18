-module(tiles_mstate).
-behaviour(gen_server).

-record(match,{id,
               version=0.1,
               teams=[1,2],
               players=[],
               objects=[],
               tiles,
               limit=20,
               eh}).

-export([start_link/1]).

-export([init/1,handle_cast/2,handle_call/3,handle_info/2,
        terminate/2,code_change/3]).


-export([clear_match/1,eh/1,id/1,tiles/1,state_to_proplist/1,state/1, add_player/3,update_player/3,remove_player/2,update_objects/2,players/1]).

start_link(Id)->
    gen_server:start_link(?MODULE,[Id],[]).

add_player(Pid,Id,Player) ->
    gen_server:call(Pid,{add_player,Id,Player}).

update_player(Pid,Id,Player) ->
    gen_server:cast(Pid,{update_players,Id,Player}).

remove_player(Pid,Id) ->
    gen_server:cast(Pid,{update_players,Id}).

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


init([Id]) ->
    {ok,new_match(Id)}.

handle_cast({update_objects, Objects},State) ->
    {noreply,State#match{objects=Objects}};
handle_cast({update_player, Id,Player},State=#match{players=Players}) ->
    Players2=lists:replaceKey(Id,1,Players,Player),
    {noreply,State#match{players=Players2}};
handle_cast({remove_player, Id},State=#match{players=Players}) ->
    Players2=proplist:delete(Id,Players),
    {noreply,State#match{players=Players2}};
handle_cast(_Msg,State) ->
    {noreply,State}.

handle_call({add_player, Id,Player},_From,State=#match{players=Players,limit=Limit}) ->
    Players2 = [{Id,Player} | Players],
    case length(Players2)>Limit of
        true ->
            {reply,failed,State};
        false ->
            {reply,ok,State#match{players=Players2}}
    end;
handle_call(return_eh, _From, State=#match{eh=Ret}) ->
    {reply,Ret,State};
handle_call(return_id, _From, State=#match{id=Ret}) ->
    {reply,Ret,State};
handle_call(return_tiles, _From, State=#match{tiles=Ret}) ->
    {reply,Ret,State};
handle_call(return_players, _From, State=#match{players=Ret}) ->
    {reply,Ret,State};
handle_call(_Msg,_From,State) ->
    {noreply,State}.

handle_info(_Msg,State) ->
    {noreply,State}.

code_change(_OldVsn,State,_ExData) ->
    {ok,State}.

terminate(_Reason,_State)->
    ok.


%% Internal
new_match(Id) ->
    Tiles = tiles_generate:new_equal_weight(20,20,75,75,[<<"grass">>,<<"earth">>,<<"water">>]),
    {ok,Event_Handler} = tiles_match:start(), %% Pass to super in the future
    #match{id=Id,tiles=tiles_generate:encode(Tiles),eh=Event_Handler}.
