import {
    Avatar, Card, CardActions, CardContent,
    CardHeader, Link, makeStyles, Typography,
    Box
} from "@material-ui/core"
import React from "react"

const useStyles = makeStyles({
    root: {
        width: 300,
        height: 240,
        marginTop: 10,
        marginBottom: 10,
        overflow: "scroll"
    }
});

const AddressCard = (props) => {

    const classes = useStyles()

    const { address, index, mainAddress, openDialog,
        setAction, setIndex, openDeleteDialog,
        setValue } = props

    const handleEditAddress = () => {
        setAction("edit")
        setIndex(index)
        openDialog(true)
    }

    const handleDeleteAddress = () => {
        setIndex(index)
        openDeleteDialog(true)
    }

    const handleChangeMainAddress = () => {
        setValue("mainAddress", index)
    }

    return (
        <Card className={classes.root} variant="outlined">
            <CardHeader
                avatar={<Avatar aria-label={`address-${index}`}>{(index + 1)}</Avatar>}
                title={address.name}
                titleTypographyProps={{ variant: 'h6' }}
                subheader={index === mainAddress ? "Predeterminado" : ""} />
            <CardContent>
                <Typography variant="body2" >
                    {`${address.street} ${address.extNumber} ${address.intRef && "int"} ${address.intRef}`}
                </Typography>
                <Typography variant="body2">
                    {`CP ${address.zipCode}, ${address.suburb}`}
                </Typography>
                <Typography variant="body2">
                    {`${address.city}, ${address.state}`}
                </Typography>
                {address.comments &&
                    <Typography variant="body2">
                        {`Comentarios: ${address.comments}`}
                    </Typography>
                }
            </CardContent>
            <CardActions>
                <Typography>
                    {<Link color="secondary" onClick={() => handleEditAddress()}>
                        Editar</Link>}
                    {" | "}
                    {<Link color="secondary" onClick={() => handleDeleteAddress()}>
                        Eliminar</Link>}
                    {index !== mainAddress && " | "}
                    {index !== mainAddress &&
                        <Link color="secondary" onClick={() => handleChangeMainAddress()}>
                            Establecer como predeterminado
                        </Link>}
                </Typography>
            </CardActions>
        </Card>
    )
}

export default AddressCard
