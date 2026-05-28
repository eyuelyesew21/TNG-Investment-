const supabaseUrl = "https://dknksfcesarrvyfufdti.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbmtzZmNlc2FycnZ5ZnVmZHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTI4ODMsImV4cCI6MjA5NTQ2ODg4M30.bemPqKzMlUrK7C9bddrAuspC-JtYIfciCxi7eECQEwk";

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

console.log("Supabase Connected");
