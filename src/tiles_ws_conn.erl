%% What this rewrite is for is to take the matchmacking out of the
%% game websocket and into either a seperate ws or a rest protocol
%% These modules / ws should only be for playing the game, after
%% inialization.

%% eg 
%% 1. api/match/list -> returns list of valid match pids or null
%% 2. api/match/new 
%% 3. api/match/join/$pid -> their is room, here is your {temp_id,expiry}
%%                        or no room 
%% 4. websocket/$pid/$user/$temp_id
%%
%% 1 and 2 are sudo implemented, need to make into proper rest requests with
%% auth. 3 needs to be taken from websocket and 4 is a wip

%% future
%% api/user/[stats,options,account]
%% api/user/options/[controls,colours,icon,display_name]
%% api/match/find 

-module(tiles_ws_conn).
-behaviour(gen_fsm).

-export([start_link/1]).

-export([authorize/2]).

-export([init/1,handle_event/3,handle_sync_event/4,
         handle_info/3,terminate/3,code_change/4,
         unauth/2,unauth/3,
         auth/2,auth/3]).

%% Once initialized state is read only
-record(state, {
          user,
          token,
          match_user_id,
          ws_pid,
          bcast_pid,
          pstate_pid}).

%% API
start_link([User,Token,Match_User_Id,WS_Pid,Bcast_Pid]) ->    
    {ok,Pid}= gen_fsm:start_link(?MODULE,[User,Token,Match_User_Id,
                                          Ws_Pid,Bcast_Pid],[]),
    Pid.

authorize(Conn_Pid,Token)->
    gen_fsm:send_event(Conn_Pid, {authorize,Token}).

process(Conn_Pid,Msg)->
    gen_fsm:send_event(Conn_Pid, {process,Msg}).

    
%% Callbacks
init([User,Token,Match_User_Id,Ws_Pid,Bcast_Pid]) ->
    Pstate_Pid=tiles_ws_pstate:start_link([]),
    State = new_state(User,Token,Match_User_Id,WS_Pid,Bcast_Pid,Pstate_Pid),
    {ok,unauth,new_state(Args)}.

unauth({process,Msg},State#{ws_pid=Ws_Pid,bcast_pid=Bcast_Pid})->
    Resp=tiles_ws_process_lib:process(Msg,State,restricted),
    case Resp of 
        {auth,Msg2} ->
            tiles_ws_handler:send(Pid,Msg2),
            {next_state,auth,State};
        {unauth,Msg2} ->
            tiles_ws_handler:send(Pid,Msg2),
            {next_state,unauth,State};
        _ ->
            {next_state,unauth,State};
    end.
unauth(_Msg,State) ->    
    {next_state, unauth,State}.

unauth(_Msg,_From,State=#state{}) ->
    {next_state, unauth,State}.

auth({process,Msg},State#{ws_pid=Ws_Pid,bcast_pid=Bcast_Pid})->
    %% This can be spun off into subtasks in the
    %% Future if there is a bottle neck
    Ret = tiles_ws_process_lib:process(Msg,State),
    case Ret of
        {reply,Msg} ->
            tiles_ws_handler:send(WS_Pid,Msg),
            {next_state,auth,State};
        {broadcast,Msg} ->
            tiles_match_bcast:send(Bcast_Pid,Msg),
            {next_state,auth,State};
        _ ->
            {next_state,auth,State}
    end.

auth(_Msg,State) ->
    {next_state, auth,State}.

auth(_Msg,_From,State=#state{}) ->
    {reply,ok, auth,State}.

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
