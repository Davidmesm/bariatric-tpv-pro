import { Box, Button, Grid, IconButton, Typography } from '@material-ui/core'
import { RemoveCircleOutline } from '@material-ui/icons'
import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import TextFieldInput from '../../../components/inputs/TextFieldInput'

const FlavourControl = (props) => {
    const { schema } = props

    const { control, watch } = useFormContext()

    const { fields, append, remove } = useFieldArray({
        control,
        name: "flavours"
    })

    const watchFlavours = watch("flavours");
    const controlledFlavours = fields.map((field, index) => {
        return {
            ...field,
            ...watchFlavours[index]
        };
    });

    return (
        <Box
            borderColor="primary.main"
            border={2}
            borderRadius={3}>
            <Box
                display="flex"
                flexDirection="column"
                padding={2}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%">
                    <Typography variant="h6">
                        Versiones
                    </Typography>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => append(schema.cast())}>
                        Agregar
                    </Button>
                </Box>
                {controlledFlavours.map((field, index) => (
                    <Box marginTop={1} marginBottom={4} key={field.id}>
                        <Grid container spacing={3}>
                            <Grid item sm={6}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between">
                                    <TextFieldInput
                                        name={`flavours.${index}.name`}
                                        label="Nombre Versión"
                                        fullWidth />
                                    <Box alignSelf="baseline">
                                        <IconButton
                                            color="secondary"
                                            aria-label="remove"
                                            component="span"
                                            onClick={() => remove(index)}>
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </Box>
        </Box>

    )
}

export default FlavourControl
