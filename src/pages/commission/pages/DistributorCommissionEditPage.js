import { Box, Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { trackPromise, usePromiseTracker } from "react-promise-tracker"
import { useHistory, useParams } from "react-router"
import * as yup from "yup"
import { useAlerts } from '../../../contexts/AlertsContext'
import { yupResolver } from '@hookform/resolvers/yup'
import Loading from '../../../components/Loading'
import { Alert } from '@material-ui/lab'
import DateFieldInput from '../../../components/inputs/DateFieldInput'
import SelectFieldInput from '../../../components/inputs/SelectFieldInput'
import CurrencyFieldInput from '../../../components/inputs/CurrencyFieldInput'
import { db } from '../../../firebase'
import TextFieldInput from '../../../components/inputs/TextFieldInput'

const schema = yup.object().shape({
    date: yup.date().required("Fecha requerida"),
    clientId: yup.string().transform((value) => {
        return value ? value.value : ""
    }).required("Cliente requerido").default(""),
    concept: yup.string().required("Concepto requerido").default("Ajuste"),
    commission: yup.number().required("Comisión requerido").default(0),
    status: yup.string().optional().default("Pendiente"),
    comments: yup.string().optional().default("")
})

const DistributorCommissionEditPage = () => {
    const history = useHistory()
    const { id: clientCommissionId } = useParams()
    const { createAlert } = useAlerts()
    const { promiseInProgress } = usePromiseTracker()

    const [clientData, setClientData] = useState([])
    const [currentClientCommission, setCurrentClientCommission] = useState()

    const { control, handleSubmit, setValue, setError,
        formState: { errors, isSubmitting } } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })

    const handleCancelClick = () => {
        history.push("/commission/distributor")
    }

    const onSubmit = async (data) => {
        trackPromise(
            db.collection('clientCommission')
                .doc(clientCommissionId)
                .update(data)
                .then(() => {
                    console.info("commission updated: ")
                    createAlert("success", "Ajuste actualizado.")
                    history.push("/commission/distributor")
                })
                .catch((error) => {
                    console.error("Error saving clientCommission: ", error);
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo guardar el ajuste."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        trackPromise(
            db.collection("client")
                .orderBy("firstName")
                .get()
                .then((result) => {
                    let clients = []
                    result.forEach((doc) => {
                        let docData = doc.data()
                        clients.push({
                            value: doc.id,
                            label: `${docData.firstName} ${docData.lastName}`,
                            render: `${docData.firstName} ${docData.lastName}`,
                            ...docData
                        })
                    })
                    setClientData(clients)
                })
                .catch((error) => {
                    console.error("Error retrieving clients: ", error)
                }))
    }, [])

    useEffect(() => {
        db.collection('clientCommission')
                .doc(clientCommissionId)
                .get()
                .then((doc) => {
                    if(doc.exists) {
                        let clientCommission = doc.data()
                        setCurrentClientCommission(clientCommission)
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original clientCommission: ", error)
                    createAlert("error", "No se encontro el Ajuste.")
                    history.push("/commission/distributor")

                })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    useEffect(() => {
        if(currentClientCommission)
        {
            let value;

            for (const property in currentClientCommission) {
                if (property === "date") {
                    value = currentClientCommission[property].toDate()
                    setValue(property, value)
                }
                else if(property === "clientId")
                {
                    value = clientData ? clientData.find(v => v.value === currentClientCommission[property]) : {}
                    
                    setValue(property, value)
                }
                else {
                    setValue(property, currentClientCommission[property]);
                }
            }
        }

    }, [clientData, currentClientCommission, setValue])
    

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <form>
            <Box display="flex"
                flexDirection="column"
                justifyContent="space-between"
                paddingTop={8}
                height={450}>
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
                <Box width={300}>
                    <DateFieldInput
                        name="date"
                        label="Fecha"
                        control={control}
                        fullWidth />
                </Box>
                <Box width={500}>
                <SelectFieldInput
                    name="clientId"
                    label="Cliente"
                    control={control}
                    setValue={setValue}
                    variant="outlined"
                    fullWidth
                    options={clientData} />
                </Box>
                <Box width={500}>
                <CurrencyFieldInput
                    name="commission"
                    label="Comisión"
                    control={control}
                    fullWidth
                />
                </Box>
                <Box width="100%">
                        <TextFieldInput
                            placeholder="Comentarios"
                            variant="outlined"
                            control={control}
                            fullWidth
                            multiline
                            minRows={3}
                            name="comments" />
                    </Box>
                <Box
                    display="flex"
                    justifyContent="flex-end">
                    <Box display="flex" justifyContent="space-between" width="230px">
                        <Button
                            variant="contained"
                            onClick={handleSubmit(onSubmit, onError)}
                            disabled={isSubmitting}>
                            Guardar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCancelClick}
                            disabled={isSubmitting}>
                            Cancelar
                        </Button>
                    </Box>
                </Box>
            </Box>
        </form>
    )
}

export default DistributorCommissionEditPage