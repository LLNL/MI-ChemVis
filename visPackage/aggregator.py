
class aggregator(object):
    def __init__(self, paperList):
        self.paperList = paperList
        self.comparisionFunc = {
            # "value":
        }

    #### category ####
    def aggregateByKeys(self, selection, keys):
        items = [self.paperList[i] for i in selection]
        for key in keys:
            items = [it[key] for it in items]
        return items

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
