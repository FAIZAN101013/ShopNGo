/*
  The emails ShopNGo sends.

  Email is not the web. There is no external stylesheet, no flexbox worth
  trusting and no JavaScript, so everything here is a table with inline
  styles - the one layout every mail client has agreed on for twenty years.

  Every template returns { subject, html, text }. The plain text version is
  not optional: some people read mail as text, some clients block HTML, and
  a mail with no text part scores higher as spam.
*/

const BRAND = "#111111";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

const money = (n) => `$${Number(n).toFixed(2)}`;

const layout = (title, body) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f6f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:${BRAND};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f7;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND};padding:22px 32px;">
                <span style="color:#ffffff;font-size:14px;letter-spacing:4px;font-weight:600;">SHOPNGO</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:21px;line-height:1.35;font-weight:600;">${title}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${BORDER};">
                <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
                  You are getting this because someone used this address at ShopNGo.
                  If that was not you, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const p = (text) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#374151;">${text}</p>`;

// The code is the entire point of the email, so it is the largest thing in
// it and spaced out enough to read off a phone without squinting.
const codeBlock = (code) => `
  <div style="margin:24px 0;padding:20px;background:#f9fafb;border:1px solid ${BORDER};border-radius:10px;text-align:center;">
    <div style="font-size:32px;letter-spacing:10px;font-weight:700;font-family:Consolas,Menlo,monospace;">${code}</div>
  </div>`;

const verificationEmail = ({ name, code, expiresInMinutes }) => ({
  subject: `${code} is your ShopNGo verification code`,
  html: layout(
    "Confirm your email address",
    p(`Hi ${name}, welcome to ShopNGo. Enter this code to finish creating your account:`) +
      codeBlock(code) +
      p(`The code stops working in ${expiresInMinutes} minutes.`) +
      p("We will never ask you for this code by phone, chat or reply.")
  ),
  text: `Hi ${name},

Your ShopNGo verification code is ${code}
It expires in ${expiresInMinutes} minutes.

We will never ask you for this code by phone, chat or reply.`,
});

const welcomeEmail = ({ name, shopUrl }) => ({
  subject: "Welcome to ShopNGo",
  html: layout(
    `You are in, ${name}`,
    p("Your email is confirmed and your account is ready.") +
      p(
        "From here you can keep a cart between visits, check out without retyping your details, and follow every order from placed to delivered."
      ) +
      `<div style="margin:26px 0 8px;">
         <a href="${shopUrl}/collection" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:14px;font-weight:600;">Start shopping</a>
       </div>`
  ),
  text: `You are in, ${name}.

Your email is confirmed and your ShopNGo account is ready.
Start shopping: ${shopUrl}/collection`,
});

const passwordResetEmail = ({ name, code, expiresInMinutes }) => ({
  subject: `${code} is your ShopNGo password reset code`,
  html: layout(
    "Reset your password",
    p(`Hi ${name}, use this code to set a new password:`) +
      codeBlock(code) +
      p(`It expires in ${expiresInMinutes} minutes and can only be used once.`) +
      p(
        "If you did not ask to reset your password, nothing has changed and you can ignore this email."
      )
  ),
  text: `Hi ${name},

Your ShopNGo password reset code is ${code}
It expires in ${expiresInMinutes} minutes and can only be used once.

If you did not ask for this, nothing has changed.`,
});

const orderConfirmationEmail = ({ name, order, shopUrl }) => {
  // Deliberately no product photos. The images live on the API, which in
  // development is localhost - an address the recipient's mail client cannot
  // reach, so every one would render as a broken icon.
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;">
          ${item.name}<br>
          <span style="color:${MUTED};font-size:12px;">Size ${item.size} &bull; Qty ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;text-align:right;white-space:nowrap;">
          ${money(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const totalRow = (label, value, bold) => `
      <tr>
        <td style="padding:6px 0;font-size:14px;${bold ? "font-weight:700;" : `color:${MUTED};`}">${label}</td>
        <td style="padding:6px 0;font-size:14px;text-align:right;${bold ? "font-weight:700;" : ""}">${value}</td>
      </tr>`;

  const s = order.shipping;

  return {
    subject: `Order ${order.reference} confirmed`,
    html: layout(
      "Thanks for your order",
      p(`Hi ${name}, we have your order and we are getting it ready.`) +
        `<p style="margin:0 0 20px;font-size:13px;color:${MUTED};">Order reference <strong style="color:${BRAND};">${order.reference}</strong></p>` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
           ${totalRow("Subtotal", money(order.subtotal))}
           ${totalRow("Delivery", money(order.deliveryFee))}
           ${totalRow("Total", money(order.total), true)}
         </table>` +
        `<div style="margin-top:26px;padding:16px;background:#f9fafb;border-radius:10px;">
           <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Delivering to</div>
           <div style="font-size:14px;line-height:1.6;">
             ${s.fullName}<br>${s.address}<br>${s.city}, ${s.state} ${s.postalCode}<br>${s.country}<br>
             <span style="color:${MUTED};">${s.phone}</span>
           </div>
         </div>` +
        `<div style="margin:26px 0 8px;">
           <a href="${shopUrl}/orders" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:14px;font-weight:600;">View your order</a>
         </div>` +
        p(`Paying by ${order.paymentMethod === "COD" ? "cash on delivery" : order.paymentMethod}.`)
    ),
    text: `Hi ${name},

Order ${order.reference} is confirmed.

${order.items
  .map((i) => `- ${i.name} (size ${i.size}) x${i.quantity}  ${money(i.price * i.quantity)}`)
  .join("\n")}

Subtotal: ${money(order.subtotal)}
Delivery: ${money(order.deliveryFee)}
Total:    ${money(order.total)}

Delivering to:
${s.fullName}, ${s.address}, ${s.city}, ${s.state} ${s.postalCode}, ${s.country}

View your order: ${shopUrl}/orders`,
  };
};

export { verificationEmail, welcomeEmail, passwordResetEmail, orderConfirmationEmail };
