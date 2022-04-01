import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { useHistory, useParams } from 'react-router'
import * as yup from "yup"
import TextFieldInput from '../../../../components/inputs/TextFieldInput'
import Loading from '../../../../components/Loading'
import { useAlerts } from '../../../../contexts/AlertsContext'
import { db } from '../../../../firebase'

const schema = yup.object().shape({
    order: yup.number()
        .transform((value => isNaN(value) ? undefined : value))
        .required("Orden requerido")
        .default(1),
    name: yup.string().required("Servicio de Paqueteria requerido")
})

const ParcelServiceEditPage = () => {
    const history = useHistory()
    const { createAlert } = useAlerts()
    const { id: parcelServiceId } = useParams()
    const { promiseInProgress } = usePromiseTracker()

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting } } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })

    const handleCancelClick = () => {
        history.push("/catalog/parcelService")
    }

    const onSubmit = async (data) => {
        trackPromise(
            db.collection("parcelService")
                .doc(parcelServiceId)
                .update(data)
                .then(() => {
                    console.info("parcelService updated: ", parcelServiceId)
                    createAlert("success", "ervicio de Paqueteria actualizado.")
                    history.push("/catalog/parcelService")
                })
                .catch((error) => {
                    console.error("Error updating parcelService: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo actualizar el servicio de paqueteria."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        trackPromise(
            db.collection('parcelService')
                .doc(parcelServiceId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        let parcelService = doc.data();

                        for (const property in parcelService) {
                            setValue(property, parcelService[property]);
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original parcelService: ", error)
                    createAlert("error", "No se encontro el servicio de paqueteria.")
                    history.push("/catalog/parcelService")

                }))
    }, [parcelServiceId, setValue, createAlert, history])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%">
            <Box width="70%">
                <form>
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
                        justifyContent="space-between"
                        height="120px">
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item sm={4}>
                                    <TextFieldInput
                                        name="order"
                                        control={control}
                                        type="number"
                                        label="Orden"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item sm={8}>
                                    <TextFieldInput
                                        name="name"
                                        label="Servicio de Paqueteria"
                                        control={control}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
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
            </Box>
        </Box>
    )
}

export default ParcelServiceEditPage
