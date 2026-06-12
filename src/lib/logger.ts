export type EventName = "SIGNUP_SUCCESS" | "MEETUP_CREATED" | "MEETUP_APPLIED";

export const logger = {
  event: (name: EventName, payload?: any) => {
    console.log(`[EVENT] 📊 ${name}`, payload || "");
  },
  error: (err: any, context?: string) => {
    console.error(`[ERROR] 🚨 ${context || "Unknown Context"}:`, err);
  }
};
