import { TextField } from "@material-ui/core"
import React from "react"
import { useController} from "react-hook-form"
import NumberFormat from "react-number-format"

const NumberFormatCustom = (props) => {
    const { inputRef, onChange, ...rest } = props;

    return (
        <NumberFormat
            {...rest}
            getInputRef={inputRef}
            onValueChange={values => {
                onChange({
                    target: {
                        value: values.value
                    }
                });
            }}
            decimalScale={2}
            prefix="$" />
    )
}

const CurrencyFieldInput = (props) => {

    const {
        control,
        name,
        label,
        fullWidth,
        disabled,
        onChange,
        variant,
        size,
        required
    } = props

    const { field, fieldState } = useController({name, control, defaultValue: ""})

    const handleOnChange = (e) => {
        onChange && onChange(e);
        field.onChange(e);
    }

    return (

        <TextField
            label={label}
            error={!!fieldState.error}
            helperText={fieldState.error ? fieldState.error.message : null}
            disabled={disabled}
            ref={field.ref}
            value={field.value}
            onChange={(e) => handleOnChange(e)} 
            onBlur={(e) => field.onBlur(e)}
            InputProps={{
                inputComponent: NumberFormatCustom
            }}
            variant={variant}
            fullWidth={fullWidth}
            size={size}
            required={required} 
            {...field}/>
    )
}

export default CurrencyFieldInput