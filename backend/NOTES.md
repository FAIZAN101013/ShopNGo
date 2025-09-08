# Backend Notes — ShopNGo

My notes while building the backend. Written in simple words so I can read
this again in 3 months and remember everything.

---

## 1. What is a backend?

Before, my whole app was React. Products were in `assets.js`. Orders were in
`localStorage`. That means the data lived **only in my own browser**. Nobody
else could see it. If I cleared my browser, it was gone.

A backend fixes this. It splits the app into 3 layers:

```
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │   REACT     │  HTTP  │   EXPRESS   │Mongoose│   MONGODB   │
   │  (browser)  │ ─────> │  (server)   │ ─────> │  (database) │
   │             │ <───── │             │ <───── │             │
   └─────────────┘  JSON  └─────────────┘        └─────────────┘
   what user sees      rules and logic         permanent storage
```

- **React** = the shop window. Only shows things.
- **Express** = the shopkeeper. Decides what is allowed, does the work.
- **MongoDB** = the warehouse. Keeps everything, forever.

Express only ever does 4 things:

1. Receive a request
2. Check if it is allowed
3. Talk to the database
4. Send JSON back

---

## 2. The journey of one request

This is what happens when someone opens my shop page:

```
 Browser asks:  GET /api/products
        |
        v
 ┌──────────────────────────────────────────┐
 │ server.js                                │
 │   app.use(express.json())   <- middleware│
 │   app.use(cors())           <- middleware│
 │   app.use("/api/products", productRouter)│
 └──────────────────────────────────────────┘
        |  "/api/products" matches, so pass it on
        v
 ┌──────────────────────────────────────────┐
 │ routes/productRoute.js                   │
 │   GET  "/"  -> listProducts              │
 │   POST "/"  -> addProduct                │
 └──────────────────────────────────────────┘
        |  it was GET, so call listProducts
        v
 ┌──────────────────────────────────────────┐
 │ controllers/productController.js         │
 │   await productModel.find({})            │
 └──────────────────────────────────────────┘
        |
        v
 ┌──────────────────────────────────────────┐
 │ models/productModel.js                   │
 │   knows the shape of a product           │
 └──────────────────────────────────────────┘
        |
        v
     MongoDB Atlas  --> sends the products back
        |
        v
 Browser receives:  {"success": true, "products": [...]}
```

The request goes **down** the files and the answer comes back **up**.

---

## 3. My folders — what each part does

```
backend/
├── .env                 SECRETS. Password. Never goes to GitHub.
├── .env.example         The same list with fake values. This one IS committed.
├── .gitignore           List of files git must ignore.
├── server.js            The front door. Starts everything.
├── config/
│   ├── db.js            Connects to MongoDB.
│   └── mailer.js        The only file that knows how to send email.
├── models/              The SHAPE of each thing.
│   ├── productModel.js
│   ├── userModel.js
│   ├── otpModel.js      One-time codes. Deletes itself when they expire.
│   └── orderModel.js
├── controllers/         The WORK. Talks to the database.
│   ├── productController.js
│   ├── userController.js
│   └── orderController.js
├── middleware/
│   └── auth.js          The bouncer. Runs BEFORE a protected controller.
├── routes/              The MAP. URL -> which function.
│   ├── productRoute.js
│   ├── userRoute.js
│   └── orderRoute.js
├── emails/
│   └── templates.js     What the four emails look like.
├── utils/
│   ├── token.js         Makes and shapes JWTs.
│   └── otp.js           Issues and checks 6 digit codes.
└── scripts/
    └── seed.js          Loads the 73 products in. Run by hand, never on boot.
```

### Why so many folders?

I could put everything in `server.js`. But with 30 endpoints that file
becomes 800 lines and nobody can read it. Each folder has one job. Then I
always know where to look.

---

## 4. Each part explained

### `.env` — my secrets

```env
PORT=4000
MONGODB_URI="mongodb+srv://USERNAME:PASSWORD@CLUSTER.example.invalid/shopngo"
```

**Why it exists:**

