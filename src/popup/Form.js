import React, { useEffect, useState } from "react"
import * as browser from "webextension-polyfill"

export function Form() {
    let [proxies, setProxies] = useState("")

    const onProxyInput = async (event) => {
        let value = event.target.value
        setProxies(value)

        let proxiesParsed = value
            .split(/\r?\n/)
            .filter((v) => !!v)
            .map((v) => v.trim().replaceAll("\n", ""))
            .map((v) => v.split(":"))
            .filter((v) => v.length >= 2 && !!v[1])
            .map((v) => {
                let pxy = {
                    host: v[0],
                    port: v[1],
                }

                if (v[3]) {
                    pxy.authCredentials = { username: v[2], password: v[3] }
                }

                return pxy
            })

        if (
            proxiesParsed &&
            proxiesParsed.length &&
            proxiesParsed.length >= 1
        ) {
            let containers = await browser.contextualIdentities.query({})

            let relations = {}

            for (let storeId in containers) {
                let prxy = proxiesParsed[storeId % proxiesParsed.length]
                let cc = containers[storeId]
                relations[cc.cookieStoreId] = {
                    type: "http",
                    host: `${prxy.host}`,
                    port: `${prxy.port}`,
                    proxyDns: true,
                    containerName: cc.name,
                    authCredentials: prxy.authCredentials,
                }
            }

            let state = {
                proxiesRaw: value,
                relations,
            }
            console.log("saving state", state)
            await browser.storage.local.set(state)
        } else {
            await browser.storage.local.set({ proxiesRaw: "", relations: [] })
        }
    }

    useEffect(() => {
        ;(async () => {
            let rr = await browser.storage.local.get("proxiesRaw")
            if (rr && rr.proxiesRaw) {
                setProxies(rr.proxiesRaw)
            }
        })()
    }, [])

    return (
        <>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="border focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
                        <div className="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
                            <p>
                                <label
                                    htmlFor="name"
                                    className="bg-white text-gray-600 px-1"
                                >
                                    Proxy List *
                                </label>
                            </p>
                        </div>
                        <p>
                            <textarea
                                onChange={onProxyInput}
                                value={proxies}
                                id="name"
                                autoComplete="false"
                                tabIndex={0}
                                type="text"
                                className="py-1 px-1 text-gray-900 outline-none block h-full w-full"
                            ></textarea>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
