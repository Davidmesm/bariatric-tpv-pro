import { Box, IconButton } from "@material-ui/core"
import { DataGrid } from "@material-ui/data-grid"
import { Delete, Edit } from "@material-ui/icons"
import React, { useEffect, useState } from "react"
import { trackPromise } from "react-promise-tracker"
import { usePromiseTracker } from "react-promise-tracker"
import { useHistory, useRouteMatch } from "react-router"
import DeleteDialog from "../../../components/dialogs/DeleteDialog"
import Loading from "../../../components/Loading"
import { useAlerts } from "../../../contexts/AlertsContext"
import { db } from "../../../firebase"
import PageToolBar from "../../components/PageToolBar"

const DistributorCommission = () => {
    const history = useHistory()
    let { url } = useRouteMatch()
    const { promiseInProgress } = usePromiseTracker()
    const { createAlert } = useAlerts()

    const [distributorCommissionData, setDistributorCommissionData] = useState([])
    const [openDialog, setOpenDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState()
    const [exportData, setExportData] = useState([])
    const [clientData, setClientData] = useState([])
    const getClient = (params) => {
        let client = clientData.find(item => item.id === params.row.clientId);

        return `${client ? `${client.firstName} ${client.lastName}` : ""}`}

    const addFunction = (e) => {
        history.push("distributor/add")
    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`)

    const handleDeleteClick = (id) => {
        setIdToDelete(id)
        setOpenDialog(true)
    }
   
    const confirmDelete = () => {
        db.collection('clientCommission')
        .doc(idToDelete)
        .delete()
        .then(() => {
            createAlert("success", "Ajuste eliminado.")
            console.log("Deleted clientCommission document: ", idToDelete);
        })
        .catch((error) => {
            createAlert("error", "Error al eliminar el ajuste")
            console.error("Error deleting clientCommission document: ", error);
        });

        setOpenDialog(false)
    }

    const columns = [
        {
            field: "id",
            headerName: " ",
            width: 140,
            renderCell: (params) => {

                if(params.row.concept === 'Ajuste') {
                    return (
                    <Box>
                        <IconButton
                            aria-label="editar"
                            onClick={() => handleEditClick(params.value)}
                            color="primary">
                            <Edit />
                        </IconButton>
                        <IconButton
                            aria-label="eliminar"
                            onClick={() => handleDeleteClick(params.value)}
                            color="secondary">
                            <Delete />
                        </IconButton>
                    </Box>)
                }
                else {
                    return (<></>)
                }
                
            }
        },
        { field: "date", headerName: "Fecha", width: 120, type: "date" },
        {
            field: "client",
            headerName: "Cliente",
            width: 250,
            valueGetter: getClient,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getClient(cellParam1).localeCompare(getClient(cellParam2))
        },
        { field: "saleId", headerName: "Venta", width: 250 },
        { field: "concept", headerName: "Concepto", width: 200 },
        {
            field: "commission",
            headerName: "Comisión",
            width: 200, valueFormatter: (params) => `$${parseFloat(params.value).toFixed(2)}`
        },
        { field: "comments", headerName: "Comentarios", width: 200 }
    ]

    const exportHeaders = [
        { label: "Id", key: "id" },
        { label: "Fecha", key: "date" },
        { label: "Distribuidor", key: "distributor" },
        { label: "Venta", key: "saleId" },
        { label: "Concepto", key: "concept" },
        { label: "Comisión", key: "commission" },
        { label: "Comentarios", key: "comments" }]

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
            data={exportData}
            addFunction={addFunction}
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
        <DeleteDialog
                setOpenDialog={setOpenDialog}
                openDialog={openDialog}
                idToDelete={idToDelete}
                entityTitle="Comisión de Vendedor"
                confirmDeleteClick={confirmDelete} />
    </Box>
    )
}

export default DistributorCommission