1. Anything inside a `.js` file goes to GitHub. Robots search GitHub for
   passwords and find them in minutes.
2. The same code must run in different places. On my laptop it uses a test
   database. On the real server it uses the live one. Same code, different
   values. So the values live outside the code.

`dotenv.config()` reads this file and puts everything into `process.env`.

**Rule: `.gitignore` must be written BEFORE `.env`.** Once a password is
committed to git, it stays in the history forever, even if I delete the file.

### The connection string is just a URL

I know how to read a normal URL. This is the same:

```
https://github.com/FAIZAN101013/ShopNGo?tab=readme
└─┬──┘  └───┬────┘└────────┬──────────┘└────┬────┘
protocol  server      which thing        options

mongodb+srv://USERNAME:PASSWORD@CLUSTER.example.invalid/shopngo?retryWrites=true
└─────┬──────┘└───────┬───────┘└──────────┬───────────┘└──┬───┘└───────┬───────┘
  protocol    username:password        server         WHICH DB      options
```

> The host above is deliberately fake. Never write a real-looking connection
> string in a file that goes to GitHub — even as an example. GitHub scans every
> push for credential patterns and will raise a security alert on it.

**One cluster can hold many databases.** So I must say which one. If I forget
the `/shopngo` part, MongoDB uses a default database called `test`. It still
says "connected", so everything looks fine — but my data goes to the wrong
place. I made this mistake 3 times.

To check which database I am really on:

```js
console.log(mongoose.connection.name)
```

### `config/db.js` — the connection

```
async function connectDB:
    try:
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("connected")
    catch:
        console.error(error)
        process.exit(1)     <- KILL the server
```

**Why `async` / `await`?** Connecting goes across the internet to Atlas. That
takes time. `await` means "stop here and wait until this finishes". Without
it, my code runs ahead and tries to use a database that is not ready.

**Why `process.exit(1)`?** If there is no database, my API is useless. Every
request would fail with a strange message. Better to die immediately with a
clear error. `1` means "failed". `0` means "fine".

> Fail loudly. Fail fast. Fail close to the real cause.

### `models/productModel.js` — the shape

MongoDB has **no rules** by itself. I could save `{ price: "banana" }` and it
would accept it. Mongoose adds the rules back.

```
SCHEMA  = the blueprint. A drawing. Does nothing by itself.
MODEL   = the machine built from that blueprint. This is what I use.
```

```js
const productSchema = new mongoose.Schema({ ...fields... })   // draw the plan
const productModel = mongoose.model("Product", productSchema) // build from it
```

**Order matters.** The plan must exist before I build from it.

My product fields:

| field | type | rule |
|---|---|---|
| name | String | required |
| description | String | required |
| price | Number | required |
| image | [String] | required (many images = array) |
| category | String | required |
| subCategory | String | required |
| sizes | [String] | required |
| bestseller | Boolean | default false |
| date | Date | default Date.now |

Things to remember:

- `[String]` (square brackets) = a list of strings, not one string.
- `"Product"` singular + capital. Mongoose makes the collection `products`
  automatically. If I write `"Products"` I get `productss`.
- Never add `_id`. MongoDB makes it automatically.
- `default: Date.now` **without** `()`. With `()` it runs ONE time when the
  server starts, and every product gets the same frozen time. Without `()` I
  give Mongoose the function, so it runs fresh each time.

**Danger:** Mongoose is "strict" by default. Any field not in my schema is
**silently deleted**. No error. If my schema is empty, my products save as
just an `_id` and everything else disappears.

### `controllers/productController.js` — the work

This is the specialist. It does not know or care which URL called it.

```
export const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({ success: true, products })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "..." })
    }
}
```

Rules:

- **Always `await` database calls.** Without it I send a Promise to the
  browser instead of my data.
- **Always `try / catch`.** Networks fail. One bad request must never crash
  the whole server.
- **`find({})`** — an empty object means "no filter, give me all".
- **`req.body` only works because of `app.use(express.json())`.** That
  middleware turns the incoming JSON text into a real object. Without it,
  `req.body` is `undefined`.

