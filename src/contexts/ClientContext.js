import React, { useContext, useEffect, useState } from "react"
import { db } from "../firebase"

const ClientContext = React.createContext()

export const useClient = () => {
    return useContext(ClientContext)
}

const ClientProvider = ({children}) => {
    const [clientData, setClientData] = useState([])
    const [loading, setLoading] = useState(true)

    const getClient = async (clientId) => 
        new Promise((resolve, reject) => {
            var client = clientData.find(c => c.id === clientId)

            if(client) return resolve(client)

            return reject("client not found")
        })

    const value = {
        clientData,
        getClient
    }

    useEffect(() => {
        const unsubscribe =
            db.collection("client")
                .orderBy("firstName")
                .onSnapshot((snapShot) => {
                    let clients = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        docData.fullName = `${docData.firstName || ""} ${docData.lastName || ""}`
                        clients.push({ ...docData, id: doc.id })
                    })
                    setClientData(clients);
                }, (error) => {
                    console.error("Unable to subscribe to client, error: ", error)
                })
        setLoading(false)
        return unsubscribe;
    }, [])

    return (
        <ClientContext.Provider value={value}>
            {!loading && children}
        </ClientContext.Provider>
    )
}

export default ClientProvider