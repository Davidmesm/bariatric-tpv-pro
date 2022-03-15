import React, { useEffect, useState } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import FormPageLayout from "../components/FormPageLayout"
import * as yup from "yup"
import { Box, Button, Grid } from "@material-ui/core"
import TextFieldInput from "../../components/inputs/TextFieldInput"
import { yupResolver } from "@hookform/resolvers/yup"
import { db } from "../../firebase"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import Loading from "../../components/Loading"
import { useHistory, useParams } from "react-router"
import { useAlerts } from "../../contexts/AlertsContext"
import { Alert } from "@material-ui/lab"
import FlavourControl from "./components/FlavourControl"
import PriceControl from "./components/PriceControl"

const priceSchema = yup.object().shape({
    priceTypeId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required(),
    price: yup.number().transform((value) => {
        return value ? parseFloat(value) : 0
    }).required("Precio Requerido").default(0)
})

const flavourSchema = yup.object().shape({
    name: yup.string().required("Versión requerida").default(""),
})

const schema = yup.object().shape({
    name: yup.string().required("Nombre del Producto requerido"),
    flavours: yup.array().of(flavourSchema).optional(),
    prices: yup.array().of(priceSchema).optional()
})

const ProductEditPage = () => {
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { id: productId } = useParams()
    const { createAlert } = useAlerts()

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting } } = methods

    const { } = useFieldArray({
        control,
        name: "prices",
        default: priceSchema.cast()
    })

    const onSubmit = async (data) => {
        trackPromise(
            db.collection("product")
                .doc(productId)
                .update(data)
                .then(() => {
                    console.info("product updated.")
                    createAlert("success", "Producto actualizado.")
                    history.push("/product")
                })
                .catch((error) => {
                    console.error("Error updating product: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo actualizar el producto."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    const handleCancelClick = () => {
        history.push("/product");
    }

    const [optionsPR, setOptionsPR] = useState([])

    useEffect(() => {
        trackPromise(
            db.collection("priceType")
                .orderBy("level")
                .get()
                .then((result) => {
                    let data = []
                    result.forEach(doc => {
                        let docData = doc.data()
                        let row = { ...docData, id: doc.id, value: doc.id, label: docData.name, render: docData.name }
                        data.push(row)
                    })
                    if (data.length > 0) {
                        let options = data.map((item) => {
                            let { id, level, name, ...option } = item
                            return option
                        })

                        setOptionsPR(options)

                        let prices = options.map((option) => {
                            return { priceTypeId: option, price: "" }
                        })

                        setValue("prices", prices)
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving priceTypes: ", error)
                }))
    }, [setOptionsPR, setValue])

    useEffect(() => {
        trackPromise(
            db.collection('product')
                .doc(productId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        let product = doc.data();

                        for (const property in product) {
                            if (property === "prices") {
                                let currPrices = product[property]

                                if (optionsPR) {
                                    let prices = optionsPR.map(priceType => {
                                        let priceIndex = currPrices.findIndex(i => i.priceTypeId === priceType.value)

                                        return { price: priceIndex >= 0 ? currPrices[priceIndex].price : 0, priceTypeId: priceType }
                                    })

                                    setValue("prices", prices)
                                }
                            }
                            else {
                                setValue(property, product[property]);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original product: ", error)
                    createAlert("error", "No se encontro el Producto.")
                    history.push("/product")

                }))
    }, [optionsPR, productId, createAlert, history, setValue])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <FormPageLayout title="Editar Producto">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)} id="add-product-form">
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
                        height="100px">
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="name"
                                    label="Nombre del Producto"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                    </Box>
                    <FlavourControl schema={flavourSchema} />
                    <br />
                    <br />
                    <PriceControl options={optionsPR} />
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

export default ProductEditPage
