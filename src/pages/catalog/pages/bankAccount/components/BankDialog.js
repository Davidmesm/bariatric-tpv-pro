import { yupResolver } from "@hookform/resolvers/yup"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import TextFieldInput from "../../../../../components/inputs/TextFieldInput"
import { useAlerts } from "../../../../../contexts/AlertsContext"
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { db } from "../../../../../firebase"
import Loading from "../../../../../components/Loading"

const schema = yup.object().shape({
    order: yup.number()
        .transform((value => isNaN(value) ? undefined : value))
        .required("Orden requerido")
        .default(1),
    name: yup.string().required("Banco requerido")
})

const BankDialog = (props) => {
    const { valueToAdd, open, setOpen } = props

    const { createAlert } = useAlerts()

    const { promiseInProgress } = usePromiseTracker();

    const { control, handleSubmit, setError, setValue,
        formState: { errors, isSubmitting} } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })
    
    const handleClose = () => {
        setOpen(false)
        setValue("order", "1")
    }

    const onSubmit = async (data) => {
        trackPromise(
        db.collection("bank")
            .add(data)
            .then((doc) => {
                console.info("bank created: ", doc.id)
                createAlert("success", "Banco creado.")
                setOpen(false)
                setValue("order", "1")
            })
            .catch((error) => {
                console.error("Error saving bank: ", error);
                setError("save", {
                    type: "firebase-error",
                    message: "Error Desconcido: No se pudo guardar el banco."
                })
            }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        if (typeof valueToAdd === "string") {
            setValue("name", valueToAdd)
        }
        else if (valueToAdd.inputValue) {
            setValue("name", valueToAdd.inputValue)
        }
        else {
            setValue("name", "")
        }
    }, [valueToAdd, setValue])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <form onSubmit={handleSubmit(onSubmit, onError)} id="bank-form">
                <DialogTitle id="form-dialog-title">Agregar Banco</DialogTitle>
                <DialogContent>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between">
                        {
                            (errors && errors.save) &&
                            <Alert severity="error">
                                {errors.save.message}
                            </Alert>
                        }
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="order"
                                    control={control}
                                    type="number"
                                    label="Orden"
                                />
                            </Grid>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="name"
                                    label="Banco"
                                    control={control}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        color="primary" 
                        form="bank-form"
                        disabled={isSubmitting}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default BankDialog
