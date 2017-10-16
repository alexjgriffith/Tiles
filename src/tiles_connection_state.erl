-module(tiles_connection_state).
-behaviour(gen_fsm).

-record(message,{
          type :: binary(),
          body :: binary(),
          id   :: binary(),
          date :: pos_integer()
}).

-record(state, {id,
                token,
                match=-1,
                ws_pid,
                fsm_pid,
                mid}).

-export([start_link/1,process_message/2,find_match/1,matching_failed/1,match_found/2]).

-export([init/1,handle_event/3,handle_sync_event/4,handle_info/3,
        terminate/3,code_change/4,
        no_id/2,no_id/3,no_match/2,no_match/3,looking/2,looking/3,matched/2,matched/3]).

%API
start_link([WS_Pid]) ->
    {ok,Pid}= gen_fsm:start_link(?MODULE,[WS_Pid],[]),
    Pid.

process_message(FSMPid,Message=#message{type=_Type})when _Type=:= <<"req_id">> ->
    {ok,ReturnMessage} = gen_fsm:sync_send_event(FSMPid,{req_id,Message},6000),
    find_match(FSMPid),
    ReturnMessage.

find_match(FSMPid) ->
    gen_fsm:send_event(FSMPid,find_match).

matching_failed(FSMPid) ->
    gen_fsm:send_event(FSMPid,no_match).

match_found(FSMPid,Match) ->
    gen_fsm:send_event(FSMPid,{match_found,Match}).

%% Callback Functions
init([WS_Pid]) ->
    {ok,noId,#state{ws_pid=WS_Pid,fsm_pid=self()}}.

handle_event(_Event,StateName,State)->
    {next_state,StateName,State}.

handle_sync_event(_Event,_From,StateName,State)->
    {next_state,StateName,State}.

handle_info(_Msg,StateName,State)->
    {next_state,StateName,State}.

code_change(_OldVsn,StateName,StateData,_Extra)->
    {ok,StateName,StateData}.

terminate(_Reason,_StateName,_State) ->
    ok.

no_id(_,State) ->
    {next_state, no_id,State}.

no_id({req_id,Message},_From,State=#state{}) ->
    {reply, Message#message{id=tiles_serve_id:get_id([])},no_match,State}.

no_match(find_match,State=#state{fsm_pid=Pid,id=Id,match=Match}) ->
    tiles_matchmaking:find_match(Pid,Id,Match),
    {next_state, looking, looking,State};
no_match(_,State)->
    {next_state, no_match,State}.

no_match(_,_From,State)->
    {noreply,State}.

looking({match_found,Match},State=#state{ws_pid=WS_Pid})->
    WS_Pid ! match_found,
    MID = tiles_match:join(Match,WS_Pid),
    {next_state,matched,State#state{match=Match,mid=MID}};
looking(no_match,State=#state{ws_pid=WS_Pid,fsm_pid=FSM_Pid})->
    WS_Pid ! {match_failed,FSM_Pid},
    {next_state,no_match,State};
looking(_,State)->
    {next_state,looking,State}.

looking(_,_From,State)->
    {noreply,State}.

matched({brodcast,Message},State=#state{match=Match})->
    tiles_match:send_message(Match,Message),
    {next_state,matched,State};
matched(_,State)->
    {next_state,matched,State}.

matched(_,_From,State)->
    {noreply,State}.
