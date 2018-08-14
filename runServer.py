from visPackage import *
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--input', default="pipeline_papers.json")
parser.add_argument('--argument-two', default=False, action='store_true',
                    dest='argument_two')


args = parser.parse_args()

# load the papers

#visualization components
visLayout = {
    "row":[{"column":["Filter", "Graph"]},
            {"column":["AggregateInfo"]},
            {"column":["Document"]}
            ]
    }

#setup interface
# vis = chemVisModule(visLayout, "papers.json")
print("Input used: ", args.input)
vis = chemVisModule(visLayout, args.input)

vis.startServer()
