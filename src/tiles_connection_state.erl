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
                pstate_pid,
                mid}).

-export([start_link/1,process_message/3,find_match/2,
         matching_failed/2,match_found/2]).

-export([init/1,handle_event/3,handle_sync_event/4,handle_info/3,
         terminate/3,code_change/4,
         no_id/2,no_id/3,no_match/2,no_match/3,looking/2,looking/3,
         matched/2,matched/3]).

%API
start_link([WS_Pid]) ->
    {ok,Pid}= gen_fsm:start_link(?MODULE,[WS_Pid],[]),
    Pid.

process_message(FSMPid,Message=#message{type=_Type},_Match)
  when _Type=:= <<"req_id">> ->
    ReturnMessage = gen_fsm:sync_send_event(FSMPid,{req_id,Message},6000),
    {respond,ReturnMessage};
process_message(FSMPid,_Message=#message{type=_Type,body=Player},_Match)
  when _Type=:= <<"req_match">> ->
    find_match(FSMPid,[]);
process_message(_FSMPID,Message=#message{type=_Type},Match)
  when _Type =:= <<"createExplosion">> ->
    tiles_match:send_message(Match,Message);
process_message(_FSMPID,Message=#message{type=_Type},Match)
  when _Type =:= <<"createBullet">> ->
    tiles_match:send_message(Match,Message);
process_message(_FSMPID,Message=#message{type=_Type},Match)
  when _Type =:= <<"updatePlayerPos">> ->
    tiles_match:send_message(Match,Message);
process_message(FSMPID,Message=#message{type=_Type},_Match)
  when _Type =:= <<"keyUp">> ->
    Key = Message#message.body,
    gen_fsm:send_event(FSMPID,{key_up, Message,Key});
process_message(FSMPID,Message=#message{type=_Type},_Match)
  when _Type =:= <<"keyDown">> ->
    Key = Message#message.body,
    gen_fsm:send_event(FSMPID,{key_down, Message,Key});
process_message(_,_,_) ->
    ok.

find_match(FSMPid,Player) ->
    io:format("find Match~n"),
    gen_fsm:send_event(FSMPid,{find_match,Player}).

matching_failed(FSMPid,PlayerInfo) ->
    gen_fsm:send_event(FSMPid,{no_match,PlayerInfo}).

match_found(FSMPid,Match) ->
    gen_fsm:sync_send_event(FSMPid,{match_found,Match}).

%% Callback Functions
init([WS_Pid]) ->
    {ok,no_id,#state{ws_pid=WS_Pid,fsm_pid=self(),id=self()}}.

handle_event(_Event,StateName,State)->
    {next_state,StateName,State}.

handle_sync_event(_Event,_From,StateName,State)->
    {next_state,StateName,State}.

handle_info(_Msg,StateName,State)->
    {next_state,StateName,State}.

code_change(_OldVsn,StateName,StateData,_Extra)->
    {ok,StateName,StateData}.

terminate(_Reason,_StateName,_State) ->
    io:format("terminate: ~p~n",[_Reason]),
    ok.

no_id(_,State) ->
    {next_state, no_id,State}.

no_id({req_id,Message},_From,State=#state{}) ->
    io:format("in no id~n"),
    {reply, Message#message{id=tiles_serve_id:get_id(Message#message.body)},no_match,State}.

%% Comes after a player is defined
%% tiles_match_making requires a player with an id
no_match({find_match,Player},State=#state{fsm_pid=Pid}) ->
    io:format("in no match~n"),
    tiles_match_making:find_match(Pid,Player),
    {next_state,  looking,State};
no_match(_,State)->
    {next_state, no_match,State}.

no_match(_,_From,State)->
    {noreply,State}.

looking({no_match,Player},State=#state{ws_pid=WS_Pid,fsm_pid=FSM_Pid})->
    io:format("looking 2~n"),
    WS_Pid ! {no_match,FSM_Pid,Player},
    {next_state,no_match,State};
looking(_,State)->
    {next_state,looking,State}.

looking({match_found,Match},_From,State=#state{id=Id,ws_pid=WS_Pid})->
    io:format("looking 1~n"),
    %%io:format("~p~n",[P]),
    Match_Pid=tiles_mstate:eh(Match),
    MID = tiles_match:join(Match_Pid,WS_Pid),
    Pos = [{x,100},{y,100}],
    Dir = [{x,1},{y,0}],
    Colour = <<"red">>,
    Team=1,
    MatchNo=tiles_mstate:id(Match),
    Tiles = tiles_mstate:tiles(Match),
    {ok,PPid} = tiles_pstate:start_link(Pos,Dir,Colour,Team,MatchNo),
    io:format("~p~n",[PPid]),
    P = tiles_pstate:state(PPid), %% needs to be difined with request id
    MSG = {message,
           <<"create">>,
           {[{player,P},{tiles,Tiles}]},
           [<<"Server">>,<<"Server">>],
           tiles_json:jtime()},
    WS_Pid ! {match_found,Match_Pid,Id,MID,MSG},
    PlayerId=1,
    %%io:format("~p,~p~n",[Match,process_info(Match)]),
    {reply,{PlayerId,P},matched,State#state{match=Match_Pid,mid=MID,pstate_pid=PPid}};

looking(_,_From,State)->
    {noreply,State}.

matched({brodcast,Message},State=#state{match=Match})->
    io:format("matched~n"),
    tiles_match:send_message(Match,Message),
    {next_state,matched,State};
matched({key_down,Message,Key},State=#state{pstate_pid=PPid,match=Match})->
    case tiles_pstate:move_key_down(PPid,Key) of
        key_down ->
            tiles_match:send_message(Match,Message);
        _ ->
            ok
    end,
    {next_state,matched,State};
matched({key_up,Message,Key},State=#state{pstate_pid=PPid,match=Match})->
    case tiles_pstate:move_key_up(PPid,Key) of
        key_up ->
            tiles_match:send_message(Match,Message);
        _ ->
            ok
    end,
    {next_state,matched,State};
matched(_,State)->
    {next_state,matched,State}.

matched(_,_From,State)->
    {noreply,State}.
