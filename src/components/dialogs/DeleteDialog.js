import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import React from 'react'

const DeleteDialog = (props) => {

    const { setOpenDialog, openDialog, confirmDeleteClick, entityTitle } = props

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
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description">
            <DialogTitle id="delete-dialog-title">
                {`Eliminar registro`}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-dialog-description">
                    {`¿Esta seguro que quiere eliminir el registro de ${entityTitle}?`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancelClick} >
                    Cancelar
                </Button>
                <Button onClick={confirmDeleteClick} color="secondary" autoFocus>
                    Borrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeleteDialog
