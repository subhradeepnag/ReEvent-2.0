'use client'

import React, { useEffect, useState } from 'react'
import { Formik, Form, useField } from 'formik'
import { TextField, Button, Box, Typography, TextFieldProps } from '@mui/material'
import { useRouter } from 'next/navigation'
import { ActivitiesService } from '@/api/activities'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import * as Yup from 'yup'

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
  imageUrl: Yup.string().url('Must be a valid URL').required('Image is required'),
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

  const profile = useSelector((state: RootState) => state.profile.profile)

  useEffect(() => {
    if (action === 'edit' && id) {
      const fetchActivity = async () => {
        try {
          const activity = await ActivitiesService.get(id)

          setInitialValues({
            title: activity.title ?? '',
            description: activity.description ?? '',
            category: activity.category ?? '',
            date: activity.date?.toString().split('T')[0] ?? '', // important for <input type="date">
            city: activity.city ?? '',
            venue: activity.venue ?? '',
            imageUrl: activity.imageUrl ?? '',
          })
        } catch (err) {
          console.error('Failed to load activity', err)
        } finally {
          setLoading(false)
        }
      }

      fetchActivity()
    }
  }, [action, id])

  if (!profile) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Unauthorized — Please sign in to access this page.
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography>Loading activity...</Typography>
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
        {({ isSubmitting }) => (
          <Form>
            <FormikTextField name="title" label="Title" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="description" label="Description" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="category" label="Category" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="date" label="Date" variant="outlined" margin="normal" fullWidth type="date" InputLabelProps={{ shrink: true }} />
            <FormikTextField name="city" label="City" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="venue" label="Venue" variant="outlined" margin="normal" fullWidth />
            <FormikTextField name="imageUrl" label="Activity Image URL" variant="outlined" margin="normal" fullWidth />
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
