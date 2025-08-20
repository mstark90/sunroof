import Fluent
import Foundation
import struct Foundation.UUID

/// Property wrappers interact poorly with `Sendable` checking, causing a warning for the `@ID` property
/// It is recommended you write your model with sendability checking on and then suppress the warning
/// afterwards with `@unchecked Sendable`.
final class Event: Model, @unchecked Sendable {
    static let schema = "events"
    
    @ID(key: .id)
    var id: UUID?
    
    @Parent(key: "calendar_id")
    var calendar: Calendar

    @Field(key: "title")
    var title: String
    
    @Field(key: "start")
    var start: Date
    
    @Field(key: "end")
    var end: Date
    
    @Field(key: "all_day")
    var allDay: Bool

    init() { }

    init(id: UUID? = nil, calendar: Calendar,
         title: String, start: Date?, end: Date?,
         allDay: Bool?) {
        self.id = id
        self.calendar = calendar
        self.title = title
        self.start = start ?? .now
        self.end = end ?? .now
        self.allDay = allDay ?? false
    }
    
    func toDTO() -> EventDTO {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // set locale to reliable US_POSIX
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        
        return EventDTO(
            id: self.id,
            title: self.$title.value,
            start: dateFormatter.string(for: self.$start.value),
            end: dateFormatter.string(for: self.$end.value),
            allDay: self.$allDay.value
        )
    }
}
