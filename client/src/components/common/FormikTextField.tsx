import { TextField, TextFieldProps } from "@mui/material"
import { useField } from "formik"
import { ReactNode } from "react"

type FormikTextFieldProps = TextFieldProps & {
  name: string
  children?: ReactNode
}

const FormikSelectField = ({ name, children, ...props }: FormikTextFieldProps) => {
  const [field, meta] = useField(name)
  const isError = meta.touched && Boolean(meta.error)

  return (
    <TextField
      {...field}
      {...props}
      select
      error={isError}
      helperText={isError ? meta.error : ''}
    >
      {children}
    </TextField>
  )
}

export default FormikSelectField
