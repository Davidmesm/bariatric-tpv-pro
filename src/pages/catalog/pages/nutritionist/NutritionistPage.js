import { Box, IconButton } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid'
import PageToolBar from "../../../components/PageToolBar"
import { useHistory, useRouteMatch } from "react-router"
import { Delete, Edit } from "@material-ui/icons"
import { db } from "../../../../firebase"
import { useAlerts } from "../../../../contexts/AlertsContext"
import DeleteDialog from "../../../../components/dialogs/DeleteDialog"

const NutritionistPage = () => {
    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState("")
    const [nutritionistData, setNutritionistData] = useState([])

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
        { field: "name", headerName: "Nutriólogo o Grupo", flex: 1 }
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

        db.collection('nutritionist')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Nutriólogo o Grupo eliminado.")
                console.log("Deleted nutritionist document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar al nutriólogo o grupo")
                console.error("Error deleting nutritionist document: ", error);
            });

    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

    useEffect(() => {
        const unsubscribe =
            db.collection("nutritionist")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let nutritionists = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        nutritionists.push({ ...docData, id: doc.id })
                    })
                    setNutritionistData(nutritionists);
                }, (error) => {
                    console.error("Unable to subscribe to nutritionists, error: ", error)
                })

        return unsubscribe;
    }, [])


    return (
        <Box>
            <PageToolBar 
                parent={`${url}`} 
                title="Nutriólogo o Grupo"
                addFunction={addFunction} />
            <Box height="500px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={nutritionistData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Nutriólogo o Grupo"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default NutritionistPage
