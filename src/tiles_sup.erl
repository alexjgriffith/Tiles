-module(tiles_sup).
-behaviour(supervisor).
-export([start_link/0]).
-export([init/1]).

start_link() ->
    ChildSpecs = [
                  {match_making,
                   {tiles_match_making,start_link,[]},
                   permanent,brutal_kill,worker,[tiles_match_making]},
                  {tiles_serve_id,
                   {tiles_serve_id,start_link,[]},
                   permanent,brutal_kill,worker,[tiles_serve_id]},
                  {tiles_uid,
                   {tiles_uid,start_link,[]},
                   permanent,brutal_kill,worker,[tiles_uid]},
                  {tiles_bcast,
                   {tiles_bcast,start_link,[]},
                   permanent,brutal_kill,worker,[tiles_bcast]}],
    supervisor:start_link({local, ?MODULE}, ?MODULE, ChildSpecs).

init(Specs) ->
{ok, { {one_for_one, 5, 10},
       Specs} }.