**Always answer with the same shape: `{ success, ... }`.** Then my React code
checks one thing: `if (data.success)`. If some endpoints send an array and
others send an object, every fetch needs different handling.

### `routes/productRoute.js` — the map

```
RECEPTIONIST (route)  = knows only "this URL -> that function"
SPECIALIST (controller) = does the actual work
```

```js
const productRouter = express.Router()
productRouter.get("/", listProducts)
productRouter.post("/", addProduct)
export default productRouter
```

**Pass the function, do not call it:**

```js
productRouter.get("/", listProducts)     // correct - give Express the phone number
productRouter.get("/", listProducts())   // wrong - calls it NOW
```

**Why both paths are `/`?** Because the HTTP verb already says what I am
doing. This is proper REST:

```
GET  /api/products   -> read all products
POST /api/products   -> create a product
```

Writing `/list` and `/add` repeats what GET and POST already mean.

### `server.js` — the front door

**The order of the lines is the most important thing in this file.**

```js
1. imports
2. dotenv.config()        <- must be first, or process.env is empty
3. connectDB()
4. const app = express()  <- app must EXIST before app.use()
5. app.use(express.json())   ← MIDDLEWARE
6. app.use(cors())           ← MIDDLEWARE
7. app.use("/api/products", productRouter)   ← ROUTES
8. app.listen(...)        <- always last
```

**Middleware must come BEFORE routes.** Express runs these top to bottom. If
my router is above `express.json()`, then POST arrives before anything parsed
the body, so `req.body` is `undefined` — but GET still works fine. Only half
my API breaks. That is a horrible bug to find.

### How the URL is built

The full URL is made of two halves that are glued together:

```
app.use("/api/products", productRouter)     productRouter.get("/")
        └──────┬───────┘                                     └┬┘
          prefix in server.js              +          path in route file
                            ↓
                  GET /api/products
```

This is useful: if I want `/api/v2/products` later, I change ONE line in
`server.js` and the whole route file moves with it.

---

## 5. Rules I keep forgetting

### Every file is a sealed island

In the browser, all scripts share one global space. In Node it is the
opposite. **Nothing leaves a file unless I `export` it, and nothing enters
unless I `import` it.** When I write a function another file needs, `export`
is part of writing it, not something I add later.

### Default vs named imports — the braces decide

```js
export default productModel        →  import productModel from "..."      (NO braces)
export { listProducts }            →  import { listProducts } from "..."  (BRACES)
```

Wrong braces = I get `undefined`, then `undefined is not a function`.

### Node never guesses the file extension

```js
import connectDB from "./config/db"      // WRONG - crashes
import connectDB from "./config/db.js"   // CORRECT
```

My React frontend lets me skip `.js` because Vite adds it. Plain Node does
not. Also `./` means "my own file". Without the dot, Node looks inside
`node_modules` for a package with that name.

### Braces vs parentheses

```
( )  hold a VALUE       →  if (x), while (x), myFunction(x)
{ }  hold a BLOCK       →  try { }, catch { }, function bodies
```

`try` does not test anything, it just guards a chunk of code. So it takes
a block, never parentheses.

The shape is always:

```js
try {
    // risky code goes BETWEEN the braces
} catch (error) {
    // rescue plan
}
```

`} catch (error) {` is one unit, always written on one line.

### `const` cannot be used above the line that creates it

```js
app.use(...)              // ReferenceError: Cannot access 'app' before initialization
const app = express()
```

Code runs top to bottom. Always.

---

## 6. HTTP status codes

The number matters. `fetch()` and every monitoring tool judge success by the
**status code**, not by my JSON.

| code | meaning | whose fault |
|---|---|---|
| 200 | OK | — |
| 201 | Created (after POST) | — |
| 400 | Bad Request — you sent rubbish | the **client's** |
| 401 | Not logged in | the client's |
| 404 | Not Found | the client's |
| 500 | Internal Server Error — I broke | **mine** |

**Do not send 500 for bad user input.** If someone posts a product with no
name, that is *their* mistake, not my server breaking. That is a **400**.
Sending 200 with `{ success: false }` is also wrong — the HTTP layer says
"fine" while the body says "failed", so broken endpoints never appear in
error logs.

