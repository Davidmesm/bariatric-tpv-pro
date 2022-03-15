import { FormControlLabel, Switch } from '@material-ui/core'
import React from 'react'
import { useController } from 'react-hook-form'

const BooleanFieldInput = (props) => {

    const { color, name, control, label, onChange, disabled, defaultValue } = props

    const { field } = useController({name, control, defaultValue: defaultValue || ""})

    const handleOnChange = (e) => {
        onChange && onChange(e);
        field.onChange(e);
    }

    return (
        <FormControlLabel
            control={
                <Switch
                    name={name}
                    color={color || "primary"}
                    checked={field.value}
                    disabled={disabled}
                    onChange={(e) => handleOnChange(e)}
                    {...field} />
            }
            label={label} />
    )
}

export default BooleanFieldInput
