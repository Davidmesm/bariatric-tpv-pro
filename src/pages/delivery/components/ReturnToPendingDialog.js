import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core"
import React from "react"

const ReturnToPendingDialog = (props) => {
    const { setOpenDialog, openDialog, confirmRecieveClick } = props

    const handleClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            setOpenDialog(false)
        }
    }

    const handleCancelClick = () => {
        setOpenDialog(false)
    }

    return (
        <Dialog
            open={openDialog}
            onClose={(event, reason) => handleClose(event, reason)}
            aria-labelledby="return-dialog-title"
            aria-describedby="return-dialog-description">
            <DialogTitle id="returndialog-title">
                {`Regresar a Pendiente`}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="recieve-dialog-description">
                    {`¿Esta seguro que quiere actualizar el envio a "Pendiente"?`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancelClick} >
                    Cancelar
                </Button>
                <Button onClick={confirmRecieveClick} color="secondary" autoFocus>
                    Actualizar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReturnToPendingDialog