import React, { useContext, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { ShopContext } from '../context/ShopContext'
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  uploadProductImage,
  imageUrl
} from '../services/api'
import FormField, { fieldClass } from './FormField'
import Alert from './Alert'

const EMPTY = {
  name: '',
  description: '',
  price: '',
  category: '',
  subCategory: '',
  image: [],
  sizes: '',
  bestseller: false
}

// Sizes stay one line of text, because typing "S, M, L" is faster than
// operating a list widget for three values. Images do not: they are files
// now, and a list of thumbnails you can remove beats a line of URLs.
const toForm = (product) => ({
  name: product.name,
  description: product.description,
  price: String(product.price),
  category: product.category,
  subCategory: product.subCategory,
  image: [...product.image],
  sizes: product.sizes.join(', '),
  bestseller: Boolean(product.bestseller)
})

const AdminProducts = () => {
  const { products, refreshProducts } = useContext(ShopContext)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  // Suggestions rather than a fixed dropdown: an admin can type a brand new
  // category, but does not have to remember the spelling of an existing one.
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].filter(Boolean).sort(),
    [products]
  )
  const subCategories = useMemo(
    () => [...new Set(products.map((p) => p.subCategory))].filter(Boolean).sort(),
    [products]
  )

  const visible = useMemo(() => {
    const list = query
      ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      : products
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [products, query])

  const addImages = async (files) => {
    if (files.length === 0) return

    setUploading(true)
    setError('')
    try {
      // One at a time rather than Promise.all, so a failure half way through
      // still keeps the images that did upload.
      for (const file of files) {
        const url = await uploadProductImage(file)
        setForm((prev) => ({ ...prev, image: [...prev.image, url] }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const addUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    setForm((prev) => ({ ...prev, image: [...prev.image, url] }))
    setUrlDraft('')
  }

  const removeImage = (index) =>
    setForm((prev) => ({ ...prev, image: prev.image.filter((_, i) => i !== index) }))

  const startNew = () => {
    setEditingId(null)
    setForm(EMPTY)
    setError('')
    setOpen(true)
  }

  const startEdit = (product) => {
    setEditingId(product._id)
    setForm(toForm(product))
    setError('')
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Split here rather than on the server so what gets sent is already the
    // shape the API documents: arrays, and a number for the price.
    const payload = {
      ...form,
      price: Number(form.price),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    }

    try {
      if (editingId) {
        await adminUpdateProduct(editingId, payload)
        toast.success('Product updated')
      } else {
        await adminCreateProduct(payload)
        toast.success('Product added')
      }
      await refreshProducts()
      setOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (product) => {
    // Deliberately a confirm(). Deleting is one click and cannot be undone,
    // and a custom modal here would be a lot of code to say the same thing.
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return

    try {
      const { message } = await adminDeleteProduct(product._id)
      toast.success(message)
      await refreshProducts()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors hover:border-gray-400 focus:border-gray-900"
        />
        <button
          type="button"
          onClick={startNew}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Add product
        </button>
      </div>

      {open && (
        <form
          onSubmit={onSubmit}
          className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {editingId ? 'Edit product' : 'New product'}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded text-sm text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="name" label="Name">
              <input id="name" name="name" value={form.name} onChange={onChange} className={fieldClass} />
            </FormField>

            <FormField id="price" label="Price">
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={onChange}
                className={fieldClass}
              />
            </FormField>

            <FormField id="category" label="Category">
              <input
                id="category"
                name="category"
                list="admin-categories"
                value={form.category}
                onChange={onChange}
                className={fieldClass}
                placeholder="Men"
              />
              <datalist id="admin-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </FormField>

            <FormField id="subCategory" label="Type">
              <input
                id="subCategory"
                name="subCategory"
                list="admin-subcategories"
                value={form.subCategory}
                onChange={onChange}
                className={fieldClass}
                placeholder="Topwear"
              />
              <datalist id="admin-subcategories">
                {subCategories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </FormField>

            <div className="sm:col-span-2">
              <FormField id="description" label="Description">
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={onChange}
                  className={fieldClass}
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Images</span>

              {form.image.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-3">
                  {form.image.map((src, index) => (
                    <div key={`${src}-${index}`} className="group relative">
                      <img
                        src={imageUrl(src)}
                        alt=""
                        className="h-24 w-24 rounded-lg border border-gray-200 bg-gray-50 object-cover"
                      />
                      {/* The first image is the one the shop grid shows, so
                          it is worth saying which that is. */}
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 shadow-sm transition-colors hover:border-red-300 hover:text-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900">
                  {uploading ? 'Uploading…' : 'Upload images'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => {
                      addImages([...e.target.files])
                      // Clear it, or picking the same file twice in a row
                      // fires no change event and looks broken.
                      e.target.value = ''
                    }}
                    className="hidden"
                  />
                </label>

                <span className="text-xs text-gray-400">or</span>

                <input
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addUrl()
                    }
                  }}
                  placeholder="paste a URL or /images/p_img1.webp"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors hover:border-gray-400 focus:border-gray-900"
                />
                <button
                  type="button"
                  onClick={addUrl}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
                >
                  Add
                </button>
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Files go straight to Cloudinary and never pass through the API. The
                first image is the one shown in the shop.
              </p>
            </div>

            <FormField id="sizes" label="Sizes">
              <input
                id="sizes"
                name="sizes"
                value={form.sizes}
                onChange={onChange}
                className={fieldClass}
                placeholder="S, M, L, XL"
              />
            </FormField>

            <label className="flex items-center gap-2.5 self-end pb-3 text-sm text-gray-700">
              <input
                type="checkbox"
                name="bestseller"
                checked={form.bestseller}
                onChange={onChange}
                className="h-4 w-4 accent-black"
              />
              Show in Best Sellers
            </label>
          </div>

          <div className="mt-5">
            <Alert>{error}</Alert>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
          </button>
        </form>
      )}

      <p className="mb-3 text-sm text-gray-500">
        {visible.length} {visible.length === 1 ? 'product' : 'products'}
      </p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <ul className="divide-y divide-gray-100">
          {visible.map((product) => (
            <li key={product._id} className="flex items-center gap-4 p-4">
              <img
                src={imageUrl(product.image[0])}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {product.category} &bull; {product.subCategory} &bull; {product.sizes.join(', ')}
                  {product.bestseller && (
                    <span className="ml-2 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-medium uppercase text-white">
                      Best seller
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-sm font-medium text-gray-900">${product.price}</div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AdminProducts
