import { TextField } from "@material-ui/core";
import React from "react"
import { useController } from "react-hook-form";
import InputMask from "react-input-mask";

const PhoneFieldInput = (props) => {

    const {
        name, 
        label,
        control,
        onChange,
        variant,
        required,
        disabled,
        readOnly,
        type,
        fullWidth,
        autoFocus } = props

    const { field, fieldState } = useController({name, control, defaultValue: ""})
    
    const handleOnChange = (e) => {
        onChange && onChange(e);
        field.onChange(e);
    }

    return (
        <InputMask
            mask="(99)99999999"
            maskChar=" "
            ref={field.ref}
            value={field.value}
            onChange={(e) => handleOnChange(e)} 
            onBlur={(e) => field.onBlur(e)}
            >
            {() => <TextField
                name={name}
                label={label}
                variant={variant}
                helperText={fieldState.error ? fieldState.error.message : ""}
                error={fieldState.error ? true : false }
                fullWidth={fullWidth}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                type={type}
                autoFocus={autoFocus}/>}
        </InputMask>
    )
}

export default PhoneFieldInput
