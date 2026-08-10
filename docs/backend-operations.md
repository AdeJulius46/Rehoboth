# Backend Operations Reference

This app has no hand-written REST routes for its business logic (see the two real
HTTP routes at the bottom, which exist for a different reason). Instead, every
operation is a Next.js **Server Action** — an exported `"use server"` function
that the UI calls directly like a normal function, but which Next.js compiles
into its own network-callable endpoint under the hood.

**How to read this doc:** "Backend Path" = the file + function name that
implements the operation. That's the thing you'd wrap in a real `route.ts`
handler later if this ever needs to be called from outside the app (see the
architecture discussion this doc came out of).

`actions.ts` = writes (create/update/delete/status changes).
`queries.ts` = reads (list/detail/stats/options for dropdowns).

---

## Customers — `src/features/customers/`

| Operation | Backend Path |
|---|---|
| List customers (paginated, search, filter) | `queries.ts` → `listCustomers` |
| Customer stats (cards on list page) | `queries.ts` → `getCustomerStats` |
| Get one customer | `queries.ts` → `getCustomerById` |
| Create customer | `actions.ts` → `createCustomer` |
| Create customer (quick-add from Sale/Invoice forms, no redirect) | `actions.ts` → `createCustomerQuick` |
| Update customer | `actions.ts` → `updateCustomer` |
| Delete customer | `actions.ts` → `deleteCustomer` |
| Toggle active/inactive | `actions.ts` → `archiveCustomer` |

## Agents — `src/features/agents/`

| Operation | Backend Path |
|---|---|
| List agents | `queries.ts` → `listAgents` |
| Agent stats | `queries.ts` → `getAgentStats` |
| Get one agent | `queries.ts` → `getAgentById` |
| Create agent | `actions.ts` → `createAgent` |
| Update agent | `actions.ts` → `updateAgent` |
| Delete agent | `actions.ts` → `deleteAgent` |
| Toggle active/inactive | `actions.ts` → `archiveAgent` |

## Staffs — `src/features/staffs/`

| Operation | Backend Path |
|---|---|
| List staff | `queries.ts` → `listStaffs` |
| Staff stats | `queries.ts` → `getStaffStats` |
| Get one staff member | `queries.ts` → `getStaffById` |
| Generate next employee ID | `queries.ts` → `generateEmployeeId` |
| Create staff | `actions.ts` → `createStaff` |
| Update staff | `actions.ts` → `updateStaff` |
| Delete staff | `actions.ts` → `deleteStaff` |
| Toggle active/inactive | `actions.ts` → `archiveStaff` |

## Products — `src/features/products/`

| Operation | Backend Path |
|---|---|
| List products | `queries.ts` → `listProducts` |
| Product stats | `queries.ts` → `getProductStats` |
| Get one product (incl. stock by warehouse) | `queries.ts` → `getProductById` |
| Generate next SKU | `queries.ts` → `generateSku` |
| Get default warehouse (for opening stock) | `queries.ts` → `getDefaultWarehouse` |
| Create product | `actions.ts` → `createProduct` |
| Update product | `actions.ts` → `updateProduct` |
| Delete product | `actions.ts` → `deleteProduct` |
| Toggle active/inactive | `actions.ts` → `archiveProduct` |

## Warehouses — `src/features/warehouses/`

| Operation | Backend Path |
|---|---|
| List warehouses | `queries.ts` → `listWarehouses` |
| Warehouse stats | `queries.ts` → `getWarehouseStats` |
| Get one warehouse (incl. stock rows) | `queries.ts` → `getWarehouseById` |
| Products not yet stocked here (for Add Product picker) | `queries.ts` → `getAvailableProductsForWarehouse` |
| Generate next warehouse code | `queries.ts` → `generateWarehouseCode` |
| Create warehouse | `actions.ts` → `createWarehouse` |
| Update warehouse | `actions.ts` → `updateWarehouse` |
| Delete warehouse | `actions.ts` → `deleteWarehouse` |
| Toggle active/inactive | `actions.ts` → `archiveWarehouse` |
| Set a product's stock quantity in this warehouse | `actions.ts` → `setStockQuantity` |
| Add a product to this warehouse's stock | `actions.ts` → `addProductStock` |

