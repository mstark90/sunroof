import Fluent
import Vapor

struct CalendarDTO: Content {
    var id: UUID?
    var name: String?
    
    var backgroundColor: String?
    
    var textColor: String?
    
    func toModel() -> Calendar {
        let model = Calendar()
        
        model.id = self.id
        
        if let name = self.name {
            model.name = name
        }
        
        model.backgroundColor = self.backgroundColor ?? "#008000";
        model.textColor = self.textColor ?? "#ffffff";
        
        return model
    }
}
