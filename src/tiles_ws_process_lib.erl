%% This module could be included directly in ws_conn
-module(tiles_ws_process_lib).

-export([process/2,process/3])

-record(state, {
          user,
          token,
          match_user_id,
          ws_pid,
          bcast_pid,
          pstate_pid}).

-record(message,{
          type :: binary(),
          body :: binary(),
          user   :: binary(),
          date :: pos_integer()
}).

%% API

%% This should be the only location where we unwrap messages
process(Msg,State)->
    process(Msg,State,unrestricted).

process(Msg,State,restricted)->
    Dmsg#message{type=Type,user=User,date=Date} = to_message(Msg),
    case Type of
        <<"auth">> ->
            {Response,Type,Ret}=process_message(<<"auth">>,Dmsg,[]),
            {Response, to_json(new_message(Type,Body,User))}
            ok;
        _ ->
            false,
    end;
process(Msg,State,unrestricted)->
    Dmsg#message{type=Type,user=User,date=Date} = to_message(Msg),
    {Response,Type,Ret}=process_message(Type,Dmsg,State),
    {Response, to_json(new_message(Type,Body,User))}.

%% Start HERE!!!
%% Need to implement the functions here, try and work as much
%% as possible with existing player and match modules
%% match -> match_bcast mstate-> match pstate -> ws_player
%% Shift the match selection to rest
%% Procssing internal functions
%% auth
%% createExplosion
%% damaged
%% dead
%% createBullet
%% updatePlayerPos
%% turned
%% exitMatch
%% ColourChanged
%% keyUp
%% keyDown
process_message(<<"auth">>,#message{body=Token},State#{token=Token})->
    {auth,Type,<<"authorized">>},
    ok;
process_message(<<"auth">>,#message{body=Token},_)->
    {unauth,Type,<<"not authorized">>},
    ok;
process_message(<<"createExplosion">>,#message{type=Type,body=Body},_)->
    {broadcast,Type,Body};



%% General Internal Functions
to_json(Record = #message{}) ->
    Plist = lists:zip(record_info(fields,message),tl(tuple_to_list(Record))),
    Rlist = [ {atom_to_binary(T,unicode),R} ||{T,R}<-Plist],
    jiffy:encode({Rlist}).

to_message(EJSON) ->
    {Record} = jiffy:decode(EJSON),
    Plist = [ {binary_to_existing_atom(T,unicode),R}
              ||{T,R}<-Record],
    #message{type = proplists:get_value(type,Plist),
             body = proplists:get_value(body,Plist),
             id   = proplists:get_value(id,Plist),
             date = proplists:get_value(date,Plist)}.

new_message(Type,Body,User)->
    #message{type=Type,body=Body,user=User,date=jtime()}.

jtime()->
    binary_to_integer(
      lists:foldl(fun(El,Col) ->
                          Asap=integer_to_binary(El) ,
                          <<Col/binary, Asap/binary>>
                  end,
                  <<>>,tuple_to_list(erlang:timestamp()))).
