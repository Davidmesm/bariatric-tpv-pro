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
    level: yup.number()
        .transform((value => isNaN(value) ? undefined : value))
        .required("Nivel requerido"),
    name: yup.string().required("Tipo de Precio requerido")
})

const PriceTypeEditPage = () => {
    const history = useHistory()
    const { createAlert } = useAlerts()
    const { id: priceTypeId } = useParams()
    const { promiseInProgress } = usePromiseTracker()

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting } } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })

    const handleCancelClick = () => {
        history.push("/catalog/price-type")
    }

    const onSubmit = async (data) => {
        trackPromise(
            db.collection("priceType")
            .doc(priceTypeId)
            .update(data)
            .then(() => {
                console.info("priceTypeupdated: ")
                createAlert("success", "Tipo de precio actualizado.")
                history.push("/catalog/price-type")
            })
            .catch((error) => {
                console.error("Error updating priceType: ", error)
                setError("save", {
                    type: "firebase-error",
                    message: "Error Desconcido: No se pudo actualizar el tipo de precio."
                })
            }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        trackPromise(
            db.collection('priceType')
                .doc(priceTypeId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        let priceType = doc.data();

                        for (const property in priceType) {
                            setValue(property, priceType[property]);
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original priceType: ", error)
                    createAlert("error", "No se encontro el Tipo de Precio.")
                    history.push("/catalog/price-type")
                }))
    }, [priceTypeId, setValue, createAlert, history])

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
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        height="120px">
                        {
                            (errors && errors.save) &&
                            <Alert severity="error">
                                {errors.save.message}
                            </Alert>
                        }
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item sm={4}>
                                    <TextFieldInput
                                        name="level"
                                        control={control}
                                        type="number"
                                        label="Nivel"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item sm={8}>
                                    <TextFieldInput
                                        name="name"
                                        label="tipo de Precio"
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

export default PriceTypeEditPage
