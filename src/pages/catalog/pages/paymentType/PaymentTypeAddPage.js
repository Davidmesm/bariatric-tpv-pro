import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React from 'react'
import { useForm } from 'react-hook-form'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { useHistory } from 'react-router'
import * as yup from "yup"
import BooleanFieldInput from '../../../../components/inputs/BooleanFieldInput'
import TextFieldInput from '../../../../components/inputs/TextFieldInput'
import Loading from '../../../../components/Loading'
import { useAlerts } from '../../../../contexts/AlertsContext'
import { db } from '../../../../firebase'

const schema = yup.object().shape({
    order: yup.number()
        .transform((value => isNaN(value) ? undefined : value))
        .required("Orden requerido")
        .default(1),
    name: yup.string().required("Forma de Pago requerida"),
    requiredBankAccount: yup.boolean().default(false)
})

const PaymentTypeAddPage = () => {
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
        history.push("/catalog/payment-type")
    }

    const onSubmit = async (data) => {
        trackPromise(
            db.collection("paymentType")
                .add(data)
                .then((doc) => {
                    console.info("paymentType created: ", doc.id)
                    createAlert("success", "Forma de pago creada.")
                    history.push("/catalog/payment-type");
                })
                .catch((error) => {
                    console.error("Error saving paymentType: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconcido: No se pudo guardar la forma de pago."
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
                        height="250px">
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        name="order"
                                        control={control}
                                        type="number"
                                        label="Orden"
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item sm={12}>
                                    <TextFieldInput
                                        name="name"
                                        label="Forma de Pago"
                                        control={control}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item sm={12}>
                                    <BooleanFieldInput
                                        name="requiredBankAccount"
                                        control={control}
                                        label="Requiere Cuenta Bancaria" />
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


export default PaymentTypeAddPage
