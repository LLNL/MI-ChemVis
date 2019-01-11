#!/bin/bash

# Run chemvis and show on port 5010
port=5010
#docker run --name=chemvis -v $(pwd):/code -p $port:5010 chemvis
docker run --name=chemvis chemvis
