import { Box, IconButton } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid'
import PageToolBar from "../../../components/PageToolBar"
import { useHistory, useRouteMatch } from "react-router"
import { Delete, Edit } from "@material-ui/icons"
import { db } from "../../../../firebase"
import { useAlerts } from "../../../../contexts/AlertsContext"
import DeleteDialog from "../../../../components/dialogs/DeleteDialog"

const PaymentTypePage = () => {
    
    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState("")
    const [paymentTypeData, setPaymentTypeData] = useState([])

    const columns = [
        {
            field: "id",
            headerName: " ",
            width: 140,
            renderCell: (params) => (
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
                </Box>
            )
        },
        { field: "order", headerName: "Orden", width: 130},
        { field: "name", headerName: "Forma de Pago", flex: 1 },
        { field: "requiredBankAccount",
            headerName: "Requiere Cuenta Bancaria",
            width: 250,
            type: 'boolean' }
    ]

    const addFunction = () => {
        history.push(`${url}/add`)
    }

    const handleDeleteClick = (id) => {
        setIdToDelete(id);
        setOpenDeleteDialog(true);
    }

    const confirmDeleteClick = () => {
        setOpenDeleteDialog(false);

        db.collection('paymentType')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Forma de Pago eliminada.")
                console.log("Deleted paymentType document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar la forma de pago.")
                console.error("Error deleting paymentType document: ", error);
            });

    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

    useEffect(() => {
        const unsubscribe =
            db.collection("paymentType")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let paymentTypes = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        paymentTypes.push({ ...docData, id: doc.id })
                    })
                    setPaymentTypeData(paymentTypes);
                }, (error) => {
                    console.error("Unable to subscribe to paymentType, error: ", error)
                })

        return unsubscribe;
    }, [])


    return (
        <Box>
            <PageToolBar 
                parent={`${url}`} 
                title="Banco"
                addFunction={addFunction} />
            <Box height="500px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={paymentTypeData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Forma de Pago"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default PaymentTypePage
