import { relations } from "drizzle-orm";
import { index, pgTableCreator, primaryKey, unique } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `2005_sti_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

// Vehicle information - tracks current state
export const vehicle = createTable("vehicle", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

  // Basic info
  year: d.integer().notNull(),
  make: d.varchar({ length: 100 }).notNull(),
  model: d.varchar({ length: 100 }).notNull(),

  // Current state
  currentMileage: d.integer().notNull(),
  lastMileageUpdate: d.timestamp({ withTimezone: true }).notNull(),

  // Ownership
  ownerId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),

  // Metadata
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Main service record table - tracks what's been done
export const serviceRecords = createTable(
  "service_record",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

    vehicleId: d
      .integer()
      .notNull()
      .references(() => vehicle.id),

    // Basic info
    title: d.varchar({ length: 255 }).notNull(),
    category: d.varchar({ length: 50 }).notNull(), // 'fluid', 'engine_drivetrain', 'consumable', 'inspection', 'other'

    // When and where
    serviceDate: d.date().notNull(),
    mileage: d.integer().notNull(),
    location: d.varchar({ length: 255 }),

    // Details
    description: d.text(),
    partsBrand: d.varchar({ length: 255 }),
    partNumber: d.varchar({ length: 255 }),

    // Cost tracking
    laborCost: d.numeric({ precision: 10, scale: 2 }),
    partsCost: d.numeric({ precision: 10, scale: 2 }),
    totalCost: d.numeric({ precision: 10, scale: 2 }),

    // Documentation
    notes: d.text(),

    // Metadata
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("vehicle_idx").on(t.vehicleId),
    index("service_date_idx").on(t.serviceDate),
    index("category_idx").on(t.category),
    index("mileage_idx").on(t.mileage),
  ],
);

// Maintenance schedule - tracks when things are DUE
export const maintenanceSchedule = createTable(
  "maintenance_schedule",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

    vehicleId: d
      .integer()
      .notNull()
      .references(() => vehicle.id),

    // What needs to be done
    title: d.varchar({ length: 255 }).notNull(),
    category: d.varchar({ length: 50 }).notNull(),
    description: d.text(),

    // Service intervals (at least one must be set)
    intervalMiles: d.integer(), // e.g., 3000 for oil changes
    intervalMonths: d.integer(), // e.g., 6 for oil changes

    // Last service tracking
    lastServicedDate: d.date(),
    lastServicedMileage: d.integer(),
    lastServiceRecordId: d.integer().references(() => serviceRecords.id),

    // Next due (computed when last service is updated)
    nextDueDate: d.date(),
    nextDueMileage: d.integer(),

    // Status
    isActive: d.boolean().notNull().default(true),

    // Metadata
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("vehicle_schedule_idx").on(t.vehicleId),
    index("next_due_date_idx").on(t.nextDueDate),
    index("next_due_mileage_idx").on(t.nextDueMileage),
    index("is_active_idx").on(t.isActive),
  ],
);

// Vehicle photos - covers, glamour shots, etc.
export const vehiclePhotos = createTable(
  "vehicle_photo",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    vehicleId: d
      .integer()
      .notNull()
      .references(() => vehicle.id, { onDelete: "cascade" }),

    fileUrl: d.varchar({ length: 500 }).notNull(),
    fileKey: d.varchar({ length: 255 }).notNull(), // UploadThing file key (for deletion)
    description: d.varchar({ length: 255 }),
    isPrimary: d.boolean().notNull().default(false),

    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("vehicle_photo_vehicle_idx").on(t.vehicleId)],
);

// Photos and documents
export const serviceDocuments = createTable(
  "service_document",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    serviceRecordId: d
      .integer()
      .notNull()
      .references(() => serviceRecords.id, { onDelete: "cascade" }),

    fileUrl: d.varchar({ length: 500 }).notNull(),
    fileType: d.varchar({ length: 50 }).notNull(), // 'photo', 'receipt', 'invoice', 'manual'
    description: d.varchar({ length: 255 }),

    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("service_record_idx").on(t.serviceRecordId)],
);

// Vehicle likes — one per user per vehicle
export const vehicleLikes = createTable(
  "vehicle_like",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    vehicleId: d
      .integer()
      .notNull()
      .references(() => vehicle.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    unique("vehicle_like_unique").on(t.vehicleId, t.userId),
    index("vehicle_like_vehicle_idx").on(t.vehicleId),
  ],
);

// Vehicle comments
export const vehicleComments = createTable(
  "vehicle_comment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    vehicleId: d
      .integer()
      .notNull()
      .references(() => vehicle.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("vehicle_comment_vehicle_idx").on(t.vehicleId)],
);

// In-app notifications — likes and comments on the user's vehicles
export const notifications = createTable(
  "notification",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    // recipient: the vehicle owner
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // actor: who triggered it
    actorId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: d.varchar({ length: 20 }).notNull(), // 'like' | 'comment'
    vehicleId: d
      .integer()
      .notNull()
      .references(() => vehicle.id, { onDelete: "cascade" }),
    commentId: d
      .integer()
      .references(() => vehicleComments.id, { onDelete: "cascade" }),
    isRead: d.boolean().notNull().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("notification_user_idx").on(t.userId),
    index("notification_read_idx").on(t.isRead),
  ],
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  vehicles: many(vehicle),
  likes: many(vehicleLikes),
  comments: many(vehicleComments),
  notifications: many(notifications, { relationName: "receivedNotifications" }),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Vehicle relations
export const vehicleRelations = relations(vehicle, ({ one, many }) => ({
  owner: one(users, { fields: [vehicle.ownerId], references: [users.id] }),
  serviceRecords: many(serviceRecords),
  maintenanceSchedule: many(maintenanceSchedule),
  photos: many(vehiclePhotos),
  likes: many(vehicleLikes),
  comments: many(vehicleComments),
  notifications: many(notifications),
}));

// Vehicle like relations
export const vehicleLikesRelations = relations(vehicleLikes, ({ one }) => ({
  vehicle: one(vehicle, { fields: [vehicleLikes.vehicleId], references: [vehicle.id] }),
  user: one(users, { fields: [vehicleLikes.userId], references: [users.id] }),
}));

// Vehicle comment relations
export const vehicleCommentsRelations = relations(vehicleComments, ({ one }) => ({
  vehicle: one(vehicle, { fields: [vehicleComments.vehicleId], references: [vehicle.id] }),
  user: one(users, { fields: [vehicleComments.userId], references: [users.id] }),
}));

// Vehicle photo relations
export const vehiclePhotosRelations = relations(vehiclePhotos, ({ one }) => ({
  vehicle: one(vehicle, {
    fields: [vehiclePhotos.vehicleId],
    references: [vehicle.id],
  }),
}));

// Service record relations
export const serviceRecordsRelations = relations(
  serviceRecords,
  ({ one, many }) => ({
    vehicle: one(vehicle, {
      fields: [serviceRecords.vehicleId],
      references: [vehicle.id],
    }),
    createdBy: one(users, {
      fields: [serviceRecords.createdById],
      references: [users.id],
    }),
    documents: many(serviceDocuments),
  }),
);

// Maintenance schedule relations
export const maintenanceScheduleRelations = relations(
  maintenanceSchedule,
  ({ one }) => ({
    vehicle: one(vehicle, {
      fields: [maintenanceSchedule.vehicleId],
      references: [vehicle.id],
    }),
    createdBy: one(users, {
      fields: [maintenanceSchedule.createdById],
      references: [users.id],
    }),
    lastServiceRecord: one(serviceRecords, {
      fields: [maintenanceSchedule.lastServiceRecordId],
      references: [serviceRecords.id],
    }),
  }),
);

// Service document relations
export const serviceDocumentsRelations = relations(
  serviceDocuments,
  ({ one }) => ({
    serviceRecord: one(serviceRecords, {
      fields: [serviceDocuments.serviceRecordId],
      references: [serviceRecords.id],
    }),
  }),
);

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "receivedNotifications",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "sentNotifications",
  }),
  vehicle: one(vehicle, {
    fields: [notifications.vehicleId],
    references: [vehicle.id],
  }),
  comment: one(vehicleComments, {
    fields: [notifications.commentId],
    references: [vehicleComments.id],
  }),
}));
