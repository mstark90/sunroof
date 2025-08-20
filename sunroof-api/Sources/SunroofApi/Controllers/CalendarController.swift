import Fluent
import Vapor

struct CalendarController: RouteCollection {
    func boot(routes: any RoutesBuilder) throws {
        let calendars = routes.grouped("calendars")

        calendars.get(use: self.index)
        calendars.post(use: self.create)
        calendars.group(":calendarID") { calendar in
            calendar.get("notes", use: self.getNotesForDate)
            calendar.post("notes", use: self.addNotes)
            calendar.get("events", use: self.getEventsForCalendar)
            calendar.post("events", use: self.addEventToCalendar)
            calendar.group("events/:eventID") { calendarEvent in
                calendarEvent.delete(use: self.deleteEventFromCalendar)
            }
            calendar.delete(use: self.delete)
        }
    }

    @Sendable
    func index(req: Request) async throws -> [CalendarDTO] {
        try await Calendar.query(on: req.db).all().map { $0.toDTO() }
    }

    @Sendable
    func create(req: Request) async throws -> CalendarDTO {
        let calendar = try req.content.decode(CalendarDTO.self).toModel()

        try await calendar.save(on: req.db)
        
        return calendar.toDTO()
    }
    
    @Sendable
    func getEventsForCalendar(req: Request) async throws -> [EventDTO] {
        guard let calendar = try await Calendar.find(req.parameters.get("calendarID"), on: req.db) else {
            throw Abort(.notFound)
        }
        
        return try await calendar.$events.get(on: req.db).map { $0.toDTO() }
    }
    
    @Sendable
    func addEventToCalendar(req: Request) async throws -> EventDTO {
        guard let calendar = try await Calendar.find(req.parameters.get("calendarID"), on: req.db) else {
            throw Abort(.notFound)
        }
        
        let event = try req.content.decode(EventDTO.self).toModel(calendar: calendar)
        
        try await event.save(on: req.db)
        
        return event.toDTO()
    }
    
    @Sendable
    func deleteEventFromCalendar(req: Request) async throws -> HTTPStatus {
        guard let calendar = try await Calendar.find(req.parameters.get("calendarID"), on: req.db) else {
            throw Abort(.notFound)
        }
        
        guard let rawEventID = req.parameters.get("eventID") else {
            throw Abort(.badRequest)
        }
        
        guard let eventID = UUID(uuidString: rawEventID) else {
            throw Abort(.badRequest)
        }
        
        guard let event = try await calendar.$events.query(on: req.db)
            .filter(\.$id == eventID)
            .first() else {
                throw Abort(.notFound)
            }
        
        try await event.delete(on: req.db)
        
        return .noContent
    }
    
    @Sendable
    func getNotesForDate(req: Request) async throws -> NoteDTO {
        guard let calendar = try await Calendar.find(req.parameters.get("calendarID"), on: req.db) else {
            throw Abort(.notFound)
        }
        
        let dateFormatter = Utilities.getDateFormatter()
        
        var date = Date.now;
        
        do {
            date = try dateFormatter.date(from: req.query.get(String.self, at: "date")) ?? .now
        } catch {
            
        }
        
        guard let note = try await calendar.$notes.query(on: req.db).filter(\.$day == date).first() else {
            throw Abort(.notFound)
        }
        
        return note.toDTO()
    }
    
    @Sendable
    func addNotes(req: Request) async throws -> NoteDTO {
        guard let calendar = try await Calendar.find(req.parameters.get("calendarID"), on: req.db) else {
            throw Abort(.notFound)
        }
        
        let notes = try req.content.decode(NoteDTO.self).toModel(calendar: calendar)
        
        try await notes.save(on: req.db)
        
        return notes.toDTO()
    }

    @Sendable
    func delete(req: Request) async throws -> HTTPStatus {
        guard let calendar = try await Calendar.find(req.parameters.get("calendarID"), on: req.db) else {
            throw Abort(.notFound)
        }

        try await calendar.delete(on: req.db)
        
        return .noContent
    }
}
