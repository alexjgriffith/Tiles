-module(erws_app).
-behaviour(application).
-export([start/2, stop/1]).

start(_StartType, _StartArgs) ->
    lager:debug("Starting App", []),
    Dispatch = cowboy_router:compile(
                 [
                  {'_', [
                         {"/", cowboy_static, {priv_file,erws,"index.html"}},
                         {"/assets/[...]", cowboy_static, {priv_dir,erws,"assets"}},
                         {"/websocket", erws_handler, []}
                        ]}
                 ]),
    {ok, _} = cowboy:start_clear(http, [{port, 9900}],
        #{env => #{dispatch => Dispatch}}),
    erws_serve_id:start_link(), %% move to erws_sup and make one-for-rest
    erws_state:start_link([]), %% move to erws_sup and make one-for-rest
    erws_bcast:start_link(),
    erws_sup:start_link().

stop(_State) ->
ok.
