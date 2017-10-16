-module(tiles_match).

-export([start_link/0]).
-export([send_message/2]).
-export([join_feed/2,leave_feed/2]).

start_link()->
    {ok,Pid} = gen_event:start_link(),
    {ok,Pid}.

send_message(Pid,Message) ->
    gen_event:notify(Pid,Message).


join_feed(Pid,SendTo)->
    Id = {Pid, make_ref()},
    gen_event:add_sup_handler(Pid, Id, [SendTo]),
    Id.


leave_feed(Pid,Id) ->
    gen_event:delete_handler(Pid,Id,leave_feed).
