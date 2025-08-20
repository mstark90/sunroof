import Fluent
import Vapor

struct EventDTO: Content {
    var id: UUID?
    
    var calendar: CalendarDTO?

    var title: String?
    
    var start: String?
    
    var end: String?
    
    var allDay: Bool?
    
    func toModel(calendar: Calendar) -> Event {
        let model = Event()
        
        model.id = self.id
        
        model.$calendar.id = calendar.id!
        
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // set locale to reliable US_POSIX
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        
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
        
        return model
    }
}
