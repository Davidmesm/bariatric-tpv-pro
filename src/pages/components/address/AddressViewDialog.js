import React from "react"
import { Dialog, DialogContent, DialogTitle, Divider, 
         List, ListItem, ListItemText, Typography } from "@material-ui/core"

const AddressViewDialog = (props) => {
    const { addresses, open, setOpen} = props

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth='md'
            aria-labelledby="addressess-title">
            <DialogTitle id="addressess-title" onClose={handleClose}>
                Direcciones
            </DialogTitle>
            <DialogContent dividers>
                <List>
                    {addresses.map(address => (
                        <div key={address.name}>
                            <ListItem>
                                <ListItemText 
                                    primary={`${address.name}`} 
                                    secondaryTypographyProps={{component:'div'}}
                                    secondary={
                                        <React.Fragment>
                                            <Typography component={'div'}>
                                                {`${address.street} ${address["extNumber"]} ${address["intRef"] && `int ${address["intRef"]}`}`}
                                            </Typography>
                                            <Typography component={'div'}>
                                                {`CP ${address["zipCode"]}, ${address.suburb}`}
                                            </Typography >
                                            <Typography component={'div'}>
                                                {`${address.city}, ${address.state}`}
                                            </Typography>
                                        </React.Fragment>
                                    }/>
                            </ListItem>
                            <Divider/>
                        </div>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    )
}

export default AddressViewDialog
