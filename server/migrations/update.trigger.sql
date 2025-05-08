CREATE TRIGGER update_event_attendance
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE events
    SET attendees = (
                SELECT SUM(ticket_count)
                FROM bookings
                WHERE event_id = NEW.event_id
                )
    WHERE id = NEW.event_id;
END;

-- drop trigger ADD
drop trigger update_event_attendance;