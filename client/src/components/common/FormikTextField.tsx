'use client'

import { useField } from 'formik'
import { Input, Select, Textarea } from '../ui/Field'

type Common = {
  name: string
  label?: string
  hint?: string
}

// Formik-connected wrappers around the shared Field controls. Keeping the wiring here
// means forms only declare a name and a label, and validation errors render identically
// everywhere.

export function FormikInput({ name, label, hint, ...props }: Common & React.InputHTMLAttributes<HTMLInputElement> & { adornment?: React.ReactNode }) {
  const [field, meta] = useField(name)
  const error = meta.touched && meta.error ? meta.error : undefined

  return <Input {...field} value={field.value ?? ''} label={label} hint={hint} error={error} {...props} />
}

export function FormikTextarea({ name, label, hint, ...props }: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [field, meta] = useField(name)
  const error = meta.touched && meta.error ? meta.error : undefined

  return <Textarea {...field} value={field.value ?? ''} label={label} hint={hint} error={error} {...props} />
}

export function FormikSelect({ name, label, hint, children, ...props }: Common & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [field, meta] = useField(name)
  const error = meta.touched && meta.error ? meta.error : undefined

  return (
    <Select {...field} value={field.value ?? ''} label={label} hint={hint} error={error} {...props}>
      {children}
    </Select>
  )
}

export default FormikSelect
