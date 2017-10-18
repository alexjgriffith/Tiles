-module(tiles_match).

-export([start_link/0,start/0]).
-export([send_message/2]).
-export([join/2,leave/2]).

start_link()->
    {ok,Pid} = gen_event:start_link(),
    {ok,Pid}.

start()->
    {ok,Pid} = gen_event:start(),
    {ok,Pid}.


send_message(Pid,Message) ->
    gen_event:notify(Pid,Message).


join(Pid,SendTo)->
    Id = {tiles_feed, make_ref()},
    gen_event:add_sup_handler(Pid, Id, [SendTo]),
    Id.

leave(Pid,Id) ->
    send_message(Pid,{message,
                       <<"message">>,
                       <<"exiting">>,
                       [<<"Server">>,<<"Server">>],
                       tiles_json:jtime()}),
    gen_event:delete_handler(Pid,Id,leave_feed).
