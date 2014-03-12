ko.bindingHandlers['selectedOptions'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        ko.utils.registerEventHandler(element, "change", function () {
            var value = valueAccessor(), valueToWrite = [];
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                if (node.selected)
                    valueToWrite.push(ko.selectExtensions.readValue(node));
            });
            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
        });
    },
    'update': function (element, valueAccessor) {
        if (ko.utils.tagNameLower(element) != "select")
            throw new Error("values binding applies only to SELECT elements");
        
        // Workaround for IE6-IE11 bug: It won't reliably apply values to SELECT nodes during the same execution thread
        // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
        // to apply the selected values as well.
        setTimeout(function () {
            var newValue = ko.utils.unwrapObservable(valueAccessor());
            if (newValue && typeof newValue.length == "number") {
                ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                    var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
                    ko.utils.setOptionNodeSelectionState(node, isSelected);
                });
            },
        0);
    }
};
ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
