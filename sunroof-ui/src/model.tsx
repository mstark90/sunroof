
export interface SunroofCalendar {
  id?: string;
  name?: string;
}

export interface SunroofEvent {
  id?: string;
  
  title?: string;

  start?: string;
  end?: string;

  allDay?: boolean;
}