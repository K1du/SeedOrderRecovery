#!/bin/bash

index=$(jq '.fileIndex' "./data/state.json")
amount=50
for ((i = 1; i <= $index; i += $amount)); do
    node checkForBalance.js $i $((i + amount - 1)) &
    sleep 2
done
