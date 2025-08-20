
import type { AxiosResponse } from "axios";
import axios from "axios";
import type { SunroofCalendar, SunroofEvent } from "./model";

const baseUrl = import.meta.env.VITE_API_URL;

export function getSunroofCalendars(): Promise<AxiosResponse<SunroofCalendar[], unknown>> {
  return axios.get<SunroofCalendar[]>(`${baseUrl}/calendars`);
}

export function createSunroofCalendar(calendar: SunroofCalendar): Promise<AxiosResponse<SunroofCalendar, unknown>> {
  return axios.post<SunroofCalendar>(`${baseUrl}/calendars`, calendar);
}

export function getSunroofEvents(calendar: SunroofCalendar): Promise<AxiosResponse<SunroofEvent[], unknown>> {
  return axios.get<SunroofEvent[]>(`${baseUrl}/calendars/${calendar.id}/events`);
}

export function createSunroofEvent(calendar: SunroofCalendar, event: SunroofEvent): Promise<AxiosResponse<SunroofEvent, unknown>> {
  return axios.post<SunroofEvent>(`${baseUrl}/calendars/${calendar.id}/events`, event);
}