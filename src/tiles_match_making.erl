-module(tiles_match_making).

-behaviour(gen_server).

-export([start_link/0]).

-export([find_match/2,create_match/0,new_match_id/0,clear_matches/0]).

-export([init/1,handle_call/3,handle_cast/2,handle_info/2,
         code_change/3,terminate/2]).


-record(state,{id=0,matches=[]}).

%% API
start_link()->
    gen_server:start_link({local,tiles_match_making_proc},?MODULE,[],[]).

find_match(RetPid,Player) ->
    io:format("finding match~n"),
    gen_server:cast(whereis(tiles_match_making_proc),{find_match,RetPid,Player}).

create_match()->
    gen_server:call(whereis(tiles_match_making_proc),add_match).

new_match_id()->
    gen_server:call(whereis(tiles_match_making_proc),new_match_id).

clear_matches()->
    gen_server:cast(whereis(tiles_match_making_proc),clear_matches).

%% Callbacks
init([]) ->
    {ok,#state{}}.

handle_call(new_match_id,_From,State=#state{id=Id})->
    {reply,Id,State#state{id=Id+1}};
handle_call(add_match,_From,State=#state{matches=Matches,id=Id}) ->
    {ok,Pid}=tiles_mstate:start_link(Id),
    {reply,ok,State#state{id=Id+1,matches=[{Pid,0,20}|
                                           Matches]}};
handle_call(_Msg,_From,State)->
    {noreply,State}.

handle_cast({find_match,WS_Pid,PInfo},State=#state{matches=Matches}) ->
    io:format("Checking if match is available~n"),
    Valid =lists:filtermap(
             fun({_,N,L})->
                     N < L end, Matches),
    case Valid of
        [] ->
            tiles_connection_state:matching_failed(WS_Pid,PInfo),
            {noreply,State};
        [{MPid,_N,_L}|_] ->
            %%io:format("~p~n",[First]),
            Match = tiles_mstate:state(MPid),
            {PlayerId,Player} = tiles_connection_state:match_found(WS_Pid,Match),
            case tiles_mstate:add_player(MPid,PlayerId,Player) of
                ok ->
                    Matches2=
                        lists:replaceKey(MPid,1,Matches,{MPid,_N+1,_L});
                fail ->
                    Matches2=Matches %% need to send note of failure
            end,
            {noreply,State#state{matches=Matches2}}
    end;
handle_cast(_Msg,State) ->
    {noreply,State}.

handle_info(_Msg,State)->
    {noreply,State}.

terminate(_Reason,_State)->
    ok.

code_change(_OldVsn,State,_Extra)->
    {ok,State}.

%% Internal
