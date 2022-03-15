import { Box, IconButton } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid'
import PageToolBar from "../../../components/PageToolBar"
import { useHistory, useRouteMatch } from "react-router"
import { Delete, Edit } from "@material-ui/icons"
import { db } from "../../../../firebase"
import { useAlerts } from "../../../../contexts/AlertsContext"
import DeleteDialog from "../../../../components/dialogs/DeleteDialog"

const BankPage = () => {
    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState("")
    const [bankData, setBankData] = useState([])

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
        { field: "order", headerName: "Orden", width: 130 },
        { field: "name", headerName: "Banco", flex: 1 }
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

        db.collection('bank')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Banco eliminado.")
                console.log("Deleted bank document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar banco")
                console.error("Error deleting bank document: ", error);
            });

    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

    useEffect(() => {
        const unsubscribe =
            db.collection("bank")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let banks = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        banks.push({ ...docData, id: doc.id })
                    })
                    setBankData(banks);
                }, (error) => {
                    console.error("Unable to subscribe to bank, error: ", error)
                })

        return unsubscribe;
    }, [])


    return (
        <Box>
            <PageToolBar 
                parent={`${url}`} 
                title="Banco"
                addFunction={addFunction} />
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={bankData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Banco"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default BankPage
