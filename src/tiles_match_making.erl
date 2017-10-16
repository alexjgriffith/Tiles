-module(tiles_match_making).

-behaviour(gen_server).

-export([start_link/0]).

-export([find_match/3,create_match/0,new_match_id/0]).

-export([init/1,handle_call/3,handle_cast/2,handle_info/2,
         code_change/3,terminate/2]).

-record(match,{id,
               version=0.1,
               players=[],
               tiles,
               eh}).

-record(state,{id=0,matches=[],limit=20}).

%% API
start_link()->
    gen_server:start_link({local,?MODULE},?MODULE,[],[]).

find_match(RetPid,Id,Match) ->
    gen_server:cast(whereis(?MODULE),{find_match,RetPid,Id,Match}).

create_match()->
    Match = new_match(),
    gen_server:call(whereis(?MODULE),{add_match,Match}).

new_match_id()->
    gen_server:call(whereis(?MODULE),new_match_id).

%% Callbacks
init([]) ->
    {ok,[]}.

handle_call(new_match_id,_From,State=#state{id=Id})->
    {reply,Id,State#state{id=Id+1}};
handle_call(_Msg,_From,State)->
    {noreply,State}.

handle_cast({find_match, RetPid,Id,-1},State=#state{matches=Matches,limit=Limit}) ->
    Valid =lists:filtermap(fun(M)-> length(M#match.players)<Limit end, Matches),
    case Valid of
        [] ->
            tiles_connection_state:matching_failed(RetPid),
            {noreply,State};
        [First|_] ->
            tiles_connection_state:match_found(RetPid,First#match.eh),
            Matches2 = lists:map(fun(M)-> append_match(M,Limit,Id)end ,Matches),
            {noreply,State#state{matches=Matches2}}
    end;
handle_cast({add_match,New_Match},State=#state{matches=Matches}) ->
    {noreply,State#state{matches=[New_Match|Matches]}};
handle_cast(_Msg,State) ->
    {noreply,State}.

handle_info(_Msg,State)->
    {noreply,State}.

terminate(_Reason,_State)->
    ok.

code_change(_OldVsn,State,_Extra)->
    {ok,State}.

%% Internal

new_match() ->
    Id = new_match_id(),
    Tiles = tiles_generate:new_equal_weight(100,100,75,75,["grass","earth","water"]),
    {ok,Event_Handler} = tiles_match:start_link(),
    #match{id=Id,tiles=tiles_generate:encode(Tiles),eh=Event_Handler}.

append_match(M,Limit,Id)->
    case length(M#match.players)<Limit of
        true -> [M|Id];
        false -> M
    end.
