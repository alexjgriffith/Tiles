-module(tiles_uid).
-behaviour(gen_server).

-export([start_link/0,uid/0]).

-export([init/1,handle_call/3,handle_cast/2,handle_info/2,code_change/3,terminate/2]).

%%% API
start_link()->
     gen_server:start_link({local,tiles_uid_proc},?MODULE,[],[]).

uid()->
    gen_server:call(tiles_uid_proc,id).


%%% gen_server callbacks
init([])->
    {ok,0}.

%% need to handle roll over at some point
handle_call(id,_From,State) ->
    {reply,State,State+1};
handle_call(_Any,_From,State) ->
    {noreply,State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.
