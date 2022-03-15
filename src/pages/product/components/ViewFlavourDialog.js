import React from "react"
import {
    Dialog, DialogContent, DialogTitle,
    List, ListItem, ListItemText
} from "@material-ui/core"

const ViewFlavourDialog = (props) => {
    const { flavours, open, setOpen } = props;

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Dialog
            open={open}
            fullWidth
            onClose={handleClose}
            maxWidth='md'
            aria-labelledby="flavours-title">
            <DialogTitle id="addressess-title" onClose={handleClose}>
                Versiones
            </DialogTitle>
            <DialogContent dividers>
                <List>
                    {flavours.map(flavour => (
                        <div key={flavour.name}>
                            <ListItem>
                                <ListItemText
                                    primary={`${flavour.name}`} />
                            </ListItem>
                        </div>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    )
}

export default ViewFlavourDialog

