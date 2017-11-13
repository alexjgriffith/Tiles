-module(tiles_ws_handler).
%%-compile([{parse_transform, lager_transform}]).
-behaviour(cowboy_websocket).
-export([send/2]).
-export([init/2, handle/2, terminate/3
         websocket_init/1, websocket_handle/2,
         websocket_info/2
]).

-record(state,{match_pid,conn_pid,bcast_pid,bcast_ref}).

%% API
send(WS_Pid,Message)->
    WS_Pid ! {send,Message}.

%% Callbacks
init(Req, State) ->
    {Match_Pid,User,Temp_Id}=extract_ws_conn(Req),
    {cowboy_websocket, Req, {Match_Pid,User,Temp_Id} ,#{idle_timeout => 10000}}.

handle(Req, State) ->
    lager:info("Request not expected: ~p~n", [Req]),
    {ok, Req2} = cowboy_http_req:reply(404,
                                       [{'Content-Type', <<"text/html">>}]),
    {ok, Req2, State}.

websocket_init([Match_Pid,User,Temp_Id]) ->
    Confirmed = tiles_match:confirm_joined(Match_Pid,User,Temp_Id),
    case Confirmed of
        {ok,User,Token,Match_User_Id,Bcast_Pid}->            
            Bcast_Ref=tiles_match_bcast:join(self()),
            Conn_Pid = 
                tiles_ws_conn:start_link([User,Token,Match_User_Id,
                                                   self(),Bcast_Pid]),
                {ok, new_state(Match_Pid,Conn_Pid,Bcast_pid,Bcast_Ref), hibernate};
         _ ->
            {stop, [], hibernate}
    end.
            
websocket_handle({text, MSG},  State=#state{conn_pid=Pid}) ->
    tiles_conn_state:process(Pid,MSG),
    {ok, State, hibernate};
websocket_handle(_Any,  State) ->
    {reply, {text, << "whut?">>}, State, hibernate}.

websocket_info({send,Msg}, State) ->
    %%io:format("Resp: ~p~n",[Msg]),

    {reply,{text,Msg},State, hibernate};
websocket_info({recieve,Msg}, State) ->
    %%io:format("Resp: ~p~n",[Msg]),
    tiles_conn_state:process(Pid,Msg),
    {ok,State, hibernate};
websocket_info(_Info, State) ->
    io:format("bad arg websocket info: ~p~n",[_Info]),
    {ok, State, hibernate}.

terminate(_Reason, _Req, []) ->
    io:format("websocket closed: ~p ~p~n",[_Reason,_Reason]),
    ok;
terminate(_Reason, _Req, State=#state{}) ->
    io:format("websocket closed: ~p ~p~n",[_Reason,Feed]),
    leave_bcast(State),
    leave_match(State),
    ok.

%%% internal

extract_ws_conn(Req)->
    {Match_Pid,User,Temp_Id}.

leave_bcast(#state{bcast_pid=Pid,bcast_ref=Ref})->
    %% we may be able to do away with bcast_ref
    %% since this PID will only be used once
    tiles_match_bcast:leave(Pid,Ref).
    
leave_match(State)->
    %% have the ws pid right next to the user id
    %% call self() in tile_match:leave() which will
    %% refer to THIS process!!
    tiles_match:leave(State#state.match_pid).

new_state(Match_Pid,Conn_Pid,Bcast_Pid,Bcast_Ref)->
    state#{
      match_pid=Match_Pid,
      conn_pid=Conn_Pid,
      bcast_pid=Bcast_Pid,
      bcast_ref=Bcast_Ref}.
