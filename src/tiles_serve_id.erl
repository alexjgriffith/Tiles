-module(tiles_serve_id).
-behaviour(gen_server).

-export([start_link/0,get_id/0,get_id/1,stop/0,list_ids/0]).

-export([init/1,handle_call/3,handle_cast/2,handle_info/2,code_change/3,terminate/2]).

%%% API
start_link()->
     gen_server:start_link({local,tiles_id_proc},?MODULE,[],[]).

get_id()->
    gen_server:call(tiles_id_proc,{id,""}).

get_id(Req)->
    gen_server:call(tiles_id_proc,{id,Req}).

list_ids()->
    gen_server:call(tiles_id_proc,list).

stop()->
    gen_server:cast(tiles_id_proc,stop).

%%% gen_server callbacks
init([])->
    {ok,[]}.

handle_call({id, _Name},_From,State) when _Name =:= <<>>->
    Name = unique_name(State),
    {reply,[<<"Unknown">>,Name],[Name|State]};
handle_call({id, Name},_From,State) ->
    NewName = unique_name(Name,State),
    {reply,[Name,NewName],[NewName|State]};
handle_call(list,_From,State) ->
    {reply,State,State};
handle_call(_Any,_From,State) ->
    {noreply,State}.

handle_cast(stop, State) ->
    {stop, normal,State};
handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%%%===================================================================
%%% Internal functions
%%%===================================================================

unique_name(Names)->
    Name = random_name(10),
    case lists:member(Name,Names) of
        true -> unique_name(Names);
        false  -> Name
    end.

unique_name(Name,Names)->
    case lists:member(Name,Names) of
        true -> unique_name(append,Name,Names);
        false  -> Name
    end.

unique_name(append,Name,Names)->
    Tail = random_name(5),
    NewName = <<Name/binary, Tail/binary>>,
    case lists:member(NewName,Names) of
        true -> unique_name(append,NewName,Names);
        false  -> NewName
    end.

random_name(Bytes) ->
    base64:encode(crypto:strong_rand_bytes(Bytes)).
