-module(tiles_match_handler).

-export([init/2,terminate/3]).

init(Req0,State) ->
    Qs = cowboy_req:qs(Req0),
    %%io:format("~p~n",[Qs]),
    {ok,Req} = match_api(Qs,Req0),
    {ok,Req,State}.


terminate(_Reason,_Req,_State)->
    ok.

match_api(<<"request_matches">>,Req0) ->
    MSG = format_matches(),
    Req = cowboy_req:reply(200,#{<<"content-type">> => <<"application/json">>},
                           MSG,
                           Req0),

    {ok,Req};
match_api(<<"new_match">>,Req0) ->
    {ok,Id}=tiles_match_making:create_match(),
    %%io:format("~p~n",[Id]),
    MSG = format_matches(),
    Req = cowboy_req:reply(200,#{<<"content-type">> => <<"application/json">>},
                           MSG,
                           Req0),
    {ok,Req};
match_api(_Qs,Req0) ->
    {ok,Req0}.

format_matches()->
    Matches = tiles_match_making:list_matches(),
    MatchSets= [{[{list_to_binary(integer_to_list(I)),
                 list_to_binary(integer_to_list(M))}]} ||
                    {I,M}<-Matches],
    MSG = case MatchSets of
              [] ->
                  jiffy:encode({[{<<"type">>,<<"matches">>},
                                 {<<"body">>,null}]});
              _ ->
                  jiffy:encode({[{<<"type">>,<<"matches">>},
                                 {<<"body">>,MatchSets}]})

          end,
    %%io:format("~p~n",[{MSG}]),
    MSG.
