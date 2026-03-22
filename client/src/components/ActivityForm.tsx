'use client'

import React, { useEffect, useState } from 'react'
import { Formik, Form, useField } from 'formik'
import { TextField, Button, Box, Typography, TextFieldProps, MenuItem } from '@mui/material'
import { useRouter } from 'next/navigation'
import { ActivitiesService } from '@/api/activities'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import * as Yup from 'yup'
import FormikSelectField from './common/FormikTextField'
import indianCities from '../data/indianCities.json'

type FormikTextFieldProps = TextFieldProps & {
  name: string
}

type ActivityFormProps = {
  action: 'create' | 'edit'
  id?: string
}

const formTitles: Record<string, string> = {
  create: 'Create Activity',
  edit: 'Edit Activity',
}

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  date: Yup.date().required('Date is required').nullable(),
  city: Yup.string().required('City is required'),
  venue: Yup.string().required('Venue is required'),
  imageUrl: Yup.string().required('Image is required'),
})

const FormikTextField = ({ name, ...props }: FormikTextFieldProps) => {
  const [field, meta] = useField(name)
  const isError = meta.touched && Boolean(meta.error)

  return <TextField {...field} {...props} error={isError} helperText={isError ? meta.error : ''} />
}

const ActivityForm = ({ action, id }: ActivityFormProps) => {
  const router = useRouter()
  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    city: '',
    venue: '',
    imageUrl: '',
  })
  const [loading, setLoading] = useState(action === 'edit')
  const [isClient, setIsClient] = useState(false)
  const profile = useSelector((state: RootState) => state.profile.profile)
  const [imagePreview, setImagePreview] = useState<string>('')

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: string) => void) {
    const file = e.target.files?.[0]
    if (!file) return

    setImagePreview(URL.createObjectURL(file))

    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 400
      const ratio = Math.min(MAX / img.width, MAX / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      setFieldValue('imageUrl', compressed)
    }
  }

  useEffect(() => {
    setIsClient(true)
    if (action === 'edit' && id) {
      const fetchActivity = async () => {
        try {
          const activity = await ActivitiesService.get(id)

          setInitialValues({
            title: activity.title ?? '',
            description: activity.description ?? '',
            category: activity.category ?? '',
            date: activity.date?.toString().split('T')[0] ?? '',
            city: activity.city ?? '',
            venue: activity.venue ?? '',
            imageUrl: activity.imageUrl ?? '',
          })
          setImagePreview(activity.imageUrl ?? '')
        } catch (err) {
          console.error('Failed to load activity', err)
        } finally {
          setLoading(false)
        }
      }

      fetchActivity()
    }
  }, [action, id])

  if (!isClient) {
    return null
  }

  if (!profile) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Unauthorized — Please sign in to access this page.
        </Typography>
      </Box>
    )
  }

  if (!profile || loading || indianCities.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography>Loading ...</Typography>
      </Box>
    )
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 300,
        margin: '0 auto',
        padding: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        {formTitles[action] || 'Activity Form'}
      </Typography>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            switch (action) {
              case 'create':
                await ActivitiesService.create(values, profile.email, profile.name)
                break
              case 'edit':
                await ActivitiesService.update(values, id)
                break
            }
            router.push('/activities')
          } catch (error) {
            console.error('Error submitting form:', error)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <FormikTextField name="title" label="Title" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="description" label="Description" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="category" label="Category" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="date" label="Date" variant="outlined" margin="normal" fullWidth type="date" InputLabelProps={{ shrink: true }} />
            <FormikSelectField name="city" label="City" variant="outlined" margin="normal" fullWidth>
              {indianCities.map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {city.name}
                </MenuItem>
              ))}
            </FormikSelectField>
            <FormikTextField name="venue" label="Venue" variant="outlined" margin="normal" fullWidth />
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Activity Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {imagePreview && <Box component="img" src={imagePreview} alt="preview" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }} />}
                <Button variant="outlined" component="label" size="small">
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, setFieldValue)} />
                </Button>
              </Box>
            </Box>
            <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }} disabled={isSubmitting}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

export default ActivityForm
