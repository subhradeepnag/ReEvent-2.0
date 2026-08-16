'use client'

import React, { useEffect, useState } from 'react'
import { Formik, Form } from 'formik'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import * as Yup from 'yup'
import { ActivitiesService } from '@/api/activities'
import { RootState } from '@/store'
import { ActivityFormValues } from '@/models'
import { compressImage } from '@/utils/image'
import indianCities from '../data/indianCities.json'
import { FormikInput, FormikSelect, FormikTextarea } from './common/FormikTextField'
import { Switch } from './ui/Field'
import Button from './ui/Button'
import Spinner from './ui/Spinner'

type ActivityFormProps = {
  action: 'create' | 'edit'
  id?: string
}

const formCopy: Record<string, { title: string; subtitle: string; submit: string }> = {
  create: { title: 'Create Activity', subtitle: 'Publish a new activity for people to join.', submit: 'Create activity' },
  edit: { title: 'Edit Activity', subtitle: 'Update the details of your activity.', submit: 'Save changes' },
}

// Number inputs come back as '' when empty, which Yup would otherwise cast to NaN — treat that as "not provided"
const emptyStringToUndefined = (value: number, original: unknown) => (original === '' ? undefined : value)

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  date: Yup.date().required('Date is required').nullable(),
  city: Yup.string().required('City is required'),
  venue: Yup.string().required('Venue is required'),
  imageUrl: Yup.string().required('Image is required'),
  isPaid: Yup.boolean(),
  // Price is only meaningful — and only required — when the activity is marked as paid
  price: Yup.number()
    .transform(emptyStringToUndefined)
    .when('isPaid', {
      is: true,
      then: (schema) => schema.typeError('Price must be a number').required('Price is required').moreThan(0, 'Price must be greater than 0'),
      otherwise: (schema) => schema.notRequired(),
    }),
  maxAttendees: Yup.number()
    .transform(emptyStringToUndefined)
    .typeError('Capacity must be a number')
    .integer('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .notRequired(),
})

// Grouped block of fields with a heading, so a long form reads as a few short ones
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  )
}

// Main component for creating or editing an activity, with form validation and image upload/preview functionality
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
    isPaid: false,
    // Kept as strings while editing so the inputs can be genuinely empty; coerced to numbers on submit
    price: '',
    maxAttendees: '',
  })
  const [loading, setLoading] = useState(action === 'edit')
  const [isClient, setIsClient] = useState(false)
  const profile = useSelector((state: RootState) => state.profile.profile)

  const copy = formCopy[action] ?? formCopy.create

  // Function to handle image file selection: compresses the picked image and stores it on the form as a data URL
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: string) => void) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setFieldValue('imageUrl', await compressImage(file, 400))
    } catch (error) {
      console.error('Failed to process image', error)
    }
  }

  // Load activity data when editing, and set up the form with initial values. Also set isClient to true to avoid hydration issues.
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
            isPaid: activity.isPaid ?? false,
            price: activity.isPaid ? String(activity.price ?? '') : '',
            maxAttendees: activity.maxAttendees === null || activity.maxAttendees === undefined ? '' : String(activity.maxAttendees),
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

  // If we're still on the server, or the activity is loading, show a spinner rather than nothing
  if (!isClient || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // If user is not logged in, show an unauthorized message
  if (!profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-semibold text-fg">Unauthorized</h1>
        <p className="text-sm text-muted">Please sign in to access this page.</p>
        <Button className="mt-2" onClick={() => router.push('/login')}>
          Go to login
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-fg">{copy.title}</h1>
        <p className="mt-1.5 text-muted">{copy.subtitle}</p>
      </header>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            // Turn the string-backed number inputs into the shape the API expects.
            // An unpaid activity always sends price 0, so clearing the toggle can't leave a stale price behind.
            const payload: ActivityFormValues = {
              ...values,
              isPaid: values.isPaid,
              price: values.isPaid ? Number(values.price) : 0,
              maxAttendees: values.maxAttendees === '' ? null : Number(values.maxAttendees),
            }

            switch (action) {
              case 'create':
                await ActivitiesService.create(payload, profile.email, profile.name)
                break
              case 'edit':
                await ActivitiesService.update(payload, id)
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
        {({ isSubmitting, setFieldValue, values, errors, touched }) => (
          <Form className="mt-8 flex animate-fade-up flex-col gap-5" style={{ animationDelay: '80ms' }}>
            <Section title="Details" description="What is happening, and what it is about.">
              <FormikInput name="title" label="Title" placeholder="Sunday morning trek" />
              <FormikTextarea name="description" label="Description" placeholder="Tell people what to expect…" rows={4} />
              <FormikInput name="category" label="Category" placeholder="Outdoors, Music, Tech…" />
            </Section>

            <Section title="When & where" description="Attendees see this on the activity card.">
              <FormikInput name="date" label="Date" type="date" />
              <FormikSelect name="city" label="City">
                <option value="">Select a city</option>
                {indianCities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </FormikSelect>
              <FormikInput name="venue" label="Venue" placeholder="Cubbon Park, Gate 3" />
            </Section>

            <Section title="Cover image" description="Shown on the activity card and detail page.">
              <div className="flex items-center gap-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
                  {values.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={values.imageUrl} alt="Cover preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-faint">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <rect x="3" y="4" width="18" height="16" rx="2.5" />
                        <circle cx="9" cy="10" r="2" />
                        <path d="m4 18 5-4 3.5 3 3-2.5L20 18" />
                      </svg>
                    </span>
                  )}
                </div>

                <label className="cursor-pointer">
                  <span className="inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg transition-all duration-250 ease-smooth hover:border-brand/50 hover:text-brand active:scale-[0.97]">
                    {values.imageUrl ? 'Change image' : 'Upload image'}
                  </span>
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, setFieldValue)} />
                </label>
              </div>

              {touched.imageUrl && errors.imageUrl && <p className="text-xs text-danger">{errors.imageUrl}</p>}
            </Section>

            {/* Ticketing — a paid activity routes attendees through Razorpay checkout instead of joining directly */}
            <Section title="Ticketing" description="Free activities let people join in one tap.">
              <Switch
                checked={values.isPaid}
                onChange={(checked) => {
                  setFieldValue('isPaid', checked)
                  // Clear the price when switching back to free so a stale value can't be shown or resubmitted
                  if (!checked) setFieldValue('price', '')
                }}
                label={values.isPaid ? 'Paid activity' : 'Free activity'}
                description={values.isPaid ? 'Attendees pay before their spot is confirmed.' : 'Anyone can join without paying.'}
              />

              {/* Price slides in with the toggle instead of appearing abruptly */}
              <div
                className={
                  values.isPaid
                    ? 'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-400 ease-smooth'
                    : 'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-400 ease-smooth'
                }
              >
                <div className="min-h-0 overflow-hidden">
                  <FormikInput name="price" label="Price per person" type="number" min={1} step="0.01" adornment={<span className="text-sm">₹</span>} />
                </div>
              </div>

              <FormikInput name="maxAttendees" label="Max attendees (optional)" type="number" min={1} step={1} hint="Leave blank for unlimited" />
            </Section>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" fullWidth loading={isSubmitting}>
                {isSubmitting ? 'Saving…' : copy.submit}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default ActivityForm
