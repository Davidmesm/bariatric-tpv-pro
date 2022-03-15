import React, { useEffect, useState } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import FormPageLayout from "../components/FormPageLayout"
import * as yup from "yup"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, Typography } from "@material-ui/core"
import TextFieldInput from "../../components/inputs/TextFieldInput"
import { yupResolver } from "@hookform/resolvers/yup"
import PhoneFieldInput from "../../components/inputs/PhoneFieldInput"
import SelectFieldInput from "../../components/inputs/SelectFieldInput"
import ContactChannelDialog from "./components/ContactChannelDialog"
import NutritionistDialog from "./components/NutritionistDialog"
import { db } from "../../firebase"
import AddressesForm from "../components/AddressesForm"
import BooleanFieldInput from "../../components/inputs/BooleanFieldInput"
import PercentageFieldInput from "../../components/inputs/PercentageFieldInput"
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import Loading from "../../components/Loading"
import { ExpandMore } from "@material-ui/icons"
import SurgeryDialog from "./components/SurgeryDialog"
import { useHistory, useParams } from "react-router"
import { useAlerts } from "../../contexts/AlertsContext"
import { Alert } from "@material-ui/lab"
import { useClient } from "../../contexts/ClientContext"
import firebase from "firebase/app"

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
    email: yup.string().optional()
        .email("Correo Electronico invalido"),
    phone: yup.string().required("Teléfono requerido")
        .matches(phonePattern, "Teléfono invalido"),
    rfc: yup.string().optional()
        .min(12, "El RFC consta de 12 a 13 caracteres")
        .max(13, "El RFC consta de 12 a 13 caracteres"),
    contactChannelId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Canal de Contacto requerido"),
    addresses: yup.array().of(addressSchema)
        .min(1, "Dirección requerida"),
    mainAddress: yup.number().required().default(0),
    nutritionist: yup.boolean().required().default(false),
    distributor: yup.boolean().required().default(false),
    commission: yup.number().transform((value => isNaN(value) ? undefined : value))
        .optional()
        .default(0),
    priceTypeId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Tipo de Precio requerido").default(""),
    recommendedDistributorId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional().default(""),
    vendorId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional().default(""),
    nutritionistId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional().default(""),
    surgeryId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).optional().default("")
})

