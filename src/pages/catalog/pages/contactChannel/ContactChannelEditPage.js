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
    name: yup.string().required("Canal de Contacto requerido")
})

const ContactChannelEditPage = () => {
    const history = useHistory()
    const { createAlert } = useAlerts()
    const { id: contactChannelId } = useParams()
    const { promiseInProgress } = usePromiseTracker()

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting } } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })

    const handleCancelClick = () => {
        history.push("/catalog/contact-channel")
    }

    const onSubmit = async (data) => {
        trackPromise(
            db.collection("contactChannel")
                .doc(contactChannelId)
                .update(data)
                .then(() => {
                    console.info("contactChannel updated: ", contactChannelId)
                    createAlert("success", "Canal de contacto actualizado.")
                    history.push("/catalog/contact-channel")
                })
                .catch((error) => {
                    console.error("Error updating contactChannel: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo actualizar el canal de contacto."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        trackPromise(
            db.collection('contactChannel')
                .doc(contactChannelId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        let contactChannel = doc.data();

                        for (const property in contactChannel) {
                            setValue(property, contactChannel[property]);
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original contactChannel: ", error)
                    createAlert("error", "No se encontro el Canal de Contacto.")
                    history.push("/catalog/contact-channel")

                }))
    }, [contactChannelId, setValue, createAlert, history])

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
                                        label="Canal de Contacto"
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

export default ContactChannelEditPage
