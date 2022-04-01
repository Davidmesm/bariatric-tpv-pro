import { Box, IconButton } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid';
import PageToolBar from "../../../components/PageToolBar"
import { useHistory, useRouteMatch } from "react-router";
import { Delete, Edit } from "@material-ui/icons";
import { db } from "../../../../firebase";
import { useAlerts } from "../../../../contexts/AlertsContext";
import DeleteDialog from "../../../../components/dialogs/DeleteDialog";

const PriceTypePage = () => {
    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState("")
    const [priceTypeData, setPriceTypeData] = useState([])

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
        { field: "name", headerName: "Tipo de Precio", flex: 1 },
        { field: "level", headerName: "Nivel", width: 130 }
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

        db.collection('priceType')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Tipo de precio eliminado.")
                console.log("Deleted priceType document: ", idToDelete);
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar tipo de precio")
                console.error("Error deleting priceType document: ", error);
            });

    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`);

    useEffect(() => {
        const unsubscribe =
            db.collection("priceType")
                .orderBy("level")
                .onSnapshot((snapShot) => {
                    let priceTypes = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        priceTypes.push({ ...docData, id: doc.id })
                    })
                    setPriceTypeData(priceTypes);
                }, (error) => {
                    console.error("Unable to subscribe to Price type, error: ", error)
                })

        return unsubscribe;
    }, [])


    return (
        <Box>
            <PageToolBar
                parent={`${url}`}
                title="Tipo de Precio"
                addFunction={addFunction} />
            <Box height="500px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={priceTypeData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Tipo de Precio"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default PriceTypePage
