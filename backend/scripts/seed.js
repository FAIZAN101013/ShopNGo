/*
  Fills the database with the catalogue.

  Run it with:   npm run seed

  Seeding is deliberately a separate script rather than something the server
  does on boot: a server that rewrites its own data every time it restarts is
  a very good way to lose data you meant to keep.
*/
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import connectDB from '../config/db.js'
import productModel from '../models/productModel.js'
import { products } from '../data/products.js'

dotenv.config()

// Images live on disk in public/images and are served by express.static.
// The database stores the path, not a full URL, so moving the API to a real
// domain later does not mean rewriting every product row.
const toStoredImage = (file) => (file.startsWith('http') ? file : `/images/${file}`)

const seed = async () => {
  await connectDB()

  const docs = products.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image.map(toStoredImage),
    category: p.category,
    subCategory: p.subCategory,
    sizes: p.sizes,
    bestseller: Boolean(p.bestseller),
    date: p.date ? new Date(p.date) : new Date()
    // _id is left out on purpose. The source file uses ids like "aaaaa";
    // MongoDB generates proper ObjectIds of its own.
  }))

  const existing = await productModel.countDocuments()
  console.log(`Products already in the database: ${existing}`)

  // Replace rather than append, so running this twice does not leave you
  // with two of everything.
  const { deletedCount } = await productModel.deleteMany({})
  console.log(`Removed: ${deletedCount}`)

  const inserted = await productModel.insertMany(docs)
  console.log(`Inserted: ${inserted.length}`)

  const bestsellers = await productModel.countDocuments({ bestseller: true })
  const categories = await productModel.distinct('category')
  console.log(`Bestsellers: ${bestsellers}`)
  console.log(`Categories: ${categories.join(', ')}`)

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error.message)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
