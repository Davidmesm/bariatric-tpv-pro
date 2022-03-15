import { yupResolver } from "@hookform/resolvers/yup"
import { Box, Button, Grid } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import { useHistory, useParams } from "react-router"
import * as yup from "yup"
import TextFieldInput from "../../components/inputs/TextFieldInput"
import Loading from "../../components/Loading"
import { useAlerts } from "../../contexts/AlertsContext"
import { db } from "../../firebase"
import FormPageLayout from "../components/FormPageLayout"
import VendorAssignmentForm from "./components/VendorAssignmentForm"

const schema = yup.object().shape({
    name: yup.string().required("Nombre Almacen requerido"),
    vendors: yup.array().optional()
})

const WarehouseEditPage = () => {

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { id: warehouseId } = useParams()
    const { createAlert } = useAlerts()

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting } } = methods

    const [vendorData, setVendorData] = useState([])
    const [warehouseVendorData, setWarehouseVendorData] = useState([])

    const onSubmit = async (data) => {
        data.vendors = warehouseVendorData.map(vendor => vendor.id)

        trackPromise(
            db.collection("warehouse")
                .doc(warehouseId)
                .update(data)
                .then(() => {
                    console.info("warehouse updated.")
                    createAlert("success", "Cliente actualizado.")
                    history.push("/inventory")
                })
                .catch((error) => {
                    console.error("Error updating warehouse: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo actualizar el warehousee."
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
        const getVendors = () => {
            return db.collection("vendor")
                .get()
                .then((result) => {
                    let vendors = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        let fullName = `${docData.firstName} ${docData.lastName}`
                        vendors.push({ id: doc.id, fullName: fullName, checked: false })
                    })
                    return vendors
                })
                .catch((error) => {
                    console.error("Error retrieving vendors: ", error)
                    return []
                })
        }

        trackPromise(
            db.collection('warehouse')
                .doc(warehouseId)
                .get()
                .then(async (doc) => {
                    if (doc.exists) {
                        let docData = doc.data()

                        setValue("name", docData.name)

                        let vendors = await getVendors()
                        let vData = []
                        let wVData = []

                        vendors.forEach(v => {
                            if(docData.vendors.includes(v.id)) {
                                wVData.push(v);
                            }
                            else {
                                vData.push(v)
                            }
                        })

                        setVendorData(vData)
                        setWarehouseVendorData(wVData)
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original warehouse: ", error)
                    createAlert("error", "No se encontro el Almacen.")
                    history.push("/inventory")
                }))
    }, [createAlert, history, setValue, warehouseId])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <FormPageLayout title="Editar Almacen">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)} id="add-warehouse-form">
                    {
                        (errors && errors.save) &&
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
                        justifyContent="space-between">
                        <Box height="100px">
                            <Grid container spacing={3}>
                                <Grid item sm={5}>
                                    <TextFieldInput
                                        name="name"
                                        label="Nombre Almacen"
                                        control={control}
                                        fullWidth />
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <VendorAssignmentForm
                        vendorData={vendorData}
                        setVendorData={setVendorData}
                        warehouseVendorData={warehouseVendorData}
                        setWarehouseVendorData={setWarehouseVendorData} />
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

export default WarehouseEditPage
