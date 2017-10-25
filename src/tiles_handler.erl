-module(tiles_handler).
-compile([{parse_transform, lager_transform}]).
-behaviour(cowboy_websocket).
-export([init/2, handle/2, terminate/3]).
-export([
    websocket_init/1, websocket_handle/2,
    websocket_info/2
]).

init(Req, State) ->
    {cowboy_websocket, Req, State ,#{idle_timeout => 10000}}.

handle(Req, State) ->
    lager:info("Request not expected: ~p~n", [Req]),
    {ok, Req2} = cowboy_http_req:reply(404,
                                       [{'Content-Type', <<"text/html">>}]),
    {ok, Req2, State}.

websocket_init(_State) ->
    %%Id = tiles_bcast:join_feed(self()),
    Id = tiles_connection_state:start_link([self()]),
    {ok, {Id,[],[]}, hibernate}.

websocket_handle({text, EJSON},  State={Id,_,Match}) ->
    Message = tiles_json:to_message(EJSON),
    %% io:format("message: ~p~n",[Message]),
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

websocket_info({match_found,Match,Mid,MSG}, {State,_,_}) ->
    Resp = tiles_json:to_json(MSG), %% need to clean this up!
    {reply,{text,Resp },{State,Mid,Match}, hibernate};
websocket_info({no_match,FSM_Pid,Player},State)->
    tiles_match_making:create_match(),
    tiles_connection_state:find_match(FSM_Pid,Player),
    {ok,State,hibernate};
websocket_info({broadcast,Msg}, State) ->
    %%io:format("Resp: ~p~n",[Msg]),
    Resp = tiles_json:to_json(Msg),
    {reply,{text,Resp},State, hibernate};
websocket_info({to_encode,Msg}, State) ->
    io:format("Resp: ~p~n",[Msg]),
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
