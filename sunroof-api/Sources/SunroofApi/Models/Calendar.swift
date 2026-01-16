import Fluent
import struct Foundation.UUID

/// Property wrappers interact poorly with `Sendable` checking, causing a warning for the `@ID` property
/// It is recommended you write your model with sendability checking on and then suppress the warning
/// afterwards with `@unchecked Sendable`.
final class Calendar: Model, @unchecked Sendable {
    static let schema = "calendars"
    
    @ID(key: .id)
    var id: UUID?

    @Field(key: "name")
    var name: String
    
    @Children(for: \.$calendar)
    var events: [Event]
    
    @Children(for: \.$calendar)
    var notes: [Note]
    
    @Field(key: "background_color")
    var backgroundColor: String
    
    @Field(key: "text_color")
    var textColor: String

    init() {
    }

    init(id: UUID? = nil, name: String, backgroundColor: String?, textColor: String?) {
        self.id = id
        self.name = name
        self.textColor = textColor ?? "#ffffff"
        self.backgroundColor = backgroundColor ?? "#008000";
    }
    
    func toDTO() -> CalendarDTO {
        .init(
            id: self.id,
            name: self.$name.value,
            backgroundColor: self.$backgroundColor.value,
            textColor: self.$textColor.value
        )
    }
}
