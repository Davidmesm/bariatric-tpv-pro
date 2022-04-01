import { Box, IconButton } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid'
import PageToolBar from "../../../components/PageToolBar"
import { useHistory, useRouteMatch } from "react-router"
import { Delete, Edit } from "@material-ui/icons"
import { db } from "../../../../firebase"
import { useAlerts } from "../../../../contexts/AlertsContext"
import DeleteDialog from "../../../../components/dialogs/DeleteDialog"

const ContactChannelPage = () => {

    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState("")
    const [contactChannelData, setContactChannelData] = useState([])

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
        { field: "name", headerName: "Canal de Contacto", flex: 1 }
    ]

    const addFunction = () => {
        history.push(`${url}/add`)
    }

    const handleDeleteClick = (id) => {
        setIdToDelete(id)
        setOpenDeleteDialog(true)
    }

    const confirmDeleteClick = () => {
        setOpenDeleteDialog(false)

        db.collection('contactChannel')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Canal de contacto eliminado.")
                console.log("Deleted contactChannel document: ", idToDelete)
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar canal de contacto")
                console.error("Error deleting contactChannel document: ", error)
            })

    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`)

    useEffect(() => {
        const unsubscribe =
            db.collection("contactChannel")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let contactChannels = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        contactChannels.push({ ...docData, id: doc.id })
                    })
                    setContactChannelData(contactChannels)
                }, (error) => {
                    console.error("Unable to subscribe to Contact Channel, error: ", error)
                })

        return unsubscribe
    }, [])


    return (
        <Box>
            <PageToolBar 
                parent={`${url}`} 
                title="Canal de Contacto"
                addFunction={addFunction} />
            <Box height="500px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={contactChannelData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Canal de Contacto"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default ContactChannelPage
