import { yupResolver } from "@hookform/resolvers/yup"
import { Box, Button, Grid } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import { useHistory } from "react-router"
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

const WarehouseAddPage = () => {

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const { control, handleSubmit, setError,
        formState: { errors, isSubmitting } } = methods

    const [vendorData, setVendorData] = useState([])
    const [warehouseVendorData, setWarehouseVendorData] = useState([])
    
    const onSubmit = async (data) => {

        data.vendors=warehouseVendorData.map(vendor => vendor.id)

        trackPromise(
            db.collection('warehouse')
                .add(data)
                .then((doc) => {
                    console.info("warehouse created: ", doc.id)
                    createAlert("success", "Almacen creado.")
                    history.push("/inventory")
                })
                .catch((error) => {
                    console.error("Error saving warehouse: ", error);
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconcido: No se pudo guardar el almacen."
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
            db.collection("vendor")
                .get()
                .then((result) => {
                    let vendors = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        let fullName = `${docData.firstName} ${docData.lastName}`
                        vendors.push({ id: doc.id, fullName: fullName, checked: false })
                    })
                    setVendorData(vendors)
                })
                .catch((error) => {
                    console.error("Error retrieving vendors: ", error)
                }))
    }, [])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <FormPageLayout title="Agregar Almacen">
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
                        setWarehouseVendorData={setWarehouseVendorData}/>
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

export default WarehouseAddPage