---

## 7. Bugs I made and what they taught me

| what I wrote | what happened | the lesson |
|---|---|---|
| `import {express}` | `express is not a function` | default export = no braces |
| `express.json()` alone | nothing happened | must be `app.use(...)` to register it |
| no `app.listen()` | log printed, nothing served | log AFTER success, inside the callback |
| pasted an example into my file | `Cannot find package 'react'` | is this the fix, or the explanation of the fix? |
| `.gitignore` said `env` | `.env` was not protected | the dot is part of the filename |
| no `/shopngo` in the URI | connected fine, wrong database | quiet bugs are worse than crashes |
| `new.mongoose.Schema` | syntax error | `new` is a keyword, not an object |
| model built from empty schema | all fields silently vanished | build the model from MY schema |
| `try( )` with parentheses | syntax error | blocks take braces |
| forgot `export` (3 times!) | route could not see the function | sealed islands |
| `app.use()` above `const app` | cannot access before initialization | top to bottom, always |

**The bugs are not the obstacle to learning. They ARE the learning.** I will
remember `app.use(express.json())` forever because I forgot it once and had
to fix it myself. Reading builds recognition. Debugging builds memory.

---

## 8. Commands I use

```bash
npm run serve        # start with nodemon (restarts when I save)
npm start            # start once, no auto restart

node --check file.js # is this valid JavaScript? silence = yes
```

Test the API:

```bash
curl http://localhost:4000/api/products
```

Better: use **Thunder Client** in VS Code or Postman. Typing JSON into curl
on Windows is painful because of all the quote escaping.

---

## 9. How to read an error message

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'react'
    imported from D:\Projects\ShopNGo\backend\server.js
    at packageResolve (node:internal/modules/esm/resolve:873:9)   <- ignore
    at moduleResolve (node:internal/modules/esm/loader:946:18)    <- ignore
```

**Read from the top. Find the first line that names MY file. Stop there.**
Everything mentioning `node:internal` is Node's own plumbing, not my problem.

Also: errors queue up. Fixing one often reveals the next. That is normal
progress, not failure.

---

## 10. Passwords — the one thing I must never store

A password is the only thing in the database I am not allowed to know.

If someone steals my `users` collection and the passwords are readable, they
do not just own my shop. Most people reuse passwords, so they own those
people's email, and then everything else.

So I never store the password. I store a **hash** of it.

```
   SIGN UP                              SIGN IN
   "hunter22"                           "hunter22"
       |                                    |
       v                                    v
   bcrypt.hash()                     bcrypt.compare("hunter22", stored)
       |                                    |
       v                                    v
   $2b$10$N9qo8uLO...            "does this password produce that hash?"
       |                                    |
       v                                    v
   saved in MongoDB                     true / false
```

A hash only goes **one way**. From "hunter22" you can get the hash. From the
hash you cannot get "hunter22" back. So checking a password is not "read the
password and compare" — it is "hash what they typed and see if it matches".

### Why bcrypt and not SHA-256

SHA-256 is *fast*, which sounds good and is actually the problem. Fast means
an attacker with my stolen database can test billions of guesses a second.

bcrypt is **deliberately slow**. `bcrypt.hash(password, 10)` means "make this
take 2^10 rounds of work" — about a tenth of a second.

```
  A tenth of a second, once, when I sign in    ->  I do not notice
  A tenth of a second x 1,000,000,000 guesses  ->  4 years
```

And bcrypt **salts** every hash automatically: a random value mixed in before
hashing. Two people with the same password get different hashes, so cracking
one tells you nothing about the other.

That is the whole reason the hash starts with `$2b$10$` — that is bcrypt
recording its own version, its cost, and the salt inside the string.

### The rule I broke first

My React version hashed the password **in the browser** with SHA-256. That is
security theatre. Whatever the browser sends is what the server accepts, so
the hash *becomes* the password. Hashing has to happen on the server.

---

## 11. JWT — the wristband

HTTP has no memory. Every request arrives as a total stranger. So after
signing in, how does the next request prove who it is?

The answer is a token: a small signed note that says "this is user 6a97cab8".

```
   POST /api/user/login
   { email, password }
          |
          v
   password correct?  --no-->  401 "Email or password is incorrect"
          |
         yes
          v
   jwt.sign({ id: user._id }, JWT_SECRET)
          |
          v
   eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjZhOTdjYWI4In0.pir52s7qToSC...
   \______ header ____/ \______ payload _____/ \_ signature _/
