async function handleProxyAuth(relations) {
    let pendingRequests = []

    function completed(requestDetails) {
        var index = pendingRequests.indexOf(requestDetails.requestId)
        if (index > -1) {
            pendingRequests.splice(index, 1)
        }
    }

    function provideCredentialsSync(requestDetails) {
        if (pendingRequests.indexOf(requestDetails.requestId) != -1) {
            return { cancel: true }
        }

        pendingRequests.push(requestDetails.requestId)

        if (
            relations &&
            relations[requestDetails.cookieStoreId] &&
            relations[requestDetails.cookieStoreId].authCredentials
        ) {
            return {
                authCredentials:
                    relations[requestDetails.cookieStoreId].authCredentials,
            }
        }

        return {
            authCredentials: null,
        }
    }

    browser.webRequest.onAuthRequired.addListener(
        provideCredentialsSync,
        {
            urls: ["<all_urls>"],
        },
        ["blocking"],
    )

    browser.webRequest.onCompleted.addListener(completed, {
        urls: ["<all_urls>"],
    })

    browser.webRequest.onErrorOccurred.addListener(completed, {
        urls: ["<all_urls>"],
    })
}

async function main() {
    let relations = {}

    let rel = await browser.storage.local.get("relations")
    if (relations in rel) {
        for (key in rel.relations) {
            relations[key] = rel.relations[key]
        }
    }
    browser.proxy.onRequest.addListener(
        function (req) {
            let rr = relations[req.cookieStoreId]
            if (rr) {
                return relations[req.cookieStoreId]
            }
            return []
        },
        {
            urls: ["<all_urls>"],
        },
    )

    browser.storage.onChanged.addListener((c) => {
        for (key in relations) {
            delete relations[key]
        }
        let data = c?.relations?.newValue

        for (key in data) {
            relations[key] = data[key]
        }
    })

    handleProxyAuth(relations)
}

main().catch((e) => console.log(e))
