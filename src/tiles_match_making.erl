-module(tiles_match_making).

-behaviour(gen_server).

-export([start_link/0]).

-export([list_matches/0,find_open_match/2,find_match/3,create_match/0,clear_matches/0]).

-export([init/1,handle_call/3,handle_cast/2,handle_info/2,
         code_change/3,terminate/2,update_match_index/4]).

-record(state,{id=0,matches=[]}).

%% API
start_link()->
    gen_server:start_link({local,tiles_match_making_proc},?MODULE,[],[]).

find_open_match(RetPid,Player) ->
    %% io:format("finding match~n"),
    gen_server:cast(whereis(tiles_match_making_proc),{find_open_match,RetPid,Player}).

find_match(RetPid,Player,MatchId) ->
    %% io:format("finding match~n"),
    gen_server:cast(whereis(tiles_match_making_proc),{find_match,RetPid,Player,MatchId}).


create_match()->
    gen_server:call(whereis(tiles_match_making_proc),add_match).

list_matches()->
    gen_server:call(whereis(tiles_match_making_proc),list_match_capacity).

clear_matches()->
    gen_server:cast(whereis(tiles_match_making_proc),clear_matches).

update_match_index(Index,Pid,Num,Limit) ->
    gen_server:cast(whereis(tiles_match_making_proc),{next_id,Index,Pid,Num,Limit}).


%% Callbacks
init([]) ->
    {ok,#state{}}.

handle_call(add_match,_From,State=#state{matches=Matches,id=Id}) ->
    L=20,
    {ok,Pid}=tiles_mstate:start_link(Id,L),
    {ok,Next} = tiles_mstate:available_slot(Pid),
    {reply,{ok,Id},State#state{id=Id+1,matches=[{Id,Pid,Next,L}|Matches]}};
handle_call(list_match_capacity,_From,State=#state{matches=Matches})->
    MatchList = [{I,tiles_mstate:capacity(M)} || {I,M,_,_}<-Matches],
    {reply,MatchList,State};
handle_call(_Msg,_From,State)->
    {noreply,State}.
handle_cast({find_match,FSMPid,PInfo,MatchId},State=#state{matches=Matches}) ->
    %% io:format("Checking if match is available~n"),
    %% Find list and update
    Valid = proplists:lookup(binary_to_integer(MatchId), Matches),
    io:format("~p~p~n",[MatchId,Matches]),
    case Valid of
        none ->
            tiles_connection_state:matching_failed(FSMPid,PInfo),
            {noreply,State};
        {Id,MPid,Index,Limit} ->
            io:format("MATCHING: asign ~p~n",[Index]),
            Player = tiles_connection_state:match_found(FSMPid,MPid,Index),
            case tiles_mstate:add_player(MPid,Player,Index) of
                {ok,NextId} ->
                    io:format("next id2: ~p~n",[NextId]),
                    Matches2=
                        lists:keyreplace(MPid,2,Matches,{Id,MPid,NextId,Limit});
                _ ->
                    Matches2=Matches %% need to send note of failure
            end,
            {noreply,State#state{matches=Matches2}}
    end;
handle_cast({find_open_match,FSMPid,PInfo},State=#state{matches=Matches}) ->
    %% io:format("Checking if match is available~n"),
    %% Find list and update
    Valid =lists:filter(fun({_,_,Index,Limit})->  Index < Limit end, Matches),
    case Valid of
        [] ->
            tiles_connection_state:matching_failed(FSMPid,PInfo),
            {noreply,State};
        [{Id,MPid,Index,Limit}|_] ->
            io:format("MATCHING: asign ~p~n",[Index]),
            Player = tiles_connection_state:match_found(FSMPid,MPid,Index),
            case tiles_mstate:add_player(MPid,Player,Index) of
                {ok,NextId} ->
                    io:format("next id2: ~p~n",[NextId]),
                    Matches2=
                        lists:keyreplace(MPid,2,Matches,{Id,MPid,NextId,Limit});
                _ ->
                    Matches2=Matches %% need to send note of failure
            end,
            {noreply,State#state{matches=Matches2}}
    end;
handle_cast({next_id,Index,Pid,Id,L}, State=#state{matches=Matches})->
    io:format("MATCHING: next id ~p~n",[Index]),
    Matches2 = lists:keyreplace(Pid,2,Matches,{Index,Pid,Id,L}),
    {noreply,State#state{matches=Matches2}};
handle_cast(_Msg,State) ->
    {noreply,State}.

handle_info(_Msg,State)->
    {noreply,State}.

terminate(_Reason,_State)->
    ok.

code_change(_OldVsn,State,_Extra)->
    {ok,State}.

%% Internal
