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

const InventoryAddPage = () => {

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { id: warehouseId } = useParams();
    const { createAlert } = useAlerts()

    const { control, handleSubmit, setError, setValue, 
        formState: { errors, isSubmitting } } = methods

    const [productOptions, setProductOptions] = useState([])
    const [warehouse, setWarehouse] = useState()

    const onSubmit = async (data) => {
        data.date = firebase.firestore.Timestamp.fromDate(data.date);

        const { ...dataInventory } = data;

        dataInventory.products = dataInventory.products.map((product) => {
            return { ...product, qtyIn: product.qty, qtyOut: 0 }
        })

        trackPromise(
            db.collection('inventoryIn')
                .add(data)
                .then((doc) => {
                    console.info("inventoryIn created: ", doc.id)

                    dataInventory.inventoryInId = doc.id;

                    db.collection('inventory')
                        .add(dataInventory)
                        .then((docInventory) => {
                            console.info("inventory created: ", docInventory.id)
                            createAlert("success", "Compra creado.")
                            history.push("/inventory")
                        })
                        .catch((error) => {
                            console.error("Error saving inventory: ", error);
                            setError("save", {
                                type: "firebase-error",
                                message: "Error Desconocido: No se pudo guardar la compra."
                            })
                        })
                })
                .catch((error) => {
                    console.error("Error saving inventoryIn: ", error);
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo guardar la compra."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    const handleCancelClick = () => {
        history.push("/inventory");
    }

    useEffect(() => {
        trackPromise(
            db.collection("warehouse")
                .doc(warehouseId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        let warehouseData = doc.data();
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
        <FormPageLayout title={`Compra para Almacén "${warehouse && warehouse.name}"`}>
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
                    <InventoryProductForm schema={productSchema} productOptions={productOptions}/>
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

export default InventoryAddPage
