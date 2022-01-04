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

function closeAll(tabs, callback=_=>null) {
    for (const tab of tabs) {
        console.log({tabs, tab})
        chrome.tabs.remove(tab.id, callback)
    }
}

chrome.commands.onCommand.addListener(cmd => {
    switch (cmd) {
        case "toggle-open-in-new-group":
            chrome.tabs.query({currentWindow: true, active: true}, e => {
                inNewGroup[e[0].id] = !inNewGroup[e[0].id];
            });
            break;
        case "close-current-tab-group":
            chrome.tabs.query({currentWindow: true, active: true}, e => {
                const groupId = e[0].groupId;
                (groupId > 0) 
                    ? chrome.tabs.query({groupId}, closeAll)
                    : closeAll(e)
            });
            break;
        case "create-new-group-from-tabs":
            chrome.tabs.query({currentWindow: true, highlighted: true}, e => {
                chrome.tabs.group({tabIds: e.map(tab=>tab.id)});
            });
            break;
        default:
            console.warn("No cmd handler for:", cmd);
            break;
    }
});