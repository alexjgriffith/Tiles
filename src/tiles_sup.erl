-module(tiles_sup).
-behaviour(supervisor).
-export([start_link/0]).
-export([init/1]).

start_link() ->
    ChildSpecs = [{state,
                   {tiles_state,start_link,[[]]},
                   permanent,brutal_kill,worker,[tiles_state]},
                  {tiles_serve_id,
                   {tiles_serve_id,start_link,[]},
                   permanent,brutal_kill,worker,[tiles_serve_id]},
                  {tiles_bcast,
                   {tiles_bcast,start_link,[]},
                   permanent,brutal_kill,worker,[tiles_bcast]}],
    supervisor:start_link({local, ?MODULE}, ?MODULE, ChildSpecs).

init(Specs) ->
{ok, { {one_for_one, 5, 10},
       Specs} }.
