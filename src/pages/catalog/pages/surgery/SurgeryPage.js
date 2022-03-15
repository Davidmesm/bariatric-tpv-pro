import { Box, IconButton } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid'
import PageToolBar from "../../../components/PageToolBar"
import { useHistory, useRouteMatch } from "react-router"
import { Delete, Edit } from "@material-ui/icons"
import { db } from "../../../../firebase"
import { useAlerts } from "../../../../contexts/AlertsContext"
import DeleteDialog from "../../../../components/dialogs/DeleteDialog"

const SurgeryPage = () => {
    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState("")
    const [SurgeryData, setSurgeryData] = useState([])

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
        { field: "name", headerName: "Cirugía", flex: 1 }
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

        db.collection('surgery')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Cirugía eliminada.")
                console.log("Deleted surgery document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar cirugía")
                console.error("Error deleting surgery document: ", error);
            });

    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

    useEffect(() => {
        const unsubscribe =
            db.collection("surgery")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let surgeries = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        surgeries.push({ ...docData, id: doc.id })
                    })
                    setSurgeryData(surgeries);
                }, (error) => {
                    console.error("Unable to subscribe to surgery, error: ", error)
                })

        return unsubscribe;
    }, [])


    return (
        <Box>
            <PageToolBar 
                parent={`${url}`} 
                title="Cirugía"
                addFunction={addFunction} />
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={SurgeryData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Cirugía"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default SurgeryPage
