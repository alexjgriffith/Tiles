-module(tiles_feed).
-behaviour(gen_event).

-export([init/1,handle_event/2,handle_call/2,handle_info/2,code_change/3,terminate/2]).

init([Pid])->
    {ok, Pid}.

handle_event(Message,Pid)->
    Pid ! {broadcast,Message},
    {ok,Pid}.

handle_call(_, State) ->
    {ok,ok,State}.

handle_info(_, State) ->
    {ok, State}.

code_change(_OldVsn,State,_Extra) ->
    {ok, State}.

terminate(_Reason, _State) ->
    ok.
