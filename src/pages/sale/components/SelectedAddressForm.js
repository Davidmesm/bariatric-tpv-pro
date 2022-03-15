import { Typography } from "@material-ui/core"
import React from "react"
import { useWatch } from "react-hook-form"

const SelectedAddressForm = (props) => {

    const {control} = props
    
    let address = useWatch({control, name: "address"})

    return (
        <>
            {address && <>
            <Typography>
                {`${address.street} ${address.extNumber} ${address.intRef ? `int ${address.intRef}` : ""}`}
            </Typography>
            <Typography>
                {`CP ${address.zipCode}, ${address.suburb}`}
            </Typography>
            <Typography>
                {`${address.city}, ${address.state}, Mexico`}
            </Typography>
            {address.comments &&
            <Typography>
                {`Comentarios: ${address.comments}`}
            </Typography>}
            </>
            }
        </>
    )
}

export default SelectedAddressForm
