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

const VendorCommission = () => {
    const history = useHistory()
    let { url } = useRouteMatch()
    const { promiseInProgress } = usePromiseTracker()
    const { createAlert } = useAlerts()

    const [vendorCommissionData, setVendorCommissionData] = useState([])
    const [openDialog, setOpenDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState()
    const [selectedCommission, setSelectedCommission] = useState([])
    const [payment, setPayment] = useState(0)
    const [exportData, setExportData] = useState([])
    const [vendorData, setVendorData] = useState([])

    const getVendor = (params) => {
        let vendor = vendorData.find(item => item.id === params?.row?.vendorId);

        return `${vendor ? `${vendor.firstName} ${vendor.lastName}` : ""}`
    }

    const addFunction = (e) => {
        history.push("vendor/add")
    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`)

    const handleDeleteClick = (id) => {
        setIdToDelete(id)
        setOpenDialog(true)
    }

    const confirmDelete = () => {
        db.collection('vendorCommission')
        .doc(idToDelete)
        .delete()
        .then(() => {
            createAlert("success", "Ajuste eliminado.")
            console.log("Deleted vendorCommission document: ", idToDelete);
        })
        .catch((error) => {
            createAlert("error", "Error al eliminar el ajuste")
            console.error("Error deleting vendorCommission document: ", error);
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
            field: "vendor",
            headerName: "Vendedor",
            width: 250,
            valueGetter: getVendor,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getVendor(cellParam1).localeCompare(getVendor(cellParam2))
        },
        { field: "saleId", headerName: "Venta", width: 250 },
        { field: "concept", headerName: "Concepto", width: 200 },
        {
            field: "commission",
            headerName: "Comisión",
            width: 200, valueFormatter: (params) => `$${parseFloat(params.value).toFixed(2)}`
        },
        { field: "status", headerName: "Estado", width: 150 },
        { field: "comments", headerName: "Comentarios", width: 200 }
    ]

    const exportHeaders = [
        { label: "Id", key: "id" },
        { label: "Fecha", key: "date" },
        { label: "Vendedor", key: "vendor" },
        { label: "Venta", key: "saleId" },
        { label: "Concepto", key: "concept" },
        { label: "Comisión", key: "commission" },
        { label: "Estatus", key: "status" },
        { label: "Comentarios", key: "comments" }]

    const updateSelectionInfo = (selectedIds) => {
        const selectedRowData = vendorCommissionData.filter((row) =>
            selectedIds.includes(row.id.toString()));

        let toPay = selectedRowData.reduce((accum, curr) => {
            return accum += curr.commission;
        }, 0)

        setPayment(toPay);

        setSelectedCommission(selectedRowData);
    }

    useEffect(() => {
        const unsubscribe =
            db.collection("vendorCommission").orderBy("date", "desc")
                .onSnapshot((snapShot) => {
                    let commission = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        docData.date = docData.date.toDate()
                        commission.push({ ...docData, id: doc.id })
                    })
                    setVendorCommissionData(commission);
                }, (error) => {
                    console.error("Unable to subscribe to vendorCommission, error: ", error)
                })

        trackPromise(
            db.collection("vendor")
                .orderBy("firstName")
                .get()
                .then((result) => {
                    let vendors = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        vendors.push({ id: doc.id, ...docData })
                    })
                    setVendorData(vendors)
                })
                .catch((error) => {
                    console.error("Error retrieving vendors: ", error)
                }))

        return unsubscribe;
    }, [])

    useEffect(() => {
        let data = []
        
        if(!vendorCommissionData )
        {
            return
        }

        data = vendorCommissionData.map(cv => {
            const { vendorId, ...vendorCommissionToExport } = cv

            let vendor = vendorData.find(item => item.id === cv.vendorId)

            vendorCommissionToExport.vendor = vendor ? `${vendor.firstName} ${vendor.lastName}` : ""

            return vendorCommissionToExport
        })

        setExportData(data)

    }, [vendorData, vendorCommissionData, setExportData])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <Box>
            <PageToolBar
                parent={`${url}`}
                title="Comisión Vendedor"
                addFunction={addFunction}
                data={exportData}
                headers={exportHeaders} />
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            checkboxSelection={true}
                            disableSelectionOnClick
                            isRowSelectable={(params) => params.row.status === "Pendiente"}
                            rows={vendorCommissionData}
                            onSelectionModelChange={(newSelection) => {
                                updateSelectionInfo(newSelection);
                            }}
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

export default VendorCommission
