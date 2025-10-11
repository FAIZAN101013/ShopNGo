/*
  Opening the card payment window.

  Razorpay's checkout is a script that has to be on the page before it can be
  used. Loading it here rather than in index.html means every visitor who
  never reaches checkout does not download it - which is most of them.
*/

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let loading = null

const loadCheckout = () => {
  if (window.Razorpay) return Promise.resolve()

  // One promise shared by every caller, so clicking pay twice does not add
  // the script twice.
  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      reject(new Error('Could not load the payment window. Check your connection and try again.'))
    }
    document.body.appendChild(script)
  })

  return loading
}

/*
  Open the payment window for an order the server has already created.

  Resolves when the customer finishes paying and rejects if they close the
  window. Note what it does NOT do: it does not tell the shop the payment
  succeeded. Razorpay does that itself, in a signed webhook, because anything
  this browser reports could equally be typed by hand.
*/
export const payForOrder = async ({ payment, order, customer }) => {
  await loadCheckout()

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: payment.keyId,
      order_id: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'ShopNGo',
      description: `Order ${order.reference}`,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone
      },
      theme: { color: '#111111' },
      handler: (response) => resolve(response),
      modal: {
        // Closing the window is not an error worth a red toast, but the
        // caller has to know the payment did not happen.
        ondismiss: () => reject(new Error('Payment cancelled'))
      }
    })

    checkout.on('payment.failed', (event) => {
      reject(new Error(event.error?.description || 'The payment did not go through'))
    })

    checkout.open()
  })
}
