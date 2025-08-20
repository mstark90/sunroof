import Fluent
import Vapor

struct CalendarDTO: Content {
    var id: UUID?
    var name: String?
    
    func toModel() -> Calendar {
        let model = Calendar()
        
        model.id = self.id
        
        if let name = self.name {
            model.name = name
        }
        
        return model
    }
}