```

Three parts separated by dots:

| Part | What it is | Secret? |
| --- | --- | --- |
| header | which algorithm | no |
| payload | `{ id, tokenVersion, expiry }` | **no — readable by anyone** |
| signature | header+payload hashed with `JWT_SECRET` | this is the whole point |

**A JWT is not encrypted.** Paste one into jwt.io and it shows you the
payload. So the payload gets an id and nothing private — never a password,
never an address.

What the signature buys is that nobody can *change* it. Edit one character of
the payload and the signature no longer matches, because producing a matching
signature needs `JWT_SECRET`, which only my server has.

It is a festival wristband. Anyone can look at it. Nobody can fake it.

### Then every later request carries it

```
   GET /api/orders
   Authorization: Bearer eyJhbGciOi...
          |
          v
   middleware/auth.js  ->  jwt.verify(token, JWT_SECRET)
          |                       |
        valid                   invalid / expired
          |                       |
          v                       v
   req.user = user            401, and the browser goes to /login
   next()
```

### The bit that surprised me

The server keeps **no list of who is signed in**. That is the trade a JWT
makes: nothing to look up, but also nothing to switch off. Signing out just
throws the token away on my side — the token itself stays valid until it
expires.

That is why the user model has `tokenVersion`. Resetting a password bumps it,
and the middleware refuses any token carrying the old number. Without that, a
stolen token would survive the password change meant to shut it out.

---

## 12. One-time codes, and sending email

Anyone can type anyone's email address into a signup form. So an account
starts with `verified: false` and cannot be signed into until a code sent to
that address comes back.

```
   register  ->  account created, verified: false
                 6 random digits generated
                 the CODE is emailed
                 a bcrypt HASH of the code is saved
                        |
                        v
   verify    ->  bcrypt.compare(typed code, stored hash)
                        |
                     matches
                        |
                        v
                 verified: true, code deleted, token issued
```

Four things that each stop a real attack:

1. **The code is hashed too.** Six digits is a tiny secret; someone reading
   the database should not be able to use what they find.
2. **`crypto.randomInt`, not `Math.random`.** `Math.random` is predictable —
   given a few codes you can work out the next one.
3. **Five attempts.** Guessing 000000–999999 is cheap with unlimited tries.
4. **Ten minute expiry**, using a MongoDB **TTL index**: `expires: 0` on the
   `expiresAt` field means MongoDB deletes the document by itself. No cleanup
   job to write and forget.

### The thing that reads wrong but is right

```js
// forgot-password, for an address with no account
return res.json({ success: true, message: "If that address has an account..." })
```

Answering "no account with that email" would be honest and would hand anyone
a free tool for finding out who shops here. Same answer either way. Same
reason login says "email **or** password is incorrect" rather than which.

### SMTP in one picture

```
   my server  --SMTP over TLS-->  smtp.gmail.com  ----->  their inbox
              port 465
```

- **Port 465** is TLS from the first byte. **587** starts in the clear and
  upgrades. That is the only reason `secure: port === 465` exists.
- Gmail rejects my normal password. It needs an **App Password**: 2-Step
  Verification on, then a generated 16 character password used only by this.
- `MAIL_DRY_RUN=1` prints the email to the terminal instead of sending it —
  which is how I tested the whole signup flow without emailing anyone.

### Loud failures and quiet ones

Not every email matters the same amount:

| Email | If it fails |
| --- | --- |
| verification code | **fail the request** — the account is useless without it |
| welcome | log it and move on — verification already worked |
| order receipt | log it and move on — **the order is already placed** |

Telling someone their order failed because a receipt did not send would be a
lie about the important thing.

---

## 13. Orders — the browser is a stranger

The rule that matters:

> The browser sends **what** was bought. Never **what it costs**.

```
   BROWSER SENDS                  SERVER DOES
   productId: 6a97c58c...   ->    look the product up in MongoDB
   size: "M"                      read the REAL price: $100
   quantity: 2                    subtotal = 100 x 2
   price: 0.01           <-- ignored completely
