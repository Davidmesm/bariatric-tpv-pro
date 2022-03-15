import { Box, Button, Card, CardContent, makeStyles } from "@material-ui/core"
import { Map } from "@material-ui/icons"
import React from "react"

const useStyles = makeStyles({
    root: {
        width: 300,
        height: 240,
        marginTop: 10,
        marginBottom: 10
    },
    content: {
        height: "100%"
    }
});

const NewAddressCard = (props) => {

    const classes = useStyles()

    const { openDialog, append, schema, setIndex, fields, setAction } = props

    const handleAddAddressClick = () => {
        setIndex((fields.length))

        let address = schema.cast();

        append(address)
        openDialog(true)
        setAction("new")
    }

    return (
        <Card className={classes.root} variant="outlined">
            <CardContent className={classes.content}>
                <Box display="flex" justifyContent="space-around" height="100%">
                    <Box display="flex" justifyContent="space-around" flexDirection="column">
                        <Box>
                            <Button 
                                variant="outlined" 
                                color="secondary"
                                size="large"
                                endIcon={<Map/>}
                                onClick={(e) => handleAddAddressClick(e)}>
                                Agregar
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}

export default NewAddressCard
