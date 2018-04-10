from visPackage import *
# load the papers

#visualization components
visLayout = {
    "row":[{"column":["Filter", "Graph"]},
            {"column":["Document"]}]
    }

#setup interface
vis = chemVisModule(visLayout)

vis.startServer()
