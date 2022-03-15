import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import FormPageLayout from "../components/FormPageLayout"
import * as yup from "yup"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, TextField, Typography } from "@material-ui/core"
import TextFieldInput from "../../components/inputs/TextFieldInput"
import { yupResolver } from "@hookform/resolvers/yup"
import PhoneFieldInput from "../../components/inputs/PhoneFieldInput"
import SelectFieldInput from "../../components/inputs/SelectFieldInput"
import { db } from "../../firebase"
import AddressesForm from "../components/AddressesForm"
import PercentageFieldInput from "../../components/inputs/PercentageFieldInput"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import Loading from "../../components/Loading"
import { ExpandMore } from "@material-ui/icons"
import { useHistory } from "react-router"
import { useAlerts } from "../../contexts/AlertsContext"
import { Alert } from "@material-ui/lab"

const phonePattern = /^[(][0-9][0-9][)][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/

const addressSchema = yup.object().shape({
    name: yup.string().required("Nombre requerido").default(""),
    street: yup.string().required("Calle requerida").default(""),
    extNumber: yup.string().required("Numero requerido").default(""),
    intRef: yup.string().optional().default(""),
    zipCode: yup.string().required("Codigo Postal requerido").default(""),
    suburb: yup.string().required("Colonia requerida").default(""),
    city: yup.string().required("Ciudad requerida").default(""),
    state: yup.string().required("Estado requerido").default(""),
    isFiscalAddress: yup.boolean().required().default(false),
    comments: yup.string().optional().default("")
})

const schema = yup.object().shape({
    firstName: yup.string().required("Nombre requerido"),
    lastName: yup.string().required("Apellido requerido"),
    businessEmail: yup.string().required("Correo Laboral requerido")
        .email("Correo Electronico invalido"),
    personalEmail: yup.string().required("Correo Personal requerido")
        .email("Correo Electronico invalido"),
    phone: yup.string().optional()
        .matches(phonePattern,  { message: "Teléfono invalido", excludeEmptyString: true }),
    cellphone: yup.string().required("Celular Personal requerido")
        .matches(phonePattern, "Teléfono invalido"),
    workCellphone: yup.string().optional()
        .matches(phonePattern, {message:"Teléfono invalido",excludeEmptyString:true}),
    taxRegistry: yup.string().optional(),
    curp: yup.string().optional(),
    securityServiceNumber: yup.string().optional(),
    commission: yup.number().transform((value => isNaN(value) ? undefined : value))
        .optional()
        .default(0),
    addresses: yup.array().of(addressSchema)
        .min(1, "Dirección requerida"),
    bankAccountId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional().default("")
})

const VendorAddPage = () => {
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { createAlert } = useAlerts()

    const [optionsBA, setOptionsBA] = useState([])

    const { control, handleSubmit, setError, watch, setValue,
        formState: { errors, isSubmitting } } = methods

    const watchBankAccount = watch("bankAccountId")


    const onSubmit = async (data) => {
        trackPromise(
            db.collection('vendor')
                .add(data)
                .then((doc) => {
                    console.info("vendor created: ", doc.id)
                    createAlert("success", "Vendedor creado.")
                    history.push("/vendor")
                })
                .catch((error) => {
                    console.error("Error saving vendor: ", error);
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconcido: No se pudo guardar el vendedor."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    const handleCancelClick = () => {
        history.push("/vendor");
    }

    useEffect(() => {

        let bankData = []

        trackPromise(
            db.collection("bank")
                .get()
                .then((result) => {
                    result.forEach((doc) => {
                        let docData = doc.data()
                        bankData.push({ ...docData, id: doc.id, })
                    })
                })
                .catch((error) => {
                    console.error("Error retrieving banks: ", error)
                }))

        const unsubscribe =
            db.collection("bankAccount")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let bankAccounts = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data()
                        let bank = bankData.find(bank => bank.id === docData.bankId)
                        let label = `${bank ? bank.name : "error"} : ${docData.account}`
                        bankAccounts.push({ ...docData, id: doc.id, value: doc.id, label: label, render: label })
                    })
                    setOptionsBA(bankAccounts);
                }, (error) => {
                    console.error("Unable to subscribe to bankAccounts, error: ", error)
                })
        return unsubscribe
    }, [])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <FormPageLayout title="Agregar Vendedor">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)} id="add-vendor-form">
                    {(errors && errors.save) &&
                        <React.Fragment>
                            <Alert severity="error">
                                {errors.save.message}
                            </Alert>
                            <br/>
                            <br/>
                        </React.Fragment>
                    }
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        height="450px">
                        <Grid container spacing={3} alignItems="flex-center">
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="firstName"
                                    label="Nombre"
                                    control={control}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="lastName"
                                    label="Apellidos"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="businessEmail"
                                    label="Correo Laboral"
                                    control={control}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="personalEmail"
                                    label="Correo Personal"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <PhoneFieldInput
                                    name="phone"
                                    label="Teléfono Casa"
                                    control={control}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <PhoneFieldInput
                                    name="cellphone"
                                    label="Celular Personal"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <PhoneFieldInput
                                    name="workCellphone"
                                    label="Celular Empresa"
                                    control={control}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="taxRegistry"
                                    control={control}
                                    label="RFC"
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="curp"
                                    control={control}
                                    label="CURP"
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="securityServiceNumber"
                                    control={control}
                                    label="NSS"
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <PercentageFieldInput
                                    name="commission"
                                    label="Comisión"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                    </Box>
                    <br />
                    <br />
                    <Accordion defaultExpanded square>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="addressess-info-content"
                            id="addressess-info-header">
                            <Typography variant="h6">
                                Direcciones
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <AddressesForm schema={addressSchema} />
                        </AccordionDetails>
                    </Accordion>
                    <br />
                    <br />
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        height="150px">
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name="bankAccountId"
                                    label="Cuenta de Banco"
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={optionsBA} />
                            </Grid>
                            <Grid item sm={6}>
                                <TextField
                                    label="CLABE"
                                    disabled={true}
                                    value={watchBankAccount ? watchBankAccount.clabe : ""}
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextField
                                    label="Tarjeta Debito"
                                    disabled={true}
                                    value={watchBankAccount ? watchBankAccount.debitCard : ""}
                                    fullWidth />
                            </Grid>
                        </Grid>
                    </Box>
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

export default VendorAddPage
