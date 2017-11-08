-module(tiles_ws_conn).
-behaviour(gen_fsm).

-export([start_link/1]).

-export([init/1,handle_event/3,handle_sync_event/4,
         handle_info/3,terminate/3,code_change/4,
         unauth/2,unauth/3,
         auth/2,auth/3]).

-record(state, {
          users,
          token,
          temp_id,
          ws_pid,
          match_pid,
          bcast_pid,
          pstate_pid}).

%% API
start_link([WS_Pid]) ->
    {ok,Pid}= gen_fsm:start_link(?MODULE,[WS_Pid],[]),
    Pid.

%% Callbacks
init([WS_Pid]) ->
    {ok,unauth,#state{ws_pid=WS_Pid,fsm_pid=self()}}.

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

unauth(_Msg,State) ->
    {next_state, unauth,State}.

unauth({req_id,Message},_From,State=#state{}) ->
    {reply,ok,no_match,State};
unauth(_Msg,_From,State=#state{}) ->
    {next_state, unauth,State}.

auth(_Msg,State) ->
    {next_state, auth,State}.

auth(_Msg,_From,State=#state{}) ->
    {reply,ok, auth,State}.

