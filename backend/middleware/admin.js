/*
  The second bouncer.

  requireAuth answers "who is this?". These answer "are they allowed to do
  this particular thing?". They are kept apart because most protected routes
  need the first and not the second - your own order history is private, but
  it is not a staff matter.

  Three gates rather than one, because the roles are a ladder:

    manager  orders
    admin    orders + products
    owner    orders + products + who the staff are

  Always used AFTER requireAuth, which is what puts req.user there.
*/

const STAFF = ["manager", "admin", "owner"];
const ADMINS = ["admin", "owner"];

// 403, not 401. 401 means "we do not know who you are, sign in"; signing in
// again would not help here. This is "we know exactly who you are, and the
// answer is no".
const refuse = (res, message) => res.status(403).json({ success: false, message });

// Anyone who works here. The gate on the order routes.
const requireStaff = (req, res, next) => {
  if (!STAFF.includes(req.user?.role)) return refuse(res, "Staff only");
  next();
};

// Changing the catalogue. A manager runs orders; they do not set prices.
const requireAdmin = (req, res, next) => {
  if (!ADMINS.includes(req.user?.role)) {
    return refuse(res, "Only an admin can change the catalogue");
  }
  next();
};

/*
  Stricter still: only the owner decides who the staff are.

  Kept separate so an admin cannot quietly promote a friend, or demote the
  owner and take the shop.
*/
const requireOwner = (req, res, next) => {
  if (req.user?.role !== "owner") {
    return refuse(res, "Only the shop owner can do that");
  }
  next();
};

export default requireAdmin;
export { requireStaff, requireAdmin, requireOwner, STAFF, ADMINS };
