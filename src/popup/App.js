import React, { useEffect, useState } from "react"
import "./App.css"
import { Form } from "./Form"
import * as browser from "webextension-polyfill"

export function App() {
    let [relations, setRelations] = useState({})

    useEffect(() => {
        let dataFetchInterval = setInterval(() => {
            ;(async () => {
                let rr = await browser.storage.local.get("relations")
                if (
                    rr &&
                    rr.relations &&
                    Object.keys(rr) &&
                    Object.keys(rr.relations).length >= 1
                ) {
                    setRelations(rr.relations)
                } else {
                    setRelations([])
                }
            })()
        }, 500)

        return () => {
            clearInterval(dataFetchInterval)
        }
    }, [])

    return (
        <>
            <Form />
            <div>
                <div className="flex items-center px-4">
                    <div className="overflow-x-auto w-full">
                        <table className="mx-auto max-w-4xl w-full whitespace-nowrap rounded-lg bg-white divide-y divide-gray-300 overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr className="text-gray-600 text-left">
                                    <th className="font-semibold text-sm uppercase px-6 py-4">
                                        Name
                                    </th>
                                    <th className="font-semibold text-sm uppercase px-6 py-4">
                                        Proxy
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.entries(relations).map((s) => (
                                    <tr key={s[0]}>
                                        <td className="px-6 py-4">
                                            <p>{s[1].containerName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p>
                                                {s[1].authCredentials
                                                    ? s[1].authCredentials
                                                          .username + " -- "
                                                    : ""}{" "}
                                                {s[1].type}
                                                ://{s[1].host}:{s[1].port}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
