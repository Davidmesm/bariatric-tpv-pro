import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { useHistory, useParams } from 'react-router'
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

const PaymentTypeEditPage = () => {
    const history = useHistory()
    const { createAlert } = useAlerts()
    const { id: paymentTypeId } = useParams()
    const { promiseInProgress } = usePromiseTracker()

    const { control, handleSubmit, setError, setValue,
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
                .doc(paymentTypeId)
                .update(data)
                .then(() => {
                    console.info("paymentType updated: ", paymentTypeId)
                    createAlert("success", "Forma de pago actualizada.")
                    history.push("/catalog/payment-type")
                })
                .catch((error) => {
                    console.error("Error updating paymentType: ", error)
                    setError("save", {
                        type: "firebase-error",
                        message: "Error Desconocido: No se pudo actualizar la forma de pago."
                    })
                }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        trackPromise(
            db.collection('paymentType')
                .doc(paymentTypeId)
                .get()
                .then(doc => {
                    if (doc.exists) {
                        let paymentType = doc.data();

                        for (const property in paymentType) {
                            setValue(property, paymentType[property]);
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving original paymentType: ", error)
                    createAlert("error", "No se encontro la forma de pago.")
                    history.push("/catalog/payment-type")

                }))
    }, [paymentTypeId, setValue, createAlert, history])

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

export default PaymentTypeEditPage
