import React, { useEffect, useState } from "react"
import { Box, IconButton } from "@material-ui/core"
import { useHistory, useRouteMatch } from "react-router"
import { DataGrid } from "@material-ui/data-grid"
import { db } from "../../../firebase"
import Edit from "@material-ui/icons/Edit"
import Delete from "@material-ui/icons/Delete"
import { useAlerts } from "../../../contexts/AlertsContext"
import DeleteDialog from "../../../components/dialogs/DeleteDialog"

const InventoryInGrid = (props) => {

    const { warehouse, productData } = props
    let { url } = useRouteMatch()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [inventoryInData, setInventoryInData] = useState([])
    const [idToDelete, setIdToDelete] = useState("")
    const [idInvToDelete, setIdInvToDelete] = useState("")
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)


    const handleDeleteClick = (id) => {
        db.collection("inventory")
            .where("inventoryInId", "==", id)
            .get()
            .then((result) => {
                let doc = result.docs[0]

                if (doc.exists) {
                    let inventory = (doc.data())
                    let productsWithQtyOut = inventory.products.filter(product => product.qtyOut > 0)

                    if (productsWithQtyOut.length > 0) {
                        createAlert("error", "No se puede eliminar la compra cuando ya se ha utilizado producto, si desea eliminar producto intente editar la compra.")
                    }
                    else {
                        setIdToDelete(id)
                        setIdInvToDelete(doc.id)
                        setOpenDeleteDialog(true)
                    }
                }
            })
            .catch((error) => {
                createAlert("error", "No se pudo eleminar la compra, error desconocido")
                console.log("error verifying inventory for delete, error: ", error)
            })
    }

    const confirmDeleteClick = () => {
        db.collection("inventoryIn")
            .doc(idToDelete)
            .delete()
            .then(() => {
                console.log("deleted inventoryIn document: ", idToDelete)

                db.collection("inventory")
                    .doc(idInvToDelete)
                    .delete()
                    .then(() => {
                        console.log("deleted inventory document: ", idInvToDelete)
                        createAlert("success", "Compra eliminada")
                    })
                    .catch((error) => {
                        console.error("error deleting inventory with id: ", idInvToDelete, ", error: ", error)
                        createAlert("error", "Error al eliminar compra")
                    })
            })
            .catch((error) => {
                console.error("error deleting inventoryIn with id: ", idToDelete, ", error: ", error)
                createAlert("error", "Error al eliminar compra")
            })

        setOpenDeleteDialog(false)
    }

    const handleEditClick = (id, warehouseId) => {

        history.push(`${url}/warehouse/${warehouseId}/buy/edit/${id}`)
    }

    const columns = [
        {
            field: "inventoryInId",
            headerName: " ",
            width: 140,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        aria-label="editar"
                        onClick={() => handleEditClick(params.value, params.row.warehouseId)}
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
        { field: "inventoryBatchId", headerName: "Clave Compra", width: 250 },
        { field: "reference", headerName: "Referencia", width: 200 },
        { field: "productName", headerName: "Producto", width: 200 },
        { field: "flavour", headerName: "Versión", width: 150 },
        { field: "cost", headerName: "Costo", width: 130 },
        { field: "qty", headerName: "Cantidad", width: 140 }]

    useEffect(() => {
        const processBatch = (invBatches) => {
            let data = []
            invBatches.forEach(batch =>
                batch.products.forEach(batchProduct => {
                    const { productId, cost, ...productToAdd } = batchProduct

                    productToAdd.id = data.length
                    productToAdd.inventoryInId = batch.id
                    productToAdd.inventoryBatchId = batch.id
                    productToAdd.cost = `$${batchProduct.cost.toFixed(2)}`
                    productToAdd.reference = batch.reference
                    productToAdd.warehouseId = batch.warehouseId

                    let productInfo = productData.find(p => p.id === batchProduct.productId)
                    productToAdd.productName = productInfo ? productInfo.name : "Error"

                    data = [...data, productToAdd]
                }))

            setInventoryInData(data)
        }

        const unsubscribe = warehouse.value ?
            db.collection("inventoryIn")
                .where("warehouseId", "==", warehouse.value)
                .orderBy("date")
                .onSnapshot((snapShot) => {
                    let invBatch = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        invBatch.push({ id: doc.id, ...docData })
                    })

                    processBatch(invBatch)

                }, (error) => {
                    console.error("Unable to subscribe to inventoryIn, error: ", error)
                })
            : db.collection("inventoryIn")
                .orderBy("date")
                .onSnapshot((snapShot) => {
                    let invBatch = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        invBatch.push({ id: doc.id, ...docData })
                    })

                    processBatch(invBatch)

                }, (error) => {
                    console.error("Unable to subscribe to inventoryIn, error: ", error)
                })

        return unsubscribe
    }, [warehouse, setInventoryInData, productData])


    return (
        <Box>
            <Box height="400px">
                <Box display="flex" height="100%">
                    <Box flexGrow={1}>
                        <DataGrid
                            rows={inventoryInData}
                            columns={columns}
                        />
                    </Box>
                </Box>
            </Box>
            <DeleteDialog
                setOpenDialog={setOpenDeleteDialog}
                openDialog={openDeleteDialog}
                idToDelete={idToDelete}
                entityTitle="Compra"
                confirmDeleteClick={confirmDeleteClick} />
        </Box>
    )
}

export default InventoryInGrid
