import Fluent

struct CreateEvent: AsyncMigration {
    func prepare(on database: any Database) async throws {
        
        try await database
            .schema("calendars")
            .id()
            .field("name", .string, .required)
            .create()
        
        try await database.schema("events")
            .id()
            .field("calendar_id", .uuid, .required, .references("calendars", "id"))
            .field("title", .string, .required)
            .field("start", .datetime, .required)
            .field("end", .datetime, .required)
            .field("all_day", .bool, .sql(.default("0")))
            .create()
    }

    func revert(on database: any Database) async throws {
        try await database.schema("events").delete()
        try await database.schema("calendars").delete()
    }
}

