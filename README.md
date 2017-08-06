erws
=====

An OTP application

Build
-----

    $ rebar3 compile

Notes
-----

### TODO
Specify `erws_message` and `erws_id` types using `jiffy` to decode recived JSON and `rec2json` to parse the resulting json into erlang records.

1. Reporduce erws_json in erws_message and erws_id
2. move erws_id to erws_id_serv
3. Remove erws_json sample and sru
