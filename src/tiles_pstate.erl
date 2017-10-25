-module(tiles_pstate).
-behaviour(gen_server).

-export([start_link/6]).

-export([init/1,handle_cast/2,handle_call/3,handle_info/2,
        terminate/2,code_change/3]).

-record(state,{keys=[{<<"up">>,false},
                     {<<"down">>,false},
                     {<<"right">>,false},
                     {<<"left">>,false}],
               match,
               alive = true,
               expLast,
               bulLast,
               health,
               power=[{red,0},{blue,0},{green,0}],
               pos,
               dir,
               colour,
               team,
               id
              }).

-export([move_key_down/2,move_key_up/2,state/1]).

%% API
start_link(Pos,Dir,Colour,Team,Match,Id)->
    gen_server:start_link(?MODULE,[Pos,Dir,Colour,Team,Match,Id],[]).

move_key_down(Pid,Key)->
    gen_server:call(Pid,{key_down,Key}).

move_key_up(Pid,Key)->
    gen_server:call(Pid,{key_up,Key}).

state(Pid)->
    io:format("getting state~n"),
    gen_server:call(Pid,request_state).

%% Callbacks

init([Pos,Dir,Colour,Team,Match,Id]) ->
    Power = case Colour of
                <<"red">> -> [{red,10},{blue,0},{green,0}];
                <<"blue">> -> [{red,0},{blue,10},{green,0}];
                <<"green">> -> [{red,0},{blue,0},{green,10}]
            end,
    {ok,#state{expLast=tiles_json:jtime(),
               bulLast=tiles_json:jtime(),
               health=10,
               pos=Pos,
               power=Power,
               dir=Dir,
               colour=Colour,
               team=Team,
               match = Match,
               id =Id}}.

handle_cast(_Msg,State) ->
    {noreply,State}.

handle_call(request_state ,_From,State=#state{match=Match,
                                              alive=Alive,
                                              health=Health,
                                              power=Power,
                                              pos=Pos,
                                              dir=Dir,
                                              colour=Colour,
                                              team=Team,
                                              id=Id}) ->
    Msg = {[{match,Match},{alive,Alive},{health,Health},
            {power,{Power}},{pos,{Pos}},{dir,{Dir}},{colour,Colour},
            {team,Team},{id,Id}]},
    {reply,Msg,State};
handle_call({key_down,Key},_From,State=#state{keys=Keys}) ->
    case proplists:get_value(Key,Keys) of
        true ->
            {reply,already_down,State};
        false ->
            K2=lists:keyreplace(Key,1,Keys,{Key,true}),
            {reply,key_down,State#state{keys=K2}}
    end;
handle_call({key_up,Key},_From,State=#state{keys=Keys}) ->
    case proplists:get_value(Key,Keys) of
        false ->
            {reply,already_up,State};
        true ->
            K2 = lists:keyreplace(Key,1,Keys,{Key,false}),
            {reply,key_up,State#state{keys=K2}}
    end;
handle_call(_Msg,_From,State) ->
    {noreply,State}.

handle_info(_Msg,State) ->
    {noreply,State}.

code_change(_OldVsn,State,_ExData) ->
    {ok,State}.

terminate(_Reason,_State)->
    ok.
