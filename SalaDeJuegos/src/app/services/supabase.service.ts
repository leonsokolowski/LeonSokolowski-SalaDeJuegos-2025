import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabase : SupabaseClient<any, "public", any>;
  constructor() 
  {
    this.supabase = createClient("https://byzbhahjyouroclvnnrf.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5emJoYWhqeW91cm9jbHZubnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjQyMzYsImV4cCI6MjA1OTc0MDIzNn0.WvufmiiBrPraaW5MX1dc6s3m-iYzRm96mdR0wQ5QUMw");
  }

}
