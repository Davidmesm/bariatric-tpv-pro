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
    name: yup.string().required("Canal de Contacto requerido")
})

const NutritionistDialog = (props) => {
    const { valueToAdd, open, setOpen } = props

    const { createAlert } = useAlerts()

    const { promiseInProgress } = usePromiseTracker();

    const { control: controlNU, handleSubmit: handleSubmitNU, 
        setError: setErrorNU, setValue: setValueNU,
        formState: { errors: errorsNU, isSubmitting: isSubmittingNU} } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: schema.cast()
        })
    
    const handleClose = () => {
        setOpen(false)
        setValueNU("order", "1")
    }

    const onSubmit = async (data) => {
        trackPromise(
        db.collection("nutritionist")
            .add(data)
            .then((doc) => {
                console.info("Nutritionist created: ", doc.id)
                createAlert("success", "Nutriólogo o Grupo creado.")
                setOpen(false)
                setValueNU("order", "1")
            })
            .catch((error) => {
                console.error("Error saving Nutritionist: ", error);
                setErrorNU("save", {
                    type: "firebase-error",
                    message: "Error Desconcido: No se pudo guardar el nutriólogo o grupo."
                })
            }))
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    useEffect(() => {
        if (typeof valueToAdd === "string") {
            setValueNU("name", valueToAdd)
        }
        else if (valueToAdd.inputValue) {
            setValueNU("name", valueToAdd.inputValue)
        }
        else {
            setValueNU("name", "")
        }
    }, [valueToAdd, setValueNU])

    if (promiseInProgress) {
        return (
            <Loading />
        )
    }

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <form onSubmit={handleSubmitNU(onSubmit, onError)} id="nutritionist-form">
                <DialogTitle id="form-dialog-title">Agregar Nutriólogo o Grupo</DialogTitle>
                <DialogContent>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between">
                        {
                            (errorsNU && errorsNU.save) &&
                            <Alert severity="error">
                                {errorsNU.save.message}
                            </Alert>
                        }
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="order"
                                    control={controlNU}
                                    type="number"
                                    label="Orden"
                                />
                            </Grid>
                            <Grid item sm={6}>
                                <TextFieldInput
                                    name="name"
                                    label="Nutriólogo o Grupo"
                                    control={controlNU}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" disabled={isSubmittingNU}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        color="primary" 
                        form="nutritionist-form"
                        disabled={isSubmittingNU}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default NutritionistDialog
