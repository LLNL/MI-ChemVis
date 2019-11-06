#!/bin/bash

# Run chemvis and show on port 5010
#port=5010
#docker run --name=chemvis -v $(pwd):/code -p $port:5010 chemvis
if [[ -z $1 ]]; then
  docker run --rm  -it -p 5010:5010 chemvis
else
  docker run --rm  -it -p 5010:5010 chemvis --input $1
fi
