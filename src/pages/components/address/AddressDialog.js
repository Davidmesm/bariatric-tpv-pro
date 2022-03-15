import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import BooleanFieldInput from "../../../components/inputs/BooleanFieldInput"
import TextFieldInput from "../../../components/inputs/TextFieldInput"

const AddressDialog = (props) => {

    const { open, setOpen, action, index, remove, update } = props

    const { control, trigger, getValues, formState: { errors } } = useFormContext()

    const [originalAddress, setOriginalAddress] = useState()

    const handleSaveClick = async () => {
        const result = await trigger(`addresses.${index}`)

        if (result) {
            setOpen(false)
        }
    }

    const handleCancelClick = () => {
        if (action === "new") {
            remove(index)
            setOpen(false)
        }
        else if (action === "edit") {
            update(`addressess.${index}`, originalAddress)
            setOpen(false)
        }
    }

    useEffect(() => {
        if (action === "edit") {
            let address = getValues(`addresses.${index}`)
            setOriginalAddress(address)
        }
    }, [action, getValues, index])

    return (
        <Dialog
            open={open}
            aria-labelledby="form-address-title"
            onClose={(e, reason) => {
                if (reason !== 'backdropClick') {
                    handleCancelClick()
                }
            }}
            fullWidth
            maxWidth='md'>
            {action && action === "new" ?
                <DialogTitle id="form-address-title">Nueva Dirección</DialogTitle> :
                <DialogTitle id="form-address-title">Editar Dirección</DialogTitle>}
            <DialogContent>
                <Box display='flex' flexDirection='column'>
                    <Box>
                        <BooleanFieldInput
                            name="isFiscalAddress"
                            control={control}
                            label="Dirección Fiscal" />
                    </Box>
                    <Box>
                        <TextFieldInput
                            label="Nombre"
                            name={`addresses.${index}.name`}
                            fullWidth
                            control={control} />
                    </Box>
                    <br />
                    <Box display='flex' justifyContent='space-between'>
                        <Box flexGrow={10}>
                            <TextFieldInput
                                label="Calle"
                                name={`addresses.${index}.street`}
                                fullWidth
                                control={control} />
                        </Box>
                        <Box flexGrow={1} />
                        <Box flexGrow={3}>
                            <TextFieldInput
                                label="Numero (Referencia)"
                                name={`addresses.${index}.extNumber`}
                                fullWidth
                                control={control} />
                        </Box>
                        <Box flexGrow={1} />
                        <Box flexGrow={3}>
                            <TextFieldInput
                                label="Interior"
                                name={`addresses.${index}.intRef`}
                                fullWidth
                                control={control} />
                        </Box>
                    </Box>
                    <br />
                    <br />
                    <Box display="flex">
                        <Box width="43%" marginRight={2}>
                            <TextFieldInput
                                label="Codigo Postal"
                                name={`addresses.${index}.zipCode`}
                                fullWidth
                                control={control} />
                        </Box>
                    </Box>
                    <br />
                    <Box width="43%">
                        <TextFieldInput
                            label="Colonia"
                            name={`addresses.${index}.suburb`}
                            fullWidth
                            control={control} />
                    </Box>
                    <br />
                    <Box width="43%">
                        <TextFieldInput
                            label="Ciudad"
                            name={`addresses.${index}.city`}
                            fullWidth
                            control={control} />
                    </Box>
                    <br />
                    <Box width="43%">
                        <TextFieldInput
                            label="Estado"
                            name={`addresses.${index}.state`}
                            fullWidth
                            control={control} />
                    </Box>
                    <br />
                    <br />
                    <Box width="100%">
                        <TextFieldInput
                            placeholder="Comentarios"
                            variant="outlined"
                            control={control}
                            fullWidth
                            multiline
                            minRows={3}
                            name={`addresses.${index}.comments`} />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleSaveClick}>Guardar</Button>
                <Button variant="contained" onClick={handleCancelClick}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddressDialog
