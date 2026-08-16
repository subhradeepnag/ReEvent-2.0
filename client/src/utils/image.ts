/**
 * Downscales a picked file and returns it as a JPEG data URL.
 *
 * Avatars and activity images are stored inline on the record, so they have to be
 * shrunk in the browser before they are ever sent — the same routine is used by the
 * signup, profile and activity forms.
 */
export function compressImage(file: File, maxSize: number, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Canvas is not available'))
        return
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read the selected image'))
    }

    img.src = objectUrl
  })
}
