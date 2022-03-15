import { Box, IconButton } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { DataGrid } from '@material-ui/data-grid'
import PageToolBar from "../../../components/PageToolBar"
import { useHistory, useRouteMatch } from "react-router"
import { Delete, Edit } from "@material-ui/icons"
import { db } from "../../../../firebase"
import { useAlerts } from "../../../../contexts/AlertsContext"
import DeleteDialog from "../../../../components/dialogs/DeleteDialog"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import Loading from "../../../../components/Loading"

const BankAccountPage = () => {
    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()
    const { promiseInProgress } = usePromiseTracker()

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [idToDelete, setIdToDelete] = useState("")
    const [bankAccountData, setBankAccountData] = useState([])
    const [bankData, setBankData] = useState([])

    const getBank = (params) => {
        let bank = bankData.find(item => item.id === params.row.bankId)
        return `${bank ? bank.name : ""}`
    }

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
        {
            field: "bank",
            headerName: "Banco",
            width: 150,
            valueGetter: getBank,
            sortComparator: (v1, v2, cellParam1, cellParam2) =>
                getBank(cellParam1).localeCompare(getBank(cellParam2))
        },
        { field: "account", headerName: "Cuenta", width: 200 },
        { field: "clabe", headerName: "CLABE", width: 200 },
        { field: "debitCard", headerName: "No. Tarjeta Debito", width: 200 }
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

        db.collection('bankAccount')
            .doc(idToDelete)
            .delete()
            .then(() => {
                createAlert("success", "Cuenta de Banco eliminado.")
                console.log("Deleted bankAccount document: ", idToDelete)
            })
            .catch((error) => {
                createAlert("error", "Error al eliminar la cuenta de banco")
                console.error("Error deleting bankAccount document: ", error)
            })

    }

    const handleEditClick = (id) => history.push(`${url}/edit/${id}`)

    useEffect(() => {
        const unsubscribe =
            db.collection("bankAccount")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let bankAccounts = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        bankAccounts.push({ ...docData, id: doc.id })
                    })
                    setBankAccountData(bankAccounts)
                }, (error) => {
                    console.error("Unable to subscribe to bankAccount, error: ", error)
                })

        return unsubscribe
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("bank")
                .get()
                .then(result => {
                    let data = []
                    result.forEach(doc => {
                        data = [...data, { id: doc.id, ...doc.data() }]
                    })

                    if (data.length > 0) {
                        setBankData(data)
                    }
                })
                .catch(error => console.error(error)))
    }, [bankAccountData])

    if(promiseInProgress)
    {
        return (
            <Loading/>
        )
    }

    return (
        <Box>
            <PageToolBar
                parent={`${url}`}
                title="Cuenta de Banco"
                addFunction={addFunction} />
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={bankAccountData}
                            columns={columns} />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Cuenta de Banco"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default BankAccountPage