const ClientEditPage = () => {

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: schema.cast()
    })

    const { promiseInProgress } = usePromiseTracker()
    const history = useHistory()
    const { id: clientId } = useParams()
    const { createAlert } = useAlerts()
    const { getClient } = useClient()

    const [openDialogCC, setOpenDialogCC] = useState(false)
    const [valueToAddCC, setValueToAddCC] = useState("")
    const [optionsCC, setOptionsCC] = useState([])
    const [optionsPT, setOptionsPT] = useState([])
    const [optionsDI, setOptionsDI] = useState([])
    const [optionsVE, setOptionsVE] = useState([])
    const [openDialogNU, setOpenDialogNU] = useState(false)
    const [valueToAddNU, setValueToAddNU] = useState("")
    const [optionsNU, setOptionsNU] = useState([])
    const [openDialogSU, setOpenDialogSU] = useState(false)
    const [valueToAddSU, setValueToAddSU] = useState("")
    const [optionsSU, setOptionsSU] = useState([])

    const { control, handleSubmit, setError, setValue, watch,
        formState: { errors, isSubmitting }  } = methods

    const { fields } = useFieldArray({control, name: "addresses" })
    console.log("Ignore", fields)

    const watchDistributor = watch("distributor")
    const watchNutritionist = watch("nutritionist")
    const watchRecommendedDistributorId = watch("recommendedDistributorId")

    const onSubmit = (data) => {
        if(data.taxRegistry) {
            if(data.taxRegistry.length < 12 || data.taxRegistry.length > 13) {
                setError("taxRegistry", {type: "manual", message: "RFC Invalido"})
                return
            }
        }

        trackPromise(
            db.collection("client")
                .doc(clientId)
                .update(data)
                .then(() => {
                    console.info("client updated.")
                    createAlert("success", "Cliente actualizado.")
                    history.push("/client")
                })
                .catch((error) => {
                    console.error("Error updating client: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo actualizar el cliente."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    const handleCancelClick = () => {
        history.push("/client");
    }

    const setAddressess = React.useCallback((addresses) => {
        setValue("addresses", addresses);
    },[setValue])

    useEffect(() => {
        if(!watchNutritionist)
        {
            setValue("recommendedDistributorId", null)
        }
    }, [watchNutritionist])


    useEffect(() => {
        trackPromise(
            db.collection('client')
                .doc(clientId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        let client = doc.data();

                        for (const property in client) {
                            let value = {}

                            if(property === "contactChannelId")
                            {
                                value = optionsCC ? optionsCC.find(o => o.value === client[property]) : {}
                                setValue(property, value);
                            }
                            else if(property === "priceTypeId")
                            {
                                value = optionsPT ? optionsPT.find(o => o.value === client[property]) : {}
                                setValue(property, value);
                            }
                            else if(property === "distributorId")
                            {
                                value = optionsDI ? optionsDI.find(o => o.value === client[property]) : {}
                                setValue(property, value);
                            }
                            else if(property === "recommendedDistributorId")
                            {
                                value = optionsDI ? optionsDI.find(o => o.value === client[property]) : {}
                                setValue(property, value);
                            }
                            else if(property === "vendorId")
                            {
                                value = optionsVE ? optionsVE.find(o => o.value === client[property]) : {}
                                setValue(property, value);
                            }
                            else if(property === "nutritionistId")
                            {
                                value = optionsNU ? optionsNU.find(o => o.value === client[property]) : {}
                                setValue(property, value);
                            }
                            else if(property === "surgeryId")
                            {
                                value = optionsSU ? optionsSU.find(o => o.value === client[property]) : {}
                                setValue(property, value);
                            }
                            else if(property === "addresses")
                            {
                                setAddressess(client[property])
                            }
                            else
                            {
                                setValue(property, client[property])
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original client: ", error)
                    createAlert("error", "No se encontro el Cliente.")
                    history.push("/client")

                }))
    }, [clientId, setValue, optionsCC, optionsDI, optionsNU, optionsPT, 
        optionsSU, optionsVE, createAlert, history, setAddressess])

    useEffect(() => {
        const unsubscribe =
            db.collection("contactChannel")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let contactChannels = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        contactChannels.push({ value: doc.id, label: docData.name, render: docData.name })
                    })
                    setOptionsCC(contactChannels);
                }, (error) => {
                    console.error("Unable to subscribe to Contact Channel, error: ", error)
                })
        return unsubscribe
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("priceType")
                .orderBy("level")
                .get()
                .then((result) => {
                    let priceTypes = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        priceTypes.push({ value: doc.id, label: docData.name, render: docData.name })
                    })
                    setOptionsPT(priceTypes)
                })
                .catch((error) => {
                    console.error("Error retrieving priceTypes: ", error)
                }))
    }, [])

    useEffect(() => {
        trackPromise(
            db.collection("client")
                .where("distributor", "==", true)
                .where(firebase.firestore.FieldPath.documentId(), "!=", clientId)
                .get()
                .then((result) => {
                    let distributors = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        let render = `${docData.firstName} ${docData.lastName} - ${docData.phone}`
                        let label = `${docData.firstName} ${docData.lastName} - ${docData.phone.replace(/\D/g, "")}`
                        distributors.push({ value: doc.id, label: label, render: render, vendorId: docData.vendorId })
                    })
                    setOptionsDI(distributors)
                })
                .catch((error) => {
                    console.error("Error retrieving distributors: ", error)
                }))
    }, [clientId])

    useEffect(() => {
        trackPromise(
            db.collection("vendor")
                .get()
                .then((result) => {
                    let vendors = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        let fullName = `${docData.firstName} ${docData.lastName}`
                        vendors.push({ value: doc.id, label: fullName, render: fullName })
                    })
                    setOptionsVE(vendors)
                })
                .catch((error) => {
                    console.error("Error retrieving vendors: ", error)
                }))
    }, [])

    useEffect(() => {
        const unsubscribe =
            db.collection("nutritionist")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let nutritionists = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        nutritionists.push({ value: doc.id, label: docData.name, render: docData.name })
                    })
                    setOptionsNU(nutritionists);
                }, (error) => {
                    console.error("Unable to subscribe to Nutritionist, error: ", error)
                })
        return (unsubscribe)
    }, [])

    useEffect(() => {
        const unsubscribe =
            db.collection("surgery")
                .orderBy("order")
                .onSnapshot((snapShot) => {
                    let surgeries = []
                    snapShot.forEach((doc) => {
                        let docData = doc.data();
                        surgeries.push({ value: doc.id, label: docData.name, render: docData.name })
                    })
                    setOptionsSU(surgeries);
                }, (error) => {
                    console.error("Unable to subscribe to Surgeries, error: ", error)
                })
        return (unsubscribe)
    }, [])

    useEffect(() => {
        if(!watchDistributor)
        {
            setValue("commission", 0)
        }
    }, [setValue, watchDistributor])

    useEffect(() => {
        if(watchRecommendedDistributorId)
        {
            if(optionsVE.length > 0)
            {
                let vendor = optionsVE.find(v => v.value === watchRecommendedDistributorId.vendorId)
                if(vendor)
                {
                    setValue("vendorId", vendor)
                }
            }
        }
    }, [setValue, watchRecommendedDistributorId, optionsVE])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <FormPageLayout title="Editar Cliente">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)} id="add-client-form">
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        height="250px">
                        {
                            (errors && errors.save) &&
                            <Alert severity="error">
                                {errors.save.message}
                            </Alert>
                        }
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
                        <Grid container spacing={3} alignItems="flex-center">
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="email"
                                    label="Correo Electronico"
                                    control={control}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <PhoneFieldInput
                                    name="phone"
                                    label="Teléfono"
                                    control={control}
                                    fullWidth />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="flex-center">
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="taxRegistry"
                                    label="RFC"
                                    control={control}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name="contactChannelId"
                                    label="Medio de Contacto"
                                    freeSolo
                                    canAdd
                                    setOpenDialog={setOpenDialogCC}
                                    setValueToAdd={setValueToAddCC}
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={optionsCC} />
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
                        height="375px">
                        <Box>
                            <BooleanFieldInput
                                name="nutritionist"
                                control={control}
                                label="Etiqueta Nutriólogo" />
                        </Box>
                        <Box>
                            <BooleanFieldInput
                                name="distributor"
                                control={control}
                                label="Distribuidor Comisionista" />
                        </Box>
                        <Grid container spacing={3} alignItems="flex-center">
                            <Grid item sm={6}>
                                <PercentageFieldInput
                                    name="commission"
                                    label="Comisión"
                                    control={control}
                                    disabled={!watchDistributor}
                                    fullWidth />
                            </Grid>
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name="priceTypeId"
                                    label="Tipo de Precio"
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={optionsPT} />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="flex-center">
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name="recommendedDistributorId"
                                    label="Recomendado Por"
                                    disabled={!watchNutritionist}
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={optionsDI} />
                            </Grid>
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name="vendorId"
                                    label="Vendedor Que Recomendó"
                                    control={control}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={optionsVE} />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} alignItems="flex-center">
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name="nutritionistId"
                                    label="Nutriólogo o Grupo"
                                    control={control}
                                    freeSolo
                                    canAdd
                                    setOpenDialog={setOpenDialogNU}
                                    setValueToAdd={setValueToAddNU}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={optionsNU} />
                            </Grid>
                            <Grid item sm={6}>
                                <SelectFieldInput
                                    name="surgeryId"
                                    label="Cirugia Realizada"
                                    control={control}
                                    freeSolo
                                    canAdd
                                    setOpenDialog={setOpenDialogSU}
                                    setValueToAdd={setValueToAddSU}
                                    setValue={setValue}
                                    variant="outlined"
                                    fullWidth
                                    options={optionsSU} />
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
            <ContactChannelDialog
                open={openDialogCC}
                setOpen={setOpenDialogCC}
                valueToAdd={valueToAddCC} />
            <NutritionistDialog
                open={openDialogNU}
                setOpen={setOpenDialogNU}
                valueToAdd={valueToAddNU} />
            <SurgeryDialog
                open={openDialogSU}
                setOpen={setOpenDialogSU}
                valueToAdd={valueToAddSU} />
        </FormPageLayout>
    )
}

export default ClientEditPage
