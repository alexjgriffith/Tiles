-module(tiles_bcast).

-export([start_link/0]).
-export([send_message/1]).
-export([join_feed/1,leave_feed/1]).

start_link()->
    {ok,Pid} = gen_event:start_link({local, tiles_bcast_process}),
    gen_event:add_handler(whereis(tiles_bcast_process), tiles_logger, []),
    {ok,Pid}.

send_message(Message) ->
    gen_event:notify(whereis(tiles_bcast_process),Message).


join_feed(SendTo)->
    Id = {tiles_feed, make_ref()},
    gen_event:add_sup_handler(whereis(tiles_bcast_process), Id, [SendTo]),
    Id.

leave_feed(Id) ->
    gen_event:delete_handler(whereis(tiles_bcast_process),Id,leave_feed).
