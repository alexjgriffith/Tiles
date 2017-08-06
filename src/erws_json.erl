-module(erws_json).
-export([to_message/1,to_json/1,process/1,jtime/0]).
-record(message,{
          type  :: binary(),
          text :: binary(),
          id  :: binary(),
          date :: pos_integer()
}).

to_json(Record = #message{}) ->
    Plist = lists:zip(record_info(fields,message),tl(tuple_to_list(Record))),
    Rlist = [ {atom_to_binary(T,unicode),R} ||{T,R}<-Plist],
    jiffy:encode({Rlist}).

to_message(EJSON) ->
    {Record} = jiffy:decode(EJSON),
    Plist = [ {binary_to_existing_atom(T,unicode),R} ||{T,R}<-Record],
    #message{type = proplists:get_value(type,Plist),
             text = proplists:get_value(text,Plist),
             id = proplists:get_value(id,Plist),
             date = proplists:get_value(date,Plist)}.

process(Message = #message{type=_Type,id=_Id,text=Text}) when _Type =:= <<"req_id">>  ->
    {text,Message#message{id=erws_serve_id:get_id(Text)}};
process(Message = #message{type=_Type,id=_Id}) when _Type =:= <<"message">> , _Id =/= <<>> ->
    %% Broadcast to all
    erws_bcast:send_message(Message),
    %%self() ! {broadcast,Message},
    ok;
process(Message = #message{id=_Id}) when _Id =/= 0->
    Message#message{type= <<"error">>,text= <<"0: invalid message type.">>};
process(Message = #message{}) ->
    Message#message{type= <<"error">>,text= <<"1: ID =:= \"\".">>}.


jtime()->
    binary_to_integer(
      lists:foldl(fun(El,Col) ->
                          Asap=integer_to_binary(El) ,
                          <<Col/binary, Asap/binary>>
                  end,
                  <<>>,tuple_to_list(erlang:timestamp()))).