## Sales — `src/features/sales/`

| Operation | Backend Path |
|---|---|
| List sales | `queries.ts` → `listSales` |
| Sales stats | `queries.ts` → `getSaleStats` |
| Get one sale (incl. items, linked invoice/receipt status) | `queries.ts` → `getSaleById` |
| Recent sales for a customer (used on Customer detail page) | `queries.ts` → `getRecentSalesByCustomer` |
| Recent sales for an agent (used on Agent detail page) | `queries.ts` → `getRecentSalesByAgent` |
| Generate next sale number | `queries.ts` → `generateSaleNumber` |
| Customer/Agent/Warehouse/Product picker options | `queries.ts` → `getCustomerOptions`, `getAgentOptions`, `getWarehouseOptions`, `getProductPickerOptions` |
| Create sale (decrements stock in a transaction) | `actions.ts` → `createSale` |
| Update sale (header fields only — items are immutable) | `actions.ts` → `updateSale` |
| Change sale status (Pending/Completed/Cancelled — restocks on cancel) | `actions.ts` → `updateSaleStatus` |
| Delete sale (restocks unless already cancelled) | `actions.ts` → `deleteSale` |

## Invoices — `src/features/invoices/`

| Operation | Backend Path |
|---|---|
| List invoices | `queries.ts` → `listInvoices` |
| Invoice stats | `queries.ts` → `getInvoiceStats` |
| Get one invoice | `queries.ts` → `getInvoiceById` |
| Generate next invoice number | `queries.ts` → `generateInvoiceNumber` |
| Customer/Agent/Product picker options | `queries.ts` → `getCustomerOptions`, `getAgentOptions`, `getProductPickerOptions` |
| Create invoice (standalone, not from a Sale) | `actions.ts` → `createInvoice` |
| Generate an invoice from an existing Sale | `actions.ts` → `generateInvoiceFromSale` |
| Update invoice (header fields) | `actions.ts` → `updateInvoice` |
| Change invoice status directly | `actions.ts` → `updateInvoiceStatus` |
| Mark invoice as paid (records the real Payment for the remaining balance + syncs linked Sale to Completed) | `actions.ts` → `markInvoiceAsPaid` |
| Delete invoice | `actions.ts` → `deleteInvoice` |

## Payments — `src/features/payments/`

| Operation | Backend Path |
|---|---|
| List payments | `queries.ts` → `listPayments` |
| Payment stats | `queries.ts` → `getPaymentStats` |
| Get one payment (incl. balance-before-payment) | `queries.ts` → `getPaymentById` |
| Get data for the printable receipt | `queries.ts` → `getPaymentReceiptData` |
| Generate next payment reference | `queries.ts` → `generatePaymentReference` |
| Customer/Invoice picker options | `queries.ts` → `getCustomerOptions`, `getInvoiceOptions` |
| Create payment (defaults to Completed, syncs linked Invoice status) | `actions.ts` → `createPayment` |
| Update payment | `actions.ts` → `updatePayment` |
| Delete payment | `actions.ts` → `deletePayment` |

## Projects — `src/features/projects/`

| Operation | Backend Path |
|---|---|
| List projects | `queries.ts` → `listProjects` |
| Project stats | `queries.ts` → `getProjectStats` |
| Get one project | `queries.ts` → `getProjectById` |
| Projects for a customer (Customer detail page) | `queries.ts` → `getProjectsByCustomer` |
| Generate next project code | `queries.ts` → `generateProjectCode` |
| Customer/Agent picker options | `queries.ts` → `getCustomerOptions`, `getAgentOptions` |
| Create project | `actions.ts` → `createProject` |
| Update project | `actions.ts` → `updateProject` |
| Delete project | `actions.ts` → `deleteProject` |

## Expenses — `src/features/expenses/`

