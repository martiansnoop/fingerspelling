#! /bin/bash -e
for x in {a..z}
do
    echo "$x"
    wget "http://asl.gs/slideshow/$x.gif"
done
