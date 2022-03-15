import { TextField } from "@material-ui/core"
import React from "react"
import { useController } from "react-hook-form";

const TextFieldInput = (props) => {

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
        autoComplete,
        inputProps,
        fullWidth,
        multiline,
        maxRows,
        autoFocus,
        size,
        color,
        margin,
        placeholder,
        minRows
        } = props

    const { field, fieldState } = useController({name, control, defaultValue: ""})

    const handleOnChange = (e) => {
        onChange && onChange(e);
        field.onChange(e);
    }

    return (
        <TextField
            name={name}
            label={label}
            ref={field.ref}
            value={field.value}
            onChange={(e) => handleOnChange(e)} 
            onBlur={(e) => field.onBlur(e)}
            variant={variant}
            helperText={fieldState.error ? fieldState.error.message : ""}
            error={fieldState.error ? true : false }
            multiline={multiline}
            maxRows={maxRows}
            size={size}
            fullWidth={fullWidth}
            required={required}
            color={color}
            disabled={disabled}
            readOnly={readOnly}
            type={type}
            autoComplete={autoComplete}
            inputProps={inputProps}
            autoFocus={autoFocus}
            margin={margin}
            placeholder={placeholder}
            minRows={minRows}
            />
    )
}

export default TextFieldInput
