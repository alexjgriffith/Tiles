-module(erws_handler).
-behaviour(cowboy_websocket).
-export([init/2, handle/2, terminate/3]).
-export([
    websocket_init/1, websocket_handle/2,
    websocket_info/2
]).

init(Req, State) ->
    {cowboy_websocket, Req, State ,#{idle_timeout => 60000}}.

handle(Req, State) ->
    debug("Request not expected: ~p~n", [Req]),
    {ok, Req2} = cowboy_http_req:reply(404, [{'Content-Type', <<"text/html">>}]),
    {ok, Req2, State}.

websocket_init(State) ->
    Id = erws_bcast:join_feed(self()),
    {ok, Id, hibernate}.

websocket_handle(Frame = {text, EJSON},  State) ->
    Message = erws_json:to_message(EJSON),
    debug("Message: ~p ~p~n", [Message,self()]),
    case erws_json:process(Message) of
        {text,Resp}->
            EResp = erws_json:to_json(Resp),
            debug("Response: ~p ~p~n", [Resp,self()]),
            {reply, {text, EResp},  State, hibernate };
        ok -> {ok, State, hibernate };
        _ -> {ok, State, hibernate }
        end;
websocket_handle(_Any,  State) ->
    {reply, {text, << "whut?">>}, State, hibernate }.

websocket_info({broadcast,Msg}, State) ->
    debug("websocket info: ~p~n",[self()]),
    Resp = erws_json:to_json(Msg),
    {reply,{text,Resp},State, hibernate};

websocket_info({test,Msg}, State) ->
    debug("websocket info: ~p~n",[self()]),
    Resp = erws_json:to_json(
             {message,
              <<"message">>,
              list_to_binary(Msg),
              [<<"Server">>,<<"Server">>],
              erws_json:jtime()}),
    {reply,{text,Resp},State, hibernate};
websocket_info(_Info, State) ->
    debug("websocket info: ~p~n",[self()]),
    {ok, State, hibernate}.

terminate(_Reason, _Req, State) ->
    debug("websocket closed: ~p ~p~n",[self(),State]),
    erws_bcast:leave_feed(State),
    ok.

debug (Str) ->
    io:format(Str).

debug(Str,Mix) ->
    io:format(Str,Mix).
