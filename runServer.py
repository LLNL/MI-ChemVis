from visPackage import *
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--input', default="chem_vis.json")
parser.add_argument('--port', type=int, default=5010)


args = parser.parse_args()

# load the papers

#visualization components
visLayout = {
    "row":[{"column":["Filter", "Graph"]},
            {"column":["AggregateInfo"]},
            {"column":["Document", "DocComparison"]}
            ]
    }

#setup interface
print("Input used: ", args.input)
vis = chemVisModule(visLayout, args.input)
vis.startServer(port=args.port)