| Operation | Backend Path |
|---|---|
| List expenses | `queries.ts` → `listExpenses` |
| Expense stats | `queries.ts` → `getExpenseStats` |
| Get one expense | `queries.ts` → `getExpenseById` |
| Generate next expense number | `queries.ts` → `generateExpenseNumber` |
| "Paid by" staff picker options | `queries.ts` → `getPaidByOptions` |
| Create expense | `actions.ts` → `createExpense` |
| Update expense | `actions.ts` → `updateExpense` |
| Approve/reject an expense | `actions.ts` → `updateExpenseStatus` |
| Delete expense | `actions.ts` → `deleteExpense` |

## Settings / User Management — `src/features/settings/`

| Operation | Backend Path |
|---|---|
| List self-registered accounts awaiting approval | `queries.ts` → `getPendingUsers` |
| List all active/inactive user accounts | `queries.ts` → `getAllUsers` |
| Approve a pending registration (also auto-creates the Staff HR record if requested role is STAFF) | `actions.ts` → `approveUser` |
| Reject a pending registration | `actions.ts` → `rejectUser` |
| Change an existing user's role (blocked for yourself and for the seeded System Admin) | `actions.ts` → `updateUserRole` |

## Auth / Registration — `src/features/auth/`

| Operation | Backend Path |
|---|---|
| Request a password reset (emails a reset link via AWS SES when configured, else dev-mode token) | `actions.ts` → `requestPasswordReset` |
| Reset password using the token | `actions.ts` → `resetPassword` |
| Contact-admin form submission (stub — no model yet) | `actions.ts` → `submitContactAdminRequest` |
| Send registration OTP (emails via AWS SES when configured, else dev-mode toast) | `register-actions.ts` → `sendVerificationCode` |
| Verify registration OTP | `register-actions.ts` → `verifyRegistrationCode` |
| Check if the Company singleton already exists (skips Company step if so) | `register-actions.ts` → `checkCompanyExists` |
| Check if an email is already registered | `register-actions.ts` → `checkEmailAvailable` |
| Complete registration (creates the User, and the Company on the very first signup) | `register-actions.ts` → `completeRegistration` |

## Reports / Dashboard — `src/features/reports/`

Read-only — no `actions.ts`, only `queries.ts`. Powers `/dashboard` and `/reports`.

| Operation | Backend Path |
|---|---|
| Dashboard stat cards | `queries.ts` → `getDashboardStats` |
| Reports page stat cards | `queries.ts` → `getReportStats` |
| Revenue/Expenses/Profit donut | `queries.ts` → `getFinancialBreakdown` |
| Revenue trend chart | `queries.ts` → `getSalesTrend` |
| Sales-by-category donut | `queries.ts` → `getSalesByCategory` |
| Top selling products table | `queries.ts` → `getTopSellingProducts` |
| Recent sales table | `queries.ts` → `getRecentSales` |
| Low stock alert table | `queries.ts` → `getLowStockAlerts` |
| Warehouse stock summary panel | `queries.ts` → `getWarehouseStockSummary` |
| Recent activity feed | `queries.ts` → `getRecentActivity` |

## Notifications — `src/features/notifications/`

Read-only, computed fresh on every page load (no persisted Notification table).

| Operation | Backend Path |
|---|---|
| Get everything for the bell dropdown (low stock, overdue invoices, recent payments/sales, pending expense approvals, new staff) | `queries.ts` → `getNotifications` |

---

## Real HTTP API routes (the only two)

These exist because a third-party SDK — not our own UI — needs to call them, so
they had to be actual `route.ts` handlers instead of Server Actions:

| Route | Purpose |
|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js (NextAuth) sign-in/session handling |
| `src/app/api/uploadthing/route.ts` + `core.ts` | UploadThing's file-upload callback |

If this app ever needs a public/external API, this is the pattern to follow:
a thin `route.ts` per resource under `src/app/api/v1/...` that calls straight
into the same `actions.ts`/`queries.ts` functions listed above.
