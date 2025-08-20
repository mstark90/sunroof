import Fluent
import Foundation
import struct Foundation.UUID

/// Property wrappers interact poorly with `Sendable` checking, causing a warning for the `@ID` property
/// It is recommended you write your model with sendability checking on and then suppress the warning
/// afterwards with `@unchecked Sendable`.
final class Note: Model, @unchecked Sendable {
    static let schema = "events"
    
    @ID(key: .id)
    var id: UUID?
    
    @Parent(key: "calendar_id")
    var calendar: Calendar

    @Field(key: "content")
    var content: String
    
    @Field(key: "day")
    var day: Date
    
    init() { }

    init(id: UUID? = nil, calendar: Calendar,
         content: String, day: Date?) {
        self.id = id
        self.calendar = calendar
        self.content = content
        self.day = day ?? .now
    }
    
    func toDTO() -> NoteDTO {
        let dateFormatter = Utilities.getDateFormatter()
        
        return NoteDTO(
            id: self.id,
            content: self.$content.value,
            day: dateFormatter.string(for: self.$day.value),
        )
    }
}
