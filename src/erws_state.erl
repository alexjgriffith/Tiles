-module(erws_state).
-behaviour(gen_server).

-include_lib("stdlib/include/ms_transform.hrl").

-export([start_link/1,insert/1,get_since/1,since/1]).

-export([init/1,handle_call/3,handle_cast/2,
         handle_info/2,code_change/3,terminate/2]).

%% API
start_link(PreState) ->
    {ok,PID}=gen_server:start_link(?MODULE,PreState,[]),
    register(erw_ets_proc,PID).

insert(Message) ->
    gen_server:cast(erw_ets_proc,{insert,Message}).

since(TimeStamp) ->
    ets:select(message_list,
               ets:fun2ms(fun(Message={_,_,_,_,N})
                                when N > TimeStamp ->
                                  Message  end)).

get_since(Timestamp) ->
    gen_server:call(erw_ets_proc,{since,Timestamp}).

%%% gen_server callbacks
init(PreState)->
    TabId = ets:new(message_list,
                    [duplicate_bag,named_table,{keypos,5}]),
    [ ets:insert(TabId,S)||S <- PreState],
    {ok,TabId}.

handle_call({since,TimeStamp},_From,State) ->
    Var = since(TimeStamp),
    {reply,Var,State};
handle_call(_Msg,_From,State) ->
    {noreply,State}.

handle_cast({insert,Msg},State) ->
    ets:insert(State,Msg),
    {noreply,State};
handle_cast(_Msg,State) ->
    {noreply,State}.

handle_info(_Msg,State) ->
    {noreply,State}.

code_change(_OldVsn,State,_Extra) ->
    {ok,State}.

terminate(_Reason,_State) ->
    ok.

%%% internal functions
