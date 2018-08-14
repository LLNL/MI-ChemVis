
class aggregator(object):
    def __init__(self, paperList):
        self.paperList = paperList
        self.comparisionFunc = {
            # "value":
        }
        self.generateAllTags()

    def generateAllTags(self):
        tagDict = {}

        def isNumber(val):
            # number = True
            if isinstance(val, basestring):
                try:
                    float(val)
                except ValueError:
                    return False
                try:
                    int(val)
                except ValueError:
                    return False
            else:
                if not isinstance(val, (float,int,long)):
                    return False
            return True

        def findTag(item, keys):
            if isinstance(item, list):
                for it in item:
                    findTag(it, keys)
            elif isinstance(item, dict):
                for key in item:
                    ### remove
                    if isNumber(item[key]):
                        return

                    tag = keys+[key]
                    tag = ":".join(tag)
                    if tag in tagDict:
                        tagDict[tag] = tagDict[tag]+1
                    else:
                        tagDict[tag] = 1
                    findTag(item[key], keys+[key])
            else:
                # print item
                if isinstance(item, basestring):
                    if isNumber(item):
                        return

                    if len(item)<20:
                        tag = keys+[item]
                        tag = ":".join(tag)
                        if tag in tagDict:
                            tagDict[tag] = tagDict[tag]+1
                        else:
                            tagDict[tag] = 1
                # else:
                    # print item

        # print self.paperList[0]
        for item in self.paperList:
            findTag(item,[])

        # print tagDict
        self.tagDict = tagDict

        ##dump json##
        # import json
        # with open('autocomplete.json', 'w') as f:
        #     json.dump(tagDict, f)

    def tagAutocomplete(self, term):
        autoList = []
        for key in self.tagDict:
            if term in key:
                autoList.append( (key, self.tagDict[key]) )

        autoList.sort(key=lambda d:d[1],reverse=True)
        # print autoList
        return [it[0] for it in autoList]

    #### category ####
    def aggregateLabelsByKeys(self, selection, keys):
        items = [(paper, i) for i, paper in enumerate(self.paperList)]
        #### if the list is not empty
        if selection:
            items = [items[i] for i in selection]
        # print selection, keys

        for key in keys:
            newItems = []
            for item in items:
                if key in item[0]:
                    ####### flatten the list #######
                    if isinstance(item[0][key], list):
                        for it in item[0][key]:
                            newItems.append( (it, item[1]) )
                    else:
                        newItems.append( (item[0][key], item[1]) )
            items = newItems

        keyCount = {}
        for it in items:
            if it[0] not in keyCount:
                keyCount[it[0]] = set([it[1]])
            else:
                keyCount[it[0]].add(it[1])
        for key in keyCount:
            keyCount[key] = list(keyCount[key])
        keyCount.pop(None, None)
        # print "keyCount:", keyCount.keys()
        return keyCount

    def aggregateValuesByKeys(self, selection, keysX, keysY):
        items = [(paper, i) for i, paper in enumerate(self.paperList)]
        #### if the list is not empty
        if selection:
            items = [items[i] for i in selection]
        # print selection, keys

        ###### assume there is two keys #######
        key0x = keysX[0]
        key1x = keysX[1]
        key0y = keysY[0]
        key1y = keysY[1]

        newItems = []
        print "items length", len(items)
        for item in items:
            if key0x in item[0] and key0y in item[0]:
                ### check if
                xval = [it[0][key1x] for it in item[0][key0x]]
                yval = [it[0][key1y] for it in item[0][key0y]]
                if xval and yval:
                    # print keyXval, keyYval
                    newItems.append( [max(xval), max(yval), item[1]] )

        print "==============\n", newItems, "\n=============="
        return newItems



    def groupByKeys(self, selection, keys):
        group = []
        items = [(paper, i) for i, paper in enumerate(self.paperList)]
        #### if the list is not empty
        if selection:
            items = [items[i] for i in selection]

        def hasKey(item, keys, keyIndex, index, group):
            # print keys, keyIndex
            if isinstance(item, list):
                for it in item:
                    hasKey(it, keys, keyIndex, index, group)
            else:
                if keys[-1] == keys[keyIndex]:
                    # print item, keys[keyIndex]
                    if keys[keyIndex] == item:
                        group.append(index)
                else:
                    if keys[keyIndex] in item:
                        it = item[keys[keyIndex]]
                        hasKey(it, keys, keyIndex+1, index, group)

        for item in items:
            hasKey(item[0], keys, 0, item[1], group)
        return group

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
