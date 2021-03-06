let inNewGroup = {};

chrome.tabs.onCreated.addListener(tab => {
    if (tab.pendingUrl != "chrome://newtab/" && tab.openerTabId) {
        chrome.tabs.get(tab.openerTabId, openerTab => {

            const groupId = openerTab.groupId
            if (groupId < 0 ) {
                chrome.tabs.group({
                    tabIds: [
                        tab.openerTabId,
                        tab.id
                    ]
                });

            } else { 

                const newGroupId = !inNewGroup[tab.openerTabId]
                    ? groupId
                    : inNewGroup[tab.openerTabId]>1
                    ? inNewGroup[tab.openerTabId]
                    : undefined;

                chrome.tabs.group({
                    groupId: newGroupId,
                    tabIds: tab.id
                }, id => {
                    if (inNewGroup[tab.openerTabId]===true) {
                        inNewGroup[tab.openerTabId] = id
                    }
                });
            }
        });
    }
});

chrome.commands.onCommand.addListener(cmd => {
    if (cmd == "toggle-open-in-new-group") {
        chrome.tabs.query({currentWindow: true, active: true}, e => {
            inNewGroup[e[0].id] = !inNewGroup[e[0].id];
        });
    }
});