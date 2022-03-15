import { yupResolver } from "@hookform/resolvers/yup"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import TextFieldInput from "../../../components/inputs/TextFieldInput"
import { useAlerts } from "../../../contexts/AlertsContext"
import { trackPromise, usePromiseTracker } from 'react-promise-tracker'
import { db } from "../../../firebase"
import Loading from "../../../components/Loading"

const schema = yup.object().shape({
    order: yup.number()
        .transform((value => isNaN(value) ? undefined : value))
        .required("Orden requerido").default(1),
    name: yup.string().required("Cirugía requerida")
})

const SurgeryDialog = (props) => {
    const { valueToAdd, open, setOpen } = props

    const { createAlert } = useAlerts()

    const { promiseInProgress } = usePromiseTracker();

    const { control: controlSU, handleSubmit: handleSubmitSU, 
        setError: setErrorSU, setValue: setValueSU,
        formState: { errors: errorsSU, isSubmitting: isSubmittingSU} } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })
    
    const handleClose = () => {
        setOpen(false)
        setValueSU("order", "1")
    }

    const onSubmit = async (data) => {
        trackPromise(
        db.collection("surgery")
            .add(data)
            .then((doc) => {
                console.info("Surgery created: ", doc.id)
                createAlert("success", "Cirugía creada.")
                setOpen(false)
                setValueSU("order", "1")
            })
            .catch((error) => {
                console.error("Error saving Surgery: ", error);
                setErrorSU("save", {
                    type: "firebase-error",
                    message: "Error Desconcido: No se pudo guardar la cirugía."
                })
            }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        if (typeof valueToAdd === "string") {
            setValueSU("name", valueToAdd)
        }
        else if (valueToAdd.inputValue) {
            setValueSU("name", valueToAdd.inputValue)
        }
        else {
            setValueSU("name", "")
        }
    }, [valueToAdd, setValueSU])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <form onSubmit={handleSubmitSU(onSubmit, onError)} id="surgery-form">
                <DialogTitle id="form-dialog-title">Agregar Cirugía</DialogTitle>
                <DialogContent>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between">
                        {
                            (errorsSU && errorsSU.save) &&
                            <Alert severity="error">
                                {errorsSU.save.message}
                            </Alert>
                        }
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="order"
                                    control={controlSU}
                                    type="number"
                                    label="Orden"
                                />
                            </Grid>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="name"
                                    label="Cirugía"
                                    control={controlSU}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" disabled={isSubmittingSU}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        color="primary" 
                        form="surgery-form"
                        disabled={isSubmittingSU}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default SurgeryDialog
