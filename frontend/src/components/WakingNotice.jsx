import React, { useContext } from 'react'

import { ShopContext } from '../context/ShopContext'

/*
  Why the shop is taking so long.

  The API is on a free host that puts the service to sleep after fifteen
  minutes of quiet, and waking it takes twenty seconds or so. That only ever
  happens to the first visitor after a lull, and there is nothing the code
  can do to make it faster.

  What the code can do is stop it reading as broken. Grey boxes and silence
  say "this is broken"; one sentence saying the server is waking up says
  "this is slow", which is the truth and is much easier to wait through.

  It appears only after four seconds, so a normal load never shows it.
*/
const WakingNotice = () => {
  const { productsLoading, productsSlow } = useContext(ShopContext)

  if (!productsLoading || !productsSlow) return null

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <div className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" />
      <div className="text-sm text-amber-800">
        <p className="font-medium">Waking the server up</p>
        <p className="mt-0.5 text-amber-700">
          The API sleeps when nobody has visited for a while, and takes about half a minute
          to start. It is quick from here on.
        </p>
      </div>
    </div>
  )
}

export default WakingNotice
