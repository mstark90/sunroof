import Fluent
import Vapor

struct EventDTO: Content {
    var id: UUID?
    
    var calendar: CalendarDTO?

    var title: String?
    
    var start: String?
    
    var end: String?
    
    var allDay: Bool?
    
    var backgroundColor: String?
    
    var textColor: String?
    
    var description: String?
    
    func toModel(calendar: Calendar) -> Event {
        let model = Event()
        
        model.id = self.id
        
        model.$calendar.id = calendar.id!
        
        let dateFormatter = Utilities.getDateTimeFormatter()
        
        if let title = self.title {
            model.title = title
        }
        
        if let start = self.start {
            model.start =  dateFormatter.date(from:start)!
        } else {
            model.start = .now
        }
        
        if let end = self.end {
            model.end =  dateFormatter.date(from:end)!
        } else {
            model.end = .now
        }
        
        if let allDay = self.allDay {
            model.allDay = allDay
        } else {
            model.allDay = false
        }
        
        if let backgroundColor = self.backgroundColor {
            model.backgroundColor = backgroundColor
        } else {
            model.backgroundColor = "#008000"
        }
        
        if let textColor = self.textColor {
            model.textColor = textColor
        } else {
            model.textColor = "#ffffff"
        }
        
        if let description = self.description {
            model.description = description
        }
        
        return model
    }
}
