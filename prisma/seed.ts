import "dotenv/config";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const CUSTOMER_COUNT = 1245;

async function seedAdmin() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.user.upsert({
    where: { email: "admin@rehobothsoftware.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@rehobothsoftware.com",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Seeded admin user: admin@rehobothsoftware.com / admin123");
}

async function seedCustomers() {
  const existing = await db.customer.count();
  if (existing > 0) {
    console.log(`Skipped customer seed — ${existing} customers already exist.`);
    return;
  }

  const batchSize = 200;
  for (let start = 0; start < CUSTOMER_COUNT; start += batchSize) {
    const count = Math.min(batchSize, CUSTOMER_COUNT - start);
    const batch = Array.from({ length: count }, (_, i) => {
      const index = start + i;
      const type = faker.helpers.arrayElement(["INDIVIDUAL", "BUSINESS"] as const);
      const status = faker.helpers.weightedArrayElement([
        { value: "ACTIVE" as const, weight: 9 },
        { value: "INACTIVE" as const, weight: 1 },
      ]);
      return {
        name: faker.person.fullName(),
        companyName: type === "BUSINESS" ? faker.company.name() : null,
        email: `${faker.internet.username().toLowerCase()}${index}@example.com`,
        phone: faker.phone.number({ style: "national" }),
        type,
        taxId: faker.helpers.maybe(() => faker.string.numeric(11), { probability: 0.4 }) ?? null,
        address: faker.location.streetAddress({ useFullAddress: true }),
        creditLimit: faker.helpers.maybe(() => faker.number.int({ min: 100_000, max: 5_000_000 }), {
          probability: 0.5,
        }),
        openingBalance: faker.number.int({ min: 0, max: 500_000 }),
        status,
        createdAt: faker.date.past({ years: 1 }),
      };
    });

    await db.customer.createMany({ data: batch });
  }

  console.log(`Seeded ${CUSTOMER_COUNT} customers.`);
}

const AGENT_COUNT = 85;
const STAFF_COUNT = 52;
const PRODUCT_COUNT = 433;
const TERRITORIES = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu"];
const DEPARTMENTS = ["Sales", "Operations", "Finance", "Warehouse", "IT", "Management", "HR"];
const POSITIONS = ["Managing Director", "Manager", "Supervisor", "Officer", "Executive", "Intern"];
const PRODUCT_CATEGORIES = ["Laptops", "Office Supplies", "Electronics", "Furniture", "Accessories"];
const BRANDS = ["Dell", "HP", "Double A", "Samsung", "Logitech", "Apple"];
const UNITS = ["pcs", "ream", "box", "carton"];

async function seedAgents() {
  const existing = await db.agent.count();
  if (existing > 0) {
    console.log(`Skipped agent seed — ${existing} agents already exist.`);
    return;
  }

  const batch = Array.from({ length: AGENT_COUNT }, (_, index) => {
    const status = faker.helpers.weightedArrayElement([
      { value: "ACTIVE" as const, weight: 9 },
      { value: "INACTIVE" as const, weight: 1 },
    ]);
    return {
      name: faker.person.fullName(),
      email: `${faker.internet.username().toLowerCase()}${index}@agents.example.com`,
      phone: faker.phone.number({ style: "national" }),
      region: faker.helpers.arrayElement(TERRITORIES),
      agentType: faker.helpers.arrayElement(["SALES", "COLLECTION"] as const),
      idNumber: faker.string.numeric(11),
      commissionRate: faker.number.int({ min: 1, max: 15 }),
      bankName: faker.helpers.arrayElement(["Access Bank", "GTBank", "Zenith Bank", "UBA"]),
      accountNumber: faker.finance.accountNumber(10),
      accountName: faker.person.fullName(),
      status,
      createdAt: faker.date.past({ years: 1 }),
    };
  });

  await db.agent.createMany({ data: batch });
  console.log(`Seeded ${AGENT_COUNT} agents.`);
}

async function seedStaffs() {
  const existing = await db.staff.count();
  if (existing > 0) {
    console.log(`Skipped staff seed — ${existing} staff already exist.`);
    return;
  }

  for (let i = 0; i < STAFF_COUNT; i++) {
    const status = faker.helpers.weightedArrayElement([
      { value: "ACTIVE" as const, weight: 9 },
      { value: "INACTIVE" as const, weight: 1 },
    ]);
    await db.staff.create({
      data: {
        employeeId: `STAFF-${String(i + 1).padStart(4, "0")}`,
        name: faker.person.fullName(),
        email: `${faker.internet.username().toLowerCase()}${i}@rehobothsoftware.com`,
        phone: faker.phone.number({ style: "national" }),
        department: faker.helpers.arrayElement(DEPARTMENTS),
        position: faker.helpers.arrayElement(POSITIONS),
        systemRole: faker.helpers.arrayElement(["Admin", "Manager", "Staff"]),
        dateOfBirth: faker.date.birthdate({ min: 22, max: 55, mode: "age" }),
        address: faker.location.streetAddress({ useFullAddress: true }),
        emergencyContactName: faker.person.fullName(),
        emergencyContactPhone: faker.phone.number({ style: "national" }),
        salary: faker.number.int({ min: 80_000, max: 900_000 }),
        hireDate: faker.date.past({ years: 3 }),
        status,
        createdAt: faker.date.past({ years: 1 }),
      },
    });
  }

  console.log(`Seeded ${STAFF_COUNT} staff members.`);
}

async function seedWarehouses() {
  const existing = await db.warehouse.count();
  if (existing > 0) {
    console.log(`Skipped warehouse seed — ${existing} warehouses already exist.`);
    return { created: false };
  }

  const names = [
    { name: "Lagos Main Warehouse", location: "12 Allen Avenue, Ikeja, Lagos" },
    { name: "Abuja Central Warehouse", location: "Wuse II, Abuja" },
    { name: "Port Harcourt Depot", location: "Trans Amadi, Port Harcourt" },
    { name: "Kano Distribution Center", location: "Sabon Gari, Kano" },
    { name: "Ibadan Storage Facility", location: "Ring Road, Ibadan" },
    { name: "Enugu Warehouse", location: "Ogui Road, Enugu" },
  ];

  for (let i = 0; i < names.length; i++) {
    await db.warehouse.create({
      data: {
        name: names[i].name,
        code: `WH-${String(i + 1).padStart(4, "0")}`,
        location: names[i].location,
        manager: faker.person.fullName(),
        phone: faker.phone.number({ style: "national" }),
        email: `${names[i].name.split(" ")[0].toLowerCase()}.warehouse@rehobothsoftware.com`,
        capacity: faker.number.int({ min: 5000, max: 20000 }),
        status: "ACTIVE",
        createdAt: faker.date.past({ years: 1 }),
      },
    });
  }

  console.log(`Seeded ${names.length} warehouses.`);
  return { created: true };
}

async function seedProducts() {
  const existing = await db.product.count();
  if (existing > 0) {
    console.log(`Skipped product seed — ${existing} products already exist.`);
    return;
  }

  const warehouses = await db.warehouse.findMany();
  if (warehouses.length === 0) {
    console.log("No warehouses found — skipping product stock seeding.");
    return;
  }

  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const costPrice = faker.number.int({ min: 5_000, max: 500_000 });
    const status = faker.helpers.weightedArrayElement([
      { value: "ACTIVE" as const, weight: 19 },
      { value: "INACTIVE" as const, weight: 1 },
    ]);
    const product = await db.product.create({
      data: {
        name: faker.commerce.productName(),
        sku: `PRD-${String(i + 1).padStart(4, "0")}`,
        category: faker.helpers.arrayElement(PRODUCT_CATEGORIES),
        brand: faker.helpers.arrayElement(BRANDS),
        description: faker.commerce.productDescription(),
        costPrice,
        sellingPrice: Math.round(costPrice * faker.number.float({ min: 1.15, max: 1.6 })),
        unit: faker.helpers.arrayElement(UNITS),
        reorderLevel: faker.number.int({ min: 5, max: 20 }),
        status,
        createdAt: faker.date.past({ years: 1 }),
      },
    });

    const warehouse = faker.helpers.arrayElement(warehouses);
    const quantity = faker.helpers.weightedArrayElement([
      { value: faker.number.int({ min: 20, max: 200 }), weight: 7 },
      { value: faker.number.int({ min: 1, max: 10 }), weight: 2 },
      { value: 0, weight: 1 },
    ]);
    await db.stock.create({ data: { productId: product.id, warehouseId: warehouse.id, quantity } });
  }

  console.log(`Seeded ${PRODUCT_COUNT} products with stock.`);
}

const PROJECT_COUNT = 96;
const SALE_COUNT = 620;
const PROJECT_NAMES = [
  "Office Building Construction",
  "Warehouse Renovation",
  "IT Infrastructure Upgrade",
  "Retail Store Fit-Out",
  "Solar Power Installation",
  "Fleet Maintenance Contract",
  "Marketing Campaign Rollout",
  "ERP Implementation",
  "Factory Expansion",
  "Road Construction",
];

async function seedProjects() {
  const existing = await db.project.count();
  if (existing > 0) {
    console.log(`Skipped project seed — ${existing} projects already exist.`);
    return;
  }

  const customers = await db.customer.findMany({ select: { id: true } });
  const agents = await db.agent.findMany({ select: { id: true } });
  if (customers.length === 0) {
    console.log("No customers found — skipping project seeding.");
    return;
  }

  for (let i = 0; i < PROJECT_COUNT; i++) {
    const status = faker.helpers.weightedArrayElement([
      { value: "ACTIVE" as const, weight: 68 },
      { value: "COMPLETED" as const, weight: 18 },
      { value: "ON_HOLD" as const, weight: 6 },
      { value: "CANCELLED" as const, weight: 4 },
    ]);
    const startDate = faker.date.past({ years: 1 });
    const budget = faker.number.int({ min: 500_000, max: 10_000_000 });
    const progress =
      status === "COMPLETED"
        ? 100
        : status === "CANCELLED"
          ? faker.number.int({ min: 0, max: 40 })
          : faker.number.int({ min: 5, max: 95 });

    await db.project.create({
      data: {
        code: `PRJ-${startDate.getFullYear()}-${String(i + 1).padStart(4, "0")}`,
        name: faker.helpers.arrayElement(PROJECT_NAMES),
        customerId: faker.helpers.arrayElement(customers).id,
        agentId: agents.length > 0 && faker.datatype.boolean() ? faker.helpers.arrayElement(agents).id : null,
        description: faker.lorem.sentence(),
        startDate,
        endDate: faker.date.future({ years: 1, refDate: startDate }),
        budget,
        status,
        progress,
        createdAt: startDate,
      },
    });
  }

  console.log(`Seeded ${PROJECT_COUNT} projects.`);
}

async function seedSales() {
  const existing = await db.sale.count();
  if (existing > 0) {
    console.log(`Skipped sale seed — ${existing} sales already exist.`);
    return;
  }

  const customers = await db.customer.findMany({ select: { id: true } });
  const agents = await db.agent.findMany({ select: { id: true } });
  const warehouses = await db.warehouse.findMany({ select: { id: true } });
  const products = await db.product.findMany();
  const productsById = new Map(products.map((p) => [p.id, p]));

  if (customers.length === 0 || warehouses.length === 0) {
    console.log("No customers/warehouses found — skipping sale seeding.");
    return;
  }

  let created = 0;
  for (let i = 0; i < SALE_COUNT; i++) {
    const warehouse = faker.helpers.arrayElement(warehouses);
    const stockRows = await db.stock.findMany({
      where: { warehouseId: warehouse.id, quantity: { gt: 0 } },
      take: 20,
    });
    if (stockRows.length === 0) continue;

    const status = faker.helpers.weightedArrayElement([
      { value: "COMPLETED" as const, weight: 7 },
      { value: "PENDING" as const, weight: 2 },
      { value: "CANCELLED" as const, weight: 1 },
    ]);

    const itemCount = faker.number.int({ min: 1, max: Math.min(4, stockRows.length) });
    const chosenStock = faker.helpers.arrayElements(stockRows, itemCount);

    const items: { productId: string; quantity: number; unitPrice: number; discount: number; lineTotal: number }[] = [];
    for (const stock of chosenStock) {
      const product = productsById.get(stock.productId);
      const maxQty = Math.min(stock.quantity, 10);
      if (!product || maxQty < 1) continue;
      const quantity = faker.number.int({ min: 1, max: maxQty });
      const unitPrice = Number(product.sellingPrice);
      const discount = faker.helpers.maybe(() => Math.round(unitPrice * 0.05), { probability: 0.2 }) ?? 0;
      items.push({ productId: product.id, quantity, unitPrice, discount, lineTotal: quantity * unitPrice - discount });
    }
    if (items.length === 0) continue;

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const date = faker.date.past({ years: 1 });

    await db.sale.create({
      data: {
        number: `INV-${date.getFullYear()}-${String(i + 1).padStart(5, "0")}`,
        customerId: faker.helpers.arrayElement(customers).id,
        agentId: agents.length > 0 && faker.datatype.boolean() ? faker.helpers.arrayElement(agents).id : null,
        warehouseId: warehouse.id,
        date,
        status,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) ?? null,
        subtotal,
        tax: 0,
        total: subtotal,
        items: { create: items },
        createdAt: date,
      },
    });

    if (status !== "CANCELLED") {
      for (const item of items) {
        await db.stock.update({
          where: { productId_warehouseId: { productId: item.productId, warehouseId: warehouse.id } },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    created += 1;
  }

  console.log(`Seeded ${created} sales.`);
}

const INVOICE_COUNT = 180;
const PAYMENT_METHODS = ["CASH", "TRANSFER", "CARD", "POS"] as const;
const PAYMENT_TERMS = ["Due on Receipt", "Net 15", "Net 30", "Net 60"];

async function seedInvoices() {
  const existing = await db.invoice.count();
  if (existing > 0) {
    console.log(`Skipped invoice seed — ${existing} invoices already exist.`);
    return;
  }

  const customers = await db.customer.findMany({ select: { id: true } });
  const agents = await db.agent.findMany({ select: { id: true } });
  const products = await db.product.findMany({ select: { id: true, name: true, sellingPrice: true } });
  if (customers.length === 0 || products.length === 0) {
    console.log("No customers/products found — skipping invoice seeding.");
    return;
  }

  for (let i = 0; i < INVOICE_COUNT; i++) {
    const issueDate = faker.date.past({ years: 1 });
    const paymentTerm = faker.helpers.arrayElement(PAYMENT_TERMS);
    const termDays = paymentTerm === "Due on Receipt" ? 0 : paymentTerm === "Net 15" ? 15 : paymentTerm === "Net 30" ? 30 : 60;
    const dueDate = new Date(issueDate.getTime() + termDays * 24 * 60 * 60 * 1000);

    const chosenProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 3 }));
    const items = chosenProducts.map((product) => {
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = Number(product.sellingPrice);
      const discount = faker.helpers.maybe(() => Math.round(unitPrice * 0.05), { probability: 0.2 }) ?? 0;
      return {
        productId: product.id,
        description: product.name,
        quantity,
        unitPrice,
        discount,
        lineTotal: quantity * unitPrice - discount,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = items.reduce((sum, item) => sum + item.discount, 0);
    const total = subtotal - discount;

    const status =
      dueDate < new Date()
        ? faker.helpers.weightedArrayElement([
            { value: "PAID" as const, weight: 5 },
            { value: "OVERDUE" as const, weight: 3 },
          ])
        : faker.helpers.weightedArrayElement([
            { value: "SENT" as const, weight: 6 },
            { value: "DRAFT" as const, weight: 2 },
            { value: "PAID" as const, weight: 2 },
          ]);

    await db.invoice.create({
      data: {
        number: `INV-${issueDate.getFullYear()}-${String(i + 1).padStart(5, "0")}`,
        customerId: faker.helpers.arrayElement(customers).id,
        agentId: agents.length > 0 && faker.datatype.boolean() ? faker.helpers.arrayElement(agents).id : null,
        issueDate,
        dueDate,
        paymentTerm,
        status,
        subtotal,
        discount,
        tax: 0,
        total,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.15 }) ?? null,
        items: { create: items },
        createdAt: issueDate,
      },
    });
  }

  console.log(`Seeded ${INVOICE_COUNT} invoices.`);
}

async function seedPayments() {
  const existing = await db.payment.count();
  if (existing > 0) {
    console.log(`Skipped payment seed — ${existing} payments already exist.`);
    return;
  }

  const paidInvoices = await db.invoice.findMany({
    where: { status: "PAID" },
    select: { id: true, customerId: true, total: true, issueDate: true },
  });
  const sentInvoices = await db.invoice.findMany({
    where: { status: "SENT" },
    select: { id: true, customerId: true, total: true, issueDate: true },
  });

  let created = 0;

  for (const invoice of paidInvoices) {
    const date = faker.date.soon({ days: 10, refDate: invoice.issueDate });
    created += 1;
    await db.payment.create({
      data: {
        reference: `PAY-${date.getFullYear()}-${String(created).padStart(5, "0")}`,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        date,
        amount: invoice.total,
        method: faker.helpers.arrayElement(PAYMENT_METHODS),
        status: "COMPLETED",
        createdAt: date,
      },
    });
  }

  const partialTargets = faker.helpers.arrayElements(sentInvoices, Math.min(30, sentInvoices.length));
  for (const invoice of partialTargets) {
    const date = faker.date.soon({ days: 10, refDate: invoice.issueDate });
    const amount = Math.round(Number(invoice.total) * faker.number.float({ min: 0.2, max: 0.6 }));
    const status = faker.helpers.weightedArrayElement([
      { value: "COMPLETED" as const, weight: 7 },
      { value: "PENDING" as const, weight: 2 },
      { value: "FAILED" as const, weight: 1 },
    ]);
    created += 1;
    await db.payment.create({
      data: {
        reference: `PAY-${date.getFullYear()}-${String(created).padStart(5, "0")}`,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        date,
        amount,
        method: faker.helpers.arrayElement(PAYMENT_METHODS),
        status,
        createdAt: date,
      },
    });
  }

  console.log(`Seeded ${created} payments.`);
}

const EXPENSE_COUNT = 140;
const EXPENSE_CATEGORIES = [
  "Office Rent",
  "Utilities",
  "Salaries",
  "Marketing",
  "Travel",
  "Supplies",
  "Maintenance",
  "Other",
];

async function seedExpenses() {
  const existing = await db.expense.count();
  if (existing > 0) {
    console.log(`Skipped expense seed — ${existing} expenses already exist.`);
    return;
  }

  const staff = await db.staff.findMany({ select: { id: true } });

  for (let i = 0; i < EXPENSE_COUNT; i++) {
    const date = faker.date.past({ years: 1 });
    const category = faker.helpers.arrayElement(EXPENSE_CATEGORIES);
    const status = faker.helpers.weightedArrayElement([
      { value: "APPROVED" as const, weight: 7 },
      { value: "PENDING" as const, weight: 2 },
      { value: "REJECTED" as const, weight: 1 },
    ]);

    await db.expense.create({
      data: {
        number: `EXP-${date.getFullYear()}-${String(i + 1).padStart(5, "0")}`,
        category,
        description: `${category} for ${date.toLocaleString("en-US", { month: "long" })} ${date.getFullYear()}`,
        amount: faker.number.int({ min: 5_000, max: 800_000 }),
        date,
        vendor: faker.helpers.maybe(() => faker.company.name(), { probability: 0.5 }) ?? null,
        paidById: staff.length > 0 ? faker.helpers.arrayElement(staff).id : null,
        paymentMethod: faker.helpers.arrayElement(PAYMENT_METHODS),
        status,
        createdAt: date,
      },
    });
  }

  console.log(`Seeded ${EXPENSE_COUNT} expenses.`);
}

async function main() {
  await seedAdmin();
  await seedCustomers();
  await seedAgents();
  await seedStaffs();
  await seedWarehouses();
  await seedProducts();
  await seedProjects();
  await seedSales();
  await seedInvoices();
  await seedPayments();
  await seedExpenses();
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
