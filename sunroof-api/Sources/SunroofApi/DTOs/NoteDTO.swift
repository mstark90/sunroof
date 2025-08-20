import Fluent
import Vapor

struct NoteDTO: Content {
    var id: UUID?
    
    var calendar: CalendarDTO?

    var content: String?
    
    var day: String?
    
    func toModel(calendar: Calendar) throws -> Note {
        let model = Note()
        
        model.id = self.id
        
        model.$calendar.id = calendar.id!
        
        let dateFormatter = Utilities.getDateFormatter()
        
        if let day = self.day {
            model.day = dateFormatter.date(from:day)!
        } else {
            throw Abort(.badRequest)
        }
        
        if let content = self.content {
            model.content =  content
        } else {
            model.content = ""
        }
        
        return model
    }
}
