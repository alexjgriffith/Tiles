-module(tiles_handler).
%%-compile([{parse_transform, lager_transform}]).
-behaviour(cowboy_websocket).
-export([init/2, handle/2, terminate/3]).
-export([
    websocket_init/1, websocket_handle/2,
    websocket_info/2
]).

%% Match needs two db
%% 1. awaiting [{user tid}{user tid}]
%% 2. users [{user token}] <- needs fast lookup time

init(Req, State) ->
    io:format("State: ~p~n",[State]),
    %% Authorize, // assisiate a websocket with a user
    %% We already request ID in the client side, this should
    %% Ask match if 
    %% become a test against users /websocket/matchpid/user/tid
    %% Pass user through state
    %% Make sure user and tid are in the permited seg for match
    %% This IS not secure, it just restricts it then throws the 
    %% value away
    %%
    %% eg
    %% 
    %% match:awaiting(Match_Pid,User,Temp_Id)
    {cowboy_websocket, Req, State ,#{idle_timeout => 10000}}.

handle(Req, State) ->
    lager:info("Request not expected: ~p~n", [Req]),
    {ok, Req2} = cowboy_http_req:reply(404,
                                       [{'Content-Type', <<"text/html">>}]),
    {ok, Req2, State}.

websocket_init(_State) ->
    %% Get user from state, 
    %%Id = tiles_bcast:join_feed(self()),
    Id = tiles_connection_state:start_link([self()]),
    %% pass matchpid to start link
    %% needs to join match feed
    %% every arg that is passed to math 
    %% after this point needs {user, token}
    %% if not in match user "db" kill all processes
    %% related to ws
    {ok, {Id,[],[]}, hibernate}.

%% Move match to connection_state
%% All processes related to the WS will be terminated
%% upon match exit
websocket_handle({text, EJSON},  State={Id,_,Match}) ->
    Message = tiles_json:to_message(EJSON),
    %%io:format("message: ~p~n",[Message]),
    Resp = tiles_connection_state:process_message(Id,Message,Match),
    case Resp of
        {respond,Message2}->
            EResp = tiles_json:to_json(Message2),
            {reply, {text, EResp},  State, hibernate };
        ok -> {ok, State, hibernate };
        _ -> {ok, State, hibernate }
        end;
websocket_handle(_Any,  State) ->
    {reply, {text, << "whut?">>}, State, hibernate}.


%% Move everything but state to tiles_connection_state
%% need to encode the json to save bandwidth
%% The match found stuff is too complex to be maintainable for
%% what it does
%% Convert tiles_connection_state to a gen_server
%% MatchID will be passed in 
websocket_info({match_found,Match,Mid,MSG}, {State,_,_}) ->
    Resp = tiles_json:to_json(MSG), %% need to clean this up!
    {reply,{text,Resp },{State,Mid,Match}, hibernate};
websocket_info({no_match,FSM_Pid,Player},State)->
    tiles_match_making:create_match(),
    tiles_connection_state:find_open_match(FSM_Pid,Player),
    {ok,State,hibernate};
websocket_info({broadcast,Msg}, State) ->
    %%io:format("Resp: ~p~n",[Msg]),
    Resp = tiles_json:to_json(Msg),
    {reply,{text,Resp},State, hibernate};
websocket_info({to_encode,Msg}, State) ->
    %%io:format("Resp: ~p~n",[Msg]),
    Resp = jiffy:encode(Msg),
    {reply,{text,Resp},State, hibernate};
websocket_info({test,Msg}, State) ->
    debug("websocket info: ~p~n",[self()]),
    Resp = tiles_json:to_json(
             {message,
              <<"message">>,
              list_to_binary(Msg),
              [<<"Server">>,<<"Server">>],
              tiles_json:jtime()}),
    {reply,{text,Resp},State, hibernate};
websocket_info(_Info, State) ->
    debug("bad arg websocket info: ~p~n",[_Info]),
    {ok, State, hibernate}.

terminate(_Reason, _Req, {_,[],[]}) ->
    debug("websocket closed: ~p ~p~n",[_Reason,_Reason]),
    ok;
terminate(_Reason, _Req, {State,Feed,_Match}) ->
    debug("websocket closed: ~p ~p~n",[_Reason,Feed]),
    tiles_connection_state:disconnect(State),
    ok.

debug(Str,Mix) ->
    io:format(Str,Mix).
