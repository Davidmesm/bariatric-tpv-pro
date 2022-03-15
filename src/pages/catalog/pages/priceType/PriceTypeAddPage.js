import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React from 'react'
import { useForm } from 'react-hook-form'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { useHistory } from 'react-router'
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

const PriceTypeAddPage = () => {
    const history = useHistory()
    const { createAlert } = useAlerts()
    const { promiseInProgress } = usePromiseTracker()

    const { control, handleSubmit, setError,
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
                .add(data)
                .then((doc) => {
                    console.info("priceType created: ", doc.id)
                    createAlert("success", "Tipo de precio creado.")
                    history.push("/catalog/price-type");
                })
                .catch((error) => {
                    console.error("Error saving priceType: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconcido: No se pudo guardar el tipo de precio."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

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

export default PriceTypeAddPage
