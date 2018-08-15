from visPackage import *
# load the papers

#visualization components
visLayout = {
    "row":[{"column":["Filter", "Graph"]},
            {"column":["AggregateInfo"]},
            {"column":["Document", "DocComparison"]}
            ]
    }

#setup interface
# vis = chemVisModule(visLayout, "papers.json")
vis = chemVisModule(visLayout, "chem_vis.json")
# vis = chemVisModule(visLayout, "pipeline_papers.json")

vis.startServer()
