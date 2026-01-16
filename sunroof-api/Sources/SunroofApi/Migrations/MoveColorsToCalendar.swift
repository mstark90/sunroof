//
//  MoveColorsToCalendar.swift
//  SunroofApi
//
//  Created by Michael Stark on 1/15/26.
//

import Fluent

struct MoveColorsToCalendar: AsyncMigration {
    func prepare(on database: any Database) async throws {
        try await database.schema("calendars")
            .field("background_color", .string, .sql(.default("#008000")))
            .field("text_color", .string, .sql(.default("#ffffff")))
            .update()
        
        try await database.schema("events")
            .deleteField("background_color")
            .deleteField("text_color")
            .update()
    }

    func revert(on database: any Database) async throws {
    }
}

