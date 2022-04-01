import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItem, ListItemText, Paper, Typography } from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import React from "react"
import { useWatch } from "react-hook-form"
import { trackPromise } from "react-promise-tracker"
import DateFieldInput from "../../../components/inputs/DateFieldInput"
import TextFieldInput from "../../../components/inputs/TextFieldInput"
import SelectFieldInput from "../../../components/inputs/SelectFieldInput"
import { useAlerts } from "../../../contexts/AlertsContext"
import { db } from "../../../firebase"
import SelectedAddressForm from "../../sale/components/SelectedAddressForm"

const SendDialog = (props) => {
    const { createAlert } = useAlerts()

    const {
        control,
        errors,
        openDialog,
        setOpenDialog,
        isSubmitting,
        setValue,
        parcelServiceData,
        handleSubmit } = props

    const watchProducts = useWatch({ control: control, name: "products", defaultValue: [] })


    const handleClose = () => {
        setOpenDialog(false);
    }

    const handleCancelClick = () => {
        setOpenDialog(false);
    }

    const onSubmit = async (data) => {
        trackPromise(
            db.collection("delivery").doc(data.id).get()
                .then(doc => {
                    if (doc.exists) {
                        let docData = doc.data()

                        docData.sendDate = data.sendDate
                        docData.parcelService = data.parcelService
                        docData.trackingGuide = data.trackingGuide
                        docData.status = "Enviado"

                        db.collection("delivery").doc(data.id).update(docData)
                            .then(() => {
                                createAlert("success", "Enviado.")
                                setOpenDialog(false)
                            })
                            .catch(error => {
                                console.error("error updating delivery: ", error)
                                createAlert("error", "No se pudo actualizar el envio")
                            })
                    }
                })
                .catch(error => {
                    console.error("delivery not found: ", error)
                    createAlert("error", "No se pudo actualizar el envio")
                })
        )
    }

    const onError = (errors, e) => {
        console.error(errors, e)
    }

    return (
        <Dialog
            maxWidth="xl"
            open={openDialog}
            onClose={handleClose}
            aria-labelledby="send-dialog-title"
            aria-describedby="send-dialog-description"
            disableBackdropClick>
            <DialogTitle id="send-dialog-title">
                {`Enviar`}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <DialogContent>
                    {(errors && errors.save) &&
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
                        width="900px"
                        height="700px">
                        <Box
                            height="100%"
                            paddingLeft={3}
                            paddingRight={3}
                            flexDirection="column"
                            display="flex"
                            justifyContent="space-between">
                            <Grid container spacing={3}>
                                <Grid item sm={6} >
                                    <DateFieldInput
                                        label="Fecha de Venta"
                                        name="saleDate"
                                        disabled
                                        control={control}
                                        fullWidth />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3} >
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        label="Id de Venta"
                                        name="saleId"
                                        disabled
                                        control={control}
                                        fullWidth />
                                </Grid>
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        label="Cliente"
                                        name="client"
                                        disabled
                                        control={control}
                                        fullWidth />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item sm={6}>
                                    <TextFieldInput
                                        label="Teléfono"
                                        name="phone"
                                        disabled
                                        control={control}
                                        fullWidth />
                                </Grid>
                                <Grid item sm={6}>
                                    <Paper elevation={1}>
                                        <Box padding={3} minHeight="120px">
                                            <SelectedAddressForm control={control} />
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3} alignItems="flex-start">
                                <Grid item sm={6}>
                                    <Typography>Productos</Typography>
                                    <Box height={300}>
                                        <Paper elevation={1}>
                                            <Box>
                                                <List>
                                                    {watchProducts.map((field) => (
                                                        <ListItem key={field.id}>
                                                            <ListItemText primary={`${field.product} ${field.flavour ?? ""}`}
                                                                secondary={`Cantidad: ${field.qty}`} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Paper>
                                    </Box>
                                </Grid>
                                <Grid item sm={6}>
                                    <Box
                                        height="100%"
                                        width="100%"
                                        flexDirection="column"
                                        display="flex"
                                        justifyContent="space-between">
                                        <Box>
                                            <DateFieldInput
                                                label="Fecha de Envio"
                                                name="sendDate"
                                                control={control}
                                                fullWidth />
                                        </Box>
                                        <br />
                                        <Box>
                                            <SelectFieldInput
                                                name="parcelService"
                                                label="Servicio de Paqueteria"
                                                control={control}
                                                setValue={setValue}
                                                variant="outlined"
                                                fullWidth
                                                options={parcelServiceData} />
                                        </Box>
                                        <br />
                                        <br />
                                        <Box>
                                            <TextFieldInput
                                                label="Guia de Rastreo"
                                                name="trackingGuide"
                                                control={control}
                                                fullWidth />
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box
                        marginBottom={3}
                        marginTop={3}
                        display="flex"
                        justifyContent="space-between"
                        marginRight={3}
                        width={250}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}>
                            Guardar
                        </Button>
                        <Button variant="contained" onClick={handleCancelClick}>Cancelar</Button>
                    </Box>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default SendDialog
