import Fluent

struct AddEventColorsAndNotes: AsyncMigration {
    func prepare(on database: any Database) async throws {
        try await database.schema("events")
            .field("background_color", .string, .sql(.default("#008000")))
            .field("text_color", .string, .sql(.default("#ffffff")))
            .field("description", .sql(.text))
            .update()
        
        try await database.schema("notes")
            .id()
            .field("calendar_id", .uuid, .required, .references("calendars", "id"))
            .field("date", .date, .required)
            .field("content", .sql(.text), .required)
            .create()
    }

    func revert(on database: any Database) async throws {
    }
}

