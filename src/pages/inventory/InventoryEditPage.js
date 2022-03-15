import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import FormPageLayout from "../components/FormPageLayout"
import * as yup from "yup"
import firebase from "firebase/app"
import { Box, Button, Grid } from "@material-ui/core"
import { yupResolver } from "@hookform/resolvers/yup"
import { db } from "../../firebase"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import Loading from "../../components/Loading"
import { useHistory, useParams } from "react-router"
import { useAlerts } from "../../contexts/AlertsContext"
import { Alert } from "@material-ui/lab"
import DateFieldInput from "../../components/inputs/DateFieldInput"
import TextFieldInput from "../../components/inputs/TextFieldInput"
import InventoryProductForm from "./components/InventoryProductForm"

const productSchema = yup.object().shape({
    productId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required(),
    flavour: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional(),
    cost: yup.number().transform((value) => {
        return value ? parseFloat(value) : 0
    }).required("Costo requerido").default(0),
    qty: yup.number().transform((value) => {
        return value ? parseFloat(value) : 0
    }).required("Cantidad requerida").default(0),
})

const schema = yup.object().shape({
    date: yup.date().required("Fecha requerida"),
    reference: yup.string().optional(),
    warehouseId: yup.string().required(),
    products: yup.array().of(productSchema)
        .min(1, "Productos requeridos"),
})

const InventoryEditPage = () => {

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { id: warehouseId, buyId: inventoryInId } = useParams()
    const { createAlert } = useAlerts()

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting } } = methods

    const [productOptions, setProductOptions] = useState([])
    const [products, setProducts] = useState()
    const [warehouse, setWarehouse] = useState()

    const onSubmit = async (data) => {
        data.date = firebase.firestore.Timestamp.fromDate(data.date)

        trackPromise(
            db.collection('inventory')
                .where('inventoryInId', '==', inventoryInId)
                .get()
                .then((result) => {
                    if (!result || result.docs.length !== 1) {
                        console.error("Error saving retrieving original inventory: not found")
                        setError("save", {
                            type: "firebase-error",
                            message: "Error Desconcido: No se pudo guardar la compra."
                        })
                        return
                    }

                    let doc = result.docs[0]

                    if (doc.exists) {
                        let inventory = doc.data()

                        let promiseInventoryIn = db.collection('inventoryIn')
                            .doc(inventoryInId)
                            .update(data)

                        data.products.forEach(product => {
                            let invProductIndex = inventory.products.findIndex(p => p.productId === product.productId &&
                                p.flavour === product.flavour)

                            if (invProductIndex === -1) {
                                inventory.products.push({ ...product, qtyIn: product.qty, qtyOut: 0 })
                            }
                            else {
                                let invProduct = inventory.products[invProductIndex]
                                let qtyIn = product.qty
                                let qty = qtyIn - invProduct.qtyOut
                                inventory.products[invProductIndex].qtyIn = qtyIn
                                inventory.products[invProductIndex].qty = qty
                            }
                        })

                        let promiseInventory = db.collection('inventory')
                            .doc(doc.id)
                            .update(inventory)

                        Promise.all([promiseInventoryIn, promiseInventory]).then(() => {
                            console.info("inventory updated: ", inventory.id)
                            createAlert("success", "Compra actualizada.")
                            history.push("/inventory")
                        })
                    }
                })
                .catch((error) => {
                    console.error("Error saving retrieving original inventory: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconcido: No se pudo guardar la compra."
                    })
                })
        )

    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    const handleCancelClick = () => {
        history.push("/inventory")
    }

    useEffect(() => {
        if (products) {
            setValue("products", products)
        }
    }, [products, setValue])

    useEffect(() => {
        trackPromise(
            db.collection('inventoryIn')
                .doc(inventoryInId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        let inventory = doc.data()

                        for (const property in inventory) {
                            if (property === "date") {
                                let timeStamp = inventory[property]
                                let currDate = timeStamp.toDate()
                                setValue(property, currDate)
                            }
                            else if (property === "products") {
                                if (productOptions && productOptions.length > 0) {
                                    let iProd = inventory[property]
                                    let prods = iProd.map(p => {
                                        let cProd = productOptions.find(cp => cp.value === p.productId)
                                        return { 
                                            productId: cProd, 
                                            flavour: {value:p.flavour, label:p.flavour, render:p.flavour}, 
                                            cost: p.cost, 
                                            qty: p.qty }
                                    })
                                    setProducts(prods)
                                }
                            }
                            else {
                                setValue(property, inventory[property])
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original inventoryId: ", error)
                    createAlert("error", "No se encontro la compra.")
                    history.push("/inventory")
                })
        )
    }, [productOptions, setValue, createAlert, history, inventoryInId])

    useEffect(() => {
        trackPromise(
            db.collection("warehouse")
                .doc(warehouseId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        let warehouseData = doc.data()
                        setWarehouse(warehouseData)
                        setValue("warehouseId", warehouseId)
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving warehouse: ", error)
                }))
    }, [warehouseId, setValue])

    useEffect(() => {
        trackPromise(
            db.collection("product")
                .orderBy("name")
                .get()
                .then((result) => {
                    let products = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        products.push({ value: doc.id, label: docData.name, render: docData.name, flavours: docData.flavours })
                    })
                    setProductOptions(products)
                })
                .catch((error) => {
                    console.error("Error retrieving products: ", error)
                }))
    }, [])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <FormPageLayout title={`Compra para Almacen "${warehouse && warehouse.name}"`}>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)} id="add-client-form">
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
                        height="140px">
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <DateFieldInput
                                    name="date"
                                    label="Fecha"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="reference"
                                    label="Referencia"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                    </Box>
                    <InventoryProductForm schema={productSchema} productOptions={productOptions} />
                    <br />
                    <br />
                    <Box display="flex" justifyContent="flex-end">
                        <Box display="flex" justifyContent="space-between" width="240px">
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}>
                                Guardar
                            </Button>
                            <Button variant="contained" onClick={handleCancelClick}>Cancelar</Button>
                        </Box>
                    </Box>
                    <br />
                    <br />
                    <br />
                </form>
            </FormProvider>
        </FormPageLayout>
    )
}

export default InventoryEditPage
