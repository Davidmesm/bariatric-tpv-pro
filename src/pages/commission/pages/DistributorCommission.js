import { Box } from "@material-ui/core"
import { DataGrid } from "@material-ui/data-grid"
import React, { useEffect, useState } from "react"
import { trackPromise } from "react-promise-tracker"
import { usePromiseTracker } from "react-promise-tracker"
import { useRouteMatch } from "react-router"
import Loading from "../../../components/Loading"
import { db } from "../../../firebase"
import PageToolBar from "../../components/PageToolBar"

const DistributorCommission = () => {
    let { url } = useRouteMatch();
    const { promiseInProgress } = usePromiseTracker();

    const [distributorCommissionData, setDistributorCommissionData] = useState([])
    const [exportData, setExportData] = useState([])
    const [clientData, setClientData] = useState([])
    
    const getClient = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId);

        return `${client ? `${client.firstName} ${client.lastName}` : ""}`
    }

    const columns = [
        { field: "date", headerName: "Fecha", width: 120, type: "date" },
        {
            field: "client",
            headerName: "Cliente",
            width: 250,
            valueGetter: getClient,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getClient(cellParam1).localeCompare(getClient(cellParam2))
        },
        { field: "saleId", headerName: "Venta", width: 200 },
        { field: "concept", headerName: "Concepto", width: 200 },
        {
            field: "commission",
            headerName: "Comisión",
            width: 200, valueFormatter: (params) => `$${parseFloat(params.value).toFixed(2)}`
        },
    ]

    const exportHeaders = [
        { label: "Id", key: "id" },
        { label: "Fecha", key: "date" },
        { label: "Distribuidor", key: "distributor" },
        { label: "Venta", key: "saleId" },
        { label: "Concepto", key: "concept" },
        { label: "Comisión", key: "commission" }]

        useEffect(() => {
            const unsubscribe =
                db.collection("clientCommission").orderBy("date", "desc")
                    .onSnapshot((snapShot) => {
                        let commission = []
                        snapShot.forEach((doc) => {
                            let docData = doc.data();
                            docData.date = docData.date.toDate()
                            commission.push({ ...docData, id: doc.id })
                        })
                        setDistributorCommissionData(commission);
                    }, (error) => {
                        console.error("Unable to subscribe to clientCommission, error: ", error)
                    })
    
            trackPromise(
                db.collection("client")
                    .orderBy("firstName")
                    .get()
                    .then((result) => {
                        let clients = []
                        result.forEach((doc) => {
                            let docData = doc.data()
                            clients.push({ id: doc.id, ...docData })
                        })
                        setClientData(clients)
                    })
                    .catch((error) => {
                        console.error("Error retrieving clients: ", error)
                    }))
    
            return unsubscribe;
        }, [])
    
        useEffect(() => {
            let data = []
            
            if(!distributorCommissionData )
            {
                return
            }
    
            data = distributorCommissionData.map(cc => {
                const { clientId, ...distributorCommissionToExport } = cc
    
                let client = clientData.find(item => item.id === cc.clientId)
    
                distributorCommissionToExport.distributor = client ? `${client.firstName} ${client.lastName}` : ""
    
                return distributorCommissionToExport
            })
    
            setExportData(data)
    
        }, [clientData, distributorCommissionData, setExportData])
    
        if (promiseInProgress) {
            return (
                <Loading />
            )
        }

    return (
        <Box>
        <PageToolBar
            parent={`${url}`}
            title="Comisión Distribuidor"
            disableAddButton={true}
            data={exportData}
            headers={exportHeaders} />
        <Box height="400px">
            <Box display="flex" height="100%">
                <Box flexGrow={1}>
                    <DataGrid
                        rows={distributorCommissionData}
                        columns={columns} />
                </Box>
            </Box>
        </Box>
    </Box>
    )
}

export default DistributorCommission
