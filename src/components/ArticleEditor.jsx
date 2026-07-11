import { useRef, useCallback, useMemo } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link'],
  ['image'],
  ['clean'],
]

export default function ArticleEditor({ value, onChange, placeholder }) {
  const quillRef = useRef(null)

  const handleImage = () => {
    const quill = quillRef.current?.getEditor?.()
    if (!quill) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 }
        quill.insertEmbed(range.index, 'image', reader.result)
        quill.setSelection(range.index + 1, 0)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const modules = {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: handleImage,
      },
    },
  }

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
      preserveWhitespace
    />
  )
}