```

I tested it by sending `price: 0.01` for a $100 top. The order came back at
$100. Anything arriving in a request body was typed by whoever sent it, and
`curl` will happily send whatever I like.

### But the line items still copy the name and price

That looks like the opposite, and is not:

```js
items: [{ productId, name, price, image, size, quantity }]
```

Prices change and products get deleted. A **receipt has to keep saying what
was bought and for how much, forever**. If the order only pointed at a
product, last year's order would silently change price when I run a sale.

Live data points at the product. A record copies it.

### Protecting a route is one line

```js
orderRouter.use(requireAuth)   // everything below this needs a valid token
```

Applied to the whole router rather than repeated on each route, so a route I
add next month is protected **by default** instead of protected only if I
remember.

And the ownership check is part of the query, not a check afterwards:

```js
await orderModel.findOne({ reference: req.params.reference, user: req.user._id })
```

A wrong reference and somebody else's order both come back as "not found",
which is the only thing either of them should tell you.

---

## 14. What I have built so far

```
[x] Express server running on port 4000
[x] Secrets in .env, protected by .gitignore
[x] Connected to MongoDB Atlas
[x] Product model with 9 fields
[x] 73 real products seeded, images served from /images
[x] Accounts: bcrypt passwords, emailed verification codes, JWT sessions
[x] Password reset by email, which also signs out every old token
[x] Orders stored per account, priced by the server, receipt emailed
```

Every endpoint:

```
        PUBLIC                              NEEDS A TOKEN
GET    /api/products                 GET  /api/user/profile
POST   /api/products                 PUT  /api/user/profile
POST   /api/user/register            POST /api/orders
POST   /api/user/verify              GET  /api/orders
POST   /api/user/resend-code         GET  /api/orders/:reference
POST   /api/user/login
POST   /api/user/forgot-password
POST   /api/user/reset-password
```

Working proof:

```
register            {"success":true,"requiresVerification":true}
verify (wrong)      {"success":false,"message":"That code is not right. 4 tries left."}
verify (right)      {"success":true,"token":"eyJhbGci..."}
/api/orders no token{"success":false,"message":"Please sign in to continue"}
order sent price 0.01 on a $100 item -> charged $100
reset password      -> the old token is instantly refused
```

### Next

```
[x] Seed my 73 real products from assets.js into the database
[x] User model + register / login
[x] Password hashing (bcrypt) and JWT tokens
[x] Email: verification codes, welcome, password reset, order receipts
[x] Middleware to protect routes
[x] Orders API
[x] Connect React to the API and delete the localStorage account code
[ ] Admin pages: add products, move an order to SHIPPED
[ ] Real payments instead of the Stripe placeholder
[ ] Deploy
```

---

## 15. How to actually remember all this

I do not need to memorise it. Professional developers look this up all the
time. What matters is knowing the **shape** of the answer, so I know what to
search for and can spot a wrong answer.

**Memorise the concepts (about 15 things total, they never change):**
middleware runs top to bottom before routes; a route is verb + path -> a
function; handlers take `(req, res)`; secrets live in `.env`; the server must
`listen()` to exist.

**Never memorise the details:** the options for `cors()`, the full list of
Mongoose types, the exact connection string format. That is what docs are for.

Three things that actually work:

1. **Build it twice.** Delete `server.js` and write it again from empty. The
   second time takes 10 minutes instead of an hour. That is when it is mine.
2. **Write notes in my own words** (this file). Copying teaches nothing.
   Rewriting in my own language is what makes it stick.
3. **Try first, get it wrong, then check.** Struggling for 30 seconds before
   looking at the answer roughly doubles what I remember.
