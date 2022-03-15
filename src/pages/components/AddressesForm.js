import { Box } from "@material-ui/core"
import React, { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import AddressCard from "./address/AddressCard"
import AddressDialog from "./address/AddressDialog"
import NewAddressCard from "./address/NewAddressCard"
import DeleteDialog from "../../components/dialogs/DeleteDialog"

const AddressesForm = (props) => {
    const { schema } = props

    const { control, watch, setValue } = useFormContext()

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "addresses",
        default: schema.cast()
    })

    const watchMainAddress = watch("mainAddress")

    const watchAddresses = watch("addresses", [])
    const controlledAddresses = fields.map((field, index) => {
        return {
            ...field,
            ...watchAddresses[index]
        }
    })

    const setMainAddress = (index) => {
        setValue("mainAddress", index)
    }

    const confirmDelete = () => {
        setOpenDeleteDialog(false)
        remove(currentIndex)
    }

    const [openAddressDialog, setOpenAddressDialog] = useState(false)
    const [action, setAction] = useState("")
    const [currentIndex, setCurrentIndex] = useState(0)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

    return (
        <React.Fragment>
            <Box display="flex" flexWrap="wrap" justifyContent="space-evenly" width="100%">
                <NewAddressCard 
                    openDialog={setOpenAddressDialog} 
                    schema={schema}
                    append={append}
                    setIndex={setCurrentIndex}
                    fields={fields}
                    setAction={setAction}
                    />
                {controlledAddresses.map((field, index) => (
                    <AddressCard 
                        key={field.id}
                        address={field} 
                        index={index} 
                        mainAddress={watchMainAddress}
                        setMainAddress={setMainAddress}
                        openDialog={setOpenAddressDialog}
                        openDeleteDialog={setOpenDeleteDialog}
                        setAction={setAction}
                        setIndex={setCurrentIndex}
                        setValue={setValue}/>
                ))}
            </Box>
            <AddressDialog 
                open={openAddressDialog}
                setOpen={setOpenAddressDialog}
                action={action}
                index={currentIndex}
                remove={remove}
                update={update}/>
            <DeleteDialog 
                openDialog={openDeleteDialog}
                setOpenDialog={setOpenDeleteDialog}
                confirmDeleteClick={confirmDelete}
                entityTitle={"Direcciones"}
                />
        </React.Fragment>
    )
}

export default AddressesForm
