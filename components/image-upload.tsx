import { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  image: string | null
  setImage: (image: string | null) => void
}

export function ImageUpload({ image, setImage }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {!image ? (
        <div className="flex justify-center items-center w-full">
          <label htmlFor="dropzone-file" className="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100">
            <div className="flex flex-col justify-center items-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            </div>
            <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>
      ) : (
        <div className="flex justify-center items-center flex-col space-y-4">
          <div className="relative max-w-xs overflow-x-auto cursor-pointer group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Uploaded" style={{ maxWidth: '100%' }} />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" onClick={clearImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}