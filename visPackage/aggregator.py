
class aggregator(object):
    def __init__(self, paperList):
        self.paperList = paperList
        self.comparisionFunc = {
            # "value":
        }

    #### category ####
    def aggregateByKeys(self, selection, keys):

        items = [(paper, i) for i, paper in enumerate(self.paperList)]
        #### if the list is not empty
        if selection:
            items = [items[i] for i in selection]
        print selection, keys

        for key in keys:
            newItems = []
            for item in items:
                if isinstance(item[0], list):
                    for it in item[0]:
                        if key in it:
                            newItems.append( (it[key], item[1]) )
                else:
                    if key in item[0]:
                        newItems.append( (item[0][key], item[1]) )

            items = newItems

        # print items
        # itSet = {el:0 for el in items}
        keyCount = {}
        for it in items:
            if it[0] not in keyCount:
                keyCount[it[0]] = set([it[1]])
            else:
                keyCount[it[0]].add(it[1])
        for key in keyCount:
            keyCount[key] = list(keyCount[key])
        keyCount.pop(None, None)
        print "keyCount:", keyCount.keys()
        return keyCount



    def distByIndex(indexPairs, keys):
        dist = []
        for pair in indexPairs:
            distance = self.paperDist(self.paperList[pair[0]],
                    self.paperList[pair[1]], keys)
            dist.append(distance)
        return dist

    def paperDist(paper1, paper2, keys):
        dist = 0
        for key in keys:
            if key in paper1 and key in paper2:
                if self.comparisonFunc[key](paper1[key], paper2[key]):
                    dist = dist +1
