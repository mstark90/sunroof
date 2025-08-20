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
    
    @Field(key: "background_color")
    var backgroundColor: String
    
    @Field(key: "text_color")
    var textColor: String
    
    @Field(key: "description")
    var description: String?

    init() { }

    init(id: UUID? = nil, calendar: Calendar,
         title: String, start: Date?, end: Date?,
         allDay: Bool?, backgroundColor: String?, textColor: String?, description: String?) {
        self.id = id
        self.calendar = calendar
        self.title = title
        self.start = start ?? .now
        self.end = end ?? .now
        self.allDay = allDay ?? false
        self.textColor = textColor ?? "#ffffff"
        self.backgroundColor = backgroundColor ?? "#008000";
        self.description = description
    }
    
    func toDTO() -> EventDTO {
        let dateFormatter = Utilities.getDateTimeFormatter()
        
        return EventDTO(
            id: self.id,
            title: self.$title.value,
            start: dateFormatter.string(for: self.$start.value),
            end: dateFormatter.string(for: self.$end.value),
            allDay: self.$allDay.value,
            backgroundColor: self.$backgroundColor.value, textColor: self.$textColor.value,
            description: self.$description.value ?? nil
        )
    }
}
