import {
    Box,
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle,
    Grid
} from "@material-ui/core"
import React from "react"
import TextFieldInput from "../../../components/inputs/TextFieldInput"
import SelectFieldInput from "../../../components/inputs/SelectFieldInput"
import { db } from "../../../firebase"
import { trackPromise } from "react-promise-tracker"
import { useAlerts } from "../../../contexts/AlertsContext"
import { Alert } from "@material-ui/lab"
import firebase from "firebase/app"

const TransferDialog = (props) => {
    const { createAlert } = useAlerts()

    const {
        control,
        errors,
        setValue,
        warehouseOptions,
        openTransferDialog,
        setOpenTransferDialog,
        isSubmitting,
        handleSubmit,
        optionsWH } = props

    const handleClose = () => {
        setOpenTransferDialog(false);
    }

    const handleCancelClick = () => {
        setOpenTransferDialog(false);
    }

    const onSubmit = async (data) => {
        let updateInventory = []
        let addInventoryIn = []
        let addInventoryOut = []
        let inventoryData = []
        let promises = []

        trackPromise(
            db.collection("inventory")
                .where("warehouseId", "==", data.originWarehouseId)
                .orderBy("date")
                .get()
                .then(result => {
                    result.forEach(doc => {
                        inventoryData = [...inventoryData, { id: doc.id, ...doc.data() }];
                    })

                    let flattenData = []

                    inventoryData.forEach(invBatch => {
                        let prodIndex = invBatch.products.findIndex(prod => prod.productId === data.productId &&
                            (prod.flavour || '') === data.flavour || '')

                        if (prodIndex >= 0) {
                            let product = invBatch.products[prodIndex]
                            let { products, ...flatInventory } = invBatch

                            flatInventory = { ...flatInventory, ...product }

                            flattenData.push(flatInventory)
                        }
                    })

                    if (flattenData.length > 0) {
                        return flattenData
                    }
                    else {
                        console.error(`product for transfer not found: ${data.productName} ${data.flavour}`)
                        createAlert("error", "Producto no encontrado.")
                        setOpenTransferDialog(false);
                    }
                })
                .then(flattenData => {
                    let pendingQtyToTransfer = data.transferQty

                    for (let i = 0; i < flattenData.length; i++) {
                        let invBatch = flattenData[i]

                        if (invBatch.qty >= pendingQtyToTransfer) {
                            addInventoryIn.push({ qty: pendingQtyToTransfer, cost: invBatch.cost })
                            addInventoryOut.push({ qty: pendingQtyToTransfer, inventoryId: invBatch.id })

                            invBatch.qty = invBatch.qty - pendingQtyToTransfer;
                            invBatch.qtyOut = invBatch.qtyOut + pendingQtyToTransfer;
                            pendingQtyToTransfer = 0;

                            updateInventory.push(invBatch);
                            break;
                        }
                        else {
                            addInventoryIn.push({ qty: invBatch.qty, cost: invBatch.cost })
                            addInventoryOut.push({ qty: invBatch.qty, inventoryId: invBatch.id })

                            pendingQtyToTransfer = pendingQtyToTransfer - invBatch.qty;
                            invBatch.qtyOut = invBatch.qtyOut + invBatch.qty;
                            invBatch.qty = 0;

                            updateInventory.push(invBatch);
                        }
                    }

                    updateInventory.forEach(invBatch => {
                        let inventoryToUpdate = inventoryData.find(i => i.id === invBatch.id)

                        if (inventoryToUpdate) {
                            let productIndex = inventoryToUpdate.products.findIndex(p => p.productId === invBatch.productId &&
                                (p.flavour || '') === (invBatch.flavour || ''));

                            if (productIndex < 0) {
                                throw new Error("product to update not found")
                            }

                            inventoryToUpdate.products[productIndex].qty = invBatch.qty;
                            inventoryToUpdate.products[productIndex].qtyOut = invBatch.qtyOut;

                            let promise = db.collection('inventory')
                                .doc(inventoryToUpdate.id)
                                .update(inventoryToUpdate)

                            promises.push(promise)
                        }
                        else {
                            throw new Error("product to update not found")
                        }
                    })

                    addInventoryOut.forEach(aInvOut => {
                        let newInvOut = {
                            date: firebase.firestore.Timestamp.fromDate(new Date()),
                            concept: "transfer", productId: data.productId,
                            flavour: data.flavour, inventoryId: aInvOut.inventoryId,
                            warehouseId: data.originWarehouseId, qty: aInvOut.qty
                        }

                        let promise = db.collection('inventoryOut')
                            .add(newInvOut)

                        promises.push(promise)
                    })

                    addInventoryIn.forEach(inva => {
                        let inventoryIn = {
                            date: firebase.firestore.Timestamp.fromDate(new Date()),
                            products: [{
                                productId: data.productId, flavour: data.flavour,
                                cost: inva.cost, qty: inva.qty
                            }],
                            reference: 'transfer',
                            warehouseId: data.targetWarehouseId
                        }

                        let promise = saveInventoryIn(inventoryIn, data)
                        promises.push(promise)
                    })

                    Promise.all(promises).then(results => {
                        console.log("transfer completed")
                        createAlert("success", "Transferencia exitosa")
                        setOpenTransferDialog(false)
                    }).catch(error => {
                        console.log("transfer failed, error: ", error)
                        createAlert("error", "Error en transferencia")
                    });
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    const saveInventoryIn = (inva, data) =>
        new Promise((resolve, reject) => {
            db.collection('inventoryIn')
                .add(inva)
                .then((doc) => {
                    let inventoryToSave = {
                        date: firebase.firestore.Timestamp.fromDate(new Date()),
                        inventoryInId: doc.id, warehouseId: data.targetWarehouseId, products: [{
                            productId: data.productId, flavour: data.flavour,
                            cost: inva.products[0].cost, qty: inva.products[0].qty, qtyOut: 0, qtyIn: inva.products[0].qty
                        }],
                    }

                    db.collection('inventory')
                        .add(inventoryToSave)
                        .then(() => {
                            resolve(true)
                        })
                        .catch(error => reject(error))
                })
        })

    return (
        <Dialog
            maxWidth="lg"
            open={openTransferDialog}
            onClose={handleClose}
            aria-labelledby="transfer-dialog-title"
            aria-describedby="transfer-dialog-description"
            disableBackdropClick>
            <DialogTitle id="transfer-dialog-title">
                {`Transferir`}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <DialogContent>
                    {(errors && errors.save) &&
                        <React.Fragment>
                            <Alert severity="error">
                                {errors.save.message}
                            </Alert>
                            <br />
                            <br />
                        </React.Fragment>
                    }
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        width="900px"
                        height="250px">
                        <Box
                            height="100%"
                            paddingLeft={3}
                            paddingRight={3}
                            flexDirection="column"
                            display="flex"
                            justifyContent="space-between">
                            <Grid container spacing={3}>
                                <Grid item sm={6}>
                                    <SelectFieldInput
                                        name="originWarehouseId"
                                        label="Almacen Origen"
                                        control={control}
                                        setValue={setValue}
                                        variant="outlined"
                                        disabled
                                        fullWidth
                                        options={warehouseOptions} />
                                </Grid>
                                <Grid item sm={6}>
                                    <SelectFieldInput
                                        name="targetWarehouseId"
                                        label="Almacen Destino"
                                        control={control}
                                        setValue={setValue}
                                        variant="outlined"
                                        fullWidth
                                        options={optionsWH} />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item sm={6}>
                                    <SelectFieldInput
                                        name="productId"
                                        label="Producto"
                                        control={control}
                                        setValue={setValue}
                                        variant="outlined"
                                        fullWidth
                                        disabled
                                        options={optionsWH} />
                                </Grid>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        label="Versión"
                                        name="flavour"
                                        disabled
                                        control={control}
                                        fullWidth />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        label="Cantidad/Origen"
                                        name="originQty"
                                        control={control}
                                        disabled
                                        fullWidth />
                                </Grid>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        label="Cantidad/Destino"
                                        name="transferQty"
                                        type="number"
                                        control={control}
                                        fullWidth />
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box
                        marginBottom={3}
                        marginTop={3}
                        display="flex"
                        justifyContent="space-between"
                        marginRight={3}
                        width={250}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}>
                            Guardar
                        </Button>
                        <Button variant="contained" onClick={handleCancelClick}>Cancelar</Button>
                    </Box>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default TransferDialog
