-module(tiles_app).
-behaviour(application).
-export([start/2, stop/1,version/0]).

start(_StartType, _StartArgs) ->
    lager:debug("Starting App", []),
    Dispatch = cowboy_router:compile(
                 [
                  {'_', [
                         {"/", cowboy_static, {priv_file,tiles,"testing.html"}},
                         {"/assets/[...]", cowboy_static, {priv_dir,tiles,"assets"}},
                         {"/api/v0/match",tiles_match_handler,[]},
                         {"/websocket", tiles_handler, []}
                        ]}
                 ]),
    {ok, _} = cowboy:start_clear(http, [{port, 11000}],#{
                                         env => #{dispatch => Dispatch},
                                         stream_handlers =>
                                             [cowboy_compress_h, cowboy_stream_h]
                                  }),

    tiles_sup:start_link().

stop(_State) ->
ok.

version()->
    <<"0.0.1">>.
